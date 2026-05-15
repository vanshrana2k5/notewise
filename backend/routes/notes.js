const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Note, AiUsage } = require('../utils/db');
const auth = require('../middleware/auth');
const { generateNoteInsights } = require('../services/ai');

const parseNote = (note) => {
  const n = note.toJSON ? note.toJSON() : note;
  return {
    ...n,
    tags: JSON.parse(n.tags || '[]'),
    ai_action_items: n.ai_action_items ? JSON.parse(n.ai_action_items) : null
  };
};

// GET /api/notes
router.get('/', auth, async (req, res) => {
  const { search, tag, category, sort = 'updated_at', archived = 'false' } = req.query;
  const where = { user_id: req.user.id, is_archived: archived === 'true' };

  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } }
    ];
  }
  if (category) where.category = category;

  const validSorts = ['updated_at', 'created_at', 'title'];
  const sortCol = validSorts.includes(sort) ? sort : 'updated_at';

  try {
    let notes = await Note.findAll({ where, order: [[sortCol, 'DESC']] });
    let parsed = notes.map(parseNote);
    if (tag) parsed = parsed.filter(n => n.tags.includes(tag));
    res.json({ notes: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes
router.post('/', auth, async (req, res) => {
  const { title = 'Untitled Note', content = '', tags = [], category = 'General' } = req.body;
  try {
    const note = await Note.create({
      id: uuidv4(), user_id: req.user.id,
      title, content, tags: JSON.stringify(tags), category
    });
    res.status(201).json({ note: parseNote(note) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// GET /api/notes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ note: parseNote(note) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});

// PATCH /api/notes/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const { title, content, tags, category, is_archived, is_public } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = JSON.stringify(tags);
    if (category !== undefined) note.category = category;
    if (is_archived !== undefined) note.is_archived = is_archived;
    if (is_public !== undefined) note.is_public = is_public;

    await note.save();
    res.json({ note: parseNote(note) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Note.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    if (!deleted) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// POST /api/notes/:id/generate-summary
router.post('/:id/generate-summary', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const insights = await generateNoteInsights(note.title, note.content);

    note.ai_summary = insights.summary;
    note.ai_action_items = JSON.stringify(insights.action_items);
    note.ai_suggested_title = insights.suggested_title;
    note.ai_calls = (note.ai_calls || 0) + 1;
    await note.save();

    await AiUsage.create({ id: uuidv4(), user_id: req.user.id, note_id: note.id, action: 'generate-summary' });

    res.json({ insights });
  } catch (err) {
    console.error('AI Error:', err.message);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

// POST /api/notes/:id/share
router.post('/:id/share', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!note) return res.status(404).json({ error: 'Note not found' });

    const shareId = note.share_id || uuidv4().replace(/-/g, '').slice(0, 16);
    note.share_id = shareId;
    note.is_public = true;
    await note.save();

    res.json({ share_id: shareId, share_url: `${process.env.CLIENT_URL}/shared/${shareId}` });
  } catch {
    res.status(500).json({ error: 'Share failed' });
  }
});

// DELETE /api/notes/:id/share
router.delete('/:id/share', auth, async (req, res) => {
  try {
    await Note.update({ is_public: false, share_id: null }, { where: { id: req.params.id, user_id: req.user.id } });
    res.json({ message: 'Share link revoked' });
  } catch {
    res.status(500).json({ error: 'Failed to revoke share' });
  }
});

module.exports = router;