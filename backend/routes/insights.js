const express = require('express');
const router = express.Router();
const { Note, AiUsage, sequelize } = require('../utils/db');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const uid = req.user.id;
  try {
    const totalNotes = await Note.count({ where: { user_id: uid, is_archived: false } });
    const archivedNotes = await Note.count({ where: { user_id: uid, is_archived: true } });
    const publicNotes = await Note.count({ where: { user_id: uid, is_public: true } });
    const aiUsage = await AiUsage.count({ where: { user_id: uid } });

    const recentNotes = await Note.findAll({
      where: { user_id: uid, is_archived: false },
      attributes: ['id', 'title', 'category', 'updated_at'],
      order: [['updated_at', 'DESC']],
      limit: 5
    });

    const allNotes = await Note.findAll({ where: { user_id: uid, is_archived: false }, attributes: ['tags'] });
    const tagCount = {};
    allNotes.forEach(n => {
      const tags = JSON.parse(n.tags || '[]');
      tags.forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; });
    });
    const topTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = await Note.count({
        where: {
          user_id: uid,
          updated_at: {
            [Op.gte]: new Date(dateStr + 'T00:00:00.000Z'),
            [Op.lte]: new Date(dateStr + 'T23:59:59.999Z')
          }
        }
      });
      weeklyActivity.push({ day: date.toLocaleDateString('en-US', { weekday: 'short' }), count });
    }

    const categoryRows = await Note.findAll({
      where: { user_id: uid, is_archived: false },
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category'],
      order: [[sequelize.literal('count'), 'DESC']]
    });

    res.json({
      stats: { totalNotes, archivedNotes, publicNotes, aiUsage },
      recentNotes: recentNotes.map(n => n.toJSON()),
      topTags,
      weeklyActivity,
      categoryBreakdown: categoryRows.map(r => ({ category: r.category, count: parseInt(r.dataValues.count) }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

module.exports = router;