import fs from 'fs'
import path from 'path'
import PhotoGallery from './components/PhotoGallery'
import { activities } from '../data/activities'
import { resolveImage } from '../lib/image'
import { readJson } from '../lib/adminData'

interface AdminAlbum { slug: string; title: string; date: string; excerpt: string; cover: string }
interface AdminPost  { slug: string; title: string; url: string; excerpt: string; date: string; coverImage?: string }

type FeedItem = {
  slug: string
  title: string
  date: string
  excerpt?: string
  src?: string | null
  kind: 'photo' | 'blog'
  href: string
  external: boolean
}

export default async function Home() {

  const [adminAlbums, adminPosts] = await Promise.all([
    readJson<AdminAlbum[]>('albums.json', []),
    readJson<AdminPost[]>('posts.json', []),
  ])

  const adminAlbumSlugs = new Set(adminAlbums.map(a => a.slug))
  const adminPostUrls   = new Set(adminPosts.map(p => p.url))

  function getTime(slug: string, date?: string) {
    const m8 = slug.match(/(\d{8})/)
    if (m8) {
      const s = m8[1]
      const d = new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)))
      if (!Number.isNaN(d.getTime())) return d.getTime()
    }
    if (date) {
      const d = new Date(date)
      if (!Number.isNaN(d.getTime())) return d.getTime()
    }
    const m4 = slug.match(/(\d{4})/)
    if (m4) {
      const d = new Date(Number(m4[1]), 0, 1)
      if (!Number.isNaN(d.getTime())) return d.getTime()
    }
    return 0
  }

  function getDate(slug: string, date?: string): Date | null {
    const m8 = slug.match(/(\d{8})/)
    if (m8) {
      const s = m8[1]
      const d = new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)))
      if (!Number.isNaN(d.getTime())) return d
    }
    if (date) {
      const d = new Date(date)
      if (!Number.isNaN(d.getTime())) return d
    }
    const m4 = slug.match(/(\d{4})/)
    if (m4) {
      const d = new Date(Number(m4[1]), 0, 1)
      if (!Number.isNaN(d.getTime())) return d
    }
    return null
  }

  function fmtDate(d: Date | null) {
    if (!d) return ''
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }

  function monthKey(d: Date | null) {
    if (!d) return 'unknown'
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  function monthLabel(d: Date | null) {
    if (!d) return 'Unknown'
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).replace(' ', '-')
  }

  // ── Featured photos ──────────────────────────────────────────────────
  const featured: { src: string; alt?: string }[] = []

  // Admin albums first (newest)
  for (const album of [...adminAlbums].sort((a, b) => getTime(a.slug, a.date) > getTime(b.slug, b.date) ? -1 : 1)) {
    if (featured.length >= 6) break
    const src = resolveImage(album.cover)
    if (src) featured.push({ src, alt: album.title })
  }

  // Fill remaining slots from activities
  const sortedActs = activities.slice().sort((a, b) => getTime(b.slug, b.date) - getTime(a.slug, a.date))
  for (const act of sortedActs) {
    if (featured.length >= 6) break
    if ((act as any).kind && (act as any).kind !== 'photo') continue
    if (adminAlbumSlugs.has(act.slug)) continue
    try {
      const dir = path.join(process.cwd(), 'public', 'images', 'photos', act.slug)
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|svg|webp)$/i.test(f))
        if (files.length > 0) {
          featured.push({ src: resolveImage(`/images/photos/${act.slug}/${files[0]}`), alt: act.title })
          continue
        }
      }
    } catch { /* ignore */ }
    if (act.cover) {
      const c = act.cover.startsWith('http') ? act.cover : act.cover.replace(/^public[\\/]/, '/').replace(/^[^/]/, (s) => '/' + s)
      featured.push({ src: resolveImage(c), alt: act.title })
    }
  }

  // ── Latest feed ──────────────────────────────────────────────────────
  const feed: FeedItem[] = []

  // Admin albums → photo feed items
  for (const album of adminAlbums) {
    feed.push({
      slug: album.slug,
      title: album.title,
      date: album.date,
      excerpt: album.excerpt,
      src: resolveImage(album.cover),
      kind: 'photo',
      href: `/photos/${album.slug}`,
      external: false,
    })
  }

  // Admin posts → blog feed items (dedupe against hardcoded activities)
  for (const post of adminPosts) {
    feed.push({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      src: post.coverImage ? resolveImage(post.coverImage) : '/images/photos/landscape-01.svg',
      kind: 'blog',
      href: post.url,
      external: true,
    })
  }

  // Activities (skip slugs already covered by admin albums)
  for (const act of activities) {
    if (adminAlbumSlugs.has(act.slug)) continue
    const isBlog = (act as any).kind === 'blog'
    const externalUrl = isBlog ? ((act as any).url || null) : null
    if (isBlog && externalUrl && adminPostUrls.has(externalUrl)) continue

    const coverRaw = isBlog ? '/images/photos/landscape-01.svg' : act.cover
    const src = coverRaw
      ? resolveImage(coverRaw.startsWith('http') ? coverRaw : coverRaw.replace(/^public[\\/]/, '/').replace(/^[^/]/, (s) => '/' + s))
      : null

    feed.push({
      slug: act.slug,
      title: act.title,
      date: act.date ?? '',
      excerpt: act.excerpt,
      src,
      kind: isBlog ? 'blog' : 'photo',
      href: externalUrl ?? `/photos/${act.slug}`,
      external: !!externalUrl,
    })
  }

  // Group by month-year, sorted newest first
  const groups: Record<string, { label: string; items: FeedItem[] }> = {}
  for (const item of feed.sort((a, b) => getTime(b.slug, b.date) - getTime(a.slug, a.date))) {
    const d = getDate(item.slug, item.date)
    const key = monthKey(d)
    if (!groups[key]) groups[key] = { label: monthLabel(d), items: [] }
    groups[key].items.push(item)
  }
  const keys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1))

  return (
    <div>
      {/* ── Photography ─────────────────────────────────────────────── */}
      <section className="container-max px-6 py-16 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="section-badge mb-3">Visual Stories</span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Photography</h2>
          </div>
          <a href="/photos" className="shrink-0 flex items-center gap-1.5 text-sm text-teal-600 dark:text-teal-400 font-semibold hover:underline underline-offset-2">
            View all
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
        <PhotoGallery photos={featured} />
      </section>

      {/* ── Latest ──────────────────────────────────────────────────── */}
      <section className="container-max px-6 py-16">
        <div className="mb-10">
          <span className="section-badge mb-3">What's New</span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Latest</h2>
        </div>

        <div className="space-y-10">
          {keys.map((k) => (
            <div key={k}>
              <div className="flex items-center gap-4 mb-5">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                  {groups[k].label}
                </h3>
                <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="space-y-3">
                {groups[k].items.map((item) => (
                  <a
                    key={item.slug}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="group block"
                  >
                    <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 hover:border-teal-200 dark:hover:border-teal-800/60 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                      <div className="shrink-0 w-24 h-[72px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                        {item.src ? (
                          <img src={item.src} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.kind === 'blog'
                              ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                              : 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                          }`}>
                            {item.kind === 'blog' ? 'Blog' : 'Photo'}
                          </span>
                          {item.date && <span className="text-xs text-slate-400">{fmtDate(getDate(item.slug, item.date))}</span>}
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        {item.excerpt && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{item.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
