import { NextRequest } from 'next/server'
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
    if (!accountId || !accessKey || !secretKey || !bucket) {
      return new Response('R2 credentials not configured', { status: 500 })
    }

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
    const client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    })

    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
    const signedUrl = await getSignedUrl(client, cmd, { expiresIn: 300 })

    return Response.redirect(signedUrl, 302)
  } catch (e: any) {
    return new Response(String(e?.message || e), { status: 500 })
  }
}
