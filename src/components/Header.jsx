import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Search, Upload, Disc3, Sparkles } from 'lucide-react';

export default function Header() {
  const { searchQuery, setSearchQuery, importAudioFiles, isImporting, songs } = useAudio();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      importAudioFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0b0c10]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 md:px-8 flex items-center justify-between gap-4">
      {/* Mobile Branding */}
      <div className="flex md:hidden items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 p-[1.5px]">
          <div className="w-full h-full bg-[#0d0e15] rounded-[10px] flex items-center justify-center">
            <Disc3 className="w-4 h-4 text-purple-400 animate-spin-slow" />
          </div>
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          VibePlay
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs, artists, albums, playlists..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Mobile Upload Button */}
        <label className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-purple-600/30 border border-purple-500/30 text-purple-300 cursor-pointer active:scale-95">
          <Upload className="w-4 h-4" />
          <input
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Stats Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{songs.length} Tracks</span>
        </div>
      </div>
    </header>
  );
}
