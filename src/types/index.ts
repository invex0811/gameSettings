import { Timestamp } from 'firebase/firestore';

export interface Game {
  id: string;
  name: string;
  emoji: string;
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

export interface Profile {
  id: string;
  name: string;
  params: GameParam[];
  notes: string;
  tags: string[];
  files: GameFile[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
