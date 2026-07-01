const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

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
    const User = require('../models/User');
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Award 50 XP and increment matchesPlayed for everyone
    await User.updateMany(
      { _id: { $in: game.players } },
      { $inc: { xp: 50, matchesPlayed: 1 } }
    );

    // Optional: Level up logic
    const players = await User.find({ _id: { $in: game.players } });
    for (const p of players) {
       if (p.xp >= p.level * 1000) {
          p.level += 1;
          await p.save();
       }
    }

    res.json({ success: true, message: 'Game completed. XP awarded!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all recent/upcoming games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({}).populate('hostId', 'name').populate('venueId', 'name');
    res.json(games);
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

    game.players.push(req.body.userId);
    await game.save();
    
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Quick Play - Find and join a game instantly
router.post('/quick-join', async (req, res) => {
  try {
    const { userId, sport } = req.body;
    
    // Find a game of the requested sport that isn't full and user isn't already in
    const game = await Game.findOne({
      sport: sport || 'Football',
      $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] },
      players: { $ne: userId }
    });

    if (!game) {
      return res.status(404).json({ success: false, message: 'No available games found for Quick Play.' });
    }

    game.players.push(userId);
    await game.save();

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
    const User = require('../models/User');
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Fetch full user profiles to access skill and winRate
    const players = await User.find({ _id: { $in: game.players } });

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
