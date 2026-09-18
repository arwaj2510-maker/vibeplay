// Metadata extraction & artwork generation utility for VibePlay

// Preset cover artwork gradient palletes
const GRADIENT_PALETTES = [
  ['#833ab4', '#fd1d1d', '#fcb045'], // Sunset Glow
  ['#00c6ff', '#0072ff'],             // Ocean Blue
  ['#11998e', '#38ef7d'],             // Emerald Dream
  ['#8e2de2', '#4a00e0'],             // Deep Neon Purple
  ['#ff416c', '#ff4b2b'],             // Crimson Flame
  ['#f857a6', '#ff5858'],             // Hot Pink
  ['#4776e6', '#8e54e9'],             // Electric Violet
  ['#1f4037', '#99f2c5'],             // Mint Forest
];

/**
 * Generates an SVG Data URI album cover with artist/song title initials and modern gradient
 */
export function generateCoverArtSvg(title = 'Unknown Track', artist = 'VibePlay', idSeed = '') {
  // Select gradient based on string seed
  let hash = 0;
  const str = (title + artist + idSeed);
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const paletteIndex = Math.abs(hash) % GRADIENT_PALETTES.length;
  const palette = GRADIENT_PALETTES[paletteIndex];

  // Get initials
  const initials = title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'VP';

  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
      <defs>
        <linearGradient id="grad-${paletteIndex}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}" />
          ${palette[2] ? `<stop offset="50%" stop-color="${palette[1]}" />` : ''}
          <stop offset="100%" stop-color="${palette[palette.length - 1]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="300" height="300" fill="url(#grad-${paletteIndex})" />
      <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
      <circle cx="150" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4" />
      <rect width="300" height="300" fill="url(#glow)" style="mix-blend-mode: overlay;" />
      
      <!-- Vinyl grooves watermark -->
      <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />
      <circle cx="150" cy="150" r="25" fill="#0b0c10" />
      <circle cx="150" cy="150" r="8" fill="#ffffff" opacity="0.8" />
      
      <!-- Display Title Initials -->
      <text x="150" y="240" font-family="system-ui, sans-serif" font-weight="800" font-size="28" fill="#ffffff" text-anchor="middle" letter-spacing="2" opacity="0.95">
        ${escapeXml(initials)}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Extracts metadata from File object (Title, Artist, Album, Duration, Cover Artwork)
 */
export async function extractFileMetadata(file) {
  return new Promise((resolve) => {
    const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
    let artist = 'Unknown Artist';
    let title = defaultTitle;
    let album = 'Local Library';

    // Parse 'Artist - Title' format if present in filename
    if (defaultTitle.includes(' - ')) {
      const parts = defaultTitle.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    // Determine duration using an offscreen audio element
    const tempAudio = document.createElement('audio');
    const objectUrl = URL.createObjectURL(file);
    tempAudio.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      tempAudio.remove();
    };

    tempAudio.onloadedmetadata = () => {
      const duration = tempAudio.duration || 0;
      cleanup();
      resolve({
        title,
        artist,
        album,
        duration: Math.round(duration),
        coverArt: generateCoverArtSvg(title, artist, file.name),
      });
    };

    tempAudio.onerror = () => {
      cleanup();
      resolve({
        title,
        artist,
        album,
        duration: 180, // Fallback duration 3 mins
        coverArt: generateCoverArtSvg(title, artist, file.name),
      });
    };
  });
}

/**
 * Formats duration seconds into M:SS display
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
