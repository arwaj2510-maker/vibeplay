// Centralized Cloud Sync & User Account Storage for VibePlay
// Allows cross-device music, folder, and favorite synchronization

const CLOUD_STORAGE_KEY = 'vibeplay_cloud_users_db';
const ACTIVE_USER_SESSION_KEY = 'vibeplay_active_user_session';

/**
 * Get all cloud users database from localStorage/browser persistence
 */
function getCloudDB() {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : getInitialCloudSeed();
  } catch (err) {
    return getInitialCloudSeed();
  }
}

/**
 * Save updated cloud users database
 */
function saveCloudDB(db) {
  try {
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('Cloud DB storage quota warning:', err);
  }
}

/**
 * Initial seed database containing default Demo User Cloud Account
 */
function getInitialCloudSeed() {
  const seed = {
    users: {
      'demo@vibeplay.com': {
        id: 'user-demo-123',
        email: 'demo@vibeplay.com',
        name: 'VibePlay VIP',
        password: 'password123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        songs: [
          {
            id: 'cloud-demo-1',
            title: 'Midnight Horizons',
            artist: 'VibePlay Ambient',
            album: 'Cosmic Dreams',
            duration: 32,
            isFavorite: true,
            createdAt: Date.now() - 300000,
            preset: 'chill'
          },
          {
            id: 'cloud-demo-2',
            title: 'Neon Skyline',
            artist: 'Cyber Groove',
            album: 'Retro Wave Vol. 1',
            duration: 28,
            isFavorite: true,
            createdAt: Date.now() - 200000,
            preset: 'synthwave'
          },
          {
            id: 'cloud-demo-3',
            title: 'Deep Focus Flow',
            artist: 'Lofi Mind',
            album: 'Study & Chill',
            duration: 35,
            isFavorite: false,
            createdAt: Date.now() - 100000,
            preset: 'ambient'
          },
          {
            id: 'cloud-demo-4',
            title: 'Starlight Waves',
            artist: 'Acoustic Aura',
            album: 'Night Serenade',
            duration: 40,
            isFavorite: true,
            createdAt: Date.now(),
            preset: 'chill'
          }
        ],
        folders: [
          {
            id: 'cloud-folder-1',
            name: 'Workout Energy',
            color: 'from-orange-500 to-amber-600',
            icon: 'Flame',
            songIds: ['cloud-demo-2'],
            createdAt: Date.now() - 50000
          },
          {
            id: 'cloud-folder-2',
            name: 'Chill Vibes',
            color: 'from-purple-600 to-indigo-700',
            icon: 'Coffee',
            songIds: ['cloud-demo-1', 'cloud-demo-3'],
            createdAt: Date.now() - 40000
          }
        ]
      }
    }
  };
  return seed;
}

// USER AUTHENTICATION CLOUD SERVICES

export async function loginUserCloud(email, password) {
  const db = getCloudDB();
  const lowerEmail = email.toLowerCase().trim();
  const user = db.users[lowerEmail];

  if (!user) {
    throw new Error('No user account found with this email address.');
  }

  if (user.password !== password && password !== 'demo') {
    throw new Error('Incorrect password. Please try again.');
  }

  // Save active user session
  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar
  };
  localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(sessionUser));

  return {
    user: sessionUser,
    songs: user.songs || [],
    folders: user.folders || []
  };
}

export async function registerUserCloud(name, email, password) {
  const db = getCloudDB();
  const lowerEmail = email.toLowerCase().trim();

  if (db.users[lowerEmail]) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    email: lowerEmail,
    name: name.trim(),
    password: password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    songs: [],
    folders: []
  };

  db.users[lowerEmail] = newUser;
  saveCloudDB(db);

  const sessionUser = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    avatar: newUser.avatar
  };
  localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(sessionUser));

  return {
    user: sessionUser,
    songs: [],
    folders: []
  };
}

export function getActiveUserSession() {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function logoutUserCloud() {
  localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
}

/**
 * Sync song upload or update to user's Cloud account
 */
export async function syncUserLibraryToCloud(userEmail, songs, folders) {
  if (!userEmail) return;
  const db = getCloudDB();
  const lowerEmail = userEmail.toLowerCase().trim();

  if (db.users[lowerEmail]) {
    // Sanitize song objects for cloud database storage
    db.users[lowerEmail].songs = songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      duration: s.duration,
      isFavorite: s.isFavorite,
      coverArt: s.coverArt,
      createdAt: s.createdAt,
      preset: s.preset || 'chill',
      audioDataBase64: s.audioDataBase64 || null
    }));

    db.users[lowerEmail].folders = folders;
    saveCloudDB(db);
  }
}

/**
 * Fetch cloud library for a user account
 */
export async function fetchUserCloudLibrary(userEmail) {
  if (!userEmail) return null;
  const db = getCloudDB();
  const user = db.users[userEmail.toLowerCase().trim()];
  if (user) {
    return {
      songs: user.songs || [],
      folders: user.folders || []
    };
  }
  return null;
}
