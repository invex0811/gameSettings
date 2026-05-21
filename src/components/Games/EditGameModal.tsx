import React, { useState, useEffect, useRef } from 'react';
import { Game } from '../../types';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { GameIcon } from '../UI/GameIcon';
import { searchRawg, RawgGame } from '../../api/rawg';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#64748b', '#ffffff',
];

interface EditGameModalProps {
  isOpen: boolean;
  game: Game | null;
  onClose: () => void;
  onSave: (gameId: string, name: string, color: string, iconUrl?: string | null) => Promise<void>;
}

export const EditGameModal: React.FC<EditGameModalProps> = ({ isOpen, game, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [iconUrl, setIconUrl] = useState<string | null | undefined>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<RawgGame[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dropdownPos, setDropdownPos] = useState<React.CSSProperties>({});

  const dropdownVisible = showDropdown && (searching || suggestions.length > 0) && name.trim().length >= 2;
  const previewIcon = customUrl.trim() || iconUrl || undefined;

  useEffect(() => {
    if (!dropdownVisible || !nameInputRef.current) return;
    const rect = nameInputRef.current.getBoundingClientRect();
    const width = Math.min(rect.width, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    setDropdownPos({
      top: rect.bottom + 4,
      left,
      width,
      maxHeight: Math.max(80, Math.min(260, window.innerHeight - rect.bottom - 16)),
    });
  }, [dropdownVisible]);

  useEffect(() => {
    if (game) {
      setName(game.name);
      setColor(game.color);
      setIconUrl(game.iconUrl ?? null);
      setCustomUrl('');
      setSuggestions([]);
      setShowDropdown(false);
      setGalleryImages(game.iconUrl ? [game.iconUrl] : []);
    }
  }, [game]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (name.trim().length < 2) { setSuggestions([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchRawg(name);
      setSuggestions(results);
      setSearching(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!game || !name.trim()) return;
    const finalIcon = customUrl.trim() || iconUrl || null;
    setLoading(true);
    try {
      await onSave(game.id, name.trim(), color, finalIcon);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIconUrl(null);
    setGalleryImages([]);
    setCustomUrl('');
    setShowDropdown(true);
  };

  const handleSelectSuggestion = (g: RawgGame) => {
    setName(g.name);
    setIconUrl(g.iconUrl ?? null);
    setCustomUrl('');
    const imgs: string[] = [];
    if (g.iconUrl) imgs.push(g.iconUrl);
    g.screenshots.forEach((s) => { if (!imgs.includes(s)) imgs.push(s); });
    setGalleryImages(imgs.slice(0, 8));
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleSelectGalleryImage = (url: string) => {
    setIconUrl(url);
    setCustomUrl('');
  };

  const handleCustomUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomUrl(e.target.value);
    if (e.target.value.trim()) setIconUrl(null);
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Game" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preview */}
        <div className="flex items-center gap-4 p-4 bg-gray-750 rounded-xl border border-gray-700">
          <GameIcon
            iconUrl={previewIcon}
            color={color}
            name={name}
            className="w-14 h-14 rounded-xl shrink-0 shadow-lg object-cover"
          />
          <div>
            <p className="text-white font-bold text-base">{name || 'Game Name'}</p>
            <p className="text-gray-500 text-xs">{previewIcon ? 'Cover selected' : 'Preview'}</p>
          </div>
        </div>

        {/* Name with autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Game Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onFocus={() => { if (blurTimerRef.current) clearTimeout(blurTimerRef.current); setShowDropdown(true); }}
            onBlur={() => { blurTimerRef.current = setTimeout(() => setShowDropdown(false), 150); }}
            placeholder="e.g. Counter-Strike 2"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            ref={nameInputRef}
            autoFocus
            autoComplete="off"
          />
          {dropdownVisible && (
            <div
              className="fixed z-[200] bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-y-auto"
              style={dropdownPos}
            >
              {searching ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-500">
                  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Searching...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-500">No results</div>
              ) : (
                suggestions.map((g) => (
                  <button key={g.name} type="button" onMouseDown={() => handleSelectSuggestion(g)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-700 transition-colors">
                    {g.iconUrl
                      ? <img src={g.iconUrl} alt={g.name} className="w-12 h-7 object-cover rounded shrink-0" />
                      : <div className="w-12 h-7 rounded bg-gray-700 shrink-0" />}
                    <span className="text-sm text-gray-200 truncate">{g.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Image gallery */}
        {galleryImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Choose Cover</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => handleSelectGalleryImage(img)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    iconUrl === img && !customUrl.trim()
                      ? 'border-indigo-500 scale-105'
                      : 'border-transparent hover:border-gray-500'
                  }`}
                >
                  <img src={img} alt="" className="w-24 h-14 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Custom Image URL
            <span className="ml-1.5 text-xs text-gray-500 font-normal">optional</span>
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={handleCustomUrlChange}
            placeholder="https://..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="w-7 h-7 rounded-lg transition-all hover:scale-110 shrink-0"
                style={{ backgroundColor: c }}>
                {color === c && (
                  <svg className="w-4 h-4 mx-auto" style={{ color: c === '#ffffff' || c === '#eab308' ? '#000' : '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            <button type="button" onClick={() => colorInputRef.current?.click()}
              className="w-7 h-7 rounded-lg border-2 border-dashed border-gray-500 hover:border-gray-300 flex items-center justify-center transition-colors shrink-0">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
            <input ref={colorInputRef} type="color" value={color} onChange={(e) => setColor(e.target.value)} className="sr-only" />
            {!PRESET_COLORS.includes(color) && (
              <div className="w-7 h-7 rounded-lg ring-2 ring-white/30" style={{ backgroundColor: color }} />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim() || loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
