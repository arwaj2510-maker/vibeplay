// Centralized Audio Engine for VibePlay
// Manages HTML5 Audio element instance, Media Session API, Queue, Repeat & Shuffle

import { createSynthesizedAudioBlob } from '../utils/audioGenerator';

class AudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.listeners = new Map();
    this.currentTrack = null;
    this.currentObjectUrl = null;
    
    // Playback state
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1.0;
    this.isMuted = false;
    
    // Repeat modes: 'off' | 'all' | 'one'
    this.repeatMode = 'all';
    this.isShuffle = false;

    // Callbacks provided by React context
    this.onNextTrack = null;
    this.onPrevTrack = null;

    this._initAudioEvents();
    this._initMediaSession();
  }

  _initAudioEvents() {
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this._updateMediaSessionPlaybackState('playing');
      this._emit('play');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this._updateMediaSessionPlaybackState('paused');
      this._emit('pause');
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime = this.audio.currentTime || 0;
      this.duration = this.audio.duration || 0;
      this._emit('timeupdate', { currentTime: this.currentTime, duration: this.duration });
      this._updateMediaSessionPositionState();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      this.duration = this.audio.duration || 0;
      this._emit('loadedmetadata', { duration: this.duration });
      this._updateMediaSessionPositionState();
    });

    this.audio.addEventListener('ended', () => {
      this._emit('ended');
      if (this.onNextTrack) {
        this.onNextTrack({ isEnded: true });
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.isPlaying = false;
      this._emit('error', e);
    });

    this.audio.addEventListener('volumechange', () => {
      this.volume = this.audio.volume;
      this.isMuted = this.audio.muted;
      this._emit('volumechange', { volume: this.volume, isMuted: this.isMuted });
    });
  }

  _initMediaSession() {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', async () => {
          await this.play();
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          this.pause();
        });

        navigator.mediaSession.setActionHandler('previoustrack', async () => {
          if (this.onPrevTrack) {
            await this.onPrevTrack();
            await this.play();
          }
        });

        navigator.mediaSession.setActionHandler('nexttrack', async () => {
          if (this.onNextTrack) {
            await this.onNextTrack({ isEnded: false });
            await this.play();
          }
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details.seekOffset || 10;
          this.seek(Math.max(this.audio.currentTime - skipTime, 0));
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10;
          this.seek(Math.min(this.audio.currentTime + skipTime, this.duration || 0));
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            this.seek(details.seekTime);
          }
        });
      } catch (e) {
        console.warn('Media Session Action Handlers error:', e);
      }
    }
  }

  _updateMediaSessionMetadata(track) {
    if ('mediaSession' in navigator && track) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title || 'Unknown Title',
          artist: track.artist || 'VibePlay',
          album: track.album || 'VibePlay Music',
          artwork: [
            { src: track.coverArt, sizes: '96x96', type: 'image/svg+xml' },
            { src: track.coverArt, sizes: '256x256', type: 'image/svg+xml' },
            { src: track.coverArt, sizes: '512x512', type: 'image/svg+xml' }
          ]
        });
      } catch (e) {
        console.warn('Failed to set MediaSession metadata:', e);
      }
    }
  }

  _updateMediaSessionPlaybackState(state) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  _updateMediaSessionPositionState() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      if (this.duration && !isNaN(this.duration) && this.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: this.duration,
            playbackRate: this.audio.playbackRate || 1.0,
            position: Math.min(this.currentTime, this.duration)
          });
        } catch (e) {
          // Ignore transient position state errors during rapid seeking
        }
      }
    }
  }

  // PUBLIC METHODS

  async loadTrack(track) {
    if (!track) return;

    // Clean up previous Object URL if present
    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    this.currentTrack = track;

    // Immediately update lock screen metadata & status
    this._updateMediaSessionMetadata(track);
    this._updateMediaSessionPlaybackState('playing');

    let audioSrc = '';
    if (track.blob) {
      this.currentObjectUrl = URL.createObjectURL(track.blob);
      audioSrc = this.currentObjectUrl;
    } else if (track.src) {
      audioSrc = track.src;
    } else if (track.preset) {
      // Regenerate preset audio blob if needed
      try {
        const blob = await createSynthesizedAudioBlob(track.preset, track.duration || 30);
        track.blob = blob;
        this.currentObjectUrl = URL.createObjectURL(blob);
        audioSrc = this.currentObjectUrl;
      } catch (err) {
        console.warn('Failed to create synthetic audio blob:', err);
      }
    }

    if (audioSrc) {
      this.audio.src = audioSrc;
      this.audio.load();
    }
    this._emit('trackchange', track);
  }

  async play() {
    if (!this.audio.src) return;
    try {
      await this.audio.play();
    } catch (err) {
      console.warn('Playback play() interrupted or rejected:', err);
    }
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  seek(seconds) {
    if (!isNaN(seconds)) {
      const clamped = Math.max(0, Math.min(seconds, this.duration || 0));
      this.audio.currentTime = clamped;
      this.currentTime = clamped;
      this._emit('timeupdate', { currentTime: clamped, duration: this.duration });
      this._updateMediaSessionPositionState();
    }
  }

  skipSeconds(deltaSeconds) {
    const target = (this.audio.currentTime || 0) + deltaSeconds;
    this.seek(target);
  }

  setVolume(val) {
    const clamped = Math.max(0, Math.min(val, 1));
    this.volume = clamped;
    this.audio.volume = clamped;
    if (clamped > 0 && this.audio.muted) {
      this.audio.muted = false;
    }
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
    this.isMuted = this.audio.muted;
  }

  setRepeatMode(mode) {
    this.repeatMode = mode;
    this._emit('repeatchange', mode);
  }

  setShuffle(isShuffle) {
    this.isShuffle = isShuffle;
    this._emit('shufflechange', isShuffle);
  }

  // EVENT SUBSCRIPTION HELPERS

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  _emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data));
    }
  }
}

export const audioEngine = new AudioEngine();
