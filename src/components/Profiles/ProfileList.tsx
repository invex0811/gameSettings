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

  const stats = useMemo(() => {
    const params = profiles.reduce((sum, profile) => sum + profile.params.length, 0);
    const files = profiles.reduce((sum, profile) => sum + profile.files.length, 0);
    const archives = profiles.reduce((sum, profile) => sum + (profile.archives || []).length, 0);
    return { params, files, archives, tags: allTags.length };
  }, [allTags.length, profiles]);

  const recentProfile = profiles[0] ?? null;

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
    <div className="flex-1 overflow-hidden flex flex-col bg-pd-bg/80">
      {/* Header */}
      <div className="px-6 py-5 border-b border-pd-b1 shrink-0">
        <div className="flex items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <GameIcon
            iconUrl={game.iconUrl}
            color={game.color}
            name={game.name}
            className="w-14 h-14 rounded-xl shrink-0 shadow-panel-soft object-cover border border-pd-b2"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-cyan-300 uppercase tracking-[0.18em] mb-1">
              Active Game
            </p>
            <h1 className="text-2xl font-black text-white tracking-tight truncate">{game.name}</h1>
            <p className="text-xs text-slate-500">
              {activeTags.length > 0
                ? `${filteredProfiles.length} of ${profiles.length} profiles`
                : `${profiles.length} profile${profiles.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Export ZIP
          </Button>
          <Button variant="primary" size="sm" onClick={openNew}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Profile
          </Button>
        </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Profiles" value={profiles.length} accent="violet" />
          <MetricCard label="Parameters" value={stats.params} accent="cyan" />
          <MetricCard label="Files" value={stats.files + stats.archives} accent="amber" />
          <MetricCard label="Tags" value={stats.tags} accent="slate" />
        </div>
      </div>

      {/* Tag filter bar */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap px-6 py-2.5 border-b border-pd-b1 shrink-0">
          <span className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider shrink-0">Filter</span>
          {allTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-all duration-150 border ${
                  active
                    ? 'bg-violet-950/50 border-violet-800/50 text-violet-400'
                    : 'bg-transparent border-pd-b1 text-slate-600 hover:border-pd-b2 hover:text-slate-400'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              onClick={() => setActiveTags([])}
              className="ml-1 text-[10px] text-slate-700 hover:text-slate-500 transition-colors uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-slate-700 text-sm">Loading profiles...</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-base font-semibold text-slate-500 mb-2">No profiles yet</h3>
            <p className="text-sm text-slate-700 mb-6">Create your first settings profile for {game.name}</p>
            <Button variant="primary" onClick={openNew}>Create Profile</Button>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-4">🏷️</div>
            <h3 className="text-base font-semibold text-slate-500 mb-2">No profiles match</h3>
            <p className="text-sm text-slate-700 mb-4">No profiles have the selected tags</p>
            <button
              onClick={() => setActiveTags([])}
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
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
            <aside className="hidden xl:block">
              <div className="glass-panel sticky top-0 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-cyan-300 uppercase tracking-[0.18em]">Quick Summary</p>
                <h2 className="mt-1 text-lg font-black text-white">Config health</h2>
                <div className="mt-4 space-y-3">
                  <SummaryRow label="Profiles with files" value={profiles.filter((p) => p.files.length > 0 || (p.archives || []).length > 0).length} total={profiles.length} />
                  <SummaryRow label="Tagged profiles" value={profiles.filter((p) => p.tags.length > 0).length} total={profiles.length} />
                  <SummaryRow label="Parameterized" value={profiles.filter((p) => p.params.length > 0).length} total={profiles.length} />
                </div>
                <div className="mt-5 rounded-lg border border-pd-b1 bg-pd-bg/70 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Latest profile</p>
                  <p className="mt-1 truncate text-sm font-bold text-white">{recentProfile?.name ?? 'No profile selected'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {recentProfile
                      ? `${recentProfile.params.length} params · ${recentProfile.files.length + (recentProfile.archives || []).length} files`
                      : 'Create one to start tuning presets.'}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

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

const MetricCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: 'violet' | 'cyan' | 'amber' | 'slate';
}) => {
  const accents = {
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-200 border-violet-500/20',
    cyan: 'from-cyan-500/18 to-cyan-500/5 text-cyan-200 border-cyan-500/20',
    amber: 'from-amber-500/18 to-amber-500/5 text-amber-200 border-amber-500/20',
    slate: 'from-slate-500/12 to-slate-500/5 text-slate-200 border-pd-b1',
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br ${accents[accent]} px-4 py-3`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-black text-white tabular-nums">{value}</p>
    </div>
  );
};

const SummaryRow = ({ label, value, total }: { label: string; value: number; total: number }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-200">{value}/{total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-pd-bg">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};
