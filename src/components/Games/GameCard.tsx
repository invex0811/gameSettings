import React from 'react';
import { Game } from '../../types';

interface GameCardProps {
  game: Game;
  profileCount: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  profileCount,
  isSelected,
  onClick,
  onDelete,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-indigo-600/20 border-indigo-500/50'
          : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
      }`}
    >
      <span className="text-3xl">{game.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{game.name}</p>
        <p className="text-xs text-gray-500">
          {profileCount} profile{profileCount !== 1 ? 's' : ''}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
        title="Delete game"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
};
