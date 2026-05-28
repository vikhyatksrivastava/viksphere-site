import type { MetadataRoute } from 'next'
import { readJson } from '../lib/adminData'

interface AdminAlbum {
  slug: string
  date?: string
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viksphere.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let albums: AdminAlbum[] = []
  try {
    albums = await readJson<AdminAlbum[]>('albums.json', [])
  } catch {
    // R2 not configured or request failed — proceed with static routes only
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}`,              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/vikhyat`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/blog`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/photos`,       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/travel_board`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/artifacts`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/music`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/contact`,      lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.4 },
  ]

  const albumRoutes: MetadataRoute.Sitemap = albums.map(a => {
    const parsed = a.date ? new Date(a.date) : null
    const lastModified = parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date()
    return {
      url: `${BASE}/photos/${a.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  })

  return [...staticRoutes, ...albumRoutes]
}
