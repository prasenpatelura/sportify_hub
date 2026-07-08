const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const { seedIfEmpty } = require('./seed');
const Message = require('./models/Message');

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

// ── Socket.io chat ───────────────────────────────────────────────────────────
// Needs a persistent process — this file is for local dev or an always-on host
// (Render/Railway/Fly.io). It is NOT used by the Vercel serverless deployment
// (see api/index.js), which can't hold a websocket open between requests.
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

const PORT = process.env.PORT || 5000;

seedIfEmpty()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`Sportify Hub API running → http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error('Fatal DB error:', err));
