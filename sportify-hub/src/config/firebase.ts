// Firebase is optional — the app works without it using the Express backend.
// To enable Firebase, replace the placeholder values below with your project config.
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY';

// Only initialize Firebase when real credentials are supplied
let app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    _db = getFirestore(app);
    _auth = getAuth(app);
  } catch (e) {
    console.warn('[Sportify] Firebase init failed:', e);
  }
}

export const db = _db as Firestore;
export const auth = _auth as Auth;
export default app;
