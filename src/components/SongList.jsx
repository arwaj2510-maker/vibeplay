import React from 'react';
import SongCard from './SongCard';
import { Music } from 'lucide-react';

export default function SongList({ songs, contextName = 'Song List', emptyMessage = 'No songs found' }) {
  if (!songs || songs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
          <Music className="w-6 h-6 text-purple-400" />
        </div>
        <h4 className="text-sm font-semibold text-gray-300 mb-1">{emptyMessage}</h4>
        <p className="text-xs text-gray-500 max-w-xs">
          Import music files from your device to start building your VibePlay library.
        </p>
      </div>
    );
  }

  const queueSongIds = songs.map(s => s.id);

  return (
    <div className="space-y-2">
      {songs.map((song, index) => (
        <SongCard
          key={song.id}
          song={song}
          index={index}
          queueSongIds={queueSongIds}
          contextName={contextName}
        />
      ))}
    </div>
  );
}
