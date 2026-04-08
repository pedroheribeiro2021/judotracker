import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey?.trim()) {
  throw new Error(
    "Firebase: falta VITE_FIREBASE_API_KEY. Cria/edita frontend/.env com as chaves do Firebase Console e reinicia o Vite (npm run dev)."
  );
}

const app = initializeApp(firebaseConfig as any);
export const auth = getAuth(app);
