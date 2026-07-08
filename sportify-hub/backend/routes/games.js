const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const User = require('../models/User');
const Venue = require('../models/Venue');

// Create game
router.post('/', async (req, res) => {
  try {
    const game = await Game.create({ ...req.body, players: [req.body.hostId] });
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Gamification: Complete game and award XP
router.post('/complete/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Award 50 XP and increment matchesPlayed for everyone
    await User.incrementXpAndMatches(game.players, { xp: 50, matchesPlayed: 1 });

    // Optional: Level up logic
    const players = await User.findByIds(game.players);
    for (const p of players) {
      if (p.xp >= p.level * 1000) {
        await User.updateById(p._id, { level: p.level + 1 });
      }
    }

    res.json({ success: true, message: 'Game completed. XP awarded!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all recent/upcoming games — optionally filtered to games at venues near lat/lng
router.get('/', async (req, res) => {
  try {
    const games = await Game.findAllPopulated();

    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) return res.json(games);

    const nearbyVenues = await Venue.findNearby({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radiusMeters: parseFloat(radius),
    });
    const distanceByVenueId = new Map(nearbyVenues.map((v) => [v._id, v.distanceKm]));

    const nearbyGames = games
      .filter((g) => g.venueId && distanceByVenueId.has(g.venueId._id))
      .map((g) => ({ ...g, distanceKm: distanceByVenueId.get(g.venueId._id) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(nearbyGames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join game
router.post('/:id/join', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    if (game.players.includes(req.body.userId)) {
      return res.status(400).json({ message: 'Already joined' });
    }

    if (game.players.length >= game.maxPlayers) {
      return res.status(400).json({ message: 'Game is full' });
    }

    const updated = await Game.addPlayer(game._id, req.body.userId);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quick Play - Find and join a game instantly
router.post('/quick-join', async (req, res) => {
  try {
    const { userId, sport } = req.body;

    const game = await Game.findQuickJoinCandidate({ sport: sport || 'Football', userId });

    if (!game) {
      return res.status(404).json({ success: false, message: 'No available games found for Quick Play.' });
    }

    await Game.addPlayer(game._id, userId);

    res.json({
      success: true,
      message: `Matched! Joined ${game.sport} game.`,
      gameId: game._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Smart Team Balancer
router.post('/team-balance/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Fetch full user profiles to access skill and winRate
    const players = await User.findByIds(game.players);

    // Assigning weights for algorithmic sorting:
    // Skill Level: Beginner(1), Intermediate(2), Advanced(3), Pro(4)
    // Weight Formula = (Skill * 10) + (winRate * 100)
    const skillMap = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Pro': 4 };

    const scoredPlayers = players.map(p => {
      const skillScore = skillMap[p.skillLevel || 'Beginner'] * 10;
      const winScore = (p.winRate || 0) * 100;
      return { id: p._id, name: p.name, score: skillScore + winScore };
    });

    // Sort by descending score
    scoredPlayers.sort((a, b) => b.score - a.score);

    const teamA = [];
    const teamB = [];
    let scoreA = 0;
    let scoreB = 0;

    // Greedy partition
    for (const player of scoredPlayers) {
      if (scoreA <= scoreB) {
        teamA.push(player);
        scoreA += player.score;
      } else {
        teamB.push(player);
        scoreB += player.score;
      }
    }

    res.json({
      success: true,
      teamA: teamA.map(p => p.name),
      teamB: teamB.map(p => p.name),
      balanceScore: Math.abs(scoreA - scoreB)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;