import { useState, useEffect } from 'react';
import { Game } from '../types';
import { subscribeToGames, addGame, deleteGame, updateGame } from '../firebase/firestore';

interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  createGame: (name: string, color: string) => Promise<void>;
  editGame: (gameId: string, name: string, color: string) => Promise<void>;
  removeGame: (gameId: string) => Promise<void>;
}

export const useGames = (uid: string | null): UseGamesReturn => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

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
    });
    return unsubscribe;
  }, [uid]);

  const createGame = async (name: string, color: string): Promise<void> => {
    if (!uid) return;
    await addGame(uid, name, color);
  };

  const editGame = async (gameId: string, name: string, color: string): Promise<void> => {
    if (!uid) return;
    await updateGame(uid, gameId, { name, color });
  };

  const removeGame = async (gameId: string): Promise<void> => {
    if (!uid) return;
    await deleteGame(uid, gameId);
  };

  return { games, loading, createGame, editGame, removeGame };
};
