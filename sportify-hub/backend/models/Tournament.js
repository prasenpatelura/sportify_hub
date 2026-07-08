const { db } = require('../config/firebase');
const { docToObject } = require('../utils/serialize');

const COLLECTION = 'tournaments';
const col = () => db.collection(COLLECTION);
const toTournament = docToObject;

async function findAll() {
  const snap = await col().get();
  return snap.docs.map(toTournament);
}

async function findById(id) {
  if (!id) return null;
  return toTournament(await col().doc(String(id)).get());
}

async function create(data) {
  const now = new Date();
  const ref = await col().add({ participants: [], status: 'Open', ...data, createdAt: now, updatedAt: now });
  return toTournament(await ref.get());
}

module.exports = { findAll, findById, create };