const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  xp: user.xp,
  level: user.level,
  streak: user.streak,
  badges: user.badges,
  matchesPlayed: user.matchesPlayed,
  winRate: user.winRate,
  token: generateToken(user._id),
});

router.post('/signup', async (req, res) => {
  const { name, username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password are required' });

  try {
    const existing = await User.findByUsername(username);
    if (existing) return res.status(409).json({ message: 'Username is already taken' });

    const user = await User.createWithUsername({ name, username, password });
    res.json(authResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'username and password are required' });

  try {
    const user = await User.findByUsername(username);
    if (!user || !(await User.verifyPassword(user, password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json(authResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/password', async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'userId, currentPassword and newPassword are required' });
  }
  try {
    const user = await User.findById(userId);
    if (!user || !(await User.verifyPassword(user, currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    await User.updatePassword(userId, newPassword);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    res.json(User.omitPassword(user));
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;