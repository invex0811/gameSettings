import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useGames } from './hooks/useGames';
import { useProfiles } from './hooks/useProfiles';
import { LoginPage } from './components/Auth/LoginPage';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ProfileList } from './components/Profiles/ProfileList';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const { games, loading: gamesLoading, createGame, removeGame } = useGames(
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

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          games={games}
          selectedGameId={selectedGameId}
          onSelectGame={setSelectedGameId}
          onDeleteGame={removeGame}
          onAddGame={createGame}
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
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-xl font-semibold text-gray-400 mb-2">
                Select a game to view profiles
              </h2>
              <p className="text-sm text-gray-600 max-w-sm">
                Choose a game from the sidebar or add a new one to start saving your settings
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
