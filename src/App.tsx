import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGames } from './hooks/useGames';
import { useProfiles } from './hooks/useProfiles';
import { getAllGamesWithProfiles } from './firebase/firestore';
import { handleDropboxCallback } from './dropbox/auth';
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ProfileList } from './components/Profiles/ProfileList';
import { EmptyState } from './components/Layout/EmptyState';

function App() {
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('code')) {
      handleDropboxCallback();
    }
  }, []);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const { games, loading: gamesLoading, createGame, editGame, removeGame } = useGames(
    user?.uid ?? null
  );

  const { profiles, loading: profilesLoading, createProfile, editProfile, removeProfile, duplicateProfile } =
    useProfiles(user?.uid ?? null, selectedGameId);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎮</div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const selectedGame = games.find((g) => g.id === selectedGameId) ?? null;

  const handleExportAll = async () => {
    if (!user) return;
    const data = await getAllGamesWithProfiles(user.uid);
    const exportData = {
      exportedAt: new Date().toISOString(),
      games: data.map(({ game, profiles }) => ({
        name: game.name,
        color: game.color,
        profiles: profiles.map((p) => ({
          name: p.name,
          params: p.params,
          notes: p.notes,
          tags: p.tags,
          files: p.files.map((f) => ({ name: f.name })),
        })),
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-settings-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Header user={user} onExportAll={handleExportAll} onHome={() => setSelectedGameId(null)} />
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
            <EmptyState games={games} onSelectGame={setSelectedGameId} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
