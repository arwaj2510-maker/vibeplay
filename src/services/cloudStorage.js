// Real-Time Global Cloud Sync & User Account Storage for VibePlay
// Allows seamless cross-device synchronization between Laptop, Mobile, and Tablet

const MASTER_DIR_ID = 'ff808181a09d98f701a0b40ec8833310';
const CLOUD_STORAGE_KEY = 'vibeplay_cloud_users_db_v2';
const ACTIVE_USER_SESSION_KEY = 'vibeplay_active_user_session';

/**
 * Get local cached cloud DB
 */
function getLocalCloudDB() {
  try {
    const raw = localStorage.getItem(CLOUD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { users: {} };
  } catch (err) {
    return { users: {} };
  }
}

function saveLocalCloudDB(db) {
  try {
    localStorage.setItem(CLOUD_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {}
}

/**
 * Global Master Directory Lookup
 */
async function fetchMasterDirectory() {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${MASTER_DIR_ID}`);
    if (res.ok) {
      const data = await res.json();
      return data.data && data.data.users ? data.data.users : {};
    }
  } catch (err) {
    console.warn('Failed to fetch global master directory:', err);
  }
  return {};
}

/**
 * Update Master Directory with new user email -> cloudObjectId mapping
 */
async function updateMasterDirectory(email, userObjectId) {
  try {
    const currentUsers = await fetchMasterDirectory();
    const updatedUsers = { ...currentUsers, [email.toLowerCase().trim()]: userObjectId };

    await fetch(`https://api.restful-api.dev/objects/${MASTER_DIR_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'vibeplay_master_directory_v1',
        data: { users: updatedUsers }
      })
    });
  } catch (err) {
    console.warn('Failed to update global master directory:', err);
  }
}

/**
 * Fetch individual User Cloud Record from REST API
 */
async function fetchUserCloudRecord(userObjectId) {
  try {
    const res = await fetch(`https://api.restful-api.dev/objects/${userObjectId}`);
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
  } catch (err) {
    console.warn('Failed to fetch user cloud record:', err);
  }
  return null;
}

/**
 * Update individual User Cloud Record on REST API
 */
async function updateUserCloudRecord(userObjectId, userData) {
  try {
    await fetch(`https://api.restful-api.dev/objects/${userObjectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `vibeplay_usr_${userData.email}`,
        data: userData
      })
    });
  } catch (err) {
    console.warn('Failed to update user cloud record:', err);
  }
}

// USER AUTHENTICATION CLOUD SERVICES

export async function loginUserCloud(email, password) {
  const lowerEmail = email.toLowerCase().trim();
  const localDb = getLocalCloudDB();

  // Demo user quick login handler
  if (lowerEmail === 'demo@vibeplay.com') {
    const demoUser = {
      id: 'usr-demo-vip',
      email: 'demo@vibeplay.com',
      name: 'VibePlay VIP',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      cloudObjectId: 'demo-object'
    };
    localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(demoUser));
    return {
      user: demoUser,
      songs: [
        { id: 'demo-1', title: 'Midnight Horizons', artist: 'VibePlay Ambient', album: 'Cosmic Dreams', duration: 32, isFavorite: true, preset: 'chill' },
        { id: 'demo-2', title: 'Neon Skyline', artist: 'Cyber Groove', album: 'Retro Wave Vol. 1', duration: 28, isFavorite: true, preset: 'synthwave' },
        { id: 'demo-3', title: 'Deep Focus Flow', artist: 'Lofi Mind', album: 'Study & Chill', duration: 35, isFavorite: false, preset: 'ambient' },
        { id: 'demo-4', title: 'Starlight Waves', artist: 'Acoustic Aura', album: 'Night Serenade', duration: 40, isFavorite: true, preset: 'chill' }
      ],
      folders: [
        { id: 'folder-workout', name: 'Workout Energy', color: 'from-orange-500 to-amber-600', icon: 'Flame', songIds: ['demo-2'] },
        { id: 'folder-chill', name: 'Chill Vibes', color: 'from-purple-600 to-indigo-700', icon: 'Coffee', songIds: ['demo-1', 'demo-3'] }
      ]
    };
  }

  // 1. Try Global Cloud Directory lookup first so account created on Laptop is found on Mobile!
  let userCloudData = null;
  let userObjectId = null;

  try {
    const masterUsers = await fetchMasterDirectory();
    userObjectId = masterUsers[lowerEmail];
    
    if (userObjectId) {
      userCloudData = await fetchUserCloudRecord(userObjectId);
    }
  } catch (err) {
    console.warn('Global lookup error:', err);
  }

  // 2. Fallback to local cache if offline
  if (!userCloudData && localDb.users[lowerEmail]) {
    userCloudData = localDb.users[lowerEmail];
    userObjectId = userCloudData.cloudObjectId;
  }

  if (!userCloudData) {
    throw new Error('No user account found with this email address. Please register first.');
  }

  if (userCloudData.password !== password) {
    throw new Error('Incorrect password. Please verify your password.');
  }

  const sessionUser = {
    id: userCloudData.id || `usr-${Date.now()}`,
    email: userCloudData.email,
    name: userCloudData.name,
    avatar: userCloudData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userCloudData.name)}`,
    cloudObjectId: userObjectId
  };

  // Cache locally
  localDb.users[lowerEmail] = { ...userCloudData, cloudObjectId: userObjectId };
  saveLocalCloudDB(localDb);
  localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(sessionUser));

  return {
    user: sessionUser,
    songs: userCloudData.songs || [],
    folders: userCloudData.folders || []
  };
}

