import React from 'react';
import { User } from 'firebase/auth';
import { signOut } from '../../firebase/auth';
import { Button } from '../UI/Button';

interface HeaderProps {
  user: User;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 shrink-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-xl">🎮</span>
        <span className="font-bold text-white text-lg">Game Settings</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-7 h-7 rounded-full ring-2 ring-gray-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <span className="text-gray-300 text-sm hidden sm:block">
            {user.displayName || user.email}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
};
