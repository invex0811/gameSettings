import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { signOut } from '../../firebase/auth';
import { Button } from '../UI/Button';

interface HeaderProps {
  user: User;
  onExportAll: () => Promise<void>;
}

export const Header: React.FC<HeaderProps> = ({ user, onExportAll }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleExportAll = async () => {
    setMenuOpen(false);
    setExporting(true);
    try {
      await onExportAll();
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 relative flex items-center px-4 shrink-0 z-10">
      <div className="flex-1" />
      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <span className="text-xl">🎮</span>
        <span className="font-bold text-white text-lg">Game Settings</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Settings menu */}
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen((v) => !v)} title="Settings" disabled={exporting}>
            {exporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </Button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-1 overflow-hidden">
                <p className="px-3 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">Export</p>
                <button
                  onClick={handleExportAll}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All Games to JSON
                </button>
              </div>
            </>
          )}
        </div>

        {/* User info + sign out */}
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
