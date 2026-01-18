const http = require('http')
const https = require('https')
const { URL } = require('url')

function fetch(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http
    lib.get(url, (res) => {
      let body = ''
      res.on('data', (c) => (body += c.toString()))
      res.on('end', () => resolve({ res, body }))
    }).on('error', (e) => resolve({ error: e }))
  })
}

async function headFollow(url, max = 5) {
  let cur = url
  for (let i = 0; i < max; i++) {
    const lib = cur.startsWith('https') ? https : http
    const { res, error } = await new Promise((resolve) => {
      lib.get(cur, (r) => resolve({ res: r })).on('error', (e) => resolve({ error: e }))
    })
    if (error) return { error }
    const status = res.statusCode
    const headers = res.headers
    if ([301, 302, 303, 307, 308].includes(status) && headers.location) {
      const next = new URL(headers.location, cur).toString()
      cur = next
      continue
    }
    // not a redirect
    return { status, headers, finalUrl: cur }
  }
  return { error: new Error('Too many redirects') }
}

function extractSrcs(html) {
  const srcs = new Set()
  const attrRegex = /<img[^>]+src=(?:\"([^\"]+)\"|\'([^\']+)\')/gi
  let m
  while ((m = attrRegex.exec(html))) {
    const s = m[1] || m[2]
    if (s) srcs.add(s)
  }
  return Array.from(srcs)
}

async function checkPage(pageUrl) {
  console.log('\nPAGE', pageUrl)
  const { res, body, error } = await fetch(pageUrl)
  if (error) return console.error('  fetch error', error.message)
  if (!res) return console.error('  no response')
  if (res.statusCode !== 200) console.log('  page status', res.statusCode)
  const srcs = extractSrcs(body)
  if (srcs.length === 0) return console.log('  no <img> src attributes found')
  console.log('  found image srcs:')
  for (const src of srcs) {
    const full = src.startsWith('http') ? src : new URL(src, pageUrl).toString()
    process.stdout.write('   ' + full + ' -> ')
    const info = await headFollow(full)
    if (info.error) console.log('ERROR', info.error.message)
    else console.log('STATUS', info.status, 'CT', info.headers['content-type'], 'FINAL', info.finalUrl)
  }
}

;(async () => {
  try {
    await checkPage('http://localhost:3000/')
    await checkPage('http://localhost:3000/photos/valencia-visit-20251224')
  } catch (e) {
    console.error('script error', e)
  }
})()
