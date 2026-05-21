import { useState, useEffect } from 'react';
import { Game } from '../types';
import { subscribeToGames, addGame, deleteGame, updateGame, getProfileCounts } from '../firebase/firestore';

interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  profileCounts: Record<string, number>;
  createGame: (name: string, color: string, iconUrl?: string) => Promise<void>;
  editGame: (gameId: string, name: string, color: string, iconUrl?: string | null) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
}

export const useGames = (uid: string | null): UseGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileCounts, setProfileCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!uid) {
      setGames([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToGames(uid, (g) => {
      setGames(g);
      setLoading(false);
      if (g.length > 0) {
        getProfileCounts(uid, g.map((x) => x.id)).then(setProfileCounts);
      }
    });
    return unsubscribe;
  }, [uid]);

  const createGame = async (name: string, color: string, iconUrl?: string): Promise<void> => {
    if (!uid) return;
    await addGame(uid, name, color, iconUrl);
  };

  const editGame = async (gameId: string, name: string, color: string, iconUrl?: string | null): Promise<void> => {
    if (!uid) return;
    await updateGame(uid, gameId, { name, color, iconUrl: iconUrl ?? null });
  };

  const removeGame = async (gameId: string): Promise<void> => {
    if (!uid) return;
    await deleteGame(uid, gameId);
  };

  return { games, loading, profileCounts, createGame, editGame, removeGame };
};
