const crypto = require('crypto');
const { db } = require('../config/firebase');

const COLLECTION = 'otps';
const col = () => db.collection(COLLECTION);

const CODE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashCode = (phone, code) => crypto.createHash('sha256').update(`${phone}:${code}`).digest('hex');

function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

// Generates and stores a one-time code for `phone`. Returns the plaintext code —
// the caller decides whether to expose it (see routes/otp.js dev-mode note: this
// project has no paid SMS provider wired up, so there is nowhere else to send it).
async function issue(phone) {
  const code = generateCode();
  await col()
    .doc(phone)
    .set({
      codeHash: hashCode(phone, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
      attempts: 0,
    });
  return code;
}

async function verify(phone, code) {
  const ref = col().doc(phone);
  const snap = await ref.get();
  if (!snap.exists) return { ok: false, reason: 'No OTP requested for this number' };

  const data = snap.data();
  if (data.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: 'Too many attempts — request a new code' };
  }
  if (data.expiresAt.toDate() < new Date()) {
    await ref.delete();
    return { ok: false, reason: 'Code expired — request a new one' };
  }

  if (data.codeHash !== hashCode(phone, code)) {
    await ref.update({ attempts: data.attempts + 1 });
    return { ok: false, reason: 'Incorrect code' };
  }

  await ref.delete();
  return { ok: true };
}

module.exports = { issue, verify };
