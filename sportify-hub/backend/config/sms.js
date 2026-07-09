const twilio = require('twilio');

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

const configured = Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
const client = configured ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) : null;

// Sends a real SMS via Twilio when TWILIO_* env vars are set; otherwise the
// caller (routes/otp.js) falls back to dev mode and echoes the code instead.
async function sendSms(phone, body) {
  if (!client) return false;
  await client.messages.create({ to: phone, from: TWILIO_FROM_NUMBER, body });
  return true;
}

module.exports = { sendSms };