export async function registerUserCloud(name, email, password) {
  const lowerEmail = email.toLowerCase().trim();
  const localDb = getLocalCloudDB();

  // Check if already registered in global master directory
  const masterUsers = await fetchMasterDirectory();
  if (masterUsers[lowerEmail]) {
    throw new Error('An account with this email already exists in the Cloud. Please Sign In instead.');
  }

  const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const userData = {
    id: userId,
    email: lowerEmail,
    name: name.trim(),
    password: password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    songs: [],
    folders: []
  };

  // Create individual user cloud record on REST API
  let cloudObjectId = null;
  try {
    const res = await fetch('https://api.restful-api.dev/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `vibeplay_usr_${lowerEmail}`,
        data: userData
      })
    });
    if (res.ok) {
      const createdObj = await res.json();
      cloudObjectId = createdObj.id;
      // Register in global master directory so other devices can find it!
      await updateMasterDirectory(lowerEmail, cloudObjectId);
    }
  } catch (err) {
    console.warn('Failed to register user on global REST API:', err);
  }

  const sessionUser = {
    id: userId,
    email: lowerEmail,
    name: userData.name,
    avatar: userData.avatar,
    cloudObjectId: cloudObjectId
  };

  localDb.users[lowerEmail] = { ...userData, cloudObjectId };
  saveLocalCloudDB(localDb);
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
 * Sync song upload, favorites, or folder updates to user's Global Cloud account
 */
export async function syncUserLibraryToCloud(userEmail, songs, folders, cloudObjectId = null) {
  if (!userEmail || userEmail === 'demo@vibeplay.com') return;
  const lowerEmail = userEmail.toLowerCase().trim();

  // Find objectId if not provided
  let objectId = cloudObjectId;
  if (!objectId) {
    const masterUsers = await fetchMasterDirectory();
    objectId = masterUsers[lowerEmail];
  }

  if (objectId) {
    const sanitizedSongs = songs.map(s => ({
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album,
      duration: s.duration,
      isFavorite: s.isFavorite,
      coverArt: s.coverArt,
      createdAt: s.createdAt,
      preset: s.preset || 'chill'
    }));

    const sessionUser = getActiveUserSession();
    await updateUserCloudRecord(objectId, {
      email: lowerEmail,
      name: sessionUser ? sessionUser.name : 'User',
      password: 'encrypted',
      songs: sanitizedSongs,
      folders: folders
    });
  }
}
