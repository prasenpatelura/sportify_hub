const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sport: { type: String, required: true },
  date: { type: String, required: true },
  entryFee: { type: Number, required: true },
  prize: { type: String, required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['Open', 'Ongoing', 'Finished'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
