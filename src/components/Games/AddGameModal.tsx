import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { GameIcon } from '../UI/GameIcon';
import { searchRawg, RawgGame } from '../../api/rawg';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#ec4899', '#64748b', '#ffffff',
];

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string, iconUrl?: string) => Promise<void>;
}

export const AddGameModal: React.FC<AddGameModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
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
  const previewIcon = customUrl.trim() || iconUrl;

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
    if (!isOpen) {
      setName('');
      setColor('#6366f1');
      setIconUrl(undefined);
      setCustomUrl('');
      setSuggestions([]);
      setGalleryImages([]);
      setShowDropdown(false);
    }
  }, [isOpen]);

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
    if (!name.trim()) return;
    const finalIcon = customUrl.trim() || iconUrl;
    setLoading(true);
    try {
      await onAdd(name.trim(), color, finalIcon);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setIconUrl(undefined);
    setGalleryImages([]);
    setCustomUrl('');
    setShowDropdown(true);
  };

  const handleSelectSuggestion = (game: RawgGame) => {
    setName(game.name);
    setIconUrl(game.iconUrl ?? undefined);
    setCustomUrl('');
    const imgs: string[] = [];
    if (game.iconUrl) imgs.push(game.iconUrl);
    game.screenshots.forEach((s) => { if (!imgs.includes(s)) imgs.push(s); });
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
    if (e.target.value.trim()) setIconUrl(undefined);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Game" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Preview */}
        <div className="flex items-center gap-4 p-4 bg-pd-s2 rounded-lg border border-pd-b1">
          <GameIcon
            iconUrl={previewIcon}
            color={color}
            name={name}
            className="w-14 h-14 rounded-xl shrink-0 shadow-lg object-cover border border-pd-b2"
          />
          <div>
            <p className="text-white font-bold text-base">{name || 'Game Name'}</p>
            <p className="text-slate-600 text-xs">{previewIcon ? 'Cover selected' : 'Preview'}</p>
          </div>
        </div>

        {/* Name with autocomplete */}
        <div className="relative">
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Game Name</label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onFocus={() => { if (blurTimerRef.current) clearTimeout(blurTimerRef.current); setShowDropdown(true); }}
            onBlur={() => { blurTimerRef.current = setTimeout(() => setShowDropdown(false), 150); }}
            placeholder="e.g. Counter-Strike 2"
            className="w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 text-sm transition-colors"
            ref={nameInputRef}
            autoFocus
            autoComplete="off"
          />
          {dropdownVisible && (
            <div
              className="fixed z-[200] bg-pd-surface border border-pd-b2 rounded-lg shadow-2xl overflow-y-auto"
              style={dropdownPos}
            >
              {searching ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-600">
                  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Searching...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-3 py-3 text-sm text-slate-600">No results</div>
              ) : (
                suggestions.map((game) => (
                  <button key={game.name} type="button" onMouseDown={() => handleSelectSuggestion(game)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-pd-s2 transition-colors">
                    {game.iconUrl
                      ? <img src={game.iconUrl} alt={game.name} className="w-12 h-7 object-cover rounded shrink-0" />
                      : <div className="w-12 h-7 rounded bg-pd-s3 shrink-0" />}
                    <span className="text-sm text-slate-300 truncate">{game.name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Image gallery */}
        {galleryImages.length > 0 && (
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Choose Cover</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => handleSelectGalleryImage(img)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    iconUrl === img && !customUrl.trim()
                      ? 'border-violet-500 scale-105'
                      : 'border-transparent hover:border-pd-b2'
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
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Custom Image URL
            <span className="ml-1.5 text-slate-700 font-normal normal-case tracking-normal">optional</span>
          </label>
          <input
            type="url"
            value={customUrl}
            onChange={handleCustomUrlChange}
            placeholder="https://..."
            className="w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 text-sm transition-colors"
          />
        </div>

        {/* Color */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Color</label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="w-7 h-7 rounded-lg transition-all hover:scale-110 shrink-0 border-2"
                style={{ backgroundColor: c, borderColor: color === c ? 'white' : 'transparent' }}>
                {color === c && (
                  <svg className="w-4 h-4 mx-auto" style={{ color: c === '#ffffff' || c === '#eab308' ? '#000' : '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
            <button type="button" onClick={() => colorInputRef.current?.click()}
              className="w-7 h-7 rounded-lg border-2 border-dashed border-pd-b2 hover:border-slate-500 flex items-center justify-center transition-colors shrink-0">
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
            <input ref={colorInputRef} type="color" value={color} onChange={(e) => setColor(e.target.value)} className="sr-only" />
            {!PRESET_COLORS.includes(color) && (
              <div className="w-7 h-7 rounded-lg ring-2 ring-white/20" style={{ backgroundColor: color }} />
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim() || loading}>
            {loading ? 'Adding...' : 'Add Game'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
