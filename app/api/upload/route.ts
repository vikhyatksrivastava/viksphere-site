import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '../../../lib/requireAdmin'

const ALLOWED_TYPES = /^image\/(jpeg|png|gif|webp|svg\+xml|avif)$/i
const MAX_BYTES = 10 * 1024 * 1024  // 10 MB

// ── MinIO upload (local / Docker dev) ─────────────────────────────────────────
async function handleMinioUpload(dataUrl: string): Promise<NextResponse> {
  const r2Endpoint = process.env.R2_ENDPOINT
  const accessKey  = process.env.R2_ACCESS_KEY_ID
  const secretKey  = process.env.R2_SECRET_ACCESS_KEY
  const bucket     = process.env.R2_BUCKET

  if (!r2Endpoint || !accessKey || !secretKey || !bucket) {
    return NextResponse.json(
      { error: 'R2/MinIO env vars missing (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET).' },
      { status: 500 },
    )
  }

  const match = dataUrl.match(/^data:(image\/[a-z+.-]+);base64,(.+)$/i)
  if (!match) {
    return NextResponse.json({ error: 'Invalid data URL — must be a base64-encoded image.' }, { status: 400 })
  }

  const [, contentType, base64Data] = match
  if (!ALLOWED_TYPES.test(contentType)) {
    return NextResponse.json({ error: `Unsupported image type: ${contentType}` }, { status: 415 })
  }

  const buffer = Buffer.from(base64Data, 'base64')
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 10 MB).' }, { status: 413 })
  }

  const ext = contentType.split('/')[1]?.replace('jpeg', 'jpg').replace('svg+xml', 'svg') ?? 'bin'
  const key = `uploads/post-covers/${Date.now()}.${ext}`

  try {
    const client = new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    })
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }))
    // Return same shape as Cloudinary so PostsManager works unchanged
    return NextResponse.json({ result: { secure_url: `/api/r2?key=${encodeURIComponent(key)}` } })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const deny = await requireAdmin()
  if (deny) return deny

  const body = await request.json().catch(() => null)
  if (!body || !body.dataUrl) return NextResponse.json({ error: 'Missing dataUrl' }, { status: 400 })

  // When R2_ENDPOINT is set we are in local/Docker dev — always use MinIO.
  // This prevents the app from trying to reach api.cloudinary.com from inside the container.
  if (process.env.R2_ENDPOINT) {
    return handleMinioUpload(body.dataUrl as string)
  }

  // ── Production: Cloudinary ────────────────────────────────────────────────
  const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET
  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { error: 'No upload service configured — set Cloudinary or R2/MinIO environment variables.' },
      { status: 500 },
    )
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
  const form = new FormData()
  form.append('file', body.dataUrl)
  form.append('upload_preset', uploadPreset)

  try {
    const res  = await fetch(url, { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) {
      // Cloudinary error bodies are objects — extract message so client sees readable text
      const msg = data?.error?.message ?? data?.message ?? JSON.stringify(data)
      return NextResponse.json({ error: msg }, { status: 500 })
    }
    return NextResponse.json({ result: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

