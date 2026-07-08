const express = require('express');
const router = express.Router();
const Otp = require('../models/Otp');
const User = require('../models/User');

// No paid SMS gateway is wired up (there's no such thing as free-forever real SMS
// delivery at any volume), so in dev mode the code is returned in the response
// instead of actually being texted. Swap this for a provider (Twilio/MSG91/etc.)
// and drop the `devCode` field before shipping to real users.
const DEV_MODE = process.env.OTP_DEV_MODE !== 'false';

router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone is required' });

    const code = await Otp.issue(phone);
    console.log(`[OTP] ${phone} -> ${code}`);

    res.json({ success: true, message: 'OTP sent', ...(DEV_MODE ? { devCode: code } : {}) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { phone, code, userId } = req.body;
    if (!phone || !code) return res.status(400).json({ message: 'phone and code are required' });

    const result = await Otp.verify(phone, code);
    if (!result.ok) return res.status(400).json({ success: false, message: result.reason });

    if (userId) {
      await User.updateById(userId, { phone, phoneVerified: true });
    }

    res.json({ success: true, message: 'Phone number verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
