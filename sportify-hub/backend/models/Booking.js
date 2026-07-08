const { db } = require('../config/firebase');
const Venue = require('./Venue');
const { docToObject } = require('../utils/serialize');

const COLLECTION = 'bookings';
const col = () => db.collection(COLLECTION);
const toBooking = docToObject;

async function create(data) {
  const now = new Date();
  const ref = await col().add({ status: 'Confirmed', ...data, createdAt: now, updatedAt: now });
  return toBooking(await ref.get());
}

async function findByUserId(userId) {
  const snap = await col().where('userId', '==', String(userId)).get();
  const bookings = snap.docs.map(toBooking);

  const venues = await Venue.findByIds(bookings.map((b) => b.venueId));
  const venueMap = new Map(venues.map((v) => [v._id, v]));

  return bookings.map((b) => ({ ...b, venueId: venueMap.get(b.venueId) || b.venueId }));
}

async function findById(id) {
  const booking = toBooking(await col().doc(String(id)).get());
  if (!booking) return null;

  const venue = await Venue.findById(booking.venueId);
  return { ...booking, venueId: venue || booking.venueId };
}

async function deleteById(id) {
  const ref = col().doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) return null;
  await ref.delete();
  return toBooking(snap);
}

module.exports = { create, findByUserId, findById, deleteById };