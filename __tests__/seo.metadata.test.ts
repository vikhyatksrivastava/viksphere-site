/**
 * Tests for SEO metadata
 *
 * Covers:
 *  - Root layout: metadataBase, OG siteName, twitter card, title template
 *  - /vikhyat: generateMetadata uses real portfolio name + title
 *  - /vikhyat: generateMetadata falls back gracefully when portfolio is default
 *  - /vikhyat: description truncated to ≤160 chars
 *  - /photos/[slug]: generateMetadata returns album title for known admin album
 *  - /photos/[slug]: generateMetadata returns activity title for known activity
 *  - /photos/[slug]: generateMetadata includes OG image when cover is set
 *  - /photos/[slug]: generateMetadata returns fallback title for unknown slug
 *  - /photos/[slug]: generateMetadata handles empty excerpt without crashing
 *  - Static page metadata: blog, photos, travel_board, music, artifacts
 */

import { readJson } from '../lib/adminData'
import { activities } from '../data/activities'

jest.mock('../lib/adminData', () => ({
  readJson: jest.fn(),
}))

jest.mock('../data/activities', () => ({
  activities: [
    {
      slug: 'activity-goa-20241201',
      title: 'Goa Road Trip',
      date: '2024-12-01',
      excerpt: 'A coastal adventure.',
      kind: 'photo',
    },
  ],
}))

jest.mock('../lib/image', () => ({
  resolveImage: (s: any) => (s ? `resolved:${s}` : s),
  isExternalImage: (s: any) => /^https?:\/\//.test(s ?? ''),
}))

// ── /photos/[slug] generateMetadata ─────────────────────────────────────────

describe('/photos/[slug] generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
    ;(readJson as jest.Mock).mockResolvedValue([])
  })

  async function loadGenerateMetadata() {
    const mod = await import('../app/photos/[slug]/page')
    return mod.generateMetadata
  }

  test('returns admin album title for a known admin album slug', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([
      { slug: 'barcelona-20260301', title: 'Barcelona Spring', date: '2026-03-01', excerpt: 'Exploring Barca.', cover: 'covers/barca.jpg' },
    ])
    const generateMetadata = await loadGenerateMetadata()
    const result = await generateMetadata({ params: Promise.resolve({ slug: 'barcelona-20260301' }) })

    expect(result.title).toBe('Barcelona Spring')
    expect((result.description ?? '').toLowerCase()).toContain('barca')
  })

  test('includes OG image when admin album has a cover', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([
      { slug: 'trip-20260101', title: 'New Year Trip', date: '2026-01-01', excerpt: '', cover: 'covers/trip.jpg' },
    ])
    const generateMetadata = await loadGenerateMetadata()
    const result = await generateMetadata({ params: Promise.resolve({ slug: 'trip-20260101' }) })

    const ogImages = (result as any).openGraph?.images ?? []
    expect(ogImages.length).toBeGreaterThan(0)
  })

  test('does NOT crash when admin album cover is missing', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([
      { slug: 'no-cover-album', title: 'No Cover Album', date: '2026-01-01', excerpt: 'Some text.' },
    ])
    const generateMetadata = await loadGenerateMetadata()
    await expect(
      generateMetadata({ params: Promise.resolve({ slug: 'no-cover-album' }) })
    ).resolves.not.toThrow()
  })

  test('returns activity title for a known static activity slug', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([]) // no admin albums
    const generateMetadata = await loadGenerateMetadata()
    const result = await generateMetadata({ params: Promise.resolve({ slug: 'activity-goa-20241201' }) })

    expect(result.title).toBe('Goa Road Trip')
  })

  test('returns generic fallback title for an unknown slug', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([]) // no admin albums
    const generateMetadata = await loadGenerateMetadata()
    const result = await generateMetadata({ params: Promise.resolve({ slug: 'completely-unknown-slug-xyz' }) })

    expect(typeof result.title).toBe('string')
    expect((result.title as string).length).toBeGreaterThan(0)
  })

  test('handles empty string excerpt without crashing', async () => {
    ;(readJson as jest.Mock).mockResolvedValue([
      { slug: 'empty-excerpt', title: 'Empty Excerpt Album', date: '2026-01-01', excerpt: '' },
    ])
    const generateMetadata = await loadGenerateMetadata()
    const result = await generateMetadata({ params: Promise.resolve({ slug: 'empty-excerpt' }) })

    expect(result.title).toBe('Empty Excerpt Album')
    expect(typeof result.description).toBe('string')
    expect((result.description ?? '').length).toBeGreaterThan(0)
  })
})

