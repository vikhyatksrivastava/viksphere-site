const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

// Load .env.local
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
  // ignore
}

const accountId = process.env.R2_ACCOUNT_ID
const bucket = process.env.R2_BUCKET
const accessKey = process.env.R2_ACCESS_KEY_ID
const secretKey = process.env.R2_SECRET_ACCESS_KEY

if (!accountId || !bucket || !accessKey || !secretKey) {
  console.error('Missing R2 env vars. Check .env.local')
  process.exit(2)
}

const key = process.argv[2]
if (!key) {
  console.error('Usage: node scripts/test-presign-and-fetch.js <key>')
  process.exit(2)
}

const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
const client = new S3Client({ region: 'auto', endpoint, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } })

;(async () => {
  try {
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
    const url = await getSignedUrl(client, cmd, { expiresIn: 300 })
    console.log('Signed URL:', url)

    const lib = url.startsWith('https') ? https : http
    const req = lib.get(url, (res) => {
      console.log('Fetch status:', res.statusCode)
      console.log('Content-Type:', res.headers['content-type'])
      console.log('Content-Length header:', res.headers['content-length'])
      let chunks = []
      let size = 0
      res.on('data', (c) => {
        chunks.push(c)
        size += c.length
        if (size > 2000000) req.destroy()
      })
      res.on('end', () => {
        if (!res.headers['content-type'] || res.headers['content-type'].includes('xml') || res.headers['content-type'].includes('text')) {
          const body = Buffer.concat(chunks).toString('utf8')
          console.log('BODY SNIPPET:', body.slice(0, 2000))
        } else {
          console.log('Fetched binary data size:', size)
        }
      })
    })
    req.on('error', (e) => {
      console.error('Fetch error:', e.message)
    })
  } catch (e) {
    console.error('Error generating signed URL:', e)
  }
})()
