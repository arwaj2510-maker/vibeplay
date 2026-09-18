import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { X, FolderKanban } from 'lucide-react';

const GRADIENTS = [
  { id: 'purple', name: 'Purple Neon', class: 'from-purple-600 to-indigo-700' },
  { id: 'orange', name: 'Flame Orange', class: 'from-orange-500 to-amber-600' },
  { id: 'cyan', name: 'Ocean Cyan', class: 'from-cyan-500 to-blue-600' },
  { id: 'pink', name: 'Hot Pink', class: 'from-pink-500 to-rose-600' },
  { id: 'emerald', name: 'Emerald Mint', class: 'from-emerald-500 to-teal-700' },
  { id: 'violet', name: 'Electric Violet', class: 'from-violet-600 to-fuchsia-700' },
];

export default function FolderModal() {
  const { isFolderModalOpen, setIsFolderModalOpen, editingFolder, createOrUpdateFolder } = useAudio();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(GRADIENTS[0].class);

  useEffect(() => {
    if (editingFolder) {
      setName(editingFolder.name);
      setSelectedColor(editingFolder.color || GRADIENTS[0].class);
    } else {
      setName('');
      setSelectedColor(GRADIENTS[0].class);
    }
  }, [editingFolder, isFolderModalOpen]);

  if (!isFolderModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    createOrUpdateFolder({
      id: editingFolder ? editingFolder.id : null,
      name: name.trim(),
      color: selectedColor,
      songIds: editingFolder ? editingFolder.songIds : []
    });

    setIsFolderModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#141624] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white my-0">
              {editingFolder ? 'Edit Folder' : 'Create New Folder'}
            </h3>
          </div>
          <button
            onClick={() => setIsFolderModalOpen(false)}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Workout, Chill Vibes, Travel"
              autoFocus
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setSelectedColor(g.class)}
                  className={`h-10 rounded-xl bg-gradient-to-r ${g.class} flex items-center justify-center text-xs font-semibold text-white transition-transform cursor-pointer ${
                    selectedColor === g.class ? 'ring-2 ring-white scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFolderModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:bg-white/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 disabled:opacity-50 hover:from-purple-500 hover:to-pink-500 cursor-pointer"
            >
              {editingFolder ? 'Save Changes' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
