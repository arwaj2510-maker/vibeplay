import React from 'react';
import { useAudio } from '../context/AudioContext';
import SongList from '../components/SongList';
import { Heart, Play } from 'lucide-react';

export default function Favorites() {
  const { songs, playTrack } = useAudio();

  const favoriteSongs = songs.filter(s => s.isFavorite);

  const handlePlayAllFavorites = () => {
    if (favoriteSongs.length > 0) {
      playTrack(favoriteSongs[0], favoriteSongs.map(s => s.id), 'Favorites');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-900/40 via-rose-900/30 to-purple-900/40 border border-pink-500/20 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold border border-pink-500/30">
            <Heart className="w-3.5 h-3.5 fill-pink-500" />
            <span>Starred Tracks</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight my-0">
            Favorites Collection
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 font-medium">
            {favoriteSongs.length} {favoriteSongs.length === 1 ? 'song' : 'songs'} saved in your favorites list
          </p>
        </div>

        {favoriteSongs.length > 0 && (
          <button
            onClick={handlePlayAllFavorites}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-extrabold text-sm shadow-xl shadow-pink-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Play All Favorites</span>
          </button>
        )}
      </div>

      {/* Song List */}
      <SongList
        songs={favoriteSongs}
        contextName="Favorites List"
        emptyMessage="No favorite songs yet."
      />
    </div>
  );
}
