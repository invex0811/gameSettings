import React, { useState } from 'react';
import { Profile, Game, GameParam, GameFile } from '../../types';
import { ProfileCard } from './ProfileCard';
import { ProfileEditor } from './ProfileEditor';
import { Button } from '../UI/Button';

interface ProfileListProps {
  game: Game;
  profiles: Profile[];
  loading: boolean;
  uid: string;
  onCreateProfile: (name: string) => Promise<void>;
  onEditProfile: (
    profileId: string,
    data: {
      name?: string;
      params?: GameParam[];
      notes?: string;
      tags?: string[];
      files?: GameFile[];
    }
  ) => Promise<void>;
  onDeleteProfile: (profileId: string) => Promise<void>;
  onCopyProfile: (profile: Profile) => Promise<void>;
}

export const ProfileList: React.FC<ProfileListProps> = ({
  game,
  profiles,
  loading,
  onCreateProfile,
  onEditProfile,
  onDeleteProfile,
  onCopyProfile,
}) => {
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    setCreatingProfile(true);
    try {
      await onCreateProfile(newProfileName.trim());
      setNewProfileName('');
      setShowNewForm(false);
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleExport = (profile: Profile) => {
    const data = {
      name: profile.name,
      params: profile.params,
      notes: profile.notes,
      tags: profile.tags,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${game.name}-${profile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Delete this profile?')) return;
    await onDeleteProfile(profileId);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{game.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{game.name}</h1>
            <p className="text-sm text-gray-500">
              {profiles.length} profile{profiles.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowNewForm(true)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Profile
        </Button>
      </div>

      {/* New Profile Form */}
      {showNewForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex gap-3 bg-gray-800 border border-gray-700 rounded-xl p-4"
        >
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="Profile name..."
            autoFocus
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <Button type="submit" variant="primary" size="sm" disabled={!newProfileName.trim() || creatingProfile}>
            {creatingProfile ? 'Creating...' : 'Create'}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => { setShowNewForm(false); setNewProfileName(''); }}>
            Cancel
          </Button>
        </form>
      )}

      {/* Profiles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-gray-600 text-sm">Loading profiles...</div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">No profiles yet</h3>
          <p className="text-sm text-gray-600 mb-4">Create your first settings profile for {game.name}</p>
          <Button variant="primary" onClick={() => setShowNewForm(true)}>
            Create Profile
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={() => setEditingProfile(profile)}
              onDelete={() => handleDelete(profile.id)}
              onCopy={() => onCopyProfile(profile)}
              onExport={() => handleExport(profile)}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <ProfileEditor
        isOpen={editingProfile !== null}
        onClose={() => setEditingProfile(null)}
        profile={editingProfile}
        onSave={onEditProfile}
      />
    </div>
  );
};
