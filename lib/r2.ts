import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'

function loadEnv() {
  // .env.local is already loaded by Next in server env, but keep this safe
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    bucket: process.env.R2_BUCKET,
    accessKey: process.env.R2_ACCESS_KEY_ID,
    secretKey: process.env.R2_SECRET_ACCESS_KEY,
  }
}

export async function listKeys(prefix = ''): Promise<string[]> {
  const { accountId, bucket, accessKey, secretKey } = loadEnv()
  if (!accountId || !bucket || !accessKey || !secretKey) return []

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
  const client = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } })

  const keys: string[] = []
  let continuation: string | undefined = undefined
  do {
    const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuation, MaxKeys: 1000 })
    // Note: this runs server-side in Next and requires env vars to be set
    const res = await client.send(cmd)
    if (res.Contents) {
      for (const o of res.Contents) {
        if (o.Key) keys.push(o.Key)
      }
    }
    continuation = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (continuation)

  return keys
}
