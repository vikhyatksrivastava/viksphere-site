import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viksphere.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/archived/', '/*/admin'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
