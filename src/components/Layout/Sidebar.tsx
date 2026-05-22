import React, { useState } from 'react';
import { Game } from '../../types';
import { AddGameModal } from '../Games/AddGameModal';
import { EditGameModal } from '../Games/EditGameModal';
import { ConfirmModal } from '../UI/ConfirmModal';
import { GameIcon } from '../UI/GameIcon';

interface SidebarProps {
  games: Game[];
  selectedGameId: string | null;
  onSelectGame: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onAddGame: (name: string, color: string, iconUrl?: string) => Promise<void>;
  onEditGame: (gameId: string, name: string, color: string, iconUrl?: string | null) => Promise<void>;
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
      <aside className="w-60 bg-pd-surface border-r border-pd-b1 flex flex-col shrink-0">
        <div className="p-3 border-b border-pd-b1">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-violet-800/50 bg-violet-950/40 text-violet-400 hover:bg-violet-950/60 hover:border-violet-700 text-xs font-semibold tracking-wide uppercase transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Game
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-1.5 px-2 space-y-0.5">
          {loading ? (
            <div className="px-4 py-8 text-center text-slate-700 text-xs">Loading...</div>
          ) : games.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-700 text-xs leading-relaxed">
              No games yet.<br />Add your first game!
            </div>
          ) : (
            <>
              <div className="px-2 py-1.5 text-[10px] font-semibold text-slate-700 uppercase tracking-[0.15em]">
                Library
              </div>
              {games.map((game) => (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game.id)}
                  className={`group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-150 border ${
                    selectedGameId === game.id
                      ? 'bg-violet-950/40 border-violet-800/40 text-white'
                      : 'text-slate-500 border-transparent hover:bg-pd-s2 hover:border-pd-b1 hover:text-slate-300'
                  }`}
                >
                  {/* Active left accent bar */}
                  {selectedGameId === game.id && (
                    <div
                      className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-r"
                      style={{
                        background: 'linear-gradient(to bottom, #8b5cf6, #6d28d9)',
                        boxShadow: '0 0 6px rgba(139,92,246,0.6)',
                      }}
                    />
                  )}
                  <GameIcon
                    iconUrl={game.iconUrl}
                    color={game.color}
                    name={game.name}
                    className="w-7 h-7 rounded-md shrink-0 object-cover border border-white/8"
                  />
                  <span className={`text-xs font-semibold truncate flex-1 ${selectedGameId === game.id ? 'text-white' : ''}`}>
                    {game.name}
                  </span>
                  {/* Count — hidden on hover */}
                  <span className="text-[11px] text-slate-700 font-medium tabular-nums group-hover:hidden">
                    {/* count shown via profileCounts — not available here, omit */}
                  </span>
                  {/* Actions — shown on hover */}
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity duration-150">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingGame(game); }}
                      className="p-1 rounded-md text-slate-600 hover:text-amber-400 hover:bg-amber-500/12 transition-all duration-150"
                      title="Edit game"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, game)}
                      disabled={deletingId === game.id}
                      className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/12 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete game"
                    >
                      {deletingId === game.id ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </>
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
        onSave={(gameId, name, color, iconUrl) => onEditGame(gameId, name, color, iconUrl)}
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
