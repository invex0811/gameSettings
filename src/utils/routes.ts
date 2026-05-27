export const toRouteSlug = (value: string): string => {
  const slug = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'game';
};

export const decodeRoutePart = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const matchesGameRouteKey = (
  routeKey: string,
  gameId: string,
  gameName: string
): boolean => routeKey === gameId || routeKey === toRouteSlug(gameName);
