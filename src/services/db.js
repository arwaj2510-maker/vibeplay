import { openDB } from 'idb';
import { createSynthesizedAudioBlob } from '../utils/audioGenerator';
import { generateCoverArtSvg } from '../utils/metadataParser';

const DB_NAME = 'VibePlayDB';
const DB_VERSION = 1;

/**
 * Initialize IndexedDB with stores for songs, folders, and settings
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Songs store: id, title, artist, album, duration, blob, coverArt, isFavorite, createdAt
      if (!db.objectStoreNames.contains('songs')) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id' });
        songStore.createIndex('isFavorite', 'isFavorite');
        songStore.createIndex('createdAt', 'createdAt');
      }

      // Folders/Playlists store: id, name, color, icon, songIds, createdAt
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }

      // App Settings store: key-value storage (volume, repeatMode, isShuffle, lastPlayedId)
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
}

/**
 * Seed initial sample audio tracks & folders if DB is empty
 */
export async function seedInitialData() {
  const db = await initDB();
  const existingSongs = await db.getAll('songs');

  if (existingSongs.length === 0) {
    try {
      // Generate synthetic high quality audio Blobs for 4 built-in demo tracks
      const chillBlob = await createSynthesizedAudioBlob('chill', 32);
      const synthBlob = await createSynthesizedAudioBlob('synthwave', 28);
      const ambientBlob = await createSynthesizedAudioBlob('ambient', 35);
      const grooveBlob = await createSynthesizedAudioBlob('chill', 40);

      const demoSongs = [
        {
          id: 'demo-1',
          title: 'Midnight Horizons',
          artist: 'VibePlay Ambient',
          album: 'Cosmic Dreams',
          duration: 32,
          blob: chillBlob,
          coverArt: generateCoverArtSvg('Midnight Horizons', 'VibePlay Ambient', '1'),
          isFavorite: true,
          createdAt: Date.now() - 300000,
          isDemo: true
        },
        {
          id: 'demo-2',
          title: 'Neon Skyline',
          artist: 'Cyber Groove',
          album: 'Retro Wave Vol. 1',
          duration: 28,
          blob: synthBlob,
          coverArt: generateCoverArtSvg('Neon Skyline', 'Cyber Groove', '2'),
          isFavorite: true,
          createdAt: Date.now() - 200000,
          isDemo: true
        },
        {
          id: 'demo-3',
          title: 'Deep Focus Flow',
          artist: 'Lofi Mind',
          album: 'Study & Chill',
          duration: 35,
          blob: ambientBlob,
          coverArt: generateCoverArtSvg('Deep Focus Flow', 'Lofi Mind', '3'),
          isFavorite: false,
          createdAt: Date.now() - 100000,
          isDemo: true
        },
        {
          id: 'demo-4',
          title: 'Starlight Waves',
          artist: 'Acoustic Aura',
          album: 'Night Serenade',
          duration: 40,
          blob: grooveBlob,
          coverArt: generateCoverArtSvg('Starlight Waves', 'Acoustic Aura', '4'),
          isFavorite: false,
          createdAt: Date.now(),
          isDemo: true
        }
      ];

      for (const song of demoSongs) {
        await db.put('songs', song);
      }

      // Initial folders
      const initialFolders = [
        {
          id: 'folder-workout',
          name: 'Workout Energy',
          color: 'from-orange-500 to-amber-600',
          icon: 'Flame',
          songIds: ['demo-2'],
          createdAt: Date.now() - 50000
        },
        {
          id: 'folder-chill',
          name: 'Chill Vibes',
          color: 'from-purple-600 to-indigo-700',
          icon: 'Coffee',
          songIds: ['demo-1', 'demo-3'],
          createdAt: Date.now() - 40000
        },
        {
          id: 'folder-travel',
          name: 'Road Trip',
          color: 'from-cyan-500 to-blue-600',
          icon: 'Compass',
          songIds: ['demo-4'],
          createdAt: Date.now() - 30000
        }
      ];

      for (const folder of initialFolders) {
        await db.put('folders', folder);
      }
    } catch (err) {
      console.warn('Failed to seed demo audio tracks:', err);
    }
  }
}

// SONG CRUD OPERATIONS

export async function getAllSongs() {
  const db = await initDB();
  return db.getAllFromIndex('songs', 'createdAt');
}

export async function saveSong(song) {
  const db = await initDB();
  await db.put('songs', song);
  return song;
}

export async function updateSongMetadata(id, updates) {
  const db = await initDB();
  const song = await db.get('songs', id);
  if (song) {
    const updated = { ...song, ...updates };
    await db.put('songs', updated);
    return updated;
  }
  return null;
}

export async function toggleSongFavoriteInDB(id) {
  const db = await initDB();
  const song = await db.get('songs', id);
  if (song) {
    song.isFavorite = !song.isFavorite;
    await db.put('songs', song);
    return song;
  }
  return null;
}

export async function deleteSongFromDB(id) {
  const db = await initDB();
  await db.delete('songs', id);
  
  // Remove song ID from all folders
  const folders = await db.getAll('folders');
  for (const folder of folders) {
    if (folder.songIds.includes(id)) {
      folder.songIds = folder.songIds.filter(sId => sId !== id);
      await db.put('folders', folder);
    }
  }
}

// FOLDER CRUD OPERATIONS

export async function getAllFolders() {
  const db = await initDB();
  return db.getAll('folders');
}

export async function saveFolder(folder) {
  const db = await initDB();
  await db.put('folders', folder);
  return folder;
}

export async function deleteFolderFromDB(id) {
  const db = await initDB();
  await db.delete('folders', id);
}

// SETTINGS CRUD OPERATIONS

export async function getSetting(key, defaultValue = null) {
  const db = await initDB();
  const val = await db.get('settings', key);
  return val !== undefined ? val : defaultValue;
}

export async function saveSetting(key, value) {
  const db = await initDB();
  await db.put('settings', value, key);
}
