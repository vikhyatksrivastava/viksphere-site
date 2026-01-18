const http = require('http')
const https = require('https')
const { URL } = require('url')

function fetchFollow(url, max = 10) {
  return new Promise((resolve) => {
    const history = []
    let cur = url
    let count = 0

    function doReq(u) {
      const lib = u.startsWith('https') ? https : http
      const req = lib.get(u, (res) => {
        const { statusCode, headers } = res
        const info = { url: u, statusCode, headers }
        history.push(info)
        if ([301,302,303,307,308].includes(statusCode) && headers.location && count < max) {
          count++
          const next = new URL(headers.location, u).toString()
          doReq(next)
          return
        }
        let body = ''
        res.on('data', (c) => (body += c.toString()))
        res.on('end', () => {
          info.body = body
          resolve(history)
        })
      })
      req.on('error', (e) => resolve({ error: e.message, history }))
    }
    doReq(cur)
  })
}

const argv = process.argv.slice(2)
if (!argv[0]) {
  console.error('Usage: node scripts/fetch-url.js <url>')
  process.exit(2)
}
;(async () => {
  const url = argv[0]
  const res = await fetchFollow(url)
  if (res && res.error) {
    console.error('ERROR', res.error)
    process.exit(1)
  }
  for (let i = 0; i < res.length; i++) {
    const r = res[i]
    console.log('--- HOP', i + 1, '---')
    console.log('URL:', r.url)
    console.log('STATUS:', r.statusCode)
    console.log('HEADERS:', JSON.stringify(r.headers, null, 2))
    if (r.body) {
      const snippet = r.body.length > 2000 ? r.body.slice(0, 2000) + '\n...[truncated]' : r.body
      console.log('BODY:', snippet)
    }
  }
})()
