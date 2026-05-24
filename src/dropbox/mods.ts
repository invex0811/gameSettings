import { Dropbox, DropboxAuth } from 'dropbox';

const CLIENT_ID = import.meta.env.VITE_DROPBOX_APP_KEY as string;
const MOD_REFRESH_TOKEN = import.meta.env.VITE_DROPBOX_MOD_REFRESH_TOKEN as string;

const getModsClient = async (): Promise<Dropbox> => {
  const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID });
  dbxAuth.setRefreshToken(MOD_REFRESH_TOKEN);
  await dbxAuth.refreshAccessToken();
  return new Dropbox({ auth: dbxAuth });
};

export const uploadMod = async (
  gameId: string,
  file: File
): Promise<{ path: string; size: number }> => {
  const dbx = await getModsClient();
  const uploadPath = `/GameSettings/Mods/${gameId}/${file.name}`;
  const contents = await file.arrayBuffer();
  const result = await dbx.filesUpload({
    path: uploadPath,
    contents,
    mode: { '.tag': 'overwrite' },
    autorename: true,
  });
  return { path: result.result.path_display ?? uploadPath, size: file.size };
};

export const downloadMod = async (path: string, name: string): Promise<void> => {
  const dbx = await getModsClient();
  const response = await dbx.filesGetTemporaryLink({ path });
  const a = document.createElement('a');
  a.href = response.result.link;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
