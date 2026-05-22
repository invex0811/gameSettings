import React from 'react';
import { Profile } from '../../types';
import { Tag } from '../UI/Tag';
import { downloadFile } from '../../firebase/storage';

interface ProfileCardProps {
  profile: Profile;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onView,
  onEdit,
  onDelete,
  onCopy,
}) => {
  const handleDownloadFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile.files.length === 1) {
      downloadFile(profile.files[0].name, profile.files[0].content);
    } else {
      onView();
    }
  };

  return (
    <div
      onClick={onView}
      className="group relative bg-pd-s2 border border-pd-b1 rounded-lg p-4 hover:border-pd-b2 hover:bg-pd-s3 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Hover top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider mb-0.5">Profile</p>
          <h3 className="font-bold text-white text-sm tracking-tight truncate">{profile.name}</h3>
        </div>
        <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {profile.files.length > 0 && (
            <button
              onClick={handleDownloadFile}
              title={profile.files.length > 1 ? `${profile.files.length} files` : `Download ${profile.files[0].name}`}
              className="flex items-center gap-1 p-1 rounded-md text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/12 transition-all duration-150"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {profile.files.length > 1 && (
                <span className="text-[10px]">{profile.files.length}</span>
              )}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(); }}
            title="Duplicate"
            className="p-1 rounded-md text-slate-600 hover:text-violet-400 hover:bg-violet-500/12 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit"
            className="p-1 rounded-md text-slate-600 hover:text-amber-400 hover:bg-amber-500/12 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title="Delete"
            className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/12 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {profile.params.length > 0 && (
        <div className="mb-3 border-t border-pd-b1">
          {profile.params.slice(0, 4).map((p, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 border-b border-pd-b1 last:border-0">
              <span className="font-mono text-[10px] text-slate-600 w-24 truncate shrink-0">{p.key}</span>
              <span className="font-mono text-[10px] text-slate-400 truncate">{p.value}</span>
            </div>
          ))}
          {profile.params.length > 4 && (
            <p className="text-[10px] text-slate-700 pt-1.5">+{profile.params.length - 4} more</p>
          )}
        </div>
      )}

      {profile.notes && (
        <p className="text-xs text-slate-600 mb-3 line-clamp-2 italic">{profile.notes}</p>
      )}

      {profile.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      {(profile.files.length > 0 || (profile.archives || []).length > 0) && (
        <div className="flex items-center gap-3 text-[10px] text-slate-600 pt-2 border-t border-pd-b1">
          {profile.files.length > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              {profile.files.length} file{profile.files.length !== 1 ? 's' : ''}
            </span>
          )}
          {(profile.archives || []).length > 0 && (
            <span className="flex items-center gap-1 text-violet-700">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              {(profile.archives || []).length} archive{(profile.archives || []).length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
