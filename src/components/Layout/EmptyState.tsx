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
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mb-7">
          <div className="w-20 h-20 rounded-2xl bg-gray-800 border border-gray-700/80 flex items-center justify-center shadow-2xl">
            <svg className="w-10 h-10 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="6" width="20" height="12" rx="3" />
              <path strokeLinecap="round" d="M8 12h4M10 10v4" />
              <circle cx="15.5" cy="11" r="0.75" fill="currentColor" stroke="none" />
              <circle cx="17.5" cy="13" r="0.75" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="absolute -inset-3 bg-indigo-500/15 rounded-3xl blur-xl -z-10" />
        </div>

        <h2 className="text-[22px] font-bold text-white mb-2 tracking-tight">Your Game Settings</h2>
        <p className="text-sm text-gray-500 max-w-[280px] text-center leading-relaxed mb-10">
          Add your first game from the sidebar to start saving your configs
        </p>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[420px]">
          <FeatureCard
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>}
            label="Profiles"
            desc="Multiple configs per game"
          />
          <FeatureCard
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            label="Parameters"
            desc="Key-value settings table"
          />
          <FeatureCard
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
            label="Export"
            desc="Download all as JSON"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Your Library</h1>
        <p className="text-sm text-gray-500 mt-1">{games.length} game{games.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games.map((game) => {
          const count = profileCounts[game.id] ?? 0;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group relative aspect-video rounded-2xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {/* Background */}
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

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              {/* Hover tint */}
              <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/15 transition-colors duration-300" />

              {/* Profile count badge (top-right) */}
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
                <svg className="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                </svg>
                <span className="text-xs text-gray-300 font-medium">{count}</span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base leading-tight truncate">{game.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5">
                  {count === 0 ? 'No profiles' : `${count} profile${count !== 1 ? 's' : ''}`}
                </p>
              </div>

              {/* "Open" pill on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full">
                  Open
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
  <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 flex flex-col items-center text-center gap-2">
    <div className="text-indigo-400">{icon}</div>
    <span className="text-sm font-semibold text-gray-300">{label}</span>
    <span className="text-xs text-gray-600 leading-snug">{desc}</span>
  </div>
);
