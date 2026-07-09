const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/firebase'); // initializes the Firebase Admin app / Firestore connection

const app = express();

app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/venues',   require('./routes/venues'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/games',    require('./routes/games'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/stats',    require('./routes/stats'));

app.get('/', (_req, res) => res.send('Sportify Hub API is running ✓'));

module.exports = app;
