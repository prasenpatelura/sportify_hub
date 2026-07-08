const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const Venue = require('./Venue');
const User = require('./User');
const { docToObject } = require('../utils/serialize');

const COLLECTION = 'games';
const col = () => db.collection(COLLECTION);
const toGame = docToObject;

async function create(data) {
  const now = new Date();
  const ref = await col().add({ maxPlayers: 10, ...data, createdAt: now, updatedAt: now });
  return toGame(await ref.get());
}

async function findById(id) {
  if (!id) return null;
  return toGame(await col().doc(String(id)).get());
}

async function findAllPopulated() {
  const snap = await col().get();
  const games = snap.docs.map(toGame);

  const [hosts, venues] = await Promise.all([
    User.findByIds(games.map((g) => g.hostId)),
    Venue.findByIds(games.map((g) => g.venueId)),
  ]);

  const hostMap = new Map(hosts.map((h) => [h._id, { _id: h._id, name: h.name }]));
  const venueMap = new Map(venues.map((v) => [v._id, { _id: v._id, name: v.name }]));

  return games.map((g) => ({
    ...g,
    hostId: hostMap.get(g.hostId) || null,
    venueId: venueMap.get(g.venueId) || null,
  }));
}

async function addPlayer(gameId, userId) {
  const ref = col().doc(String(gameId));
  await ref.update({ players: FieldValue.arrayUnion(String(userId)), updatedAt: new Date() });
  return toGame(await ref.get());
}

async function findQuickJoinCandidate({ sport, userId }) {
  const snap = await col().where('sport', '==', sport).get();
  const games = snap.docs.map(toGame);
  return (
    games.find((g) => g.players.length < g.maxPlayers && !g.players.includes(String(userId))) || null
  );
}

async function insertMany(items) {
  const batch = db.batch();
  const now = new Date();
  const refs = items.map((item) => {
    const ref = col().doc();
    batch.set(ref, { maxPlayers: 10, players: [], ...item, createdAt: now, updatedAt: now });
    return ref;
  });
  await batch.commit();
  const snaps = await Promise.all(refs.map((r) => r.get()));
  return snaps.map(toGame);
}

module.exports = { create, findById, findAllPopulated, addPlayer, findQuickJoinCandidate, insertMany };