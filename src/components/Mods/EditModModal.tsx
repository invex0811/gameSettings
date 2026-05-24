import React, { useState, useEffect } from 'react';
import { Mod } from '../../types';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { updateMod } from '../../firebase/firestore';

interface EditModModalProps {
  isOpen: boolean;
  onClose: () => void;
  mod: Mod | null;
}

export const EditModModal: React.FC<EditModModalProps> = ({ isOpen, onClose, mod }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [modIconUrl, setModIconUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (isOpen && mod) {
      setName(mod.name);
      setDescription(mod.description);
      setModIconUrl(mod.modIconUrl ?? '');
      setError('');
      setImgError(false);
    }
  }, [isOpen, mod]);

  const coverPreview = modIconUrl.trim() || mod?.gameIconUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mod || !name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await updateMod(mod.id, {
        name: name.trim(),
        description: description.trim(),
        modIconUrl: modIconUrl.trim() || null,
      });
      onClose();
    } catch {
      setError('Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!mod) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Mod" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cover preview */}
        {coverPreview && (
          <div className="relative h-24 rounded-lg overflow-hidden border border-pd-b1">
            {!imgError ? (
              <img
                src={coverPreview}
                alt=""
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-violet-950/40 flex items-center justify-center">
                <span className="text-xs text-slate-600">Invalid image URL</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-pd-bg/80 to-transparent" />
            <div className="absolute bottom-2 left-3">
              <p className="text-white font-bold text-sm truncate">{name || mod.name}</p>
              <p className="text-[10px] text-slate-500">{mod.gameName}</p>
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Mod Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 text-sm transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Description
            <span className="ml-1.5 text-slate-700 font-normal normal-case tracking-normal">optional</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 text-sm resize-none transition-colors"
          />
        </div>

        {/* Mod image URL */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Mod Image URL
            <span className="ml-1.5 text-slate-700 font-normal normal-case tracking-normal">optional — uses game cover if empty</span>
          </label>
          <input
            type="url"
            value={modIconUrl}
            onChange={(e) => { setModIconUrl(e.target.value); setImgError(false); }}
            placeholder="https://..."
            className="w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 text-sm transition-colors"
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2 border-t border-pd-b1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim() || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
