import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import SongList from '../components/SongList';
import { Music2, Upload, ArrowUpDown, Play } from 'lucide-react';

export default function Library() {
  const { songs, searchQuery, importAudioFiles, playTrack } = useAudio();
  const [sortBy, setSortBy] = useState('title'); // 'title' | 'artist' | 'album' | 'date'
  const [sortOrder, setSortOrder] = useState('asc');
  const [isDragOver, setIsDragOver] = useState(false);

  // Filter & Sort Logic
  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.album.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedSongs = [...filtered].sort((a, b) => {
    let valA = a[sortBy] || '';
    let valB = b[sortBy] || '';
    if (sortBy === 'date') {
      valA = a.createdAt || 0;
      valB = b.createdAt || 0;
    }
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      importAudioFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      importAudioFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handlePlayAll = () => {
    if (sortedSongs.length > 0) {
      playTrack(sortedSongs[0], sortedSongs.map(s => s.id), 'Library All');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2.5 my-0">
            <Music2 className="w-6 h-6 text-purple-400" />
            <span>Music Library</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {songs.length} total tracks in your offline IndexedDB library
          </p>
        </div>

        <div className="flex items-center gap-3">
          {songs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play All ({sortedSongs.length})</span>
            </button>
          )}

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-xs cursor-pointer shadow-md transition-transform active:scale-95">
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
      </div>

      {/* Drag & Drop Import Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-purple-400 bg-purple-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-white/20 bg-white/[0.01]'
        }`}
      >
        <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-70" />
        <p className="text-xs text-gray-300 font-medium">
          Drag & drop MP3, WAV, OGG, or M4A audio files here
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Files stay local on your device and are stored securely in IndexedDB
        </p>
      </div>

      {/* Sorting Controls Bar */}
      <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="title" className="bg-[#141624]">Title</option>
            <option value="artist" className="bg-[#141624]">Artist</option>
            <option value="album" className="bg-[#141624]">Album</option>
            <option value="date" className="bg-[#141624]">Date Added</option>
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer font-semibold uppercase text-[10px]"
          >
            {sortOrder}
          </button>
        </div>

        <span>Showing {sortedSongs.length} tracks</span>
      </div>

      {/* Song List */}
      <SongList
        songs={sortedSongs}
        contextName="Library"
        emptyMessage="Your music library is currently empty."
      />
    </div>
  );
}