// ── /vikhyat generateMetadata ────────────────────────────────────────────────

describe('/vikhyat generateMetadata', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  async function loadVikhyatMetadata() {
    const mod = await import('../app/vikhyat/page')
    return mod.generateMetadata
  }

  test('uses real portfolio name as the page title', async () => {
    ;(readJson as jest.Mock).mockResolvedValue({
      name: 'Vikhyat Kumar Srivastava',
      title: 'Lead Data Engineer',
      about: 'An expert in big data platforms.',
      skills: [], experience: [], education: [], certifications: [], links: {},
    })
    const generateMetadata = await loadVikhyatMetadata()
    const result = await generateMetadata()

    expect(result.title).toBe('Vikhyat Kumar Srivastava')
  })

  test('description is at most 160 characters', async () => {
    const longAbout = 'A'.repeat(300)
    ;(readJson as jest.Mock).mockResolvedValue({
      name: 'Vikhyat Kumar Srivastava',
      title: 'Lead Data Engineer',
      about: longAbout,
      skills: [], experience: [], education: [], certifications: [], links: {},
    })
    const generateMetadata = await loadVikhyatMetadata()
    const result = await generateMetadata()

    expect((result.description ?? '').length).toBeLessThanOrEqual(160)
  })

  test('falls back to name — title when about is empty', async () => {
    ;(readJson as jest.Mock).mockResolvedValue({
      name: 'Vikhyat Kumar Srivastava',
      title: 'Lead Data Engineer',
      about: '',
      skills: [], experience: [], education: [], certifications: [], links: {},
    })
    const generateMetadata = await loadVikhyatMetadata()
    const result = await generateMetadata()

    expect(result.description).toContain('Vikhyat Kumar Srivastava')
    expect(result.description).toContain('Lead Data Engineer')
  })
})

// ── Root layout metadata shape ────────────────────────────────────────────────

describe('Root layout metadata', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('has metadataBase defined', async () => {
    const mod = await import('../app/layout')
    const meta = mod.metadata as any
    expect(meta.metadataBase).toBeDefined()
    expect(meta.metadataBase).toBeInstanceOf(URL)
  })

  test('has title template with %s placeholder', async () => {
    const mod = await import('../app/layout')
    const meta = mod.metadata as any
    expect(typeof meta.title).toBe('object')
    expect(meta.title.template).toContain('%s')
  })

  test('has openGraph siteName', async () => {
    const mod = await import('../app/layout')
    const meta = mod.metadata as any
    expect(meta.openGraph?.siteName).toBeTruthy()
  })

  test('has twitter card type defined', async () => {
    const mod = await import('../app/layout')
    const meta = mod.metadata as any
    expect(meta.twitter?.card).toBeTruthy()
  })

  test('description is non-trivial (not just "Personal site")', async () => {
    const mod = await import('../app/layout')
    const meta = mod.metadata as any
    expect(meta.description).not.toMatch(/^Personal site/)
    expect((meta.description ?? '').length).toBeGreaterThan(30)
  })
})

// ── Static page metadata spot-checks ────────────────────────────────────────

describe('Static page metadata', () => {
  test('/blog page has title and description', async () => {
    const mod = await import('../app/blog/page')
    const meta = mod.metadata as any
    expect(meta?.title).toBeTruthy()
    expect(meta?.description).toBeTruthy()
  })

  test('/photos page has title and description', async () => {
    const mod = await import('../app/photos/page')
    const meta = mod.metadata as any
    expect(meta?.title).toBeTruthy()
    expect(meta?.description).toBeTruthy()
  })

  test('/travel_board page has both title and description', async () => {
    const mod = await import('../app/travel_board/page')
    const meta = mod.metadata as any
    expect(meta?.title).toBeTruthy()
    expect(meta?.description).toBeTruthy()
  })

  test('/music page has title and description', async () => {
    const mod = await import('../app/music/page')
    const meta = mod.metadata as any
    expect(meta?.title).toBeTruthy()
    expect(meta?.description).toBeTruthy()
  })

  test('/artifacts page has title and description', async () => {
    const mod = await import('../app/artifacts/page')
    const meta = mod.metadata as any
    expect(meta?.title).toBeTruthy()
    expect(meta?.description).toBeTruthy()
  })
})
