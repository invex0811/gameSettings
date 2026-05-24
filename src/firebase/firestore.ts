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
  getCountFromServer,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { Game, Profile, GameParam, GameFile, DropboxArchive, Mod } from '../types';

// ---- Games ----

export const gamesCollection = (uid: string) =>
  collection(db, 'users', uid, 'games');

export const addGame = async (
  uid: string,
  name: string,
  color: string,
  iconUrl?: string
): Promise<string> => {
  const ref = await addDoc(gamesCollection(uid), {
    name,
    color,
    ...(iconUrl ? { iconUrl } : {}),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateGame = async (
  uid: string,
  gameId: string,
  data: { name?: string; color?: string; iconUrl?: string | null }
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid, 'games', gameId), data);
};

export const deleteGame = async (uid: string, gameId: string): Promise<void> => {
  // Delete all profiles first
  const profilesSnap = await getDocs(profilesCollection(uid, gameId));
  const deletePromises = profilesSnap.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletePromises);
  await deleteDoc(doc(db, 'users', uid, 'games', gameId));
};

export const getProfileCounts = async (
  uid: string,
  gameIds: string[]
): Promise<Record<string, number>> => {
  const entries = await Promise.all(
    gameIds.map(async (id) => {
      const snap = await getCountFromServer(profilesCollection(uid, id));
      return [id, snap.data().count] as [string, number];
    })
  );
  return Object.fromEntries(entries);
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
  name: string,
  extra?: {
    params?: GameParam[];
    notes?: string;
    tags?: string[];
    files?: GameFile[];
    archives?: DropboxArchive[];
  }
): Promise<string> => {
  const ref = await addDoc(profilesCollection(uid, gameId), {
    name,
    params: extra?.params ?? [],
    notes: extra?.notes ?? '',
    tags: extra?.tags ?? [],
    files: extra?.files ?? [],
    archives: extra?.archives ?? [],
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
    archives?: DropboxArchive[];
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
    archives: profile.archives || [],
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

// ---- Mods (public collection) ----

export const modsCollection = () => collection(db, 'mods');

export const subscribeToMods = (
  callback: (mods: Mod[]) => void
): Unsubscribe => {
  const q = query(modsCollection(), orderBy('uploadedAt', 'desc'));
  return onSnapshot(q, (snap: QuerySnapshot<DocumentData>) => {
    const mods: Mod[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Mod, 'id'>),
    }));
    callback(mods);
  });
};

export const addMod = async (
  data: Omit<Mod, 'id' | 'uploadedAt'>
): Promise<string> => {
  const ref = await addDoc(modsCollection(), {
    ...data,
    uploadedAt: serverTimestamp(),
  });
  return ref.id;
};

export const deleteMod = async (modId: string): Promise<void> => {
  await deleteDoc(doc(db, 'mods', modId));
};

export const updateMod = async (
  modId: string,
  data: { name?: string; description?: string; modIconUrl?: string | null }
): Promise<void> => {
  await updateDoc(doc(db, 'mods', modId), data);
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
