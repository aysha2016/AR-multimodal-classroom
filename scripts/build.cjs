const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

console.log('[1/5] Ensuring audio assets are pre-rendered...');
try {
  require('./buildAudioAssets.cjs');
} catch (e) {
  console.warn('Audio generation warning:', e.message);
}

console.log('[2/5] Preparing index.html for Vite build...');
const indexPath = path.join(rootDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

// Ensure index.html references /src/main.tsx for Vite build
if (!html.includes('/src/main.tsx')) {
  html = html.replace(
    /<script type="module" crossorigin src=".*?assets\/index-[^"]+\.js"><\/script>/,
    '<script type="module" src="/src/main.tsx"></script>'
  );
  fs.writeFileSync(indexPath, html);
}

console.log('[3/5] Running Vite production build...');
execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

console.log('[4/5] Synchronizing production bundle to root, docs, and dist...');
const distIndex = path.join(rootDir, 'dist', 'index.html');
const compiledHtml = fs.readFileSync(distIndex, 'utf-8');

// A. Write compiled HTML to root index.html and 404.html
fs.writeFileSync(path.join(rootDir, 'index.html'), compiledHtml);
fs.writeFileSync(path.join(rootDir, '404.html'), compiledHtml);
fs.writeFileSync(path.join(rootDir, 'dist', '404.html'), compiledHtml);

// B. Sync to docs directory
const docsDir = path.join(rootDir, 'docs');
fs.rmSync(docsDir, { recursive: true, force: true });
fs.cpSync(path.join(rootDir, 'dist'), docsDir, { recursive: true });

// C. Copy dist/assets to root assets directory for root deployments
const rootAssets = path.join(rootDir, 'assets');
fs.rmSync(rootAssets, { recursive: true, force: true });
fs.cpSync(path.join(rootDir, 'dist', 'assets'), rootAssets, { recursive: true });

// D. Ensure .nojekyll in all locations
fs.writeFileSync(path.join(rootDir, '.nojekyll'), '');
fs.writeFileSync(path.join(rootDir, 'dist', '.nojekyll'), '');
fs.writeFileSync(path.join(rootDir, 'docs', '.nojekyll'), '');

console.log('[5/5] Build and multi-target deployment synchronization complete!');
