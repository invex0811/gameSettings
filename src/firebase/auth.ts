import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
  signOut as firebaseSignOut,
  signInAnonymously as firebaseSignInAnonymously,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let redirectResultPromise: Promise<void> | null = null;

export const signInWithGoogle = async (): Promise<void> => {
  await signInWithRedirect(auth, googleProvider);
};

export const handleGoogleRedirectResult = async (): Promise<void> => {
  redirectResultPromise ??= getRedirectResult(auth).then(() => undefined);
  await redirectResultPromise;
};

export const signInAnonymously = async (): Promise<void> => {
  await firebaseSignInAnonymously(auth);
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
