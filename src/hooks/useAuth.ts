import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { handleGoogleRedirectResult, onAuthChange } from '../firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handleGoogleRedirectResult().catch((err) => {
      console.error('Google redirect sign-in failed:', err);
    });

    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
};
