import { Dropbox, DropboxAuth } from 'dropbox';
import { getDropboxToken, getDropboxRefreshToken } from './auth';

const CLIENT_ID = import.meta.env.VITE_DROPBOX_APP_KEY as string;

const getClient = () => {
  const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID });
  dbxAuth.setAccessToken(getDropboxToken() ?? '');
  const refreshToken = getDropboxRefreshToken();
  if (refreshToken) dbxAuth.setRefreshToken(refreshToken);
  return new Dropbox({ auth: dbxAuth });
};

export const uploadArchive = async (
  gameId: string,
  profileId: string,
  file: File
): Promise<{ path: string; size: number }> => {
  const dbx = getClient();
  const path = `/GameSettings/${gameId}/${profileId}/${file.name}`;
  const contents = await file.arrayBuffer();
  await dbx.filesUpload({
    path,
    contents,
    mode: { '.tag': 'overwrite' },
    autorename: false,
  });
  return { path, size: file.size };
};

export const downloadArchive = async (path: string, name: string): Promise<void> => {
  const dbx = getClient();
  const response = await dbx.filesGetTemporaryLink({ path });
  const a = document.createElement('a');
  a.href = response.result.link;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
