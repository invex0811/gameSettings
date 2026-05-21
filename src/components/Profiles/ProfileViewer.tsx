import React, { useState } from 'react';
import { Profile } from '../../types';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Tag } from '../UI/Tag';
import { downloadFile } from '../../firebase/storage';
import { useDropbox } from '../../hooks/useDropbox';
import { downloadArchive } from '../../dropbox/files';

interface ProfileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onEdit: () => void;
}

export const ProfileViewer: React.FC<ProfileViewerProps> = ({
  isOpen,
  onClose,
  profile,
  onEdit,
}) => {
  const { connected } = useDropbox();
  const [archiveError, setArchiveError] = useState('');

  if (!profile) return null;

  const handleDownloadArchive = async (dropboxPath: string, name: string) => {
    setArchiveError('');
    try {
      await downloadArchive(dropboxPath, name);
    } catch {
      setArchiveError('Download failed. File may have been deleted from Dropbox.');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const hasContent =
    profile.params.length > 0 ||
    profile.notes ||
    profile.tags.length > 0 ||
    profile.files.length > 0 ||
    (profile.archives || []).length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={profile.name} maxWidth="max-w-xl">
      <div className="space-y-5">
        {!hasContent && (
          <p className="text-sm text-gray-500 text-center py-4">No data in this profile yet.</p>
        )}

        {profile.params.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Parameters</p>
            <div className="bg-gray-700/40 rounded-lg divide-y divide-gray-700/60">
              {profile.params.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="text-gray-400 font-mono w-36 truncate shrink-0">{p.key}</span>
                  <span className="text-white font-mono break-all">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.notes && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Notes</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-700/40 rounded-lg px-3 py-2">
              {profile.notes}
            </p>
          </div>
        )}

        {profile.tags.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </div>
        )}

        {profile.files.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Config Files</p>
            <div className="space-y-1.5">
              {profile.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-gray-700/40 rounded-lg px-3 py-2 text-sm"
                >
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-300 truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => downloadFile(file.name, file.content)}
                    title="Download"
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/15 transition-all duration-150 shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(profile.archives || []).length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Archives
              <span className="ml-1.5 text-blue-400 normal-case font-normal">via Dropbox</span>
            </p>
            {archiveError && (
              <p className="text-xs text-red-400 mb-2">{archiveError}</p>
            )}
            <div className="space-y-1.5">
              {(profile.archives || []).map((archive) => (
                <div
                  key={archive.id}
                  className="flex items-center gap-2 bg-gray-700/40 rounded-lg px-3 py-2 text-sm"
                >
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span className="text-gray-300 truncate flex-1">{archive.name}</span>
                  <span className="text-xs text-gray-600 shrink-0">{formatSize(archive.size)}</span>
                  {connected ? (
                    <button
                      onClick={() => handleDownloadArchive(archive.dropboxPath, archive.name)}
                      title="Download from Dropbox"
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/15 transition-all duration-150 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  ) : (
                    <span className="text-xs text-gray-600 shrink-0">Connect Dropbox to download</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-gray-700">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => { onClose(); onEdit(); }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Button>
        </div>
      </div>
    </Modal>
  );
};
