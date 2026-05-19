import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Game, Profile, GameParam, GameFile } from '../types';

// ---- Games ----

export const gamesCollection = (uid: string) =>
  collection(db, 'users', uid, 'games');

export const addGame = async (
  uid: string,
  name: string,
  color: string
): Promise<string> => {
  const ref = await addDoc(gamesCollection(uid), {
    name,
    color,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const deleteGame = async (uid: string, gameId: string): Promise<void> => {
  // Delete all profiles first
  const profilesSnap = await getDocs(profilesCollection(uid, gameId));
  const deletePromises = profilesSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);
  await deleteDoc(doc(db, 'users', uid, 'games', gameId));
};

export const subscribeToGames = (
  uid: string,
  callback: (games: Game[]) => void
): Unsubscribe => {
  const q = query(gamesCollection(uid), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const games: Game[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Game, 'id'>),
    }));
    callback(games);
  });
};

// ---- Profiles ----

export const profilesCollection = (uid: string, gameId: string) =>
  collection(db, 'users', uid, 'games', gameId, 'profiles');

export const addProfile = async (
  uid: string,
  gameId: string,
  name: string
): Promise<string> => {
  const ref = await addDoc(profilesCollection(uid, gameId), {
    name,
    params: [],
    notes: '',
    tags: [],
    files: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProfile = async (
  uid: string,
  gameId: string,
  profileId: string,
  data: {
    name?: string;
    params?: GameParam[];
    notes?: string;
    tags?: string[];
    files?: GameFile[];
  }
): Promise<void> => {
  const ref = doc(db, 'users', uid, 'games', gameId, 'profiles', profileId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteProfile = async (
  uid: string,
  gameId: string,
  profileId: string
): Promise<void> => {
  await deleteDoc(
    doc(db, 'users', uid, 'games', gameId, 'profiles', profileId)
  );
};

export const copyProfile = async (
  uid: string,
  gameId: string,
  profile: Profile
): Promise<string> => {
  const ref = await addDoc(profilesCollection(uid, gameId), {
    name: `${profile.name} (copy)`,
    params: profile.params,
    notes: profile.notes,
    tags: profile.tags,
    files: profile.files,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const getAllGamesWithProfiles = async (uid: string) => {
  const gamesSnap = await getDocs(query(gamesCollection(uid), orderBy('createdAt', 'asc')));
  const result = await Promise.all(
    gamesSnap.docs.map(async (gameDoc) => {
      const game = { id: gameDoc.id, ...(gameDoc.data() as Omit<Game, 'id'>) };
      const profilesSnap = await getDocs(
        query(profilesCollection(uid, gameDoc.id), orderBy('createdAt', 'asc'))
      );
      const profiles: Profile[] = profilesSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Profile, 'id'>),
      }));
      return { game, profiles };
    })
  );
  return result;
};

export const subscribeToProfiles = (
  uid: string,
  gameId: string,
  callback: (profiles: Profile[]) => void
): Unsubscribe => {
  const q = query(
    profilesCollection(uid, gameId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const profiles: Profile[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Profile, 'id'>),
    }));
    callback(profiles);
  });
};
