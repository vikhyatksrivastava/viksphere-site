import fs from 'fs'
import path from 'path'
import Image from 'next/image'
import { isExternalImage } from '../../lib/image'
import Link from 'next/link'
import { activities } from '../../data/activities'
import { resolveImage } from '../../lib/image'

export default function PhotosPage() {
  // Build album list from activities: prefer first image in folder, else activity.cover
  const albums: { slug: string; title: string; excerpt?: string; src?: string }[] = []
  for (const act of activities.slice().sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()))) {
    let img: string | undefined = undefined
    try {
      const dir = path.join(process.cwd(), 'public', 'images', 'photos', act.slug)
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png|svg|webp)$/i.test(f))
        if (files.length > 0) img = resolveImage(`/images/photos/${act.slug}/${files[0]}`)
      }
    } catch (e) {
      // ignore and fallback to cover
    }
    if (!img && act.cover) {
      img = resolveImage(act.cover.startsWith('http') ? act.cover : act.cover.replace(/^public[\\/]/, '/').replace(/^[^/]/, (s) => '/' + s))
    }
    albums.push({ slug: act.slug, title: act.title, excerpt: act.excerpt, src: img })
  }

  return (
    <main className="container-max px-6 py-12">
      <h1 className="text-3xl font-semibold">Photography</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Albums created from the latest photography posts.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {albums.map((a) => (
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
    </main>
  )
}
