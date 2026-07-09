const express = require('express');
const router = express.Router();
const Otp = require('../models/Otp');
const User = require('../models/User');
const { sendSms } = require('../config/sms');

router.post('/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'phone is required' });

    const code = await Otp.issue(phone);
    const sent = await sendSms(phone, `Your Sportify Hub verification code is ${code}. It expires in 5 minutes.`);
    if (!sent) {
      // Twilio isn't configured (TWILIO_* env vars missing) — no SMS was sent.
      console.log(`[OTP] Twilio not configured, would have sent to ${phone} -> ${code}`);
      return res.status(503).json({ message: 'SMS delivery is not configured on the server.' });
    }

    res.json({ success: true, message: 'OTP sent' });
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
