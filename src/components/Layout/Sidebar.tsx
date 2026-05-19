import React, { useState } from 'react';
import { Game } from '../../types';
import { Button } from '../UI/Button';
import { AddGameModal } from '../Games/AddGameModal';

interface SidebarProps {
  games: Game[];
  selectedGameId: string | null;
  onSelectGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onAddGame: (name: string, emoji: string) => Promise<void>;
  loading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  games,
  selectedGameId,
  onSelectGame,
  onDeleteGame,
  onAddGame,
  loading,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    if (!confirm('Delete this game and all its profiles?')) return;
    setDeletingId(gameId);
    try {
      await onDeleteGame(gameId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-800">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => setShowAddModal(true)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Game
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">Loading...</div>
          ) : games.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">
              No games yet. Add your first game!
            </div>
          ) : (
            games.map((game) => (
              <div
                key={game.id}
                onClick={() => onSelectGame(game.id)}
                className={`group flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-150 ${
                  selectedGameId === game.id
                    ? 'bg-indigo-600/20 text-white border-r-2 border-indigo-500'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl shrink-0">{game.emoji}</span>
                <span className="text-sm font-medium truncate flex-1">{game.name}</span>
                <button
                  onClick={(e) => handleDelete(e, game.id)}
                  disabled={deletingId === game.id}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all shrink-0"
                  title="Delete game"
                >
                  {deletingId === game.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
            ))
          )}
        </nav>
      </aside>

      <AddGameModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddGame}
      />
    </>
  );
};
