import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, SkipForward, Maximize2 } from 'lucide-react';

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handleNextTrack,
    setIsFullPlayerOpen
  } = useAudio();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={() => setIsFullPlayerOpen(true)}
      className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-64 bg-[#12131d]/95 backdrop-blur-xl border-t border-white/10 p-2.5 px-4 z-30 transition-all duration-300 shadow-2xl select-none cursor-pointer hover:bg-[#181928]"
    >
      {/* Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Artwork + Title/Artist */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md shrink-0 bg-slate-800">
            <img
              src={currentTrack.coverArt}
              alt={currentTrack.title}
              className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-gray-100 truncate">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] text-gray-400 truncate">
              {currentTrack.artist}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          {/* Next Song */}
          <button
            onClick={() => handleNextTrack({ isEnded: false })}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Expand Full Player */}
          <button
            onClick={() => setIsFullPlayerOpen(true)}
            className="hidden sm:flex p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
            title="Expand Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
