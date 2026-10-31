import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export async function sendFirebasePhoneCode(
  phone: string,
  containerId = 'firebase-recaptcha-container',
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Auth no está configurado');

  const digits = phone.replace(/\D/g, '').replace(/^591/, '');
  if (!/^[67]\d{7}$/.test(digits)) throw new Error('Escribe un celular boliviano válido de 8 dígitos.');
  const e164 = `+591${digits}`;
  auth.languageCode = 'es';

  // Each request gets a fresh challenge, including resends and reopened dialogs.
  const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  try {
    return await signInWithPhoneNumber(auth, e164, verifier);
  } finally {
    verifier.clear();
  }
}
