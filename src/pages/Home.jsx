import React from 'react';
import { useAudio } from '../context/AudioContext';
import SongList from '../components/SongList';
import { Play, Flame, Heart, FolderKanban, Sparkles, Upload } from 'lucide-react';

export default function Home() {
  const {
    songs,
    folders,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    setCurrentView,
    setActiveFolderId,
    searchQuery,
    importAudioFiles
  } = useAudio();

  const favoriteSongs = songs.filter(s => s.isFavorite);
  const recentSongs = [...songs].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 5);

  const filteredSongs = searchQuery
    ? songs.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : songs;

  const handleQuickPlay = () => {
    if (currentTrack) {
      togglePlay();
    } else if (songs.length > 0) {
      playTrack(songs[0], songs.map(s => s.id), 'Quick Play');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      importAudioFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  if (searchQuery) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-2">Search Results</h2>
        <SongList
          songs={filteredSongs}
          contextName={`Search: ${searchQuery}`}
          emptyMessage={`No songs found matching "${searchQuery}"`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-fuchsia-900/30 to-indigo-900/40 border border-purple-500/20 p-6 md:p-8 shadow-2xl">
        {/* Background Decorative Glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-600/20 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-48 h-48 bg-pink-600/15 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offline & Background Playback</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight my-0">
              Your Music, Unlimited Vibe.
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Listen to your favorite audio tracks anywhere with seamless background lock-screen controls and persistent folders.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleQuickPlay}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 text-white font-bold text-sm shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{isPlaying ? 'Pause Vibe' : 'Quick Play'}</span>
            </button>

            <label className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/10 cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Add Music</span>
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
      </section>

      {/* Folders Preview Grid */}
      {folders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-purple-400" />
              <span>My Folders</span>
            </h3>
            <button
              onClick={() => {
                setCurrentView('folders');
                setActiveFolderId(null);
              }}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.slice(0, 4).map(folder => {
              const count = (folder.songIds || []).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => {
                    setCurrentView('folders');
                    setActiveFolderId(folder.id);
                  }}
                  className="group relative p-4 rounded-2xl glass-panel glass-panel-hover cursor-pointer space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${folder.color || 'from-purple-600 to-indigo-600'} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 truncate">
                      {folder.name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {count} {count === 1 ? 'Track' : 'Tracks'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Favorites Preview */}
      {favoriteSongs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              <span>Favorite Songs</span>
            </h3>
            <button
              onClick={() => setCurrentView('favorites')}
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
            >
              See All ({favoriteSongs.length})
            </button>
          </div>

          <SongList
            songs={favoriteSongs.slice(0, 3)}
            contextName="Home Favorites"
          />
        </section>
      )}

      {/* Recently Added Songs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span>Recently Added</span>
          </h3>
          <button
            onClick={() => setCurrentView('library')}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer"
          >
            All Tracks ({songs.length})
          </button>
        </div>

        <SongList
          songs={recentSongs}
          contextName="Recently Added"
        />
      </section>
    </div>
  );
}
