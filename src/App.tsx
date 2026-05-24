import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGames } from './hooks/useGames';
import { useProfiles } from './hooks/useProfiles';
import { exportAllAsZip } from './utils/exportZip';
import { handleDropboxCallback } from './dropbox/auth';
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ProfileList } from './components/Profiles/ProfileList';
import { EmptyState } from './components/Layout/EmptyState';
import { ModsPage } from './components/Mods/ModsPage';

type AppView = 'settings' | 'mods';

const getInitialView = (): AppView => {
  const hash = window.location.hash.slice(1);
  return hash.startsWith('mods') ? 'mods' : 'settings';
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<AppView>(getInitialView);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('code')) {
      handleDropboxCallback();
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1);
      setView(hash.startsWith('mods') ? 'mods' : 'settings');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleViewChange = (v: AppView) => {
    setView(v);
    window.location.hash = v;
  };

  const isGoogleUser = !!user && !user.isAnonymous;

  const { games, loading: gamesLoading, profileCounts, createGame, editGame, removeGame } = useGames(
    isGoogleUser ? user.uid : null
  );

  const { profiles, loading: profilesLoading, createProfile, editProfile, removeProfile, duplicateProfile } =
    useProfiles(isGoogleUser ? user.uid : null, selectedGameId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-pd-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎮</div>
          <p className="text-slate-700 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedGame = games.find((g) => g.id === selectedGameId) ?? null;

  const handleExportAll = async () => {
    if (!isGoogleUser) return;
    await exportAllAsZip(user.uid);
  };

  return (
    <div className="h-screen bg-pd-bg flex flex-col overflow-hidden">
      <Header
        user={user}
        view={view}
        onViewChange={handleViewChange}
        onExportAll={handleExportAll}
        onHome={() => setSelectedGameId(null)}
      />

      {view === 'mods' ? (
        <div className="flex flex-1 overflow-hidden">
          <ModsPage user={user} games={games} />
        </div>
      ) : !isGoogleUser ? (
        <LoginPage />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            games={games}
            selectedGameId={selectedGameId}
            onSelectGame={setSelectedGameId}
            onDeleteGame={removeGame}
            onAddGame={createGame}
            onEditGame={editGame}
            loading={gamesLoading}
          />
          <main className="flex-1 overflow-hidden flex">
            {selectedGame ? (
              <ProfileList
                game={selectedGame}
                profiles={profiles}
                loading={profilesLoading}
                uid={user.uid}
                onCreateProfile={createProfile}
                onEditProfile={editProfile}
                onDeleteProfile={removeProfile}
                onCopyProfile={duplicateProfile}
              />
            ) : (
              <EmptyState games={games} profileCounts={profileCounts} onSelectGame={setSelectedGameId} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
