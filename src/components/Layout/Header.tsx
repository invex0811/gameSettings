import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { signOut } from '../../firebase/auth';

interface HeaderProps {
  user: User;
  onExportAll: () => Promise<void>;
  onHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onExportAll, onHome }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
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
    <header className="h-14 bg-pd-surface border-b border-pd-b1 flex items-center justify-between px-5 shrink-0 z-10 relative">
      {/* Gold + violet accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(139,92,246,0.6) 30%, rgba(245,158,11,0.4) 70%, transparent)',
          opacity: 0.7,
        }}
      />

      <button onClick={onHome} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
        <svg
          className="w-5 h-5 text-violet-400 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ filter: 'drop-shadow(0 0 5px rgba(139,92,246,0.5))' }}
        >
          <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5S14.67 12 15.5 12s1.5.67 1.5 1.5S16.33 15 15.5 15zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5S19.33 12 18.5 12z" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="text-[10px] font-medium text-slate-600 tracking-[0.2em] uppercase">Game</span>
          <span className="text-[15px] font-extrabold text-white tracking-tight">Settings</span>
        </div>
      </button>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-pd-b2 hover:border-violet-700 bg-pd-s2 hover:bg-pd-s3 transition-all duration-150"
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className="w-6 h-6 rounded-full"
              style={{ boxShadow: '0 0 8px rgba(139,92,246,0.35)' }}
            />
          ) : (
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)' }}
            >
              {(user.displayName || user.email || 'U')[0].toUpperCase()}
            </div>
          )}
          <span className="text-slate-400 text-xs hidden sm:block">
            {user.displayName || user.email}
          </span>
          <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-12 z-20 w-52 bg-pd-surface border border-pd-b2 rounded-xl shadow-2xl py-1.5 overflow-hidden px-1.5">
              {/* Dropdown top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)' }}
              />
              <button
                onClick={handleExportAll}
                disabled={exporting}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-sm text-slate-400 hover:bg-pd-s2 hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <svg className="w-4 h-4 text-violet-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                Download All Games as ZIP
              </button>
              <div className="border-t border-pd-b1 my-1" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-sm text-red-500 hover:bg-pd-s2 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
