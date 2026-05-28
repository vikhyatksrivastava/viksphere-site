const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''

export async function uploadToCloudinary(fileBuffer: Buffer, filename: string) {
  if (!CLOUDINARY_URL) throw new Error('CLOUDINARY_URL not set')

  // CLOUDINARY_URL must be in the form: cloudinary://api_key:api_secret@cloud_name
  // We'll use unsigned upload if you prefer, or proxy via server-side signed calls.

  const endpoint = 'https://api.cloudinary.com/v1_1/'
  // Caller should parse CLOUDINARY_URL to extract cloud_name and upload_preset, or use signed uploads.
  throw new Error('Add your Cloudinary upload implementation or use unsigned preset')
}

export function buildCloudinaryUrl(publicId: string, options = '') {
  // Example: https://res.cloudinary.com/<cloud_name>/image/upload/<options>/<publicId>
  const cloudNameMatch = (process.env.CLOUDINARY_URL || '').match(/@(.+)$/)
  const cloudName = cloudNameMatch ? cloudNameMatch[1] : process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/${options}/${publicId}`
}
