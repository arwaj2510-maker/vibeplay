import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { formatTime } from '../utils/metadataParser';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function FullPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    isFullPlayerOpen,
    skipBadge,
    setIsFullPlayerOpen,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    seek,
    skipSeconds,
    changeVolume,
    toggleMute,
    toggleRepeatMode,
    toggleShuffle,
    toggleFavorite
  } = useAudio();

  const [hoverSeekTime, setHoverSeekTime] = useState(null);

  if (!isFullPlayerOpen || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  };

  const handleSeekMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    setHoverSeekTime(Math.max(0, Math.min(pos * duration, duration)));
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#090a10]/95 backdrop-blur-2xl text-white overflow-hidden select-none animate-in fade-in slide-in-from-bottom duration-300">
      {/* Dynamic Ambient Background Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <img
          src={currentTrack.coverArt}
          alt=""
          className="w-full h-full object-cover filter blur-3xl scale-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090a10]/60 via-[#090a10]/80 to-[#090a10]" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 flex items-center justify-between p-4 md:px-8 border-b border-white/5">
        <button
          onClick={() => setIsFullPlayerOpen(false)}
          className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          title="Minimize Player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
            Now Playing
          </p>
          <p className="text-xs text-gray-400 font-medium truncate max-w-[200px]">
            {currentTrack.album}
          </p>
        </div>

        <button
          onClick={() => toggleFavorite(currentTrack.id)}
          className={`p-2 rounded-full transition-transform cursor-pointer ${
            currentTrack.isFavorite ? 'text-pink-500 animate-heart-pop' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Heart className={`w-6 h-6 ${currentTrack.isFavorite ? 'fill-pink-500' : ''}`} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between max-w-lg mx-auto w-full p-6 md:p-8 min-h-0">
        
        {/* Floating Animation Badge for +10s / -10s */}
        {skipBadge && (
          <div
            key={skipBadge.key}
            className="absolute top-1/3 z-30 px-4 py-1.5 rounded-full bg-purple-600/90 text-white font-bold text-sm shadow-xl shadow-purple-600/50 backdrop-blur-md pointer-events-none animate-float-badge"
          >
            {skipBadge.text}
          </div>
        )}

        {/* Vinyl Album Artwork Display */}
        <div className="relative my-auto flex items-center justify-center">
          {/* Glowing Ring */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 opacity-40 filter blur-xl transition-all duration-700 ${
            isPlaying ? 'scale-105 opacity-60' : 'scale-95'
          }`} />

          {/* Vinyl Container */}
          <div className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full p-2 bg-gradient-to-b from-slate-700 to-slate-950 shadow-2xl border-4 border-slate-800 transition-transform duration-500 ${
            isPlaying ? 'animate-spin-vinyl' : 'animation-paused'
          }`}>
            {/* Center Cover Art */}
            <div className="w-full h-full rounded-full overflow-hidden relative shadow-inner border-2 border-black/40">
              <img
                src={currentTrack.coverArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              {/* Vinyl Groove Rings overlay */}
              <div className="absolute inset-0 rounded-full border-[8px] border-black/20 pointer-events-none" />
              <div className="absolute inset-[25%] rounded-full border-[6px] border-black/30 pointer-events-none" />
              <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
              </div>
            </div>
          </div>
        </div>

        {/* Track Title & Artist Info */}
        <div className="w-full text-center my-4 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white truncate tracking-tight my-0">
            {currentTrack.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 font-medium truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Seek Progress Bar */}
        <div className="w-full space-y-2 my-2">
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeekChange}
              onMouseMove={handleSeekMouseMove}
              onMouseLeave={() => setHoverSeekTime(null)}
              className="w-full h-2 rounded-full cursor-pointer z-10"
            />
            {/* Custom Track Fill */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>{formatTime(currentTime)}</span>
            {hoverSeekTime !== null && (
              <span className="text-purple-400 text-[10px] bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/20">
                Seek: {formatTime(hoverSeekTime)}
              </span>
            )}
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Main Controls Row */}
        <div className="w-full flex items-center justify-between gap-2 my-4">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isShuffle ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30' : 'text-gray-400 hover:text-white'
            }`}
            title={isShuffle ? 'Shuffle Enabled' : 'Shuffle Disabled'}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Skip -10s */}
          <button
            onClick={() => skipSeconds(-10)}
            className="p-2.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-transform active:scale-90 cursor-pointer"
            title="Rewind 10 Seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={handlePrevTrack}
            className="p-3 text-white rounded-full hover:bg-white/10 transition-transform active:scale-90 cursor-pointer"
            title="Previous Track"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-purple-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={() => handleNextTrack({ isEnded: false })}
            className="p-3 text-white rounded-full hover:bg-white/10 transition-transform active:scale-90 cursor-pointer"
            title="Next Track"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          {/* Skip +10s */}
          <button
            onClick={() => skipSeconds(10)}
            className="p-2.5 text-gray-300 hover:text-white rounded-full hover:bg-white/10 transition-transform active:scale-90 cursor-pointer"
            title="Forward 10 Seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Repeat Mode Toggle Button */}
          <button
            onClick={toggleRepeatMode}
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              repeatMode !== 'off' ? 'text-purple-400 bg-purple-500/20 border border-purple-500/30' : 'text-gray-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode.toUpperCase()}`}
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Volume Bar Row */}
        <div className="w-full flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
          <button
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-red-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-purple-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer"
          />
          <span className="text-xs text-gray-400 font-mono w-8 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>

      </main>
    </div>
  );
}
