const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  sports: [{ type: String }],
  pricePerHour: { type: Number, required: true },
  availableSlots: [{ type: String }], // '10:00-11:00'
  images: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
