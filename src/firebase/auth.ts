import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signOut as firebaseSignOut,
  signInAnonymously as firebaseSignInAnonymously,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, requireFirebaseConfig } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let redirectResultPromise: Promise<void> | null = null;

const requireAuth = (): Auth => {
  requireFirebaseConfig();
  if (!auth) {
    throw new Error('Firebase Auth is unavailable.');
  }
  return auth;
};

export const signInWithGoogle = async (): Promise<void> => {
  await signInWithPopup(requireAuth(), googleProvider);
};

export const handleGoogleRedirectResult = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  redirectResultPromise ??= getRedirectResult(requireAuth()).then(() => undefined);
  await redirectResultPromise;
};

export const signInAnonymously = async (): Promise<void> => {
  await firebaseSignInAnonymously(requireAuth());
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(requireAuth());
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(requireAuth(), callback);
};
