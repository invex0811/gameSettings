# GameVault — Game Settings Manager

A React web application for saving and managing game settings profiles with Firebase backend.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v3
- Firebase SDK v10 (modular)
- Firebase Auth (Google Sign-In)
- Firestore (data storage)
- Firebase Storage (config files)

---

## Setup Guide

### Step 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name (e.g. `game-settings-app`)
4. Follow the wizard (you can disable Google Analytics if you don't need it)

### Step 2. Register a Web App

1. In your Firebase project, click the **</>** icon (Web)
2. Register the app with a nickname
3. Copy the `firebaseConfig` object — you'll need it for Step 5

### Step 3. Enable Google Authentication

1. In Firebase Console go to **Authentication > Sign-in method**
2. Enable **Google**
3. Set a support email
4. Click **Save**

### Step 4. Enable Firestore

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (you'll add rules below)
4. Select a region close to you
5. Click **Enable**

### Step 5. Enable Firebase Storage

1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in production mode**
4. Select the same region as Firestore
5. Click **Done**

### Step 6. Fill .env

Open `.env` in the project root and fill in the values from Step 2:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

---

## Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build for Production

```bash
npm run build
npm run preview
```

---

## Firestore Security Rules

Go to **Firestore > Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Firebase Storage Rules

Go to **Storage > Rules** and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Project Structure

```
src/
  firebase/
    config.ts        — Firebase init
    auth.ts          — Google Sign-In / Sign-Out
    firestore.ts     — CRUD for games and profiles
    storage.ts       — File upload and delete
  components/
    Auth/
      LoginPage.tsx
    Layout/
      Header.tsx
      Sidebar.tsx
    Games/
      GameCard.tsx
      AddGameModal.tsx
    Profiles/
      ProfileList.tsx
      ProfileCard.tsx
      ProfileEditor.tsx
      ParamsTable.tsx
    UI/
      Modal.tsx
      Button.tsx
      Tag.tsx
  hooks/
    useAuth.ts
    useGames.ts
    useProfiles.ts
  types/
    index.ts
  App.tsx
  main.tsx
  index.css
```

---

## Features

- Google Sign-In authentication
- Create and delete games with emoji icons
- Create, edit, duplicate, and delete settings profiles
- Key-value parameters table (FOV, sensitivity, etc.)
- Free-text notes per profile
- Tags for categorization
- Upload config files to Firebase Storage with download links
- Export profile settings as JSON
- Real-time sync via Firestore onSnapshot
- Dark theme UI with Tailwind CSS
