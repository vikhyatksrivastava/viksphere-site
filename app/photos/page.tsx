import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import { isExternalImage } from '../../lib/image'
import Link from 'next/link'
import { activities } from '../../data/activities'
import { resolveImage } from '../../lib/image'

export default function PhotosPage() {
  // Helper: get Date for activity (prefer slug YYYYMMDD, fallback to activity.date)
  function getActivityDate(act: { slug: string; date?: string }) {
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

  function monthKeyForDate(d: Date | null) {
    if (!d) return 'unknown'
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }

  function monthLabel(d: Date | null) {
    if (!d) return 'Unknown'
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).replace(' ', '-')
  }

  // Build grouped albums from activities: group by month-year
  const groups: Record<string, { label: string; items: { slug: string; title: string; excerpt?: string; src?: string; date?: string }[] }> = {}
  for (const act of activities.slice().sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))) {
    if ((act as any).kind && (act as any).kind !== 'photo') continue
    let img: string | undefined = undefined
    let folderDate: Date | null = null
    try {
      const dir = path.join(process.cwd(), 'public', 'images', 'photos', act.slug)
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|svg|webp)$/i.test(f))
        if (files.length > 0) img = resolveImage(`/images/photos/${act.slug}/${files[0]}`)
        try {
          const st = fs.statSync(dir)
          if (st && st.mtime && !Number.isNaN(st.mtime.getTime())) folderDate = st.mtime
        } catch (e) {
          // ignore stat errors
        }
      }
    } catch (e) {
      // ignore and fallback to cover
    }
    if (!img && act.cover) {
      img = resolveImage(act.cover.startsWith('http') ? act.cover : act.cover.replace(/^public[\\/]/, '/').replace(/^[^/]/, (s) => '/' + s))
    }

    // Prefer explicit date parsed from slug (YYYYMMDD) first, then folder timestamp, then other fallbacks
    const d = getActivityDate(act) || folderDate
    const key = monthKeyForDate(d)
    if (!groups[key]) groups[key] = { label: monthLabel(d), items: [] }
    groups[key].items.push({ slug: act.slug, title: act.title, excerpt: act.excerpt, src: img, date: act.date })
  }

  // Sort group keys descending
  const sortedKeys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1))

  return (
    <main className="container-max px-6 py-12">
      <h1 className="text-3xl font-semibold">Photography</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Albums created from the latest photography posts.</p>

      <div className="mt-6 space-y-8">
        {sortedKeys.map((key) => (
          <section key={key}>
            <h2 className="text-xl font-semibold">{groups[key].label}</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {groups[key].items.map((a) => (
                <Link key={a.slug} href={`/photos/${a.slug}`} className="group block overflow-hidden rounded-md shadow-card bg-[var(--surface-muted)] dark:bg-slate-800 relative">
                  <div className="w-full h-56 bg-slate-100 dark:bg-slate-900 relative">
                    {a.src ? (
                      isExternalImage(a.src) ? (
                        <img src={a.src} alt={a.title} className="w-full h-full object-cover object-center" />
                      ) : (
                        <Image src={a.src} alt={a.title} fill className="object-cover object-center" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-lg font-medium text-slate-900 dark:text-slate-100">{a.title}</div>
                    {a.excerpt && <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">{a.excerpt}</div>}
                  </div>
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="glass-overlay">
                      <div className="glass-card h-full w-full rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
