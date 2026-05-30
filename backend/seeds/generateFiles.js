const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');
const musicDir = path.join(uploadsDir, 'music');
const videosDir = path.join(uploadsDir, 'videos');
const thumbnailsDir = path.join(uploadsDir, 'thumbnails');

const categories = [
  'Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'Electronic', 'R&B', 'Country',
  'Indie', 'Latin', 'Metal', 'Lo-Fi', 'Blues', 'Reggae', 'Folk', 'Soul',
  'K-Pop', 'Ambient', 'Techno', 'Gospel', 'World', 'Acoustic', 'Funk', 'Punk'
];

const gradients = [
  ['from-purple-500', 'to-pink-500'],
  ['from-blue-500', 'to-cyan-500'],
  ['from-green-500', 'to-emerald-500'],
  ['from-orange-500', 'to-red-500'],
  ['from-indigo-500', 'to-purple-500'],
  ['from-pink-500', 'to-rose-500'],
  ['from-teal-500', 'to-blue-500'],
  ['from-amber-500', 'to-orange-500'],
];

const hexColors = {
  'purple': '#A855F7',
  'pink': '#EC4899',
  'blue': '#3B82F6',
  'cyan': '#06B6D4',
  'green': '#22C55E',
  'emerald': '#10B981',
  'orange': '#F97316',
  'red': '#EF4444',
  'indigo': '#6366F1',
  'rose': '#F43F5E',
  'teal': '#14B8A6',
  'amber': '#F59E0B',
};

function getRandomColorPair() {
  const gradient = gradients[Math.floor(Math.random() * gradients.length)];
  const color1 = gradient[0].replace('from-', '').split('-')[0];
  const color2 = gradient[1].replace('to-', '').split('-')[0];
  return [hexColors[color1] || '#A855F7', hexColors[color2] || '#EC4899'];
}

function generateThumbnailSVG(title, isVideo = false) {
  const [color1, color2] = getRandomColorPair();
  const displayTitle = title.length > 20 ? title.substring(0, 17) + '...' : title;
  const icon = isVideo ? 
    `<polygon points="160,130 280,200 160,270" fill="white"/>` :
    `<circle cx="160" cy="200" r="50" fill="none" stroke="white" stroke-width="4"/>
     <line x1="160" y1="150" x2="160" y2="200" stroke="white" stroke-width="4" stroke-linecap="round"/>
     <path d="M160,200 Q200,170 200,200 T240,200" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <rect width="400" height="400" fill="url(#bg)"/>
  
  <circle cx="350" cy="50" r="80" fill="white" opacity="0.07"/>
  <circle cx="50" cy="350" r="100" fill="white" opacity="0.05"/>
  
  <g filter="url(#shadow)" transform="translate(0, -20)">
    ${icon}
  </g>
  
  <text x="200" y="350" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold" opacity="0.95">
    ${displayTitle}
  </text>
</svg>`;
}

function generateSilentWAV(durationSeconds = 5) {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const dataSize = sampleRate * numChannels * (bitsPerSample / 8) * durationSeconds;
  const buffer = Buffer.alloc(44 + dataSize);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  return buffer;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generatePlaceholderFiles() {
  ensureDir(musicDir);
  ensureDir(videosDir);
  ensureDir(thumbnailsDir);
  
  const silentWav = generateSilentWAV(30);
  
  for (let i = 1; i <= 43; i++) {
    const svg = generateThumbnailSVG(`Track ${i}`, false);
    fs.writeFileSync(path.join(thumbnailsDir, `music_${i}.svg`), svg);
    fs.writeFileSync(path.join(musicDir, `track_${i}.mp3`), silentWav);
  }
  
  for (let i = 1; i <= 35; i++) {
    const svg = generateThumbnailSVG(`Video ${i}`, true);
    fs.writeFileSync(path.join(thumbnailsDir, `video_${i}.svg`), svg);
    fs.writeFileSync(path.join(videosDir, `video_${i}.mp4`), silentWav);
  }
  
  console.log('========================================');
  console.log('Placeholder files generated successfully!');
  console.log('========================================');
  console.log(`Music files (43): ${musicDir}`);
  console.log(`Video files (35): ${videosDir}`);
  console.log(`Thumbnails (78): ${thumbnailsDir}`);
  console.log('========================================\n');
}

module.exports = {
  generateThumbnailSVG,
  generateSilentWAV,
  generatePlaceholderFiles,
  ensureDir
};

if (require.main === module) {
  generatePlaceholderFiles();
}
