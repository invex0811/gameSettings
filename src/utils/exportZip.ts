import JSZip from 'jszip';
import { getAllGamesWithProfiles } from '../firebase/firestore';
import { isDropboxConnected } from '../dropbox/auth';
import { fetchArchiveBlob } from '../dropbox/files';
import { Game, Profile } from '../types';

const sanitize = (name: string) =>
  name.replace(/[/\\:*?"<>|]/g, '_').trim() || 'unnamed';

const addProfilesToZip = async (
  zip: JSZip,
  rootFolder: string,
  profiles: Profile[],
  dropboxConnected: boolean
): Promise<void> => {
  for (const profile of profiles) {
    const profileFolder = `${rootFolder}/${sanitize(profile.name)}`;

    for (const file of profile.files ?? []) {
      zip.file(`${profileFolder}/${file.name}`, file.content);
    }

    const archives = profile.archives ?? [];
    if (archives.length > 0 && dropboxConnected) {
      for (const archive of archives) {
        try {
          const blob = await fetchArchiveBlob(archive.dropboxPath);
          zip.file(`${profileFolder}/${archive.name}`, blob);
        } catch {
          // skip failed archive
        }
      }
    }
  }
};

const generateAndDownload = async (zip: JSZip, filename: string): Promise<void> => {
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportGameAsZip = async (game: Game, profiles: Profile[]): Promise<void> => {
  const zip = new JSZip();
  const dropboxConnected = isDropboxConnected();
  await addProfilesToZip(zip, sanitize(game.name), profiles, dropboxConnected);
  await generateAndDownload(zip, `${sanitize(game.name)}-${new Date().toISOString().slice(0, 10)}.zip`);
};

export const exportAllAsZip = async (uid: string): Promise<void> => {
  const zip = new JSZip();
  const data = await getAllGamesWithProfiles(uid);
  const dropboxConnected = isDropboxConnected();
  for (const { game, profiles } of data) {
    await addProfilesToZip(zip, sanitize(game.name), profiles, dropboxConnected);
  }
  await generateAndDownload(zip, `game-settings-${new Date().toISOString().slice(0, 10)}.zip`);
};
