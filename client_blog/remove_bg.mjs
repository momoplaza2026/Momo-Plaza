/**
 * Removes black background from logo JPG and saves as transparent PNG.
 * Black pixels (and near-black) become transparent.
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT  = path.join(__dirname, 'public', 'logo.jpg');
const OUTPUT = path.join(__dirname, 'public', 'logo.png');

const THRESHOLD = 40; // pixels darker than this on all channels → transparent

const { data, info } = await sharp(INPUT)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info; // channels = 4 (RGBA)

for (let i = 0; i < data.length; i += channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  // If pixel is near-black → make transparent
  if (r < THRESHOLD && g < THRESHOLD && b < THRESHOLD) {
    data[i + 3] = 0; // alpha = 0 (fully transparent)
  } else if (r < THRESHOLD * 2 && g < THRESHOLD * 2 && b < THRESHOLD * 2) {
    // Soft edge: semi-transparent for smoother blending
    const darkness = Math.max(r, g, b);
    data[i + 3] = Math.round((darkness / (THRESHOLD * 2)) * 255);
  }
}

await sharp(data, { raw: { width, height, channels } })
  .png()
  .toFile(OUTPUT);

console.log(`✅ Transparent logo saved to: ${OUTPUT}`);
