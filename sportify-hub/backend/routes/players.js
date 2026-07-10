const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/players?ids=id1,id2,id3 — batch-fetch player names/avatars (e.g. a match roster)
router.get('/', async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ message: 'ids query param is required' });

    const users = await User.findByIds(String(ids).split(','));
    res.json(users.map(User.omitPassword));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/players/location — update current user location
router.put('/location', async (req, res) => {
  try {
    const { userId, latitude, longitude, city } = req.body;
    if (!userId || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'userId, latitude, longitude are required' });
    }

    const user = await User.updateById(userId, {
      latitude,
      longitude,
      city: city || '',
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      locationEnabled: true,
      lastSeen: new Date(),
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user: User.omitPassword(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/players/nearby?lat=&lng=&radius=5000
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, excludeUserId } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const results = await User.findNearby({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radiusMeters: parseFloat(radius),
      excludeUserId,
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;