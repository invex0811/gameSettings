import React, { useState } from 'react';
import { Mod } from '../../types';
import { downloadMod } from '../../dropbox/mods';

interface ModCardProps {
  mod: Mod;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatUploadedAt = (uploadedAt: Mod['uploadedAt'] | Date | string | null | undefined) => {
  if (!uploadedAt) return 'Date pending';

  const date =
    uploadedAt instanceof Date
      ? uploadedAt
      : typeof uploadedAt === 'string'
        ? new Date(uploadedAt)
        : uploadedAt.toDate();

  if (Number.isNaN(date.getTime())) return 'Date pending';

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const ModCard: React.FC<ModCardProps> = ({ mod, canEdit, canDelete, onEdit, onDelete }) => {
  const [downloading, setDownloading] = useState(false);
  const [dlError, setDlError] = useState('');

  const coverUrl = mod.modIconUrl || mod.gameIconUrl;
  const uploadedAtLabel = formatUploadedAt(mod.uploadedAt);

  const handleDownload = async () => {
    setDownloading(true);
    setDlError('');
    try {
      await downloadMod(mod.dropboxPath, mod.name);
    } catch {
      setDlError('Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="group relative bg-pd-s2 border border-pd-b1 rounded-lg overflow-hidden hover:border-pd-b2 hover:bg-pd-s3 transition-all duration-200 flex flex-col">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

      {/* Cover */}
      <div className="relative h-28 shrink-0 overflow-hidden">
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt={mod.gameName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-pd-s2 via-pd-s2/30 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-950/60 to-pd-s3 flex items-center justify-center">
            <svg className="w-8 h-8 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        )}

        {/* Game badge */}
        <div className="absolute bottom-2 left-3 right-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 text-violet-300 border border-violet-800/40 truncate max-w-full backdrop-blur-sm">
            {mod.gameName}
          </span>
        </div>

        {/* Actions */}
        {(canEdit || canDelete) && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {canEdit && (
              <button
                onClick={onEdit}
                className="p-1 rounded-md bg-black/50 text-slate-400 hover:text-amber-400 hover:bg-black/70 transition-all duration-150 backdrop-blur-sm"
                title="Edit mod"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="p-1 rounded-md bg-black/50 text-slate-400 hover:text-red-400 hover:bg-black/70 transition-all duration-150 backdrop-blur-sm"
                title="Delete mod"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-white text-sm tracking-tight truncate">{mod.name}</h3>
          {mod.description && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-0.5">{mod.description}</p>
          )}
        </div>

        {dlError && <p className="text-[10px] text-red-400">{dlError}</p>}

        <div className="flex items-center justify-between pt-2 border-t border-pd-b1">
          <div className="min-w-0">
            <p className="text-[10px] text-slate-700">{formatSize(mod.size)}</p>
            <p className="text-[10px] text-slate-600 truncate">Added {uploadedAtLabel}</p>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-950/40 text-violet-400 border border-violet-800/40 hover:bg-violet-950/70 hover:border-violet-700 transition-all duration-150 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
