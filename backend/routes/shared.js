const express = require('express');
const router = express.Router();
const { Note, User } = require('../utils/db');

router.get('/:shareId', async (req, res) => {
  try {
    const note = await Note.findOne({
      where: { share_id: req.params.shareId, is_public: true, is_archived: false },
      include: [{ model: User, attributes: ['name'] }]
    });

    if (!note) return res.status(404).json({ error: 'Note not found or no longer shared' });

    const n = note.toJSON();
    res.json({
      note: {
        ...n,
        author_name: n.User?.name || 'Unknown',
        tags: JSON.parse(n.tags || '[]'),
        ai_action_items: n.ai_action_items ? JSON.parse(n.ai_action_items) : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shared note' });
  }
});

module.exports = router;