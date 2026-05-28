import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import { isExternalImage } from '../../lib/image'
import Link from 'next/link'
import { activities } from '../../data/activities'
import { resolveImage } from '../../lib/image'
import { readJson } from '../../lib/adminData'

export const metadata: Metadata = {
  title: 'Photos',
  description: 'Travel photography and visual stories by Vikhyat Kumar Srivastava.',
  openGraph: { title: 'Photos | VikSphere', type: 'website' },
}

interface AdminAlbum { slug: string; title: string; date: string; excerpt: string; cover: string }

export default async function PhotosPage() {
  const adminAlbums = await readJson<AdminAlbum[]>('albums.json', [])

  function getActivityDate(act: { slug: string; date?: string }): Date | null {
    const m8 = act.slug.match(/(\d{8})/)
    if (m8) {
      const s = m8[1]
      const d = new Date(Number(s.slice(0, 4)), Number(s.slice(4, 6)) - 1, Number(s.slice(6, 8)))
      if (!Number.isNaN(d.getTime())) return d
    }
    if (act.date) {
      const d = new Date(act.date)
      if (!Number.isNaN(d.getTime())) return d
    }
    const m4 = act.slug.match(/(\d{4})/)
    if (m4) {
      const d = new Date(Number(m4[1]), 0, 1)
      if (!Number.isNaN(d.getTime())) return d
    }
    return null
  }

  function monthKey(d: Date | null) {
    if (!d) return 'unknown'
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  function monthLabel(d: Date | null) {
    if (!d) return 'Unknown'
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).replace(' ', '-')
  }

  const groups: Record<string, { label: string; items: { slug: string; title: string; excerpt?: string; src?: string; date?: string }[] }> = {}

  const adminSlugs = new Set(adminAlbums.map(a => a.slug))

  for (const album of adminAlbums) {
    const d = album.date ? new Date(album.date) : null
    const key = d && !Number.isNaN(d.getTime())
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      : 'unknown'
    if (!groups[key]) groups[key] = { label: d ? monthLabel(d) : 'Unknown', items: [] }
    groups[key].items.push({ slug: album.slug, title: album.title, excerpt: album.excerpt, src: resolveImage(album.cover), date: album.date })
  }

  for (const act of activities.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())) {
    if ((act as any).kind && (act as any).kind !== 'photo') continue
    if (adminSlugs.has(act.slug)) continue

    let img: string | undefined
    let folderDate: Date | null = null
    try {
      const dir = path.join(process.cwd(), 'public', 'images', 'photos', act.slug)
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|svg|webp)$/i.test(f))
        if (files.length > 0) img = resolveImage(`/images/photos/${act.slug}/${files[0]}`)
        try {
          const st = fs.statSync(dir)
          if (st?.mtime && !Number.isNaN(st.mtime.getTime())) folderDate = st.mtime
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }
    if (!img && act.cover) {
      img = resolveImage(
        act.cover.startsWith('http')
          ? act.cover
          : act.cover.replace(/^public[\\/]/, '/').replace(/^[^/]/, (s) => '/' + s)
      )
    }

    const d = getActivityDate(act) || folderDate
    const key = monthKey(d)
    if (!groups[key]) groups[key] = { label: monthLabel(d), items: [] }
    groups[key].items.push({ slug: act.slug, title: act.title, excerpt: act.excerpt, src: img, date: act.date })
  }

  const sortedKeys = Object.keys(groups).sort((a, b) => (a < b ? 1 : -1))

  return (
    <main className="container-max px-6 py-16">

      {/* Header */}
      <div className="mb-12">
        <span className="section-badge mb-4">Visual Stories</span>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Photography</h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400 leading-relaxed">
          Albums from my photography journey.
        </p>
      </div>

      {/* Grouped albums */}
      <div className="space-y-12">
        {sortedKeys.map((key) => (
          <section key={key}>
            {/* Month divider */}
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">
                {groups[key].label}
              </h2>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {groups[key].items.map((a) => (
                <Link
                  key={a.slug}
                  href={`/photos/${a.slug}`}
                  className="group block overflow-hidden rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 hover:border-teal-200 dark:hover:border-teal-800/60 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-full h-56 relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {a.src ? (
                      isExternalImage(a.src) ? (
                        <img
                          src={a.src}
                          alt={a.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Image
                          src={a.src}
                          alt={a.title}
                          fill
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                      {a.title}
                    </h3>
                    {a.excerpt && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{a.excerpt}</p>
                    )}
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
