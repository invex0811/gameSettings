import { Timestamp } from 'firebase/firestore';

export interface Game {
  id: string;
  name: string;
  color: string;
  createdAt: Timestamp;
}

export interface GameParam {
  key: string;
  value: string;
}

export interface GameFile {
  id: string;
  name: string;
  content: string;
}

export interface DropboxArchive {
  id: string;
  name: string;
  dropboxPath: string;
  size: number;
  uploadedAt: string;
}

export interface Profile {
  id: string;
  name: string;
  params: GameParam[];
  notes: string;
  tags: string[];
  files: GameFile[];
  archives: DropboxArchive[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
