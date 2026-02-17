import Image from 'next/image'
import fs from 'fs'
import path from 'path'
import PhotoGallery from './components/PhotoGallery'
import { activities } from '../data/activities'
import { resolveImage } from '../lib/image'

export default function Home() {

  function getActivityTime(act: { slug: string; date?: string }) {
    // Prefer an explicit YYYYMMDD in the slug first, then activity.date, then YYYY in slug
    // Try to extract YYYYMMDD from the slug first
    const m8 = act.slug.match(/(\d{8})/)
    if (m8) {
      const s = m8[1]
      const yyyy = Number(s.slice(0, 4))
      const mm = Number(s.slice(4, 6)) - 1
      const dd = Number(s.slice(6, 8))
      const d = new Date(yyyy, mm, dd)
      if (!Number.isNaN(d.getTime())) return d.getTime()
    }
    // Prefer the explicit activity.date field when present
    if (act.date) {
      const d = new Date(act.date)
      if (!Number.isNaN(d.getTime())) return d.getTime()
    }
    // Try to extract year-only from the slug as a fallback
    const m4 = act.slug.match(/(\d{4})/)
    if (m4) {
      const yyyy = Number(m4[1])
      const d = new Date(yyyy, 0, 1)
      if (!Number.isNaN(d.getTime())) return d.getTime()
    }
    return 0
  }

  function getActivityDate(act: { slug: string; date?: string }) {
    // Prefer explicit YYYYMMDD in slug first, then activity.date, then year-only in slug
    const m8 = act.slug.match(/(\d{8})/)
    if (m8) {
      const s = m8[1]
      const yyyy = Number(s.slice(0, 4))
      const mm = Number(s.slice(4, 6)) - 1
      const dd = Number(s.slice(6, 8))
      const d = new Date(yyyy, mm, dd)
      if (!Number.isNaN(d.getTime())) return d
    }
    if (act.date) {
      const d = new Date(act.date)
      if (!Number.isNaN(d.getTime())) return d
    }
    const m4 = act.slug.match(/(\d{4})/)
    if (m4) {
      const yyyy = Number(m4[1])
      const d = new Date(yyyy, 0, 1)
      if (!Number.isNaN(d.getTime())) return d
    }
    return null
  }

  function extractUrlFromContent(content?: string) {
    if (!content) return null
    const m = content.match(/href=["']([^"']+)["']/i)
    return m ? m[1] : null
  }

  function formatActivityDate(d: Date | null) {
    if (!d) return ''
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  }
  return (
    <main>
      <section className="container-max px-6 py-12">
        <h2 className="text-2xl font-semibold">Photography</h2>
        <div className="mt-4">
          {/* Featured images: take first image from each recent activity folder or fallback to activity.cover */}
          {(() => {
            const featured: { src: string; alt?: string }[] = []
            const sorted = activities.slice().sort((a, b) => (getActivityTime(b) - getActivityTime(a)))
            for (const act of sorted) {
              // Only consider photo activities for the featured gallery
              if ((act as any).kind && (act as any).kind !== 'photo') continue
              if (featured.length >= 6) break
              try {
                const dir = path.join(process.cwd(), 'public', 'images', 'photos', act.slug)
                if (fs.existsSync(dir)) {
                  const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|svg|webp)$/i.test(f))
                  if (files.length > 0) {
                    featured.push({ src: resolveImage(`/images/photos/${act.slug}/${files[0]}`), alt: act.title })
                    continue
                  }
                }
              } catch (e) {
                // ignore
              }
              if (act.cover) {
                const c = act.cover.startsWith('http')
                  ? act.cover
                  : act.cover.replace(/^public[\\/]/, '/').replace(/^[^/]/, (s) => '/' + s)
                featured.push({ src: resolveImage(c), alt: act.title })
              }
            }
            return <PhotoGallery photos={featured} />
          })()}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold">Latest</h3>
          <div className="mt-4 space-y-6">
            {(() => {
              // Group activities by month-year
              const groups: Record<string, { label: string; items: typeof activities }> = {}
              for (const act of activities.slice().sort((a, b) => getActivityTime(b) - getActivityTime(a))) {
                const d = getActivityDate(act)
                const key = d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : 'unknown'
                if (!groups[key]) groups[key] = { label: d ? d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).replace(' ', '-') : 'Unknown', items: [] }
                groups[key].items.push(act)
              }

              const keys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1))
              return keys.map((k) => (
                <section key={k}>
                  <h4 className="text-lg font-medium">{groups[k].label}</h4>
                  <div className="mt-3 space-y-4">
                    {groups[k].items.map((act) => {
                      const isBlog = (act as any).kind === 'blog'
                      const externalUrl = isBlog ? ((act as any).url || extractUrlFromContent(act.content)) : null
                      const href = externalUrl || `/photos/${act.slug}`
                      return (
                        <a key={act.slug} href={href} target={externalUrl ? '_blank' : undefined} rel={externalUrl ? 'noopener noreferrer' : undefined} className="block p-4 bg-[var(--surface-muted)] dark:bg-slate-800 rounded-md shadow-card hover:shadow-lg">
                          <div className="flex items-center gap-4">
                            {(() => {
                              const cover = (act as any).kind === 'blog' ? '/images/photos/landscape-01.svg' : act.cover
                              const src = cover
                                ? resolveImage(cover.startsWith('http') ? cover : cover.replace(/^public[\\/]/, '/').replace(/^[^/]/, (s) => '/' + s))
                                : null
                              return src ? (
                                <img src={src} alt="cover" className="w-28 h-20 object-cover rounded" />
                              ) : (
                                <div className="w-28 h-20 bg-slate-200 dark:bg-slate-700 rounded" />
                              )
                            })()}
                            <div>
                              <div className="text-lg font-medium">{act.title}</div>
                              <div className="text-sm text-slate-500">{formatActivityDate(getActivityDate(act)) || act.date}</div>
                              {act.excerpt && <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{act.excerpt}</p>}
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </section>
              ))
            })()}
          </div>
        </div>
      </section>
    </main>
  )
}
