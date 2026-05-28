// Upload local images under public/images to Cloudinary
// Requires CLOUDINARY_URL env var (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
// Install deps: npm install cloudinary glob

const cloudinary = require('cloudinary').v2
const path = require('path')
const glob = require('glob')

cloudinary.config({
  // cloudinary will read CLOUDINARY_URL if present
})

const localDir = path.join(__dirname, '..', 'public', 'images')
const pattern = process.argv[2] || `${localDir}/**/*.{jpg,jpeg,png,webp,svg}`

if (!process.env.CLOUDINARY_URL && !(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  console.error('Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET')
  process.exit(2)
}

const files = glob.sync(pattern, { nodir: true })
if (files.length === 0) {
  console.log('No files found for pattern', pattern)
  process.exit(0)
}

;(async () => {
  for (const f of files) {
    const publicId = path.relative(localDir, f).replace(/\\\\/g, '/').replace(/\.[^.]+$/, '')
    try {
      const res = await cloudinary.uploader.upload(f, { folder: 'viksphere', public_id: publicId })
      console.log('uploaded', f, '->', res.secure_url)
    } catch (e) {
      console.error('upload failed', f, e.message || e)
    }
  }
})()
