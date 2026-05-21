const API_KEY = import.meta.env.VITE_RAWG_API_KEY as string;
const BASE_URL = 'https://api.rawg.io/api';

export interface RawgGame {
  name: string;
  iconUrl: string | null;
  screenshots: string[];
}

export const searchRawg = async (query: string): Promise<RawgGame[]> => {
  if (!query.trim() || !API_KEY) return [];
  const url = `${BASE_URL}/games?search=${encodeURIComponent(query)}&key=${API_KEY}&page_size=8&search_precise=true`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((g: {
    name: string;
    background_image: string | null;
    short_screenshots: { id: number; image: string }[];
  }) => ({
    name: g.name,
    iconUrl: g.background_image ?? null,
    screenshots: (g.short_screenshots ?? []).map((s) => s.image).filter(Boolean),
  }));
};
