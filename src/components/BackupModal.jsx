import React from 'react';
import { useAudio } from '../context/AudioContext';
import { X, HardDrive, Download, Upload, ShieldCheck, Smartphone, Laptop, CheckCircle2 } from 'lucide-react';

export default function BackupModal() {
  const {
    isBackupModalOpen,
    setIsBackupModalOpen,
    songs,
    folders,
    exportLibraryBackup,
    importLibraryBackup
  } = useAudio();

  if (!isBackupModalOpen) return null;

  const handleExport = () => {
    exportLibraryBackup();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      importLibraryBackup(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg bg-[#121320] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white my-0">
                Storage & Device Sync Guide
              </h3>
              <p className="text-xs text-gray-400">IndexedDB Persistence & Transfer</p>
            </div>
          </div>
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persistence Status Info */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-3">
          <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Browser Refresh Persistence is ACTIVE</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            All your songs, created folders, favorites, volume, and playback state are saved directly in your device’s <strong>IndexedDB storage</strong>. When you refresh or close the browser on this device, everything remains saved!
          </p>
        </div>

        {/* Laptop vs Mobile Explanation */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <span>On Laptop</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-normal">
              Local MP3 files stay securely stored in your Laptop's browser IndexedDB.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Smartphone className="w-4 h-4 text-pink-400" />
              <span>On Mobile</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-normal">
              Pre-loaded demo music plays out-of-the-box. You can also import songs directly on mobile!
            </p>
          </div>
        </div>

        {/* Export / Import Backup Section */}
        <div className="space-y-3 pt-2 border-t border-white/10">
          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
            Transfer & Sync Playlists Between Devices
          </h4>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Library (.json)</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs cursor-pointer transition-transform active:scale-95">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Import Backup File</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setIsBackupModalOpen(false)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
