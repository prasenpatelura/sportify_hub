const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let user = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.id).select('-password');
      } catch {}
    }

    const matchesPlayed = user?.matchesPlayed || 0;
    const winRate = user?.winRate || 0;
    const xpEarned = user?.xp || 0;

    res.json({
      matchesPlayed,
      winRate,
      xpEarned,
      history: [
        { date: '2026-06-10', sport: 'Football', result: 'Win', xpChange: '+50' },
        { date: '2026-06-05', sport: 'Basketball', result: 'Loss', xpChange: '+20' },
        { date: '2026-06-01', sport: 'Football', result: 'Win', xpChange: '+50' },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
