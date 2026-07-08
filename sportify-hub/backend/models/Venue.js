const { db } = require('../config/firebase');
const { docToObject } = require('../utils/serialize');
const { haversineKm } = require('../utils/geo');

const COLLECTION = 'venues';
const col = () => db.collection(COLLECTION);
const toVenue = docToObject;

async function findAll() {
  const snap = await col().get();
  return snap.docs.map(toVenue);
}

async function findById(id) {
  if (!id) return null;
  return toVenue(await col().doc(String(id)).get());
}

async function findByIds(ids) {
  const unique = [...new Set(ids.map(String))].filter(Boolean);
  const docs = await Promise.all(unique.map((id) => col().doc(id).get()));
  return docs.map(toVenue).filter(Boolean);
}

async function create(data) {
  const now = new Date();
  const ref = await col().add({ ...data, createdAt: now, updatedAt: now });
  return toVenue(await ref.get());
}

async function insertMany(items) {
  const batch = db.batch();
  const now = new Date();
  const refs = items.map((item) => {
    const ref = col().doc();
    batch.set(ref, { ...item, createdAt: now, updatedAt: now });
    return ref;
  });
  await batch.commit();
  const snaps = await Promise.all(refs.map((r) => r.get()));
  return snaps.map(toVenue);
}

async function count() {
  const snap = await col().count().get();
  return snap.data().count;
}

// Firestore has no native geo-radius query (same tradeoff as User.findNearby) —
// fine for this app's venue count; revisit with a geohash index if it grows large.
async function findNearby({ lat, lng, radiusMeters }) {
  const venues = await findAll();
  return venues
    .filter((v) => typeof v.location?.lat === 'number' && typeof v.location?.lng === 'number')
    .map((v) => ({ ...v, distanceKm: haversineKm(lat, lng, v.location.lat, v.location.lng) }))
    .filter((v) => v.distanceKm * 1000 <= radiusMeters)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

module.exports = { findAll, findById, findByIds, create, insertMany, count, findNearby };