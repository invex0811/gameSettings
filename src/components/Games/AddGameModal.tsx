import React, { useState } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';

const EMOJI_OPTIONS = [
  '🎮', '🕹️', '🎯', '🏆', '⚔️', '🛡️', '🔫', '🚀', '🐉', '🧙',
  '🦸', '🤖', '👾', '💣', '🔥', '⚡', '🌍', '🏎️', '⚽', '🎲',
];

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, emoji: string) => Promise<void>;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎮');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd(name.trim(), emoji);
      setName('');
      setEmoji('🎮');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Game">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Game Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Counter-Strike 2"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Icon</label>
          <div className="grid grid-cols-10 gap-1.5">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-xl p-1.5 rounded-lg transition-all ${
                  emoji === e
                    ? 'bg-indigo-600 ring-2 ring-indigo-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {e}
              </button>
            ))}
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
