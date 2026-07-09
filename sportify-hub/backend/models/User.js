const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { FieldValue, FieldPath } = require('firebase-admin/firestore');
const { docToObject } = require('../utils/serialize');
const { haversineKm } = require('../utils/geo');

const COLLECTION = 'users';
const col = () => db.collection(COLLECTION);
const toUser = docToObject;

function omitPassword(user) {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
}

async function findByUsername(username) {
  const snap = await col().where('username', '==', username).limit(1).get();
  return snap.empty ? null : toUser(snap.docs[0]);
}

async function createWithUsername({ name, username, password }) {
  const now = new Date();
  const passwordHash = await bcrypt.hash(password, 10);
  const ref = await col().add({
    name: name || 'Player',
    username,
    password: passwordHash,
    sports: [],
    skillLevel: 'Beginner',
    xp: 0,
    level: 1,
    streak: 0,
    matchesPlayed: 0,
    winRate: 0,
    badges: [],
    createdAt: now,
    updatedAt: now,
  });
  return toUser(await ref.get());
}

async function verifyPassword(user, password) {
  if (!user?.password) return false;
  return bcrypt.compare(password, user.password);
}

async function findById(id) {
  if (!id) return null;
  return toUser(await col().doc(String(id)).get());
}

async function findByIds(ids) {
  const unique = [...new Set(ids.map(String))].filter(Boolean);
  if (!unique.length) return [];

  // Firestore 'in' queries accept at most 30 values per query.
  const chunks = [];
  for (let i = 0; i < unique.length; i += 30) chunks.push(unique.slice(i, i + 30));

  const results = await Promise.all(
    chunks.map((chunk) => col().where(FieldPath.documentId(), 'in', chunk).get())
  );
  return results.flatMap((snap) => snap.docs.map(toUser));
}

async function updateById(id, fields) {
  const ref = col().doc(String(id));
  await ref.set({ ...fields, updatedAt: new Date() }, { merge: true });
  return toUser(await ref.get());
}

async function incrementXpAndMatches(ids, { xp = 0, matchesPlayed = 0 }) {
  const unique = [...new Set(ids.map(String))].filter(Boolean);
  if (!unique.length) return;

  const batch = db.batch();
  unique.forEach((id) => {
    batch.update(col().doc(id), {
      xp: FieldValue.increment(xp),
      matchesPlayed: FieldValue.increment(matchesPlayed),
      updatedAt: new Date(),
    });
  });
  await batch.commit();
}

// Firestore has no native geo-radius query, so nearby users are fetched by the
// locationEnabled flag and filtered/sorted by haversine distance in memory.
// Fine at this app's scale; revisit with a geohash index if the user base grows large.
async function findNearby({ lat, lng, radiusMeters, excludeUserId }) {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const snap = await col().where('locationEnabled', '==', true).get();

  return snap.docs
    .map(toUser)
    .filter((u) => u._id !== String(excludeUserId))
    .filter((u) => u.lastSeen && new Date(u.lastSeen) >= cutoff)
    .filter((u) => u.location?.coordinates?.length === 2)
    .map((u) => {
      const [pLng, pLat] = u.location.coordinates;
      return { ...u, distanceKm: haversineKm(lat, lng, pLat, pLng) };
    })
    .filter((u) => u.distanceKm * 1000 <= radiusMeters)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20)
    .map(omitPassword);
}

module.exports = {
  findByUsername,
  createWithUsername,
  verifyPassword,
  findById,
  findByIds,
  updateById,
  incrementXpAndMatches,
  omitPassword,
  findNearby,
};