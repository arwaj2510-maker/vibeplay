import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { X, UserCheck, Mail, Lock, User, Sparkles, Cloud, ArrowRight } from 'lucide-react';

export default function LoginModal() {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
    register,
    loginAsDemo,
    authError,
    setAuthError,
    isLoading
  } = useAuth();

  const { loadCloudUserLibrary } = useAudio();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      try {
        const res = await login(email, password);
        if (res && res.songs) {
          await loadCloudUserLibrary(res.songs, res.folders);
        }
      } catch (err) {}
    } else {
      if (!name.trim()) return;
      try {
        const res = await register(name, email, password);
        if (res && res.songs) {
          await loadCloudUserLibrary(res.songs, res.folders);
        }
      } catch (err) {}
    }
  };

  const handleDemoClick = async () => {
    try {
      const res = await loginAsDemo();
      if (res && res.songs) {
        await loadCloudUserLibrary(res.songs, res.folders);
      }
    } catch (err) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-[#121320] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-gray-200 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-600/20 rounded-full filter blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white my-0">
                {mode === 'login' ? 'Cloud Sync Login' : 'Create VibePlay Account'}
              </h3>
              <p className="text-xs text-gray-400">Sync songs & playlists across laptop & mobile</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAuthModalOpen(false);
              setAuthError('');
            }}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {authError && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
            {authError}
          </div>
        )}

        {/* 1-Click Demo Login Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900/60 border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-purple-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant Cross-Device Sync Demo</span>
            </span>
            <span className="text-[10px] bg-purple-500/20 px-2 py-0.5 rounded-full text-purple-300">1-Click</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Log in as demo user to instantly test cross-device cloud music sync on Laptop & Mobile!
          </p>
          <button
            type="button"
            onClick={handleDemoClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs shadow-md hover:from-purple-500 hover:to-pink-500 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Login as Demo VIP User</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#121320] px-3 text-[10px] uppercase font-bold text-gray-500 shrink-0">
            Or Use Email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Your Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@vibeplay.com"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-white text-gray-900 font-extrabold text-sm shadow-xl hover:bg-gray-100 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Syncing...' : mode === 'login' ? 'Sign In to Cloud' : 'Create Free Account'}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="text-center text-xs text-gray-400">
          {mode === 'login' ? (
            <p>
              Don't have a cloud account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setAuthError('');
                }}
                className="text-purple-400 font-bold hover:underline cursor-pointer"
              >
                Register Free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthError('');
                }}
                className="text-purple-400 font-bold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
