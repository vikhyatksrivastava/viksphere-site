const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const imagesDir = path.join(root, 'public', 'images')

function removeDir(dir) {
  if (!fs.existsSync(dir)) return
  const stats = fs.statSync(dir)
  if (stats.isDirectory()) {
    fs.rmSync(dir, { recursive: true, force: true })
    console.log('Removed directory:', dir)
  } else {
    fs.unlinkSync(dir)
    console.log('Removed file:', dir)
  }
}

try {
  // Remove photos folder
  const photos = path.join(imagesDir, 'photos')
  removeDir(photos)

  // Remove hero.jpg if present
  const hero = path.join(imagesDir, 'hero.jpg')
  if (fs.existsSync(hero)) removeDir(hero)

  // Optionally remove images folder if empty
  const remaining = fs.readdirSync(imagesDir)
  if (remaining.length === 0) {
    removeDir(imagesDir)
  }

  console.log('Cleanup complete.')
} catch (e) {
  console.error('Error during cleanup:', e)
  process.exit(1)
}
