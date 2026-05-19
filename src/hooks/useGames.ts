import { useState, useEffect } from 'react';
import { Game } from '../types';
import { subscribeToGames, addGame, deleteGame } from '../firebase/firestore';

interface UseGamesReturn {
  games: Game[];
  loading: boolean;
  createGame: (name: string, emoji: string) => Promise<void>;
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

  const createGame = async (name: string, emoji: string): Promise<void> => {
    if (!uid) return;
    await addGame(uid, name, emoji);
  };

  const removeGame = async (gameId: string): Promise<void> => {
    if (!uid) return;
    await deleteGame(uid, gameId);
  };

  return { games, loading, createGame, removeGame };
};
