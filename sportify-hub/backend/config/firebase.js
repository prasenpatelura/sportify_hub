const admin = require('firebase-admin');

function loadCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  return null;
}

if (!admin.apps.length) {
  const credential = loadCredential();

  // No credential + FIRESTORE_EMULATOR_HOST set → connects to the local Firestore emulator (free, no cloud project needed).
  admin.initializeApp(
    credential
      ? { credential: admin.credential.cert(credential), projectId: credential.projectId }
      : { projectId: process.env.FIREBASE_PROJECT_ID }
  );
}

const db = admin.firestore();

module.exports = { admin, db };
