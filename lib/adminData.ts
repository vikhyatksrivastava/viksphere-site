import fs from 'fs'
import path from 'path'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

function makeR2() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKey = process.env.R2_ACCESS_KEY_ID
  const secretKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket    = process.env.R2_BUCKET
  if (!accountId || !accessKey || !secretKey || !bucket) return null
  return {
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    }),
    bucket,
  }
}

export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  // Try R2 first — holds admin-saved data
  const r2 = makeR2()
  if (r2) {
    try {
      const res = await r2.client.send(new GetObjectCommand({ Bucket: r2.bucket, Key: `data/${filename}` }))
      const body = await res.Body?.transformToString()
      if (body) return JSON.parse(body) as T
    } catch { /* not in R2 yet — fall through */ }
  }
  // Fall back to bundled local file (initial/default data)
  try {
    const text = fs.readFileSync(path.join(process.cwd(), 'data', filename), 'utf8')
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

export async function writeJson(filename: string, data: unknown): Promise<void> {
  const r2 = makeR2()
  if (!r2) throw new Error('R2 not configured')
  await r2.client.send(new PutObjectCommand({
    Bucket: r2.bucket,
    Key: `data/${filename}`,
    Body: JSON.stringify(data, null, 2) + '\n',
    ContentType: 'application/json',
  }))
}
