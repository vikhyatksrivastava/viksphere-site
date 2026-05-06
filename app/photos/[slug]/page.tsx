import fs from 'fs'
import path from 'path'
import LightboxWrapper from '../../components/LightboxWrapper'
import Image from 'next/image'
import { activities } from '../../../data/activities'
import { visitedPlaces } from '../../../data/travel'
import { resolveImage } from '../../../lib/image'
import { listKeys } from '../../../lib/r2'

// Client wrapper imported above; renders client-only `LightboxGallery`.

export default async function PhotoPost({ params }: { params: { slug: string } }) {
  const slug = params.slug
  const post = activities.find((a) => a.slug === slug)
  const travelPlace = visitedPlaces.find((p) => p.slug === slug)
  if (!post && !travelPlace) return <main className="container-max px-6 py-12">Post not found</main>

  // Look for images in public/images/photos/<slug>/
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'photos', slug)
  let images: string[] = []
  try {
    if (fs.existsSync(imagesDir)) {
      images = fs
        .readdirSync(imagesDir)
        .filter((f) => /\.(jpe?g|png|svg|webp)$/i.test(f))
        .map((f) => resolveImage(`/images/photos/${slug}/${f}`))
    }
  } catch (e) {
    images = []
  }

  // If there are no local files, try listing objects from R2 under the album prefix
  if (images.length === 0) {
    try {
      // bucket keys are stored as e.g. "valencia-visit-20251224/filename.jpg"
      const keys = await listKeys(`${slug}/`)
      if (keys && keys.length) {
        images = keys.filter((k) => /\.(jpe?g|png|svg|webp)$/i.test(k)).map((k) => resolveImage(k))
      }
    } catch (e) {
      // ignore and fall back to cover
    }
  }

  // Fallback: if no local or R2-listed images, try to expand the cover into the album prefix
  const coverToUse = post ? post.cover : undefined
  if (images.length === 0 && coverToUse) {
    const rawCover = coverToUse
    // If cover is an absolute account URL, strip the account host to get the key
    let coverKey = rawCover
    const acct = process.env.R2_ACCOUNT_ID
    if (coverKey && acct && coverKey.includes(acct)) {
      // remove https://{acct}.r2.cloudflarestorage.com/
      coverKey = coverKey.replace(new RegExp('^https?://'+acct.replace(/[-\\/\\^$*+?.()|[\]{}]/g,'\\$&')+'\\/'), '')
    }
    // normalize leading public/ or leading slash
    coverKey = coverKey.replace(/^public[\\/]/, '').replace(/^\//, '')

    // derive directory prefix from coverKey and try listing that prefix
    const dirPrefix = coverKey.includes('/') ? coverKey.replace(/\\/g, '/').replace(/\/[^/]*$/, '') + '/' : ''
    if (dirPrefix) {
      try {
        const keys = await listKeys(dirPrefix)
        if (keys && keys.length) {
          images = keys.filter((k) => /\.(jpe?g|png|svg|webp)$/i.test(k)).map((k) => resolveImage(k))
        }
      } catch (e) {
        // ignore
      }
    }

    // if still empty, fall back to single cover
    if (images.length === 0) {
      images = [resolveImage(coverKey.startsWith('http') ? coverKey : '/' + coverKey)]
    }
  }

  // Prepare title/content when rendering a travelPlace default page
  const title = post ? post.title : travelPlace ? travelPlace.name : 'Post'
  const date = post ? post.date : undefined
  const contentHtml = post ? (post.content ?? '') : travelPlace ? `<p>Notes and photos from ${travelPlace.name}, ${travelPlace.country}.</p>` : ''

  return (
    <main className="container-max px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {date && <p className="text-sm text-slate-500 mt-2">{date}</p>}

        <div className="mt-6 prose max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />

      {images.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-medium mb-4">Gallery</h2>
          {/* LightboxGallery shows thumbnails and opens single-image lightbox navigation */}
          <div>
            {/* Client component imported below */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <div id="lightbox-root">
              {/* Rendered client-side: */}
              <LightboxWrapper images={images} />
            </div>
          </div>
        </section>
      )}
      </div>
    </main>
  )
}
