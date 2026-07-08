const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get messages for a specific game room
router.get('/:gameId', async (req, res) => {
  try {
    const messages = await Message.findByGameId(req.params.gameId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;