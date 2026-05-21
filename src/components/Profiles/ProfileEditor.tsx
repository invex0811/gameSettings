import React, { useState, useEffect, useRef } from 'react';
import { Profile, GameParam, GameFile, DropboxArchive } from '../../types';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Tag } from '../UI/Tag';
import { ParamsTable } from './ParamsTable';
import { readFileAsText, downloadFile } from '../../firebase/storage';
import { ConfirmModal } from '../UI/ConfirmModal';
import { useDropbox } from '../../hooks/useDropbox';
import { uploadArchive, downloadArchive } from '../../dropbox/files';

interface ProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  gameId: string;
  onSave: (
    profileId: string | null,
    data: {
      name?: string;
      params?: GameParam[];
      notes?: string;
      tags?: string[];
      files?: GameFile[];
      archives?: DropboxArchive[];
    }
  ) => Promise<void>;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  isOpen,
  onClose,
  profile,
  gameId,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [params, setParams] = useState<GameParam[]>([]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<GameFile[]>([]);
  const [archives, setArchives] = useState<DropboxArchive[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingArchive, setUploadingArchive] = useState(false);
  const [archiveError, setArchiveError] = useState('');
  const [confirmFile, setConfirmFile] = useState<GameFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const archiveInputRef = useRef<HTMLInputElement>(null);
  const { connected, connect, disconnect } = useDropbox();

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setParams(profile.params || []);
      setNotes(profile.notes || '');
      setTags(profile.tags || []);
      setFiles(profile.files || []);
      setArchives(profile.archives || []);
    } else {
      setName('');
      setParams([]);
      setNotes('');
      setTags([]);
      setFiles([]);
      setArchives([]);
    }
    setArchiveError('');
  }, [profile, isOpen]);

  const isNew = !profile?.id;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave(profile?.id ?? null, { name: name.trim(), params, notes, tags, files, archives });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    try {
      const content = await readFileAsText(file);
      setFiles([...files, { id: String(Date.now()), name: file.name, content }]);
    } catch (err) {
      console.error('Read failed:', err);
      alert('Could not read file. Make sure it is a text-based config file.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileItem: GameFile) => {
    setConfirmFile(fileItem);
  };

  const handleDeleteFileConfirm = () => {
    if (!confirmFile) return;
    setFiles(files.filter((f) => f.id !== confirmFile.id));
    setConfirmFile(null);
  };

  const handleArchiveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploadingArchive(true);
    setArchiveError('');
    try {
      const { path, size } = await uploadArchive(gameId, profile.id, file);
      const archive: DropboxArchive = {
        id: String(Date.now()),
        name: file.name,
        dropboxPath: path,
        size,
        uploadedAt: new Date().toISOString(),
      };
      setArchives((prev) => [...prev, archive]);
    } catch (err) {
      console.error('Archive upload failed:', err);
      setArchiveError('Upload failed. Check Dropbox connection.');
    } finally {
      setUploadingArchive(false);
      if (archiveInputRef.current) archiveInputRef.current.value = '';
    }
  };

  const handleRemoveArchive = (id: string) => {
    setArchives(archives.filter((a) => a.id !== id));
  };

  const handleDownloadArchive = async (archive: DropboxArchive) => {
    try {
      await downloadArchive(archive.dropboxPath, archive.name);
    } catch {
      setArchiveError('Download failed. File may have been deleted from Dropbox.');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isNew ? 'New Profile' : 'Edit Profile'} maxWidth="max-w-2xl">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Profile Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder="e.g. Competitive"
          />
        </div>

        {/* Params */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Parameters</label>
          <ParamsTable params={params} onChange={setParams} />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any notes about this profile..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} onRemove={() => removeTag(tag)} />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add tag, press Enter"
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addTag}>
              Add
            </Button>
          </div>
        </div>

        {/* Config Files */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Config Files</label>
          {files.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 text-sm"
                >
                  <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-gray-300 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => downloadFile(file.name, file.content)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                    title="Download"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file)}
                    className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={uploadingFile}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingFile ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload File
                </>
              )}
            </Button>
            <span className="text-xs text-gray-600">Any config file format</span>
          </div>
        </div>

        {/* Archives (Dropbox) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-300">
              Archives
              <span className="ml-1.5 text-xs text-blue-400 font-normal">via Dropbox</span>
            </label>
            {connected && (
              <button
                type="button"
                onClick={disconnect}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          {!connected ? (
            <div className="flex items-center gap-3 bg-gray-700/30 border border-gray-700 rounded-lg px-3 py-3">
              <svg className="w-5 h-5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 2L0 6l6 4-6 4 6 4 6-4-6-4 6-4L6 2zm12 0l-6 4 6 4-6 4 6 4 6-4-6-4 6-4-6-4zM6 16.5L12 20l6-3.5-6-4-6 4z"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm text-gray-300">Connect Dropbox to upload archives</p>
                <p className="text-xs text-gray-600">zip, rar, 7z and other binary files</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={connect}>
                Connect
              </Button>
            </div>
          ) : (
            <>
              {archives.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {archives.map((archive) => (
                    <div
                      key={archive.id}
                      className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 text-sm"
                    >
                      <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <span className="text-gray-300 truncate flex-1">{archive.name}</span>
                      <span className="text-xs text-gray-600 shrink-0">{formatSize(archive.size)}</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadArchive(archive)}
                        className="text-blue-400 hover:text-blue-300 transition-colors shrink-0"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveArchive(archive.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {archiveError && (
                <p className="text-xs text-red-400 mb-2">{archiveError}</p>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={archiveInputRef}
                  type="file"
                  accept=".zip,.rar,.7z,.tar,.gz,.tar.gz,.bz2,.xz"
                  onChange={handleArchiveUpload}
                  className="hidden"
                  id="archive-upload"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={uploadingArchive}
                  onClick={() => archiveInputRef.current?.click()}
                >
                  {uploadingArchive ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Upload Archive
                    </>
                  )}
                </Button>
                <span className="text-xs text-gray-600">zip, rar, 7z, tar...</span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-700">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim() || saving}>
            {saving ? (isNew ? 'Creating...' : 'Saving...') : (isNew ? 'Create Profile' : 'Save Changes')}
          </Button>
        </div>
      </form>

      <ConfirmModal
        isOpen={confirmFile !== null}
        title="Delete file"
        description={`"${confirmFile?.name}" will be removed from this profile.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteFileConfirm}
        onCancel={() => setConfirmFile(null)}
      />
    </Modal>
  );
};
