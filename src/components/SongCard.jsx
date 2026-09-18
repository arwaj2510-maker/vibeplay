import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/metadataParser';
import EqualizerVisualizer from './EqualizerVisualizer';
import { Play, Pause, Heart, MoreVertical, Edit3, Trash2, FolderPlus, Check } from 'lucide-react';

export default function SongCard({ song, index, queueSongIds = null, contextName = 'Song List' }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleFavorite,
    deleteSong,
    setEditingSong,
    folders,
    addSongToFolder,
    removeSongFromFolder
  } = useAudio();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFolderSubmenuOpen, setIsFolderSubmenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentTrack && currentTrack.id === song.id;

  // Close dropdown menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
        setIsFolderSubmenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleCardClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(song, queueSongIds, contextName);
    }
  };

  return (
    <div className={`group relative flex items-center justify-between gap-3 p-3 rounded-2xl transition-all duration-200 border cursor-pointer ${
      isCurrent
        ? 'bg-purple-900/30 border-purple-500/40 shadow-lg shadow-purple-950/40'
        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10'
    }`}>
      {/* Left: Index / Play Icon & Thumbnail & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1" onClick={handleCardClick}>
        {/* Track Index / Equalizer */}
        <div className="w-6 text-center text-xs font-semibold text-gray-500 shrink-0">
          {isCurrent ? (
            <EqualizerVisualizer isPlaying={isPlaying} />
          ) : (
            <span className="group-hover:hidden">{index + 1}</span>
          )}
          {!isCurrent && (
            <Play className="w-3.5 h-3.5 text-purple-400 hidden group-hover:inline-block mx-auto fill-purple-400" />
          )}
        </div>

        {/* Thumbnail */}
        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
          <img
            src={song.coverArt}
            alt={song.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isCurrent && isPlaying ? 'scale-105' : 'group-hover:scale-110'
            }`}
          />
          {isCurrent && (
            <div className="absolute inset-0 bg-purple-950/40 backdrop-blur-[1px] flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-white" />
              ) : (
                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold truncate ${
            isCurrent ? 'text-purple-300' : 'text-gray-100 group-hover:text-white'
          }`}>
            {song.title}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {song.artist} • <span className="text-gray-500">{song.album}</span>
          </p>
        </div>
      </div>

      {/* Right Controls: Duration, Favorite Heart, Options Menu */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
          {formatTime(song.duration)}
        </span>

        {/* Heart Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
            song.isFavorite
              ? 'text-pink-500 animate-heart-pop'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
          title={song.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-pink-500' : ''}`} />
        </button>

        {/* Context Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Context Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#141622] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 backdrop-blur-xl text-xs text-gray-200">
              {/* Add to Folder Option */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFolderSubmenuOpen(!isFolderSubmenuOpen);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 hover:bg-white/10 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Add to Folder</span>
                  </div>
                  <span className="text-[10px] text-gray-400">›</span>
                </button>

                {/* Folders Submenu */}
                {isFolderSubmenuOpen && (
                  <div className="absolute right-full top-0 mr-1 w-44 bg-[#141622] border border-white/10 rounded-xl shadow-2xl py-1 z-50 max-h-48 overflow-y-auto">
                    {folders.length === 0 ? (
                      <p className="px-3 py-2 text-[11px] text-gray-400 italic">No folders available</p>
                    ) : (
                      folders.map(folder => {
                        const inFolder = folder.songIds.includes(song.id);
                        return (
                          <button
                            key={folder.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inFolder) {
                                removeSongFromFolder(folder.id, song.id);
                              } else {
                                addSongToFolder(folder.id, song.id);
                              }
                            }}
                            className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-white/10 text-left text-xs"
                          >
                            <span className="truncate">{folder.name}</span>
                            {inFolder && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Edit Metadata */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setEditingSong(song);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-white/10 text-left cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Edit Information</span>
              </button>

              {/* Delete Song */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  deleteSong(song.id);
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-red-500/20 text-red-400 text-left cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Track</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
