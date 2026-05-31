import React from 'react';
import { Game } from '../../types';

interface EmptyStateProps {
  games: Game[];
  profileCounts: Record<string, number>;
  onSelectGame: (id: string) => void;
}

export const EmptyState = ({ games, profileCounts, onSelectGame }: EmptyStateProps) => {
  if (games.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none bg-pd-bg">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(109,40,217,0.08) 0%, transparent 60%)',
          }}
        />

        {/* Hexagon icon */}
        <div className="relative mb-7 w-20 h-20 flex items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 80 80" className="absolute top-0 left-0">
            <polygon
              points="40,4 72,22 72,58 40,76 8,58 8,22"
              stroke="rgba(139,92,246,0.25)"
              strokeWidth="1"
              fill="rgba(109,40,217,0.08)"
            />
            <polygon
              points="40,14 62,27 62,53 40,66 18,53 18,27"
              stroke="rgba(139,92,246,0.12)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <svg
            className="w-9 h-9 text-violet-400 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }}
          >
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <path strokeLinecap="round" d="M8 12h4M10 10v4" />
            <circle cx="15.5" cy="11" r="0.75" fill="currentColor" stroke="none" />
            <circle cx="17.5" cy="13" r="0.75" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">Start Your Library</h2>
        <p className="text-sm text-slate-600 max-w-[260px] text-center leading-relaxed mb-10">
          Add your first game from the sidebar to begin saving configs and profiles.
        </p>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[380px]">
          <FeatureCard
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>}
            label="Profiles"
            desc="Multiple configs per game"
          />
          <FeatureCard
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            label="Params"
            desc="Key-value settings table"
          />
          <FeatureCard
            icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            label="Export"
            desc="Download all as ZIP"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-pd-bg">
      <div className="mb-6 rounded-2xl border border-pd-b1 bg-pd-surface/70 p-5 shadow-panel-soft">
        <div>
          <p className="text-[10px] font-semibold text-cyan-300 uppercase tracking-[0.18em] mb-1">Your Collection</p>
          <h1 className="text-3xl font-black text-white tracking-tight">Game Library</h1>
          <p className="text-xs text-slate-500 mt-1">
            {games.length} title{games.length !== 1 ? 's' : ''} ready for profile management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {games.map((game) => {
          const count = profileCounts[game.id] ?? 0;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer focus:outline-none border border-pd-b1 bg-pd-s2 transition-all duration-300 hover:-translate-y-1"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 0 1px rgba(139,92,246,0.25), 0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(109,40,217,0.1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(109,40,217,0.5)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '';
              }}
            >
              {game.iconUrl ? (
                <img
                  src={game.iconUrl}
                  alt={game.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: game.color }}
                />
              )}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-pd-bg/95 via-pd-bg/40 to-transparent" />

              {/* Profile count badge — top left */}
              <div
                className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600 border border-pd-b1 uppercase tracking-wider"
                style={{ background: 'rgba(10,10,15,0.85)' }}
              >
                {count} profile{count !== 1 ? 's' : ''}
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-bold text-sm leading-tight truncate">{game.name}</h3>
              </div>

              {/* Hover open button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span
                  className="px-4 py-1.5 rounded text-xs font-bold text-white uppercase tracking-wider"
                  style={{
                    background: 'rgba(109,40,217,0.85)',
                    border: '1px solid rgba(139,92,246,0.4)',
                    boxShadow: '0 0 16px rgba(109,40,217,0.4)',
                  }}
                >
                  Open →
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) => (
  <div className="bg-pd-s2 border border-pd-b1 rounded-lg p-4 flex flex-col items-center text-center gap-2 hover:border-pd-b2 transition-colors">
    <div className="text-violet-500">{icon}</div>
    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
    <span className="text-[10px] text-slate-700 leading-snug">{desc}</span>
  </div>
);
