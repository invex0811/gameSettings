import React from 'react';
import { Game } from '../../types';

interface EmptyStateProps {
  games: Game[];
  onSelectGame: (id: string) => void;
}

export const EmptyState = ({ games, onSelectGame }: EmptyStateProps) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
    {/* Dot grid */}
    <div
      className="absolute inset-0 opacity-[0.04] pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    />

    {/* Glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

    {/* Icon */}
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

    {games.length > 0 ? (
      <>
        <h2 className="text-[22px] font-bold text-white mb-2 tracking-tight">
          Select a game
        </h2>
        <p className="text-sm text-gray-500 max-w-[280px] text-center leading-relaxed mb-8">
          Click on a game to view and manage its profiles
        </p>

        <div className="flex flex-wrap justify-center gap-3 w-full max-w-[520px]">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className="group bg-gray-800/60 hover:bg-gray-800 border border-gray-700/40 hover:border-gray-600 rounded-xl p-4 flex flex-col items-center gap-3 transition-all duration-150 cursor-pointer w-[150px]"
            >
              <div
                className="w-10 h-10 rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-150"
                style={{ backgroundColor: game.color }}
              />
              <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors duration-150 truncate w-full text-center">
                {game.name}
              </span>
            </button>
          ))}
        </div>
      </>
    ) : (
      <>
        <h2 className="text-[22px] font-bold text-white mb-2 tracking-tight">
          Your Game Settings
        </h2>
        <p className="text-sm text-gray-500 max-w-[280px] text-center leading-relaxed mb-10">
          Add your first game from the sidebar to start saving your configs
        </p>

        <div className="grid grid-cols-3 gap-3 w-full max-w-[420px]">
          <FeatureCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
              </svg>
            }
            label="Profiles"
            desc="Multiple configs per game"
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            label="Parameters"
            desc="Key-value settings table"
          />
          <FeatureCard
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
            label="Export"
            desc="Download all as JSON"
          />
        </div>
      </>
    )}
  </div>
);

const FeatureCard = ({
  icon,
  label,
  desc,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
}) => (
  <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 flex flex-col items-center text-center gap-2">
    <div className="text-indigo-400">{icon}</div>
    <span className="text-sm font-semibold text-gray-300">{label}</span>
    <span className="text-xs text-gray-600 leading-snug">{desc}</span>
  </div>
);
