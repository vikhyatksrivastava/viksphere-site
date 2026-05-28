/**
 * @jest-environment node
 *
 * Tests for app/api/admin/posts/route.ts
 *
 * Covers:
 *  - POST creates post without coverImage (backward compat)
 *  - POST creates post WITH coverImage when provided
 *  - POST ignores non-string / empty coverImage values (security/type safety)
 *  - POST returns 400 when required fields are missing
 *  - DELETE removes a post by slug and revalidates paths
 *  - All handlers return 401 when requireAdmin denies
 */

// ── Lightweight next/server mock — avoids edge-runtime deps in Jest ──────────
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}))

jest.mock('../lib/requireAdmin', () => ({
  requireAdmin: jest.fn(),
}))

jest.mock('../lib/adminData', () => ({
  readJson: jest.fn(),
  writeJson: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import { NextResponse } from 'next/server'
import { requireAdmin } from '../lib/requireAdmin'
import { readJson, writeJson } from '../lib/adminData'
import { revalidatePath } from 'next/cache'
import { POST, DELETE } from '../app/api/admin/posts/route'

// Helper to create a Request-like object
function makeRequest(body: unknown, method = 'POST') {
  return {
    json: async () => body,
    method,
  } as unknown as Request
}

// ── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/admin/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireAdmin as jest.Mock).mockResolvedValue(null) // authenticated
    ;(readJson as jest.Mock).mockResolvedValue([])
    ;(writeJson as jest.Mock).mockResolvedValue(undefined)
  })

  test('creates a post without coverImage', async () => {
    const res = await POST(makeRequest({ title: 'Test Post', url: 'https://linkedin.com/pulse/test', date: '2026-05-01', excerpt: 'Hello' }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.title).toBe('Test Post')
    expect(data.coverImage).toBeUndefined()
  })

  test('creates a post WITH coverImage when provided', async () => {
    const imageUrl = 'https://res.cloudinary.com/demo/image/upload/post-cover.jpg'
    const res = await POST(makeRequest({ title: 'Post With Cover', url: 'https://linkedin.com/pulse/cover', date: '2026-05-02', coverImage: imageUrl }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.coverImage).toBe(imageUrl)
  })

  test('does NOT store coverImage when it is an empty string', async () => {
    const res = await POST(makeRequest({ title: 'No Cover', url: 'https://linkedin.com/pulse/nocover', date: '2026-05-03', coverImage: '' }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.coverImage).toBeUndefined()
  })

  test('does NOT store coverImage when it is a non-string value', async () => {
    const res = await POST(makeRequest({ title: 'Invalid Cover', url: 'https://linkedin.com/pulse/invalid', date: '2026-05-04', coverImage: 12345 }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.coverImage).toBeUndefined()
  })

  test('does NOT store coverImage when it is whitespace-only', async () => {
    const res = await POST(makeRequest({ title: 'Whitespace Cover', url: 'https://linkedin.com/pulse/ws', date: '2026-05-05', coverImage: '   ' }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.coverImage).toBeUndefined()
  })

  test('returns 400 when title is missing', async () => {
    const res = await POST(makeRequest({ url: 'https://linkedin.com/pulse/test', date: '2026-05-01' }))
    expect(res.status).toBe(400)
  })

  test('returns 400 when url is missing', async () => {
    const res = await POST(makeRequest({ title: 'Post', date: '2026-05-01' }))
    expect(res.status).toBe(400)
  })

  test('returns 400 when date is missing', async () => {
    const res = await POST(makeRequest({ title: 'Post', url: 'https://linkedin.com/pulse/test' }))
    expect(res.status).toBe(400)
  })

  test('revalidates / and /blog after creating a post', async () => {
    await POST(makeRequest({ title: 'Revalidate Test', url: 'https://linkedin.com/pulse/r', date: '2026-05-05' }))
    expect(revalidatePath).toHaveBeenCalledWith('/blog')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  test('returns 401 when requireAdmin denies', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
    const res = await POST(makeRequest({ title: 'Should Fail', url: 'https://linkedin.com/pulse/fail', date: '2026-05-06' }))
    expect(res.status).toBe(401)
  })
})

// ── DELETE ────────────────────────────────────────────────────────────────────

describe('DELETE /api/admin/posts', () => {
  const existingPosts = [
    { slug: 'post-to-delete', title: 'Delete Me', url: 'https://linkedin.com/pulse/del', excerpt: '', date: '2026-01-01' },
    { slug: 'post-to-keep', title: 'Keep Me', url: 'https://linkedin.com/pulse/keep', excerpt: '', date: '2026-01-02' },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireAdmin as jest.Mock).mockResolvedValue(null)
    ;(readJson as jest.Mock).mockResolvedValue(existingPosts)
    ;(writeJson as jest.Mock).mockResolvedValue(undefined)
  })

  test('removes post by slug and calls writeJson with filtered list', async () => {
    const res = await DELETE(makeRequest({ slug: 'post-to-delete' }, 'DELETE'))
    expect(res.status).toBe(200)

    const writtenData = (writeJson as jest.Mock).mock.calls[0][1] as Array<{ slug: string }>
    expect(writtenData.every(p => p.slug !== 'post-to-delete')).toBe(true)
    expect(writtenData.some(p => p.slug === 'post-to-keep')).toBe(true)
  })

  test('returns 400 when slug is missing', async () => {
    const res = await DELETE(makeRequest({}, 'DELETE'))
    expect(res.status).toBe(400)
  })

  test('returns 401 when requireAdmin denies', async () => {
    ;(requireAdmin as jest.Mock).mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    )
    const res = await DELETE(makeRequest({ slug: 'post-to-delete' }, 'DELETE'))
    expect(res.status).toBe(401)
  })
})

