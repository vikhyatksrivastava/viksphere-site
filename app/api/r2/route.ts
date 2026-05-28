import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const key = url.searchParams.get('key')
    if (!key) return new Response('Missing key', { status: 400 })

    const accountId = process.env.R2_ACCOUNT_ID
    const accessKey = process.env.R2_ACCESS_KEY_ID
    const secretKey = process.env.R2_SECRET_ACCESS_KEY
    const bucket = process.env.R2_BUCKET
    const customEndpoint = process.env.R2_ENDPOINT  // present in dev (MinIO)

    if (!accessKey || !secretKey || !bucket || (!customEndpoint && !accountId)) {
      return new Response('R2 credentials not configured', { status: 500 })
    }

    const endpoint = customEndpoint || `https://${accountId}.r2.cloudflarestorage.com`
    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: !!customEndpoint,
    })

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })

    if (customEndpoint) {
      // MinIO / local dev: the internal hostname (e.g. http://minio:9000) is not
      // reachable by the browser, so we stream the object body directly through
      // this proxy instead of issuing a redirect to a presigned URL.
      const result = await client.send(cmd)
      if (!result.Body) return new Response('Not found', { status: 404 })

      const bytes = await (result.Body as any).transformToByteArray()
      return new Response(bytes, {
        headers: {
          'Content-Type': result.ContentType ?? 'application/octet-stream',
          'Cache-Control': 'public, max-age=300',
        },
      })
    }

    // Production (Cloudflare R2): generate a short-lived presigned URL and redirect.
    const signedUrl = await getSignedUrl(client, cmd, { expiresIn: 300 })
    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      },
    })
  } catch (e: any) {
    // S3/MinIO returns NoSuchKey when the object doesn't exist — map to 404
    const code = (e as any)?.Code ?? (e as any)?.name ?? ''
    if (code === 'NoSuchKey' || code === 'NotFound') {
      return new Response('Not found', { status: 404 })
    }
    return new Response(String(e?.message || e), { status: 500 })
  }
}

