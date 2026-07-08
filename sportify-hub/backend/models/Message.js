const { db } = require('../config/firebase');
const User = require('./User');
const { docToObject } = require('../utils/serialize');

const COLLECTION = 'messages';
const col = () => db.collection(COLLECTION);
const toMessage = docToObject;

async function populateSender(message) {
  if (!message) return message;
  const sender = await User.findById(message.senderId);
  return { ...message, senderId: sender ? { _id: sender._id, name: sender.name } : message.senderId };
}

async function create(data) {
  const now = new Date();
  const ref = await col().add({ ...data, createdAt: now });
  return populateSender(toMessage(await ref.get()));
}

async function findByGameId(gameId) {
  const snap = await col().where('gameId', '==', String(gameId)).get();
  const messages = snap.docs
    .map(toMessage)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const senders = await User.findByIds(messages.map((m) => m.senderId));
  const senderMap = new Map(senders.map((s) => [s._id, { _id: s._id, name: s.name }]));

  return messages.map((m) => ({ ...m, senderId: senderMap.get(m.senderId) || m.senderId }));
}

module.exports = { create, findByGameId };