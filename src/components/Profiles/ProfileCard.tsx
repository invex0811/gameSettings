import React from 'react';
import { Profile } from '../../types';
import { Button } from '../UI/Button';
import { Tag } from '../UI/Tag';

interface ProfileCardProps {
  profile: Profile;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onEdit,
  onDelete,
  onCopy,
  onExport,
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-white text-base truncate">{profile.name}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={onExport} title="Export JSON">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4M4 12h16" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={onCopy} title="Duplicate">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={onEdit} title="Edit">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} title="Delete" className="hover:text-red-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
      </div>

      {profile.params.length > 0 && (
        <div className="mb-3 space-y-1">
          {profile.params.slice(0, 4).map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-mono w-24 truncate">{p.key}</span>
              <span className="text-gray-300 font-mono">{p.value}</span>
            </div>
          ))}
          {profile.params.length > 4 && (
            <p className="text-xs text-gray-600">+{profile.params.length - 4} more params</p>
          )}
        </div>
      )}

      {profile.notes && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{profile.notes}</p>
      )}

      {profile.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {profile.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      )}

      {profile.files.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          {profile.files.length} file{profile.files.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};
