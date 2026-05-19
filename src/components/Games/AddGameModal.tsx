import React, { useState, useRef } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#64748b', '#ffffff',
];

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string) => Promise<void>;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [loading, setLoading] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd(name.trim(), color);
      setName('');
      setColor('#6366f1');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const initials = name.trim().slice(0, 2).toUpperCase() || 'GS';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Game">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-750 rounded-xl border border-gray-700">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg"
            style={{ backgroundColor: color }}
          >
            {initials}
          </div>
          <div>
            <p className="text-white font-bold text-base">{name || 'Game Name'}</p>
            <p className="text-gray-500 text-xs">Preview</p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Game Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Counter-Strike 2"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            autoFocus
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-lg transition-all hover:scale-110 shrink-0"
                style={{ backgroundColor: c }}
              >
                {color === c && (
                  <svg className="w-4 h-4 mx-auto" style={{ color: c === '#ffffff' || c === '#eab308' ? '#000' : '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}

            {/* Custom color picker */}
            <button
              type="button"
              onClick={() => colorInputRef.current?.click()}
              className="w-7 h-7 rounded-lg border-2 border-dashed border-gray-500 hover:border-gray-300 flex items-center justify-center transition-colors shrink-0"
              title="Custom color"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="sr-only"
            />

            {/* Current custom color swatch if not in presets */}
            {!PRESET_COLORS.includes(color) && (
              <div
                className="w-7 h-7 rounded-lg ring-2 ring-white/30"
                style={{ backgroundColor: color }}
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim() || loading}>
            {loading ? 'Adding...' : 'Add Game'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
