import { useState, useEffect } from 'react';
import { isDropboxConnected, startDropboxAuth, disconnectDropbox } from '../dropbox/auth';

export const useDropbox = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const sync = () => setConnected(isDropboxConnected());
    sync();
    window.addEventListener('dropbox:auth-changed', sync);
    return () => window.removeEventListener('dropbox:auth-changed', sync);
  }, []);

  return {
    connected,
    connect: startDropboxAuth,
    disconnect: () => { disconnectDropbox(); },
  };
};
