const fs = require('fs');
const path = require('path');
try {
  const sharp = require('sharp');
  const root = path.resolve(__dirname, '..');
  const svgPath = path.join(root, 'docs', 'architecture.svg');
  const outPath = path.join(root, 'docs', 'architecture.png');

  if (!fs.existsSync(svgPath)) {
    console.error('SVG file not found:', svgPath);
    process.exit(1);
  }

  sharp(svgPath)
    .png({ quality: 90 })
    .toFile(outPath)
    .then(() => console.log('Generated PNG:', outPath))
    .catch((err) => {
      console.error('Error converting SVG to PNG:', err.message || err);
      process.exit(1);
    });
} catch (err) {
  console.error('Missing dependency `sharp`. Install with: npm install --save-dev sharp');
  process.exit(1);
}
