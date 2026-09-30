import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Default / Local storage key
const STORAGE_KEY = 'manca_firebase_custom_config';

export const getSavedFirebaseConfig = () => {
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) return JSON.parse(fromStorage);
  } catch (e) {
    console.error('Errore lettura config Firebase da localStorage:', e);
  }

  // Fallback to Vite env variables if set
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
};

export const saveFirebaseConfig = (config) => {
  if (!config) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.location.reload();
};

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let isFirebaseConfigured = false;

const config = getSavedFirebaseConfig();

if (config && config.apiKey && config.projectId) {
  try {
    app = !getApps().length ? initializeApp(config) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    isFirebaseConfigured = true;
    console.log('✅ Firebase connesso al progetto:', config.projectId);
  } catch (err) {
    console.error('❌ Errore inizializzazione Firebase:', err);
  }
}

export { app, auth, db, googleProvider, isFirebaseConfigured };
