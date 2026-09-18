import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';
import {
  getAllSongs,
  getAllFolders,
  saveSong,
  updateSongMetadata,
  toggleSongFavoriteInDB,
  deleteSongFromDB,
  saveFolder,
  deleteFolderFromDB,
  seedInitialData,
  saveSetting,
  getSetting
} from '../services/db';
import { extractFileMetadata, generateCoverArtSvg } from '../utils/metadataParser';
import confetti from 'canvas-confetti';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  // State
  const [songs, setSongs] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]); // Active playlist/queue array of song IDs
  const [queueContextName, setQueueContextName] = useState('All Songs');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatModeState] = useState('all'); // 'off' | 'all' | 'one'
  const [isShuffle, setIsShuffleState] = useState(false);
  
  // UI Navigation State
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'library' | 'folders' | 'favorites'
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [skipBadge, setSkipBadge] = useState(null); // { text: '+10s' | '-10s', key: number }

  // Modals state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // History stack for shuffle tracking
  const playedHistoryRef = useRef([]);

  // Initialize Data from IndexedDB
  useEffect(() => {
    async function loadData() {
      await seedInitialData();
      const loadedSongs = await getAllSongs();
      const loadedFolders = await getAllFolders();
      
      const savedVol = await getSetting('volume', 0.8);
      const savedRepeat = await getSetting('repeatMode', 'all');
      const savedShuffle = await getSetting('isShuffle', false);

      setSongs(loadedSongs);
      setFolders(loadedFolders);
      setVolumeState(savedVol);
      setRepeatModeState(savedRepeat);
      setIsShuffleState(savedShuffle);

      audioEngine.setVolume(savedVol);
      audioEngine.setRepeatMode(savedRepeat);
      audioEngine.setShuffle(savedShuffle);

      if (loadedSongs.length > 0) {
        setQueue(loadedSongs.map(s => s.id));
        const lastSongId = await getSetting('lastPlayedId', loadedSongs[0].id);
        const initialTrack = loadedSongs.find(s => s.id === lastSongId) || loadedSongs[0];
        setCurrentTrack(initialTrack);
        audioEngine.loadTrack(initialTrack);
      }
    }
    loadData();
  }, []);

  // Audio Engine Listener Bindings
  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = ({ currentTime, duration }) => {
      setCurrentTime(currentTime);
      setDuration(duration);
    };
    const handleLoadedMetadata = ({ duration }) => setDuration(duration);
    const handleVolumeChange = ({ volume, isMuted }) => {
      setVolumeState(volume);
      setIsMuted(isMuted);
    };

    audioEngine.on('play', handlePlay);
    audioEngine.on('pause', handlePause);
    audioEngine.on('timeupdate', handleTimeUpdate);
    audioEngine.on('loadedmetadata', handleLoadedMetadata);
    audioEngine.on('volumechange', handleVolumeChange);

    return () => {
      audioEngine.off('play', handlePlay);
      audioEngine.off('pause', handlePause);
      audioEngine.off('timeupdate', handleTimeUpdate);
      audioEngine.off('loadedmetadata', handleLoadedMetadata);
      audioEngine.off('volumechange', handleVolumeChange);
    };
  }, []);

  // Sync track playback selection
  const playTrack = useCallback(async (track, newQueue = null, contextName = 'Queue') => {
    if (!track) return;
    
    if (newQueue) {
      setQueue(newQueue);
      setQueueContextName(contextName);
    }
    
    setCurrentTrack(track);
    await audioEngine.loadTrack(track);
    audioEngine.play();
    saveSetting('lastPlayedId', track.id);
  }, []);

  // Next Track Logic
  const handleNextTrack = useCallback(({ isEnded = false } = {}) => {
    if (queue.length === 0 || !currentTrack) return;

    // 1. Repeat One
    if (isEnded && repeatMode === 'one') {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }

    const currentIndex = queue.indexOf(currentTrack.id);

    // 2. Shuffle mode
    if (isShuffle && queue.length > 1) {
      let unplayed = queue.filter(id => id !== currentTrack.id && !playedHistoryRef.current.includes(id));
      if (unplayed.length === 0) {
        playedHistoryRef.current = [currentTrack.id];
        unplayed = queue.filter(id => id !== currentTrack.id);
      }
      const nextId = unplayed[Math.floor(Math.random() * unplayed.length)];
      playedHistoryRef.current.push(nextId);
      const nextTrack = songs.find(s => s.id === nextId);
      if (nextTrack) playTrack(nextTrack);
      return;
    }

    // 3. Normal Sequential
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      const nextId = queue[currentIndex + 1];
      const nextTrack = songs.find(s => s.id === nextId);
      if (nextTrack) playTrack(nextTrack);
    } else {
      // Reached end of queue
      if (repeatMode === 'all') {
        const firstTrack = songs.find(s => s.id === queue[0]);
        if (firstTrack) playTrack(firstTrack);
      } else {
        // Repeat Off: stop playback
        audioEngine.pause();
        audioEngine.seek(0);
      }
    }
  }, [queue, currentTrack, isShuffle, repeatMode, songs, playTrack]);

  // Previous Track Logic
  const handlePrevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;

    // If current song played > 3 seconds, restart current track
    if (currentTime > 3) {
      audioEngine.seek(0);
      return;
    }

    const currentIndex = queue.indexOf(currentTrack.id);
    if (currentIndex > 0) {
      const prevTrack = songs.find(s => s.id === queue[currentIndex - 1]);
      if (prevTrack) playTrack(prevTrack);
    } else if (repeatMode === 'all') {
      const lastTrack = songs.find(s => s.id === queue[queue.length - 1]);
      if (lastTrack) playTrack(lastTrack);
    } else {
      audioEngine.seek(0);
    }
  }, [currentTrack, queue, currentTime, repeatMode, songs, playTrack]);

  // Bind Audio Engine Action Callbacks
  useEffect(() => {
    audioEngine.onNextTrack = handleNextTrack;
    audioEngine.onPrevTrack = handlePrevTrack;
  }, [handleNextTrack, handlePrevTrack]);

  // Toggle Controls
  const togglePlay = () => audioEngine.togglePlay();

  const seek = (seconds) => audioEngine.seek(seconds);

  const skipSeconds = (seconds) => {
    audioEngine.skipSeconds(seconds);
    setSkipBadge({
      text: seconds > 0 ? '+10s' : '-10s',
      key: Date.now()
    });
  };

  const changeVolume = (val) => {
    audioEngine.setVolume(val);
    saveSetting('volume', val);
  };

  const toggleMute = () => audioEngine.toggleMute();

  const toggleRepeatMode = () => {
    const modes = ['off', 'all', 'one'];
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    const newMode = modes[nextIndex];
    setRepeatModeState(newMode);
    audioEngine.setRepeatMode(newMode);
    saveSetting('repeatMode', newMode);
  };

  const toggleShuffle = () => {
    const newShuffle = !isShuffle;
    setIsShuffleState(newShuffle);
    audioEngine.setShuffle(newShuffle);
    saveSetting('isShuffle', newShuffle);
  };

  // FAVORITES MANAGEMENT
  const toggleFavorite = async (songId) => {
    const updated = await toggleSongFavoriteInDB(songId);
    if (updated) {
      setSongs(prev => prev.map(s => s.id === songId ? updated : s));
      if (currentTrack && currentTrack.id === songId) {
        setCurrentTrack(updated);
      }
      if (updated.isFavorite) {
        // Trigger celebratory confetti effect
        confetti({
          particleCount: 25,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#ec4899', '#a855f7', '#f43f5e']
        });
      }
    }
  };

  // FILE IMPORT
  const importAudioFiles = async (files) => {
    setIsImporting(true);
    const newSongs = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac)$/i.test(file.name)) {
        continue;
      }

      try {
        const metadata = await extractFileMetadata(file);
        const songRecord = {
          id: `local-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          duration: metadata.duration,
          blob: file, // Store binary file Blob in IndexedDB
          coverArt: metadata.coverArt,
          isFavorite: false,
          createdAt: Date.now() + i
        };

        await saveSong(songRecord);
        newSongs.push(songRecord);
      } catch (err) {
        console.warn('Failed to parse audio file:', file.name, err);
      }
    }

    if (newSongs.length > 0) {
      const updatedSongs = await getAllSongs();
      setSongs(updatedSongs);
    }
    setIsImporting(false);
  };

  // EDIT SONG METADATA
  const editSongMetadata = async (songId, updates) => {
    const updated = await updateSongMetadata(songId, updates);
    if (updated) {
      // Regenerate cover art if title/artist changed and using procedural SVG cover
      if (updated.coverArt.startsWith('data:image/svg+xml')) {
        updated.coverArt = generateCoverArtSvg(updated.title, updated.artist, updated.id);
        await saveSong(updated);
      }
      setSongs(prev => prev.map(s => s.id === songId ? updated : s));
      if (currentTrack && currentTrack.id === songId) {
        setCurrentTrack(updated);
      }
    }
  };

  // DELETE SONG
  const deleteSong = async (songId) => {
    await deleteSongFromDB(songId);
    setSongs(prev => prev.filter(s => s.id !== songId));
    setQueue(prev => prev.filter(id => id !== songId));
    
    // Refresh folders
    const updatedFolders = await getAllFolders();
    setFolders(updatedFolders);

    if (currentTrack && currentTrack.id === songId) {
      const remaining = songs.filter(s => s.id !== songId);
      if (remaining.length > 0) {
        playTrack(remaining[0]);
      } else {
        setCurrentTrack(null);
        audioEngine.pause();
      }
    }
  };

  // FOLDER MANAGEMENT
  const createOrUpdateFolder = async (folderData) => {
    const folderRecord = {
      id: folderData.id || `folder-${Date.now()}`,
      name: folderData.name,
      color: folderData.color || 'from-purple-600 to-indigo-700',
      icon: folderData.icon || 'Folder',
      songIds: folderData.songIds || [],
      createdAt: folderData.createdAt || Date.now()
    };
    await saveFolder(folderRecord);
    const updatedFolders = await getAllFolders();
    setFolders(updatedFolders);
  };

  const deleteFolder = async (folderId) => {
    await deleteFolderFromDB(folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    if (activeFolderId === folderId) {
      setActiveFolderId(null);
    }
  };

  const addSongToFolder = async (folderId, songId) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder && !(folder.songIds || []).includes(songId)) {
      const updated = { ...folder, songIds: [...(folder.songIds || []), songId] };
      await saveFolder(updated);
      setFolders(prev => prev.map(f => f.id === folderId ? updated : f));
    }
  };

  const removeSongFromFolder = async (folderId, songId) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      const updated = { ...folder, songIds: (folder.songIds || []).filter(id => id !== songId) };
      await saveFolder(updated);
      setFolders(prev => prev.map(f => f.id === folderId ? updated : f));
    }
  };

  const playFolder = (folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder || (folder.songIds || []).length === 0) return;
    const folderSongs = songs.filter(s => (folder.songIds || []).includes(s.id));
    if (folderSongs.length > 0) {
      playTrack(folderSongs[0], folderSongs.map(s => s.id), folder.name);
    }
  };

  // BACKUP & SYNC HELPERS
  const exportLibraryBackup = () => {
    const backupData = {
      version: 1,
      appName: 'VibePlay',
      exportDate: new Date().toISOString(),
      folders: folders,
      favorites: songs.filter(s => s.isFavorite).map(s => s.id),
      songsMetadata: songs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        duration: s.duration,
        isFavorite: s.isFavorite,
        coverArt: s.coverArt,
        isDemo: s.isDemo
      }))
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibeplay-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importLibraryBackup = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.folders && Array.isArray(data.folders)) {
        for (const folder of data.folders) {
          await saveFolder(folder);
        }
        const updatedFolders = await getAllFolders();
        setFolders(updatedFolders);
      }
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.6 }
      });
      setIsBackupModalOpen(false);
    } catch (err) {
      console.warn('Failed to import backup JSON file:', err);
    }
  };

  // KEYBOARD ACCESSIBILITY LISTENERS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keyboard shortcuts if user is typing in an input field
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipSeconds(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipSeconds(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(Math.min(volume + 0.05, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(Math.max(volume - 0.05, 0));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

  return (
    <AudioContext.Provider value={{
      songs,
      folders,
      currentTrack,
      queue,
      queueContextName,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      repeatMode,
      isShuffle,
      currentView,
      activeFolderId,
      searchQuery,
      isFullPlayerOpen,
      skipBadge,
      isFolderModalOpen,
      isBackupModalOpen,
      editingFolder,
      editingSong,
      isImporting,
      setCurrentView,
      setActiveFolderId,
      setSearchQuery,
      setIsFullPlayerOpen,
      setIsFolderModalOpen,
      setIsBackupModalOpen,
      setEditingFolder,
      setEditingSong,
      playTrack,
      togglePlay,
      handleNextTrack,
      handlePrevTrack,
      seek,
      skipSeconds,
      changeVolume,
      toggleMute,
      toggleRepeatMode,
      toggleShuffle,
      toggleFavorite,
      importAudioFiles,
      editSongMetadata,
      deleteSong,
      createOrUpdateFolder,
      deleteFolder,
      addSongToFolder,
      removeSongFromFolder,
      playFolder,
      exportLibraryBackup,
      importLibraryBackup
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
