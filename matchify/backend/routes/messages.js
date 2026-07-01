const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages for a specific game room
router.get('/:gameId', async (req, res) => {
  try {
    const messages = await Message.find({ gameId: req.params.gameId })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
