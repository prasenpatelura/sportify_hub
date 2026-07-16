const { db } = require('../config/firebase');
const Venue = require('./Venue');
const { docToObject } = require('../utils/serialize');

const COLLECTION = 'bookings';
const col = () => db.collection(COLLECTION);
const toBooking = docToObject;

// Single-field query (matches the rest of this file) so no Firestore composite
// index is needed — date/timeSlot filtering happens in application code.
async function findByVenueId(venueId) {
  const snap = await col().where('venueId', '==', String(venueId)).get();
  return snap.docs.map(toBooking);
}

async function findByVenueAndDate(venueId, date) {
  const bookings = await findByVenueId(venueId);
  return bookings.filter((b) => b.date === date && b.status !== 'Cancelled');
}

async function create(data) {
  const { venueId, date, timeSlot } = data;
  if (venueId && date && timeSlot) {
    const existing = await findByVenueAndDate(venueId, date);
    if (existing.some((b) => b.timeSlot === timeSlot)) {
      const err = new Error('This time slot was just booked by someone else. Please pick another.');
      err.status = 409;
      throw err;
    }
  }
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

module.exports = { create, findByUserId, findById, findByVenueAndDate, deleteById };