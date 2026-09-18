import React from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Music2,
  FolderKanban,
  Heart,
  Plus,
  Upload,
  Disc3,
  CloudCheck,
  User,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const {
    currentView,
    setCurrentView,
    folders,
    activeFolderId,
    setActiveFolderId,
    setIsFolderModalOpen,
    setEditingFolder,
    importAudioFiles
  } = useAudio();

  const { user, setIsAuthModalOpen, logout } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Music Library', icon: Music2 },
    { id: 'folders', label: 'Folders & Playlists', icon: FolderKanban },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      importAudioFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#0d0e15]/90 border-r border-white/10 p-5 select-none shrink-0 h-screen sticky top-0 backdrop-blur-xl z-20">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 p-[2px] shadow-lg shadow-purple-500/20">
          <div className="w-full h-full bg-[#0d0e15] rounded-[14px] flex items-center justify-center">
            <Disc3 className="w-6 h-6 text-purple-400 animate-spin-slow" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent my-0">
            VibePlay
          </h1>
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            Pure Audio Experience
          </p>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="space-y-1.5 mb-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id && (item.id !== 'folders' || activeFolderId === null);
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setActiveFolderId(null);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/20 text-white border border-purple-500/30 shadow-md shadow-purple-900/20 font-semibold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Import Audio Button */}
      <div className="mb-6">
        <label className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
          <Upload className="w-4 h-4" />
          <span>Import Songs</span>
          <input
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* My Folders List */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 space-y-2">
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span>My Folders</span>
          <button
            onClick={() => {
              setEditingFolder(null);
              setIsFolderModalOpen(true);
            }}
            className="p-1 hover:text-purple-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Create New Folder"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          {folders.length === 0 ? (
            <p className="text-xs text-gray-500 px-2 py-2 italic">No folders yet</p>
          ) : (
            folders.map((folder) => {
              const songCount = (folder.songIds || []).length;
              const isFolderActive = currentView === 'folders' && folder.id === activeFolderId;
              return (
                <button
                  key={folder.id}
                  onClick={() => {
                    setCurrentView('folders');
                    setActiveFolderId(folder.id);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                    isFolderActive
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${folder.color || 'from-purple-500 to-indigo-500'}`} />
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-gray-400 shrink-0">
                    {songCount}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Cloud User Profile Badge */}
      <div className="mt-4 pt-4 border-t border-white/5 px-2">
        {user ? (
          <div className="p-3 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/40 border border-purple-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-xs text-white block truncate">{user.name}</span>
                <span className="text-[10px] text-purple-300 font-medium">Cloud Synced</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/10 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full p-3 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/40 border border-purple-500/20 hover:border-purple-500/40 flex items-center gap-3 text-left transition-all cursor-pointer"
          >
            <User className="w-5 h-5 text-purple-400 shrink-0" />
            <div className="text-[11px] text-gray-400">
              <span className="font-semibold text-gray-200 block">Sign In / Register</span>
              Sync songs to Mobile
            </div>
          </button>
        )}
      </div>
    </aside>
  );
}
