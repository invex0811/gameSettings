import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Mod, Game } from '../../types';
import { subscribeToMods, deleteMod } from '../../firebase/firestore';
import { ModCard } from './ModCard';
import { AddModModal } from './AddModModal';
import { EditModModal } from './EditModModal';
import { AuthPromptModal } from './AuthPromptModal';
import { ConfirmModal } from '../UI/ConfirmModal';

const ADMIN_UID = import.meta.env.VITE_ADMIN_UID as string;

interface ModGame {
  gameId: string;
  gameName: string;
  gameIconUrl?: string;
  modCount: number;
}

interface ModsPageProps {
  user: User | null;
  games: Game[];
}

export const ModsPage: React.FC<ModsPageProps> = ({ user, games }) => {
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [myModsOnly, setMyModsOnly] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMod, setEditingMod] = useState<Mod | null>(null);
  const [confirmMod, setConfirmMod] = useState<Mod | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000);
    const unsub = subscribeToMods((m) => {
      clearTimeout(timer);
      setMods(m);
      setLoading(false);
    });
    return () => { clearTimeout(timer); unsub(); };
  }, []);

  const isGoogleUser = !!user && !user.isAnonymous;
  const isAdmin = isGoogleUser && !!ADMIN_UID && user!.uid === ADMIN_UID;

  const canEditMod = (mod: Mod) =>
    isAdmin || (isGoogleUser && mod.uploadedBy === user!.uid);
  const canDeleteMod = (mod: Mod) =>
    isAdmin || (isGoogleUser && mod.uploadedBy === user!.uid);

  const visibleMods = myModsOnly && isGoogleUser
    ? mods.filter((m) => m.uploadedBy === user!.uid)
    : mods;

  const modGames: ModGame[] = Object.values(
    visibleMods.reduce<Record<string, ModGame>>((acc, mod) => {
      if (!acc[mod.gameId]) {
        acc[mod.gameId] = {
          gameId: mod.gameId,
          gameName: mod.gameName,
          gameIconUrl: mod.gameIconUrl,
          modCount: 0,
        };
      }
      acc[mod.gameId].modCount += 1;
      return acc;
    }, {})
  );

  const selectedGame = selectedGameId ? modGames.find((g) => g.gameId === selectedGameId) ?? null : null;
  const selectedMods = selectedGameId ? visibleMods.filter((m) => m.gameId === selectedGameId) : [];

  const prefilledGame = selectedGame
    ? { gameId: selectedGame.gameId, gameName: selectedGame.gameName, gameIconUrl: selectedGame.gameIconUrl }
    : undefined;

  const handleAddModClick = () => {
    if (!isGoogleUser) setShowAuthPrompt(true);
    else setShowAddModal(true);
  };

  const handleAuthed = () => {
    setShowAuthPrompt(false);
    setShowAddModal(true);
  };

  const handleDelete = async () => {
    if (!confirmMod) return;
    await deleteMod(confirmMod.id);
    setConfirmMod(null);
  };

  // ── Level 2: mods for selected game ──────────────────────────────────────
  if (selectedGameId) {
    const game = selectedGame ?? { gameId: selectedGameId, gameName: '—', modCount: 0 };
    return (
      <div className="flex-1 overflow-hidden flex flex-col bg-pd-bg">
        <div className="px-6 py-4 border-b border-pd-b1 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSelectedGameId(null)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-pd-b1 bg-pd-s2 text-slate-300 hover:text-white hover:border-pd-b2 hover:bg-pd-s3 text-xs font-semibold transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            All Games
          </button>
          <div className="h-4 w-px bg-pd-b2" />
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {game.gameIconUrl ? (
              <img src={game.gameIconUrl} alt={game.gameName} className="w-8 h-5 object-cover rounded shrink-0" />
            ) : (
              <div className="w-8 h-5 rounded bg-violet-950/60 shrink-0" />
            )}
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm truncate">{game.gameName}</h2>
              <p className="text-[10px] text-slate-600">{selectedMods.length} mod{selectedMods.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={handleAddModClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-800/50 bg-violet-950/40 text-violet-400 hover:bg-violet-950/60 hover:border-violet-700 text-xs font-semibold tracking-wide uppercase transition-all duration-150 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Mod
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {selectedMods.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-700 text-sm mb-2">No mods here yet.</p>
              <button onClick={handleAddModClick} className="text-violet-500 hover:text-violet-400 text-sm underline transition-colors">
                Add the first mod.
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {selectedMods.map((mod) => (
                <ModCard
                  key={mod.id}
                  mod={mod}
                  canEdit={canEditMod(mod)}
                  canDelete={canDeleteMod(mod)}
                  onEdit={() => setEditingMod(mod)}
                  onDelete={() => setConfirmMod(mod)}
                />
              ))}
            </div>
          )}
        </div>

        <AddModModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} games={games} user={user} prefilledGame={prefilledGame} />
        <EditModModal isOpen={editingMod !== null} onClose={() => setEditingMod(null)} mod={editingMod} />
        <AuthPromptModal isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} onAuthed={handleAuthed} />
        <ConfirmModal isOpen={confirmMod !== null} title="Delete mod" description={`"${confirmMod?.name}" will be permanently deleted.`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmMod(null)} />
      </div>
    );
  }

  // ── Level 1: game cards grid ──────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-pd-bg">
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-700 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
        </div>
      ) : modGames.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(109,40,217,0.06) 0%, transparent 60%)' }} />
          <svg className="w-12 h-12 text-violet-900 mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-slate-600 text-sm mb-1">{myModsOnly ? "You haven't uploaded any mods yet." : 'No mods uploaded yet.'}</p>
          {myModsOnly && (
            <button onClick={() => setMyModsOnly(false)} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pd-b1 bg-pd-s2 text-slate-300 hover:text-white hover:border-pd-b2 text-xs font-semibold transition-all duration-150">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              All Mods
            </button>
          )}
          {isGoogleUser && !myModsOnly && (
            <button onClick={handleAddModClick} className="text-violet-500 hover:text-violet-400 text-sm underline transition-colors">
              Be the first to add one.
            </button>
          )}
          {isGoogleUser && myModsOnly && (
            <button onClick={handleAddModClick} className="mt-1 text-violet-500 hover:text-violet-400 text-sm underline transition-colors">
              Upload your first mod.
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-[0.15em] mb-1">Public Library</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Mods</h1>
              <p className="text-xs text-slate-600 mt-1">
                {modGames.length} game{modGames.length !== 1 ? 's' : ''} · {visibleMods.length} mod{visibleMods.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isGoogleUser && (
                <div className="flex rounded-lg border border-pd-b1 overflow-hidden text-xs font-semibold">
                  <button
                    onClick={() => setMyModsOnly(false)}
                    className={`px-3 py-1.5 transition-colors ${!myModsOnly ? 'bg-violet-950/60 text-violet-300' : 'text-slate-500 hover:text-slate-300 hover:bg-pd-s2'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMyModsOnly(true)}
                    className={`px-3 py-1.5 transition-colors border-l border-pd-b1 ${myModsOnly ? 'bg-violet-950/60 text-violet-300' : 'text-slate-500 hover:text-slate-300 hover:bg-pd-s2'}`}
                  >
                    My Mods
                  </button>
                </div>
              )}
              <button
                onClick={handleAddModClick}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-800/50 bg-violet-950/40 text-violet-400 hover:bg-violet-950/60 hover:border-violet-700 text-xs font-semibold tracking-wide uppercase transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Mod
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {modGames.map((game) => (
              <button
                key={game.gameId}
                onClick={() => setSelectedGameId(game.gameId)}
                className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer focus:outline-none border border-pd-b1 bg-pd-s2 transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 1px rgba(139,92,246,0.25), 0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(109,40,217,0.1)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(109,40,217,0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '';
                }}
              >
                {game.gameIconUrl ? (
                  <img src={game.gameIconUrl} alt={game.gameName} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 to-pd-s3 transition-transform duration-500 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-pd-bg/95 via-pd-bg/40 to-transparent" />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600 border border-pd-b1 uppercase tracking-wider" style={{ background: 'rgba(10,10,15,0.85)' }}>
                  {game.modCount} mod{game.modCount !== 1 ? 's' : ''}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-white font-bold text-sm leading-tight truncate">{game.gameName}</h3>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="px-4 py-1.5 rounded text-xs font-bold text-white uppercase tracking-wider" style={{ background: 'rgba(109,40,217,0.85)', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 16px rgba(109,40,217,0.4)' }}>
                    Open →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <AddModModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} games={games} user={user} prefilledGame={prefilledGame} />
      <AuthPromptModal isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} onAuthed={handleAuthed} />
      <ConfirmModal isOpen={confirmMod !== null} title="Delete mod" description={`"${confirmMod?.name}" will be permanently deleted.`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmMod(null)} />
    </div>
  );
};
