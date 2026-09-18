import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, Edit3 } from 'lucide-react';

export default function EditMetadataModal() {
  const { editingSong, setEditingSong, editSongMetadata } = useAudio();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');

  useEffect(() => {
    if (editingSong) {
      setTitle(editingSong.title || '');
      setArtist(editingSong.artist || '');
      setAlbum(editingSong.album || '');
    }
  }, [editingSong]);

  if (!editingSong) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    editSongMetadata(editingSong.id, {
      title: title.trim(),
      artist: artist.trim() || 'Unknown Artist',
      album: album.trim() || 'Unknown Album'
    });

    setEditingSong(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#141624] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white my-0">
              Edit Track Details
            </h3>
          </div>
          <button
            onClick={() => setEditingSong(null)}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Song Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Artist Name
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Album Name
            </label>
            <input
              type="text"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditingSong(null)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 cursor-pointer"
            >
              Save Track Info
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
