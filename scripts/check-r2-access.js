const https = require('https')
const urls = process.argv.slice(2)
if (urls.length === 0) {
  console.error('Usage: node check-r2-access.js <url> [<url> ...]')
  process.exit(2)
}

function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      console.log(url)
      console.log('  status:', res.statusCode)
      console.log('  content-type:', res.headers['content-type'])
      let seen = ''
      res.on('data', (chunk) => {
        if (seen.length < 200) seen += chunk.toString('utf8')
      })
      res.on('end', () => {
        console.log('  sample:', seen.slice(0, 200).replace(/\n/g, ' '))
        resolve()
      })
    }).on('error', (err) => {
      console.error(url, 'error:', err.message)
      resolve()
    })
  })
}

;(async () => {
  for (const u of urls) await check(u)
  console.log('done')
})()
