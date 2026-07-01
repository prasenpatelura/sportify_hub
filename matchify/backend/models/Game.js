const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sport: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  maxPlayers: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
