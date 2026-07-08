// Converts a Firestore doc snapshot into a plain object, turning any
// Firestore Timestamp fields into ISO date strings (Mongoose's default
// serialization, which the frontend already expects, e.g. `new Date(x.createdAt)`).
function docToObject(snap) {
  if (!snap || !snap.exists) return null;
  const data = snap.data();
  const result = { _id: snap.id };
  for (const [key, value] of Object.entries(data)) {
    result[key] = value && typeof value.toDate === 'function' ? value.toDate().toISOString() : value;
  }
  return result;
}

module.exports = { docToObject };