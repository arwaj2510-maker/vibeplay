import React from 'react';
import { useAudio } from '../context/AudioContext';
import { Home, Music2, FolderKanban, Heart } from 'lucide-react';

export default function BottomNav() {
  const { currentView, setCurrentView, setActiveFolderId } = useAudio();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: Music2 },
    { id: 'folders', label: 'Folders', icon: FolderKanban },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d0e15]/95 border-t border-white/10 flex items-center justify-around px-2 z-40 backdrop-blur-xl select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              setActiveFolderId(null);
            }}
            className={`flex flex-col items-center justify-center w-full h-full py-1 cursor-pointer transition-all ${
              isActive ? 'text-purple-400 font-semibold scale-105' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-0.5" />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm shadow-purple-400" />
              )}
            </div>
            <span className="text-[11px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
