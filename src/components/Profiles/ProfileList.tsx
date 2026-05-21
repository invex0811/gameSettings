import React, { useState, useMemo } from 'react';
import { Profile, Game, GameParam, GameFile, DropboxArchive } from '../../types';
import { ProfileCard } from './ProfileCard';
import { ProfileEditor } from './ProfileEditor';
import { ProfileViewer } from './ProfileViewer';
import { GameIcon } from '../UI/GameIcon';
import { Button } from '../UI/Button';
import { ConfirmModal } from '../UI/ConfirmModal';
import { exportGameAsZip } from '../../utils/exportZip';

interface ProfileListProps {
  game: Game;
  profiles: Profile[];
  loading: boolean;
  uid: string;
  onCreateProfile: (
    name: string,
    extra?: {
      params?: GameParam[];
      notes?: string;
      tags?: string[];
      files?: GameFile[];
      archives?: DropboxArchive[];
    }
  ) => Promise<void>;
  onEditProfile: (
    profileId: string,
    data: {
      name?: string;
      params?: GameParam[];
      notes?: string;
      tags?: string[];
      files?: GameFile[];
      archives?: DropboxArchive[];
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
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmProfile, setConfirmProfile] = useState<Profile | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

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

  const handleSaveProfile = async (
    profileId: string | null,
    data: {
      name?: string;
      params?: GameParam[];
      notes?: string;
      tags?: string[];
      files?: GameFile[];
      archives?: DropboxArchive[];
    }
  ) => {
    if (profileId === null) {
      await onCreateProfile(data.name!, {
        params: data.params,
        notes: data.notes,
        tags: data.tags,
        files: data.files,
        archives: data.archives,
      });
      setIsCreating(false);
    } else {
      await onEditProfile(profileId, data);
      setEditingProfile(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmProfile) return;
    const id = confirmProfile.id;
    setConfirmProfile(null);
    await onDeleteProfile(id);
  };

  const openNew = () => {
    setEditingProfile(null);
    setIsCreating(true);
  };

  const closeEditor = () => {
    setEditingProfile(null);
    setIsCreating(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GameIcon
            iconUrl={game.iconUrl}
            color={game.color}
            name={game.name}
            className="w-11 h-11 rounded-xl shrink-0 shadow-lg object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-white">{game.name}</h1>
            <p className="text-sm text-gray-500">
              {activeTags.length > 0
                ? `${filteredProfiles.length} of ${profiles.length} profiles`
                : `${profiles.length} profile${profiles.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={exporting || profiles.length === 0}
            onClick={async () => {
              setExporting(true);
              try { await exportGameAsZip(game, profiles); } finally { setExporting(false); }
            }}
          >
            {exporting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Export ZIP
          </Button>
          <Button variant="primary" size="sm" onClick={openNew}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Profile
          </Button>
        </div>
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
          <Button variant="primary" onClick={openNew}>
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
              onView={() => setViewingProfile(profile)}
              onEdit={() => { setIsCreating(false); setEditingProfile(profile); }}
              onDelete={() => setConfirmProfile(profile)}
              onCopy={() => onCopyProfile(profile)}
            />
          ))}
        </div>
      )}

      <ProfileViewer
        isOpen={viewingProfile !== null}
        onClose={() => setViewingProfile(null)}
        profile={viewingProfile}
        onEdit={() => { setIsCreating(false); setEditingProfile(viewingProfile); }}
      />

      <ProfileEditor
        isOpen={editingProfile !== null || isCreating}
        onClose={closeEditor}
        profile={editingProfile}
        gameId={game.id}
        onSave={handleSaveProfile}
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
