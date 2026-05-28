/**
 * Tests for app/sitemap.ts
 *
 * Covers:
 *  - Static routes are always present
 *  - Dynamic album routes are generated from albums.json
 *  - Admin / API / archived routes are never included
 *  - Edge: missing or invalid album date falls back to current date
 *  - Edge: readJson throws (R2 not configured) → graceful fallback to static routes
 *  - Priority levels
 */

import { readJson } from '../lib/adminData'

jest.mock('../lib/adminData', () => ({
  readJson: jest.fn(),
}))

// Dynamically import sitemap inside each test after configuring the mock return value.
// This ensures the module sees the correct mock state even across tests.
const loadSitemap = () => import('../app/sitemap').then(m => m.default)

const EXPECTED_STATIC_PATHS = [
  '',          // homepage
  '/vikhyat',
  '/blog',
  '/photos',
  '/travel_board',
  '/artifacts',
  '/music',
  '/contact',
]

describe('sitemap()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ;(readJson as jest.Mock).mockResolvedValue([])
  })

  test('returns all static routes', async () => {
    const sitemap = await loadSitemap()
    const routes = await sitemap()
    const urls: string[] = routes.map((r: any) => r.url)

    for (const path of EXPECTED_STATIC_PATHS) {
      expect(urls.some(u => u.endsWith(path === '' ? 'viksphere.com' : path))).toBe(true)
    }
  })

  test('includes dynamic album routes from albums.json', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([
      { slug: 'barcelona-20260301', date: '2026-03-01' },
      { slug: 'goa-20251215', date: '2025-12-15' },
    ])
    const sitemap = await loadSitemap()
    const routes = await sitemap()
    const urls: string[] = routes.map((r: any) => r.url)

    expect(urls.some(u => u.includes('/photos/barcelona-20260301'))).toBe(true)
    expect(urls.some(u => u.includes('/photos/goa-20251215'))).toBe(true)
  })

  test('never includes /api/, /archived/, or /admin in any URL', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([
      { slug: 'normal-album', date: '2026-01-01' },
    ])
    const sitemap = await loadSitemap()
    const routes = await sitemap()
    const urls: string[] = routes.map((r: any) => r.url)

    expect(urls.every(u => !u.includes('/api/'))).toBe(true)
    expect(urls.every(u => !u.includes('/archived'))).toBe(true)
    expect(urls.every(u => !u.includes('/admin'))).toBe(true)
  })

  test('album with missing date uses a valid Date fallback', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([{ slug: 'no-date-album' }])
    const sitemap = await loadSitemap()
    const routes = await sitemap()
    const album = routes.find((r: any) => r.url.includes('no-date-album'))

    expect(album).toBeDefined()
    expect(album!.lastModified).toBeInstanceOf(Date)
    expect(Number.isNaN((album!.lastModified as Date).getTime())).toBe(false)
  })

  test('album with invalid date string uses a valid Date fallback', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([{ slug: 'bad-date-album', date: 'not-a-date' }])
    const sitemap = await loadSitemap()
    const routes = await sitemap()
    const album = routes.find((r: any) => r.url.includes('bad-date-album'))

    expect(album).toBeDefined()
    expect(Number.isNaN((album!.lastModified as Date).getTime())).toBe(false)
  })

  test('handles readJson throwing gracefully — still returns static routes', async () => {
    ;(readJson as jest.Mock).mockRejectedValue(new Error('R2 not configured'))
    const sitemap = await loadSitemap()
    const routes = await sitemap()

    expect(Array.isArray(routes)).toBe(true)
    expect(routes.length).toBeGreaterThanOrEqual(EXPECTED_STATIC_PATHS.length)
    // Static homepage must still be present
    expect(routes.some((r: any) => r.url.endsWith('viksphere.com'))).toBe(true)
  })

  test('homepage has highest priority (1.0)', async () => {
    const sitemap = await loadSitemap()
    const routes = await sitemap()
    const home = routes.find((r: any) => r.url.endsWith('viksphere.com'))

    expect(home).toBeDefined()
    expect(home!.priority).toBe(1.0)
  })

  test('album routes have priority 0.7', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([{ slug: 'some-album', date: '2026-01-01' }])
    const sitemap = await loadSitemap()
    const routes = await sitemap()
    const album = routes.find((r: any) => r.url.includes('some-album'))

    expect(album!.priority).toBe(0.7)
  })

  test('all route URLs are absolute (start with https://)', async () => {
    const sitemap = await loadSitemap()
    const routes = await sitemap()

    for (const r of routes as any[]) {
      expect(r.url).toMatch(/^https?:\/\//)
    }
  })
})
