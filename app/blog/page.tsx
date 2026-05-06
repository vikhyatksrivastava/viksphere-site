import { readJson } from '../../lib/adminData'

interface AdminPost { slug: string; title: string; url: string; excerpt: string; date: string }

export default async function BlogPage() {
  const url = 'https://www.linkedin.com/pulse/why-games-struggle-simulate-india-what-reveals-indian-srivastava-lso4e'
  let ogImage = null
  let excerpt = null
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } })
    const html = await res.text()

    const imgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
    if (imgMatch) ogImage = imgMatch[1]

    const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    if (descMatch) {
      excerpt = descMatch[1]
    } else {
      const pMatch = html.match(/<p[^>]*>(.*?)<\/p>/i)
      if (pMatch) excerpt = pMatch[1].replace(/<[^>]+>/g, '')
    }
    if (excerpt && excerpt.length > 300) excerpt = excerpt.slice(0, 300) + '...'
  } catch { /* fail silently */ }

  if (!ogImage && url.includes('linkedin.com')) {
    ogImage = '/images/photos/landscape-01.svg'
  }

  try {
    const { resolveImage } = await import('../../lib/image')
    ogImage = resolveImage(ogImage)
  } catch { /* ignore */ }

  try {
    if (ogImage && typeof ogImage === 'string' && /^https?:\/\//i.test(ogImage)) {
      const headRes = await fetch(ogImage, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } })
      const ct = headRes.headers.get('content-type') || ''
      if (!ct.startsWith('image/')) ogImage = '/images/photos/landscape-01.svg'
    }
  } catch {
    ogImage = '/images/photos/landscape-01.svg'
  }

  let displayImage = '/images/photos/landscape-01.svg'
  if (ogImage && typeof ogImage === 'string' && !/^\/api\/r2|^https?:\/\//i.test(ogImage)) {
    displayImage = ogImage
  }

  const adminPosts = (await readJson<AdminPost[]>('posts.json', [])).map(p => ({
    title: p.title,
    excerpt: p.excerpt || 'Click to read the original on LinkedIn.',
    url: p.url,
    image: displayImage,
    date: p.date,
    source: 'LinkedIn',
  }))

  const hardcoded = [
    {
      title: 'Databricks — A Simple Story of Data Lakes, Delta, Live Tables, Unity',
      excerpt: 'Click to read the original on LinkedIn.',
      url: 'https://www.linkedin.com/pulse/databricks-simple-story-data-lakes-delta-live-tables-unity-jkvtc/',
      image: displayImage,
      date: '2026-02-17',
      source: 'LinkedIn',
    },
    {
      title: 'Why games struggle to simulate India — What this reveals about Indian culture',
      excerpt: excerpt ?? 'Click to read the original on LinkedIn.',
      url,
      image: displayImage,
      date: '2026-01-18',
      source: 'LinkedIn',
    },
    {
      title: 'Development — How AI Made It Easy',
      excerpt: 'Click to read the original on LinkedIn.',
      url: 'https://www.linkedin.com/pulse/development-how-ai-made-easy-vikhyat-kumar-srivastava-u3gbe/',
      image: displayImage,
      date: '2026-01-27',
      source: 'LinkedIn',
    },
  ]

  const seenUrls = new Set(adminPosts.map(p => p.url))
  const posts = [...adminPosts, ...hardcoded.filter(p => !seenUrls.has(p.url))]

  // Group by month-year
  const groups: Record<string, { label: string; items: typeof posts }> = {}
  for (const p of posts.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0
    const tb = b.date ? new Date(b.date).getTime() : 0
    return tb - ta
  })) {
    const d = p.date ? new Date(p.date) : null
    const key = d && !Number.isNaN(d.getTime())
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      : 'unknown'
    if (!groups[key]) {
      groups[key] = {
        label: d && !Number.isNaN(d.getTime())
          ? d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).replace(' ', '-')
          : 'Unknown',
        items: [],
      }
    }
    groups[key].items.push(p)
  }
  const keys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1))

  return (
    <main className="container-max px-6 py-16">

      {/* Header */}
      <div className="mb-12">
        <span className="section-badge mb-4">Writing</span>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Blog</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
          Thoughts on technology, philosophy, music, and ideas. Published on LinkedIn.
        </p>
      </div>

      {/* Posts grouped by month */}
      <div className="space-y-12">
        {keys.map((k) => (
          <section key={k}>
            {/* Month divider */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                {groups[k].label}
              </h2>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="space-y-4">
              {groups[k].items.map((p) => (
                <a
                  key={p.url}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <article className="flex gap-5 p-5 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 hover:border-teal-200 dark:hover:border-teal-800/60 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-40 h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                      <img
                        src={p.image}
                        alt="preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                          {p.source}
                        </span>
                        {p.date && (
                          <span className="text-xs text-slate-400">
                            {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {p.excerpt}
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400 font-semibold">
                        Read original
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </article>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
