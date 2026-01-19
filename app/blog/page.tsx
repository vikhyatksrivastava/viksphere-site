export default async function BlogPage() {
  const url = 'https://www.linkedin.com/pulse/why-games-struggle-simulate-india-what-reveals-indian-srivastava-lso4e'
  let ogImage = null
  let excerpt = null
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()

    const imgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    if (imgMatch) ogImage = imgMatch[1]

    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    if (descMatch) {
      excerpt = descMatch[1]
    } else {
      const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i)
      if (pMatch) excerpt = pMatch[1].replace(/<[^>]+>/g, '')
    }
    if (excerpt && excerpt.length > 300) excerpt = excerpt.slice(0, 300) + '...'
  } catch (e) {
    // Fail silently and show fallback
  }

  // If this is a LinkedIn article and we couldn't fetch an OG image, use local fallback
  if (!ogImage && url.includes('linkedin.com')) {
    ogImage = '/images/photos/landscape-01.svg'
  }

  // Resolve to remote base if configured
  try {
    const { resolveImage } = await import('../../lib/image')
    ogImage = resolveImage(ogImage)
  } catch (e) {
    // ignore
  }

  // If ogImage is an external absolute URL, verify it's actually an image
  try {
    if (ogImage && typeof ogImage === 'string' && /^https?:\/\//i.test(ogImage)) {
      const headRes = await fetch(ogImage, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
      const ct = headRes.headers.get('content-type') || ''
      if (!ct.startsWith('image/')) {
        ogImage = '/images/photos/landscape-01.svg'
      }
    }
  } catch (e) {
    // If HEAD fails, fall back to local preview
    ogImage = '/images/photos/landscape-01.svg'
  }

  return (
    <main className="container-max px-6 py-12">
      <h1 className="text-3xl font-semibold">Blog</h1>
      <p className="mt-2">Posts will be managed via Sanity. Categories: Philosophy, Technology, Music, Ideas.</p>

      <div className="mt-6 space-y-4">
        <a
          href="https://www.linkedin.com/pulse/why-games-struggle-simulate-india-what-reveals-indian-srivastava-lso4e"
          target="_blank"
          rel="noopener noreferrer"
        >
          <article className="p-4 bg-[var(--surface-muted)] dark:bg-slate-800 rounded-[var(--radius-md)] shadow-card hover:shadow-lg transition-transform transform hover:-translate-y-0.5 flex gap-4">
            {ogImage ? (
              <img src={ogImage} alt="preview" className="w-40 h-28 object-cover rounded-md" />
            ) : (
              <div className="w-40 h-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
            )}

            <div className="flex-1">
              <h2 className="text-xl font-medium">Why games struggle to simulate India — preview</h2>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{excerpt ?? 'Preview unavailable. Click to read the original on LinkedIn.'}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span>LinkedIn</span>
                <span>·</span>
                <span>Read original →</span>
              </div>
            </div>
          </article>
        </a>
      </div>
    </main>
  )
}
