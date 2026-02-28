/**
 * Generates PWA icons (192x192 and 512x512) from public/favicon.png.
 * Run: node scripts/generate-pwa-icons.cjs
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '..', 'public');
const input = path.join(publicDir, 'favicon.png');
const sizes = [192, 512];

if (!fs.existsSync(input)) {
  console.error('public/favicon.png not found');
  process.exit(1);
}

async function generate() {
  for (const size of sizes) {
    const output = path.join(publicDir, `icon-${size}.png`);
    await sharp(input)
      .resize(size, size)
      .png()
      .toFile(output);
    console.log(`Created ${output}`);
  }
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
