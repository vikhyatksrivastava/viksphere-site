import fs from 'fs'
import path from 'path'
import LightboxWrapper from '../../components/LightboxWrapper'
import { activities } from '../../../data/activities'
import { visitedPlaces } from '../../../data/travel'
import { resolveImage } from '../../../lib/image'
import { listKeys } from '../../../lib/r2'
import { readJson } from '../../../lib/adminData'

interface AdminAlbum { slug: string; title: string; date: string; excerpt: string; cover: string }

// Pre-generate pages for all known admin albums + static activities at build time.
// dynamicParams=true allows new slugs to be rendered on-demand.
export const dynamicParams = true

export async function generateStaticParams() {
  const adminAlbums = await readJson<AdminAlbum[]>('albums.json', [])
  const adminSlugs  = adminAlbums.map(a => ({ slug: a.slug }))
  const actSlugs    = activities.map(a => ({ slug: a.slug }))
  return [...adminSlugs, ...actSlugs]
}

function fmtDate(d: string | undefined) {
  if (!d) return ''
  const dt = new Date(d)
  if (Number.isNaN(dt.getTime())) return d
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

export default async function PhotoPost({ params }: { params: { slug: string } }) {
  const slug = params.slug

  // Admin albums take priority — they live in R2, not in the static activities list
  const adminAlbums = await readJson<AdminAlbum[]>('albums.json', [])
  const adminAlbum = adminAlbums.find(a => a.slug === slug)

  const post = activities.find((a) => a.slug === slug)
  const travelPlace = visitedPlaces.find((p) => p.slug === slug)

  if (!adminAlbum && !post && !travelPlace) {
    return <main className="container-max px-6 py-12 text-slate-500">Post not found</main>
  }

  // ── Resolve images ───────────────────────────────────────────────────
  let images: string[] = []

  if (adminAlbum) {
    try {
      const keys = await listKeys(`${slug}/`)
      images = keys.filter(k => /\.(jpe?g|png|svg|webp)$/i.test(k)).map(k => resolveImage(k))
    } catch { /* ignore */ }
  } else {
    // Static activity: local filesystem first
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'photos', slug)
    try {
      if (fs.existsSync(imagesDir)) {
        images = fs.readdirSync(imagesDir)
          .filter(f => /\.(jpe?g|png|svg|webp)$/i.test(f))
          .map(f => resolveImage(`/images/photos/${slug}/${f}`))
      }
    } catch { /* ignore */ }

    // R2 fallback
    if (images.length === 0) {
      try {
        const keys = await listKeys(`${slug}/`)
        if (keys.length) {
          images = keys.filter(k => /\.(jpe?g|png|svg|webp)$/i.test(k)).map(k => resolveImage(k))
        }
      } catch { /* ignore */ }
    }

    // Cover fallback
    const coverToUse = post?.cover
    if (images.length === 0 && coverToUse) {
      let coverKey = coverToUse
      const acct = process.env.R2_ACCOUNT_ID
      if (coverKey && acct && coverKey.includes(acct)) {
        coverKey = coverKey.replace(new RegExp('^https?://' + acct.replace(/[-\\/^$*+?.()|[\]{}]/g, '\\$&') + '\\/'), '')
      }
      coverKey = coverKey.replace(/^public[\\/]/, '').replace(/^\//, '')
      const dirPrefix = coverKey.includes('/') ? coverKey.replace(/\\/g, '/').replace(/\/[^/]*$/, '') + '/' : ''
      if (dirPrefix) {
        try {
          const keys = await listKeys(dirPrefix)
          if (keys.length) images = keys.filter(k => /\.(jpe?g|png|svg|webp)$/i.test(k)).map(k => resolveImage(k))
        } catch { /* ignore */ }
      }
      if (images.length === 0) {
        images = [resolveImage(coverKey.startsWith('http') ? coverKey : '/' + coverKey)]
      }
    }
  }

  const title    = adminAlbum?.title   ?? (post ? post.title   : travelPlace!.name)
  const date     = adminAlbum?.date    ?? post?.date
  const excerpt  = adminAlbum?.excerpt ?? post?.excerpt
  const contentHtml = !adminAlbum && post ? (post.content ?? '') : ''
  const coverSrc = adminAlbum ? resolveImage(adminAlbum.cover) : (images[0] ?? null)

  return (
    <main className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <div className="relative h-64 sm:h-96 overflow-hidden bg-slate-900">
        {coverSrc && (
          <img
            src={coverSrc}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-55"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-max px-6 pb-8">
          <span className="section-badge mb-3">Photography</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">{title}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {date && <span className="text-sm text-slate-300">{fmtDate(date)}</span>}
            {images.length > 0 && (
              <>
                <span className="text-slate-500">·</span>
                <span className="text-sm text-slate-300">{images.length} photo{images.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </div>
          {excerpt && <p className="mt-3 text-slate-300 max-w-2xl text-sm leading-relaxed">{excerpt}</p>}
        </div>
      </div>

      {/* ── Gallery ─────────────────────────────────────────────────── */}
      <div className="container-max px-6 py-10">
        {contentHtml && (
          <div className="prose dark:prose-invert max-w-2xl mb-10" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        )}
        {images.length > 0 ? (
          <LightboxWrapper images={images} />
        ) : (
          <p className="text-center text-slate-400 py-16">No photos available yet.</p>
        )}
      </div>
    </main>
  )
}
