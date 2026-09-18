import React from 'react';

export default function EqualizerVisualizer({ isPlaying = true, className = "h-4 w-4" }) {
  if (!isPlaying) {
    return (
      <div className={`flex items-end justify-center gap-[2px] ${className}`}>
        <span className="w-[3px] h-1 bg-purple-400 rounded-full" />
        <span className="w-[3px] h-2 bg-purple-400 rounded-full" />
        <span className="w-[3px] h-1.5 bg-purple-400 rounded-full" />
        <span className="w-[3px] h-3 bg-purple-400 rounded-full" />
      </div>
    );
  }

  return (
    <div className={`flex items-end justify-center gap-[2px] ${className}`}>
      <span className="w-[3px] bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-eq-1" />
      <span className="w-[3px] bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-eq-2" />
      <span className="w-[3px] bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-eq-3" />
      <span className="w-[3px] bg-gradient-to-t from-purple-500 to-pink-400 rounded-full animate-eq-4" />
    </div>
  );
}
