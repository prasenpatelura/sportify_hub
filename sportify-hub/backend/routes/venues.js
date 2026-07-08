const express = require('express');
const router = express.Router();
const Venue = require('../models/Venue');

// Get all venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.findAll();
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/venues/nearby?lat=&lng=&radius=5000
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const venues = await Venue.findNearby({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radiusMeters: parseFloat(radius),
    });

    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get venue by ID
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (venue) {
      res.json(venue);
    } else {
      res.status(404).json({ message: 'Venue not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create venue (Admin)
router.post('/', async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    res.status(201).json(venue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;