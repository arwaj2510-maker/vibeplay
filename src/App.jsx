import React from 'react';
import { AudioProvider, useAudio } from './context/AudioContext';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import MiniPlayer from './components/MiniPlayer';
import FullPlayer from './components/FullPlayer';
import FolderModal from './components/FolderModal';
import EditMetadataModal from './components/EditMetadataModal';

import Home from './pages/Home';
import Library from './pages/Library';
import Folders from './pages/Folders';
import Favorites from './pages/Favorites';

function MainLayout() {
  const { currentView } = useAudio();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'library':
        return <Library />;
      case 'folders':
        return <Folders />;
      case 'favorites':
        return <Favorites />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0c10] text-gray-100 font-sans antialiased select-none">
      {/* Sidebar Navigation for Desktop */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-28 md:pb-24">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>

      {/* Sticky Mini Player */}
      <MiniPlayer />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Full Player Modal */}
      <FullPlayer />

      {/* Folder Creation / Edit Modal */}
      <FolderModal />

      {/* Edit Track Metadata Modal */}
      <EditMetadataModal />
    </div>
  );
}

export default function App() {
  return (
    <AudioProvider>
      <MainLayout />
    </AudioProvider>
  );
}
