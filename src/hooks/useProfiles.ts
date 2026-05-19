import { useState, useEffect } from 'react';
import { Profile, GameParam, GameFile } from '../types';
import {
  subscribeToProfiles,
  addProfile,
  updateProfile,
  deleteProfile,
  copyProfile,
} from '../firebase/firestore';

interface UseProfilesReturn {
  profiles: Profile[];
  loading: boolean;
  createProfile: (name: string) => Promise<void>;
  editProfile: (
    profileId: string,
    data: {
      name?: string;
      params?: GameParam[];
      notes?: string;
      tags?: string[];
      files?: GameFile[];
    }
  ) => Promise<void>;
  removeProfile: (profileId: string) => Promise<void>;
  duplicateProfile: (profile: Profile) => Promise<void>;
}

export const useProfiles = (
  uid: string | null,
  gameId: string | null
): UseProfilesReturn => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !gameId) {
      setProfiles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToProfiles(uid, gameId, (p) => {
      setProfiles(p);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid, gameId]);

  const createProfile = async (name: string): Promise<void> => {
    if (!uid || !gameId) return;
    await addProfile(uid, gameId, name);
  };

  const editProfile = async (
    profileId: string,
    data: {
      name?: string;
      params?: GameParam[];
      notes?: string;
      tags?: string[];
      files?: GameFile[];
    }
  ): Promise<void> => {
    if (!uid || !gameId) return;
    await updateProfile(uid, gameId, profileId, data);
  };

  const removeProfile = async (profileId: string): Promise<void> => {
    if (!uid || !gameId) return;
    await deleteProfile(uid, gameId, profileId);
  };

  const duplicateProfile = async (profile: Profile): Promise<void> => {
    if (!uid || !gameId) return;
    await copyProfile(uid, gameId, profile);
  };

  return { profiles, loading, createProfile, editProfile, removeProfile, duplicateProfile };
};
