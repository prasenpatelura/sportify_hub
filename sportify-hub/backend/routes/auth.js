const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  phoneVerified: user.phoneVerified,
  xp: user.xp,
  level: user.level,
  streak: user.streak,
  badges: user.badges,
  matchesPlayed: user.matchesPlayed,
  winRate: user.winRate,
  token: generateToken(user._id),
});

// Phone + OTP is the primary sign-up/sign-in flow: verifying a phone number
// logs the user in if that number already has an account, or creates one
// (using `name`) if it doesn't — no separate register/login step needed.
router.post('/phone-auth', async (req, res) => {
  const { phone, code, name } = req.body;
  if (!phone || !code) return res.status(400).json({ message: 'phone and code are required' });

  try {
    const result = await Otp.verify(phone, code);
    if (!result.ok) return res.status(400).json({ message: result.reason });

    let user = await User.findByPhone(phone);
    if (!user) {
      user = await User.createWithPhone({ name, phone });
    }

    res.json(authResponse(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findByEmail(email);
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({ _id: user._id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, badges: user.badges, matchesPlayed: user.matchesPlayed, winRate: user.winRate, token: generateToken(user._id) });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByEmail(email);
    if (user && (await User.comparePassword(user, password))) {
      res.json({ _id: user._id, name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak, badges: user.badges, matchesPlayed: user.matchesPlayed, winRate: user.winRate, token: generateToken(user._id) });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
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