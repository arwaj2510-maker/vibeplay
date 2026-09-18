// Helper to generate synthetic WAV audio Blobs for demo tracks
// Creates real, playable audio files using Web Audio API offline rendering

export function createSynthesizedAudioBlob(preset = 'chill', durationSeconds = 30) {
  const sampleRate = 44100;
  const numberOfChannels = 2;
  const totalFrames = sampleRate * durationSeconds;
  
  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    numberOfChannels,
    totalFrames,
    sampleRate
  );

  // Generate music based on preset
  if (preset === 'chill') {
    // Soft synth chord progression: Am7 -> Fmaj7 -> Cmaj7 -> G7
    const chords = [
      [220.00, 261.63, 329.63, 392.00], // A3, C4, E4, G4
      [174.61, 220.00, 261.63, 329.63], // F3, A3, C4, E4
      [130.81, 164.81, 196.00, 246.94], // C3, E3, G3, B3
      [196.00, 246.94, 293.66, 349.23], // G3, B3, D4, F4
    ];

    chords.forEach((chord, idx) => {
      const startTime = idx * (durationSeconds / 4);
      const chordDuration = durationSeconds / 4;

      chord.forEach(freq => {
        const osc = offlineCtx.createOscillator();
        const gain = offlineCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration - 0.1);

        osc.connect(gain);
        gain.connect(offlineCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + chordDuration);
      });
    });
  } else if (preset === 'synthwave') {
    // Energetic bassline & lead synth melody
    const bassNotes = [110, 110, 130.81, 146.83, 110, 110, 98, 110]; // A2, C3, D3, G2
    const stepDuration = durationSeconds / bassNotes.length;

    bassNotes.forEach((freq, idx) => {
      const startTime = idx * stepDuration;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + stepDuration - 0.05);

      osc.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + stepDuration);
    });
  } else {
    // Ambient pad with warm sweep
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, 0);
    osc.frequency.exponentialRampToValueAtTime(440, durationSeconds / 2);
    osc.frequency.exponentialRampToValueAtTime(220, durationSeconds);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, 0);
    filter.frequency.linearRampToValueAtTime(1200, durationSeconds / 2);
    filter.frequency.linearRampToValueAtTime(400, durationSeconds);

    gain.gain.setValueAtTime(0.01, 0);
    gain.gain.linearRampToValueAtTime(0.2, 1);
    gain.gain.linearRampToValueAtTime(0.01, durationSeconds);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(offlineCtx.destination);

    osc.start(0);
    osc.stop(durationSeconds);
  }

  return offlineCtx.startRendering().then(renderedBuffer => {
    return bufferToWavBlob(renderedBuffer);
  });
}

// Convert AudioBuffer to WAV Blob format
function bufferToWavBlob(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  let channels = [], sampleRate = buffer.sampleRate;
  let offset = 0, pos = 0;

  function setUint16(data) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16);         // length = 16
  setUint16(1);          // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2);              // block-align
  setUint16(16);                         // 16-bit

  setUint32(0x61746164); // "data" chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}
