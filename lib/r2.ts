import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'

function makeClient() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKey = process.env.R2_ACCESS_KEY_ID
  const secretKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKey || !secretKey) return null
  return {
    client: new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    }),
    bucket: process.env.R2_BUCKET ?? '',
  }
}

export async function listKeys(prefix = ''): Promise<string[]> {
  const r2 = makeClient()
  if (!r2 || !r2.bucket) return []

  const keys: string[] = []
  let continuation: string | undefined = undefined
  do {
    const cmd = new ListObjectsV2Command({ Bucket: r2.bucket, Prefix: prefix, ContinuationToken: continuation, MaxKeys: 1000 })
    const res = await r2.client.send(cmd)
    if (res.Contents) {
      for (const o of res.Contents) {
        if (o.Key) keys.push(o.Key)
      }
    }
    continuation = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (continuation)

  return keys
}

export async function uploadObject(key: string, body: Buffer, contentType: string): Promise<void> {
  const r2 = makeClient()
  if (!r2 || !r2.bucket) throw new Error('R2 not configured')
  await r2.client.send(new PutObjectCommand({ Bucket: r2.bucket, Key: key, Body: body, ContentType: contentType }))
}
