const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

require('./config/firebase'); // initializes the Firebase Admin app / Firestore connection

const Venue = require('./models/Venue');
const Game = require('./models/Game');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/otp',      require('./routes/otp'));
app.use('/api/venues',   require('./routes/venues'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/games',    require('./routes/games'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/stats',    require('./routes/stats'));

app.get('/', (_req, res) => res.send('Matchify API is running ✓'));

// ── Socket.io chat ───────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('joinRoom', (roomId) => socket.join(roomId));
  socket.on('sendMessage', async (data) => {
    try {
      const msg = await Message.create(data);
      io.to(data.gameId).emit('receiveMessage', msg);
    } catch (err) {
      console.error('Socket error:', err);
    }
  });
});

// ── Seed initial data ─────────────────────────────────────────────────────────
async function seedIfEmpty() {
  if ((await Venue.count()) > 0) return;

  console.log('[Seed] Inserting initial venues & games...');

  const venues = await Venue.insertMany([
    {
      name: 'Neon Arena',
      location: { address: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408 },
      sports: ['Football', 'Tennis'],
      pricePerHour: 1500,
      rating: 4.8,
      images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800'],
      availableSlots: ['06:00', '07:00', '18:00', '19:00', '20:00'],
    },
    {
      name: 'Skyline Sports Hub',
      location: { address: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
      sports: ['Basketball', 'Badminton'],
      pricePerHour: 800,
      rating: 4.5,
      images: ['https://images.unsplash.com/photo-1622279457486-640c4cb4ebf6?w=800'],
      availableSlots: ['05:00', '08:00', '16:00', '17:00', '21:00'],
    },
    {
      name: 'Velocity Turf',
      location: { address: 'Whitefield, Bangalore', lat: 12.9698, lng: 77.7500 },
      sports: ['Football', 'Cricket'],
      pricePerHour: 2000,
      rating: 4.9,
      images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800'],
      availableSlots: ['18:00', '19:00', '20:00', '21:00'],
    },
  ]);

  await Game.insertMany([
    {
      sport: 'Football',
      date: '2026-06-01',
      time: '18:00',
      venueId: venues[0]._id,
      hostId: 'seed-host-1',
      players: [],
      maxPlayers: 10,
      skillLevel: 'Intermediate',
      status: 'open',
    },
    {
      sport: 'Badminton',
      date: '2026-06-02',
      time: '07:00',
      venueId: venues[1]._id,
      hostId: 'seed-host-2',
      players: [],
      maxPlayers: 4,
      skillLevel: 'Beginner',
      status: 'open',
    },
    {
      sport: 'Basketball',
      date: '2026-06-03',
      time: '17:00',
      venueId: venues[1]._id,
      hostId: 'seed-host-3',
      players: [],
      maxPlayers: 10,
      skillLevel: 'Advanced',
      status: 'open',
    },
  ]);

  console.log('[Seed] Done — 3 venues and 3 games inserted.');
}

const PORT = process.env.PORT || 5000;

seedIfEmpty()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Matchify API running → http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('Fatal DB error:', err));
