import React, { useState, useMemo } from 'react';
import { Profile, Game, GameParam, GameFile } from '../../types';
import { ProfileCard } from './ProfileCard';
import { ProfileEditor } from './ProfileEditor';
import { Button } from '../UI/Button';
import { ConfirmModal } from '../UI/ConfirmModal';

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
  const [confirmProfile, setConfirmProfile] = useState<Profile | null>(null);
  const [newProfileName, setNewProfileName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const allTags = useMemo(
    () => [...new Set(profiles.flatMap((p) => p.tags))].sort(),
    [profiles]
  );

  const filteredProfiles = useMemo(
    () =>
      activeTags.length === 0
        ? profiles
        : profiles.filter((p) => activeTags.some((t) => p.tags.includes(t))),
    [profiles, activeTags]
  );

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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

  const handleDeleteConfirm = async () => {
    if (!confirmProfile) return;
    const id = confirmProfile.id;
    setConfirmProfile(null);
    await onDeleteProfile(id);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{game.emoji}</span>
          <div>
            <h1 className="text-xl font-bold text-white">{game.name}</h1>
            <p className="text-sm text-gray-500">
              {activeTags.length > 0
                ? `${filteredProfiles.length} of ${profiles.length} profiles`
                : `${profiles.length} profile${profiles.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowNewForm(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Profile
        </Button>
      </div>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-5 pb-5 border-b border-gray-800">
          <span className="text-xs text-gray-500 shrink-0">Filter:</span>
          {allTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 border ${
                  active
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-transparent border-gray-600 text-gray-400 hover:border-indigo-500 hover:text-indigo-300'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="ml-1 text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}

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
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-4">🏷️</div>
          <h3 className="text-lg font-medium text-gray-400 mb-2">No profiles match</h3>
          <p className="text-sm text-gray-600 mb-4">No profiles have the selected tags</p>
          <button
            onClick={() => setActiveTags([])}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProfiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={() => setEditingProfile(profile)}
              onDelete={() => setConfirmProfile(profile)}
              onCopy={() => onCopyProfile(profile)}
            />
          ))}
        </div>
      )}

      <ProfileEditor
        isOpen={editingProfile !== null}
        onClose={() => setEditingProfile(null)}
        profile={editingProfile}
        onSave={onEditProfile}
      />

      <ConfirmModal
        isOpen={confirmProfile !== null}
        title="Delete profile"
        description={`"${confirmProfile?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmProfile(null)}
      />
    </div>
  );
};
