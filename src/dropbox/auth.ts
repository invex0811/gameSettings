import { DropboxAuth } from 'dropbox';

const CLIENT_ID = import.meta.env.VITE_DROPBOX_APP_KEY as string;

const getRedirectUri = () =>
  import.meta.env.DEV
    ? 'http://localhost:5173/gameSettings/'
    : 'https://invex0811.github.io/gameSettings/';

export const startDropboxAuth = async () => {
  const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID });
  const authUrl = await dbxAuth.getAuthenticationUrl(
    getRedirectUri(),
    undefined,
    'code',
    'offline',
    undefined,
    undefined,
    true
  );
  sessionStorage.setItem('dropbox_code_verifier', dbxAuth.getCodeVerifier());
  window.location.href = String(authUrl);
};

export const handleDropboxCallback = async (): Promise<boolean> => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return false;

  const codeVerifier = sessionStorage.getItem('dropbox_code_verifier');
  if (!codeVerifier) return false;

  try {
    const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID });
    dbxAuth.setCodeVerifier(codeVerifier);
    const response = await dbxAuth.getAccessTokenFromCode(getRedirectUri(), code);
    const result = response.result as { access_token: string; refresh_token?: string };
    localStorage.setItem('dropbox_access_token', result.access_token);
    if (result.refresh_token) {
      localStorage.setItem('dropbox_refresh_token', result.refresh_token);
    }
    sessionStorage.removeItem('dropbox_code_verifier');
    window.history.replaceState({}, '', window.location.pathname);
    window.dispatchEvent(new CustomEvent('dropbox:auth-changed'));
    return true;
  } catch {
    return false;
  }
};

export const getDropboxToken = () => localStorage.getItem('dropbox_access_token');
export const getDropboxRefreshToken = () => localStorage.getItem('dropbox_refresh_token');

export const disconnectDropbox = () => {
  localStorage.removeItem('dropbox_access_token');
  localStorage.removeItem('dropbox_refresh_token');
  window.dispatchEvent(new CustomEvent('dropbox:auth-changed'));
};

export const isDropboxConnected = () => !!getDropboxToken();
