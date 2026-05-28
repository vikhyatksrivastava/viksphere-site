// List objects in a Cloudflare R2 bucket using AWS SDK v3 (S3-compatible)
// Requires env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
// Install deps: npm install @aws-sdk/client-s3

const fs = require('fs')
const path = require('path')
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3')

// Auto-load .env.local if present so users don't have to export env vars in the shell
try {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    content.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
      if (m) {
        let val = m[2]
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
        if (!process.env[m[1]]) process.env[m[1]] = val
      }
    })
  }
} catch (e) {
  // non-fatal
}

const accountId = process.env.R2_ACCOUNT_ID
const accessKey = process.env.R2_ACCESS_KEY_ID
const secretKey = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET
const arg = process.argv[2]
const prefix = (arg === '--all' || arg === '-a') ? '' : (process.argv[2] || 'images/')

if (!accountId || !accessKey || !secretKey || !bucket) {
  console.error('Missing required env vars. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET')
  process.exit(2)
}

const endpoint = `https://${accountId}.r2.cloudflarestorage.com`

const client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
})

async function listAll() {
  let continuation = undefined
  do {
    const cmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuation,
      MaxKeys: 1000,
    })
    try {
      console.log('Listing with Bucket=%s Prefix=%s Continuation=%s', bucket, prefix, continuation || '<none>')
      const res = await client.send(cmd)
      console.log('Received ListObjectsV2 response keys:', (res.KeyCount || 0))
      if (res.Contents && res.Contents.length) {
        for (const o of res.Contents) {
          console.log(o.Key, o.Size, o.LastModified)
        }
      } else {
        console.log('No objects in this page')
      }
      console.log('IsTruncated=', !!res.IsTruncated, 'NextContinuationToken=', res.NextContinuationToken)
      continuation = res.IsTruncated ? res.NextContinuationToken : undefined
    } catch (err) {
      console.error('Error from S3 ListObjectsV2:', err && err.message ? err.message : err)
      process.exit(1)
    }
  } while (continuation)
}

listAll().catch((err) => {
  console.error('Error listing R2 bucket:', err)
  process.exit(1)
})
