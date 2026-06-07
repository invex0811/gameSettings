import React, { useState } from 'react';
import { signInWithGoogle } from '../../firebase/auth';
import { isFirebaseConfigured, missingFirebaseEnv } from '../../firebase/config';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!isFirebaseConfigured) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pd-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 25% 30%, rgba(124,58,237,0.12) 0%, transparent 55%), radial-gradient(ellipse 40% 30% at 75% 70%, rgba(245,158,11,0.06) 0%, transparent 50%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="bg-pd-surface border border-pd-b2 rounded-xl shadow-2xl p-10 relative overflow-hidden">
          {/* Gold + violet gradient top line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(139,92,246,0.7) 40%, rgba(245,158,11,0.5) 60%, transparent)',
            }}
          />

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-violet-950/60 text-violet-400 border border-violet-800/40">
              🎮 Game Settings
            </span>
          </div>

          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center text-2xl"
            style={{
              background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)',
              boxShadow: '0 0 32px rgba(109,40,217,0.4), 0 0 0 1px rgba(139,92,246,0.3)',
            }}
          >
            🎮
          </div>

          <h1 className="text-2xl font-extrabold text-white text-center tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-slate-500 text-center leading-relaxed mb-7">
            Save and manage your game configs.<br />All in one place.
          </p>

          <div className="h-px bg-pd-b1 mb-6" />

          <button
            onClick={handleSignIn}
            disabled={loading || !isFirebaseConfigured}
            className="w-full flex items-center justify-center gap-3 bg-pd-s2 hover:bg-pd-s3 text-slate-200 font-semibold py-3 px-4 rounded-lg border border-pd-b2 hover:border-violet-700 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {!isFirebaseConfigured && (
            <p className="mt-4 text-xs text-amber-300 text-center leading-relaxed">
              Fill Firebase values in .env: {missingFirebaseEnv.join(', ')}
            </p>
          )}

          {error && (
            <p className="mt-4 text-xs text-red-400 text-center">{error}</p>
          )}

          <p className="text-center text-[10px] text-slate-700 mt-6 uppercase tracking-widest">
            Secure · Private · Your Data Only
          </p>
        </div>
      </div>
    </div>
  );
};
