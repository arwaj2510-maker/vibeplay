import React from 'react';
import { useAudio } from '../context/AudioContext';
import SongCard from '../components/SongCard';
import {
  FolderKanban,
  Plus,
  Play,
  Edit3,
  Trash2,
  ArrowLeft,
  Flame,
  Music,
  MinusCircle,
  FolderOpen
} from 'lucide-react';

export default function Folders() {
  const {
    folders,
    activeFolderId,
    setActiveFolderId,
    setIsFolderModalOpen,
    setEditingFolder,
    deleteFolder,
    songs,
    playFolder,
    removeSongFromFolder
  } = useAudio();

  // Active Folder Detail View
  const activeFolder = folders.find(f => f.id === activeFolderId);
  const folderSongs = activeFolder
    ? songs.filter(s => (activeFolder.songIds || []).includes(s.id))
    : [];

  if (activeFolder) {
    return (
      <div className="space-y-6 pb-12">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveFolderId(null)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Folders</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingFolder(activeFolder);
                setIsFolderModalOpen(true);
              }}
              className="p-2 text-gray-400 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
              title="Edit Folder"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                deleteFolder(activeFolder.id);
                setActiveFolderId(null);
              }}
              className="p-2 text-red-400 hover:text-red-300 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 cursor-pointer"
              title="Delete Folder"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Folder Banner Header */}
        <div className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-r ${activeFolder.color || 'from-purple-600 to-indigo-700'} text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold">
              <Flame className="w-3.5 h-3.5" />
              <span>Playlist / Folder</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight my-0">
              {activeFolder.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-medium">
              {folderSongs.length} {folderSongs.length === 1 ? 'song' : 'songs'} in this playlist
            </p>
          </div>

          {folderSongs.length > 0 && (
            <button
              onClick={() => playFolder(activeFolder.id)}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-white text-gray-900 font-extrabold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Play className="w-5 h-5 fill-gray-900" />
              <span>Play Entire Folder</span>
            </button>
          )}
        </div>

        {/* Songs in Folder List */}
        {folderSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Music className="w-10 h-10 text-purple-400 mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-gray-300 mb-1">Folder is Empty</h4>
            <p className="text-xs text-gray-500 max-w-xs">
              Go to your Music Library to add tracks to "{activeFolder.name}".
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {folderSongs.map((song, index) => (
              <div key={song.id} className="relative group">
                <SongCard
                  song={song}
                  index={index}
                  queueSongIds={folderSongs.map(s => s.id)}
                  contextName={`Folder: ${activeFolder.name}`}
                />
                <button
                  onClick={() => removeSongFromFolder(activeFolder.id, song.id)}
                  className="absolute right-14 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Remove from Folder"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Folders Grid Overview View
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5 my-0">
            <FolderKanban className="w-6 h-6 text-purple-400" />
            <span>Folders & Playlists</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Organize your music into custom folders. Saved in IndexedDB.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingFolder(null);
            setIsFolderModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
          <FolderKanban className="w-10 h-10 text-purple-400 mb-3 opacity-60" />
          <h4 className="text-sm font-semibold text-gray-300 mb-1">No Folders Created Yet</h4>
          <p className="text-xs text-gray-500 max-w-xs mb-4">
            Create playlists or folders (e.g., Workout, Chill, Travel) to group your tracks.
          </p>
          <button
            onClick={() => {
              setEditingFolder(null);
              setIsFolderModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 cursor-pointer"
          >
            Create Your First Folder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map(folder => {
            const trackCount = (folder.songIds || []).length;
            return (
              <div
                key={folder.id}
                onClick={() => setActiveFolderId(folder.id)}
                className="group relative p-5 rounded-2xl glass-panel glass-panel-hover cursor-pointer space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${folder.color || 'from-purple-600 to-indigo-700'} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                    <Flame className="w-6 h-6" />
                  </div>
                  <span className="text-xs text-purple-300 font-bold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                    {trackCount} {trackCount === 1 ? 'Track' : 'Tracks'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 truncate my-0">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Click card to view folder tracks
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setActiveFolderId(folder.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                    <span>Open Folder</span>
                  </button>

                  {trackCount > 0 && (
                    <button
                      onClick={() => playFolder(folder.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-xs font-semibold text-white shadow-md shadow-purple-600/20 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
