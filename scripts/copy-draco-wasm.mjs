import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const electronProjectDir = path.resolve(__dirname, '../../3d_viewer_electron');

const srcDir = path.resolve(electronProjectDir, 'node_modules/three/examples/jsm/libs/draco');
const destDir = path.resolve(electronProjectDir, 'src/renderer/public/wasm/draco');

const filesToCopy = [
  'draco_wasm_wrapper.js',
  'draco_decoder.js',
  'draco_decoder.wasm',
];

if (!fs.existsSync(srcDir)) {
  console.warn('[copy-draco-wasm] three package not found in electron project, skipping');
  process.exit(0);
}

// Only copy if destination doesn't already have the files
if (fs.existsSync(destDir) && filesToCopy.every((f) => fs.existsSync(path.join(destDir, f)))) {
  console.log('[copy-draco-wasm] Draco WASM files already present, skipping');
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

for (const file of filesToCopy) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  fs.copyFileSync(src, dest);
  console.log(`[copy-draco-wasm] Copied ${file}`);
}
