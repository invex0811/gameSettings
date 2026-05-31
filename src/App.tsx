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
import { decodeRoutePart, matchesGameRouteKey, toRouteSlug } from './utils/routes';

type AppView = 'settings' | 'mods';

interface AppRoute {
  view: AppView;
  selectedGameKey: string | null;
}

const buildRouteHash = ({ view, selectedGameKey }: AppRoute): string =>
  selectedGameKey ? `${view}/${encodeURIComponent(selectedGameKey)}` : view;

const getRouteFromHash = (): AppRoute => {
  const [hashView, ...hashRest] = window.location.hash.slice(1).split('/');
  const view: AppView = hashView === 'mods' ? 'mods' : 'settings';
  const routeId = hashRest.length > 0 ? decodeRoutePart(hashRest.join('/')) : null;

  return {
    view,
    selectedGameKey: view === 'settings' && routeId ? routeId : null,
  };
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const [route, setRoute] = useState<AppRoute>(getRouteFromHash);
  const { view, selectedGameKey } = route;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('code')) {
      handleDropboxCallback();
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRouteFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigateTo = (nextRoute: AppRoute) => {
    const nextHash = buildRouteHash(nextRoute);
    setRoute(nextRoute);
    if (window.location.hash.slice(1) !== nextHash) {
      window.location.hash = nextHash;
    }
  };

  const isGoogleUser = !!user && !user.isAnonymous;

  const { games, loading: gamesLoading, profileCounts, createGame, editGame, removeGame } = useGames(
    isGoogleUser ? user.uid : null
  );

  const selectedGame = selectedGameKey
    ? games.find((g) => matchesGameRouteKey(selectedGameKey, g.id, g.name)) ?? null
    : null;
  const selectedGameId = selectedGame?.id ?? null;

  const { profiles, loading: profilesLoading, createProfile, editProfile, removeProfile, duplicateProfile } =
    useProfiles(isGoogleUser ? user.uid : null, selectedGameId);

  const handleViewChange = (v: AppView) => navigateTo({ view: v, selectedGameKey: null });
  const handleSettingsHome = () => navigateTo({ view: 'settings', selectedGameKey: null });
  const handleSelectGame = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    navigateTo({ view: 'settings', selectedGameKey: game ? toRouteSlug(game.name) : gameId });
  };

  useEffect(() => {
    if (view !== 'settings' || !selectedGame || !selectedGameKey) return;

    const slug = toRouteSlug(selectedGame.name);
    if (selectedGameKey === slug) return;

    const nextHash = buildRouteHash({ view: 'settings', selectedGameKey: slug });
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${nextHash}`);
    setRoute({ view: 'settings', selectedGameKey: slug });
  }, [selectedGame, selectedGameKey, view]);

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

  const handleExportAll = async () => {
    if (!isGoogleUser) return;
    await exportAllAsZip(user.uid);
  };

  return (
    <div className="h-screen bg-pd-bg dashboard-grid flex flex-col overflow-hidden">
      <Header
        user={user}
        view={view}
        onViewChange={handleViewChange}
        onExportAll={handleExportAll}
        onHome={handleSettingsHome}
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
            onSelectGame={handleSelectGame}
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
              <EmptyState games={games} profileCounts={profileCounts} onSelectGame={handleSelectGame} />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
