const express = require('express');
const router = express.Router();
const User = require('../models/User');

// PUT /api/players/location — update current user location
router.put('/location', async (req, res) => {
  try {
    const { userId, latitude, longitude, city } = req.body;
    if (!userId || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'userId, latitude, longitude are required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        latitude,
        longitude,
        city: city || '',
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        locationEnabled: true,
        lastSeen: new Date(),
      },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/players/nearby?lat=&lng=&radius=5000
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, excludeUserId } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    let query = {
      locationEnabled: true,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lngNum, latNum] },
          $maxDistance: parseFloat(radius),
        }
      },
      // Only show players seen in the last 2 hours
      lastSeen: { $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    };

    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const players = await User.find(query)
      .select('name avatar skillLevel sports city lastSeen location latitude longitude')
      .limit(20);

    const results = players.map(p => {
      const pObj = p.toObject();
      const [pLng, pLat] = p.location.coordinates;
      pObj.distanceKm = haversine(latNum, lngNum, pLat, pLng);
      return pObj;
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1));
}

module.exports = router;
