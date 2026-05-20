import React, { useState } from 'react';
import { Game } from '../../types';
import { Button } from '../UI/Button';
import { AddGameModal } from '../Games/AddGameModal';
import { EditGameModal } from '../Games/EditGameModal';
import { ConfirmModal } from '../UI/ConfirmModal';

interface SidebarProps {
  games: Game[];
  selectedGameId: string | null;
  onSelectGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onAddGame: (name: string, color: string) => Promise<void>;
  onEditGame: (gameId: string, name: string, color: string) => Promise<void>;
  loading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  games,
  selectedGameId,
  onSelectGame,
  onDeleteGame,
  onAddGame,
  onEditGame,
  loading,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmGame, setConfirmGame] = useState<Game | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, game: Game) => {
    e.stopPropagation();
    setConfirmGame(game);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmGame) return;
    const id = confirmGame.id;
    setConfirmGame(null);
    setDeletingId(id);
    try {
      await onDeleteGame(id);
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

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
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
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                  selectedGameId === game.id
                    ? 'bg-indigo-600/20 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md shrink-0"
                  style={{ backgroundColor: game.color }}
                />
                <span className="text-sm font-bold truncate flex-1">{game.name}</span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity duration-150">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingGame(game); }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/15 hover:scale-110 active:scale-95 transition-all duration-150"
                    title="Edit game"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, game)}
                    disabled={deletingId === game.id}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/15 hover:scale-110 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete game"
                  >
                    {deletingId === game.id ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
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

      <EditGameModal
        isOpen={editingGame !== null}
        game={editingGame}
        onClose={() => setEditingGame(null)}
        onSave={onEditGame}
      />

      <ConfirmModal
        isOpen={confirmGame !== null}
        title="Delete game"
        description={`"${confirmGame?.name}" and all its profiles will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmGame(null)}
      />
    </>
  );
};
