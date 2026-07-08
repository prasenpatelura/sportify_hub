// Vercel serverless entry point. No socket.io/chat here — serverless functions
// don't hold a persistent connection open between requests, so real-time chat
// needs an always-on host (see ../server.js) instead of Vercel.
const app = require('../app');
const { seedIfEmpty } = require('../seed');

seedIfEmpty().catch((err) => console.error('Seed error:', err));

module.exports = app;
