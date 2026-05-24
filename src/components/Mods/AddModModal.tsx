import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { Game } from '../../types';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { searchRawg, RawgGame } from '../../api/rawg';
import { uploadMod } from '../../dropbox/mods';
import { addMod } from '../../firebase/firestore';

interface AddModModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  user: User | null;
  prefilledGame?: { gameId: string; gameName: string; gameIconUrl?: string };
}

export const AddModModal: React.FC<AddModModalProps> = ({ isOpen, onClose, games, user, prefilledGame }) => {
  const [gameName, setGameName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('');
  const [gameIconUrl, setGameIconUrl] = useState<string | undefined>(undefined);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [modIconUrl, setModIconUrl] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [suggestions, setSuggestions] = useState<RawgGame[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<React.CSSProperties>({});

  const gameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dropdownVisible = showDropdown && (searching || suggestions.length > 0 || games.length > 0) && gameName.trim().length >= 1;

  useEffect(() => {
    if (!dropdownVisible || !gameInputRef.current) return;
    const rect = gameInputRef.current.getBoundingClientRect();
    const width = Math.min(rect.width, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    setDropdownPos({
      top: rect.bottom + 4,
      left,
      width,
      maxHeight: Math.max(80, Math.min(280, window.innerHeight - rect.bottom - 16)),
    });
  }, [dropdownVisible]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (gameName.trim().length < 2) { setSuggestions([]); return; }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchRawg(gameName);
      setSuggestions(results);
      setSearching(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [gameName]);

  useEffect(() => {
    if (isOpen && prefilledGame) {
      setGameName(prefilledGame.gameName);
      setSelectedGameId(prefilledGame.gameId);
      setGameIconUrl(prefilledGame.gameIconUrl);
      setGalleryImages([]);
    }
    if (!isOpen) {
      setGameName(''); setSelectedGameId(''); setGameIconUrl(undefined);
      setGalleryImages([]); setModIconUrl(''); setName(''); setDescription('');
      setFile(null); setError(''); setSuggestions([]); setShowDropdown(false);
    }
  }, [isOpen]);

  const filteredUserGames = games.filter((g) =>
    g.name.toLowerCase().includes(gameName.toLowerCase())
  );

  const handleGameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameName(e.target.value);
    setSelectedGameId('');
    setGameIconUrl(undefined);
    setGalleryImages([]);
    setShowDropdown(true);
  };

  const handleSelectUserGame = (game: Game) => {
    setGameName(game.name);
    setSelectedGameId(game.id);
    setGameIconUrl(game.iconUrl);
    setGalleryImages([]);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleSelectRawgGame = (game: RawgGame) => {
    setGameName(game.name);
    const match = games.find((g) => g.name.toLowerCase() === game.name.toLowerCase());
    setSelectedGameId(match?.id ?? '');
    const imgs: string[] = [];
    if (game.iconUrl) imgs.push(game.iconUrl);
    game.screenshots.forEach((s) => { if (!imgs.includes(s)) imgs.push(s); });
    setGalleryImages(imgs.slice(0, 8));
    setGameIconUrl(game.iconUrl ?? undefined);
    setShowDropdown(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !gameName.trim() || !name.trim()) return;
    setUploading(true);
    setError('');
    try {
      const gameId = selectedGameId || gameName.trim().toLowerCase().replace(/\s+/g, '-');
      const { path, size } = await uploadMod(gameId, file);
      await addMod({
        gameId,
        gameName: gameName.trim(),
        ...(gameIconUrl ? { gameIconUrl } : {}),
        ...(modIconUrl.trim() ? { modIconUrl: modIconUrl.trim() } : {}),
        name: name.trim(),
        description: description.trim(),
        dropboxPath: path,
        size,
        uploadedBy: user?.uid ?? null,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Upload failed. Check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Mod" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Game with RAWG autocomplete */}
        <div className="relative">
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Game</label>
          <input
            ref={gameInputRef}
            type="text"
            value={gameName}
            onChange={handleGameInputChange}
            onFocus={() => { if (!prefilledGame) { if (blurTimerRef.current) clearTimeout(blurTimerRef.current); setShowDropdown(true); } }}
            onBlur={() => { blurTimerRef.current = setTimeout(() => setShowDropdown(false), 150); }}
            placeholder="e.g. Cyberpunk 2077"
            autoComplete="off"
            readOnly={!!prefilledGame}
            className={`w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none text-sm transition-colors ${
              prefilledGame
                ? 'opacity-60 cursor-default'
                : 'focus:ring-1 focus:ring-violet-700 focus:border-violet-700'
            }`}
          />

          {dropdownVisible && (
            <div
              className="fixed z-[200] bg-pd-surface border border-pd-b2 rounded-lg shadow-2xl overflow-y-auto"
              style={dropdownPos}
            >
              {filteredUserGames.length > 0 && (
                <>
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                    Your Library
                  </div>
                  {filteredUserGames.slice(0, 3).map((game) => (
                    <button
                      key={game.id}
                      type="button"
                      onMouseDown={() => handleSelectUserGame(game)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-pd-s2 transition-colors"
                    >
                      {game.iconUrl
                        ? <img src={game.iconUrl} alt={game.name} className="w-12 h-7 object-cover rounded shrink-0" />
                        : <div className="w-12 h-7 rounded shrink-0 border border-pd-b1" style={{ backgroundColor: game.color }} />}
                      <span className="text-sm text-slate-300 truncate">{game.name}</span>
                    </button>
                  ))}
                  {suggestions.length > 0 && (
                    <div className="border-t border-pd-b1 mx-2 mt-1 pt-1">
                      <div className="px-1 pb-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">RAWG</div>
                    </div>
                  )}
                </>
              )}

              {searching ? (
                <div className="flex items-center gap-2 px-3 py-3 text-sm text-slate-600">
                  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                  </svg>
                  Searching...
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((game) => (
                  <button
                    key={game.name}
                    type="button"
                    onMouseDown={() => handleSelectRawgGame(game)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-pd-s2 transition-colors"
                  >
                    {game.iconUrl
                      ? <img src={game.iconUrl} alt={game.name} className="w-12 h-7 object-cover rounded shrink-0" />
                      : <div className="w-12 h-7 rounded bg-pd-s3 shrink-0" />}
                    <span className="text-sm text-slate-300 truncate">{game.name}</span>
                  </button>
                ))
              ) : filteredUserGames.length === 0 ? (
                <div className="px-3 py-3 text-sm text-slate-600">No results</div>
              ) : null}
            </div>
          )}
        </div>

        {/* Cover gallery (shown after RAWG selection) */}
        {galleryImages.length > 0 && (
          <div>
            <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Choose Cover</label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImages.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setGameIconUrl(img)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    gameIconUrl === img ? 'border-violet-500 scale-105' : 'border-transparent hover:border-pd-b2'
                  }`}
                >
                  <img src={img} alt="" className="w-24 h-14 object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mod image URL */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
            Mod Image URL
            <span className="ml-1.5 text-slate-700 font-normal normal-case tracking-normal">optional — uses game cover if empty</span>
          </label>
          <input
            type="url"
            value={modIconUrl}
            onChange={(e) => setModIconUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 text-sm transition-colors"
          />
        </div>

        {/* Mod name */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Mod Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ultra Graphics Overhaul"
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
            placeholder="What does this mod do?"
            className="w-full bg-pd-s2 border border-pd-b1 rounded-lg px-3 py-2 text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-700 focus:border-violet-700 text-sm resize-none transition-colors"
          />
        </div>

        {/* File */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Archive File</label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.rar,.7z,.tar,.gz,.bz2,.xz"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
            <span className="text-xs text-slate-600 truncate flex-1">
              {file ? file.name : 'No file chosen — zip, rar, 7z...'}
            </span>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2 border-t border-pd-b1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!gameName.trim() || !name.trim() || !file || uploading}
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 000 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
                Uploading...
              </>
            ) : (
              'Upload Mod'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
