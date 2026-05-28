/**
 * Tests for PostsManager — cover image feature
 *
 * Covers:
 *  - Renders the Add LinkedIn Post form
 *  - Cover Image file input is rendered and is optional (not required)
 *  - File input accepts only image/* types
 *  - Image preview appears when a file is selected
 *  - Submits WITHOUT coverImage when no file is selected
 *  - Uploads to /api/upload first, then includes coverImage in posts API call
 *  - Shows error and does NOT create post if /api/upload fails
 *  - Resets file and preview state after successful submission
 *  - Shows thumbnail next to saved posts that have a coverImage
 *  - Edge: zero-byte file does not crash the component
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostsManager from '../app/components/admin/PostsManager'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeMockFile(name = 'cover.jpg', type = 'image/jpeg', size = 1024): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

const basePost = {
  slug: 'linkedin-2026-01-01-existing-post',
  title: 'Existing Post',
  url: 'https://www.linkedin.com/pulse/existing-post',
  excerpt: 'An existing post.',
  date: '2026-01-01',
}

const basePostWithCover = {
  ...basePost,
  slug: 'linkedin-2026-01-01-post-with-cover',
  title: 'Post With Cover',
  coverImage: 'https://res.cloudinary.com/demo/image/upload/post-cover.jpg',
}

// ── Mock fetch ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  global.URL.createObjectURL = jest.fn(() => 'blob:preview-url')
  global.URL.revokeObjectURL = jest.fn()
})

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('PostsManager', () => {
  describe('Form structure', () => {
    test('renders the "Add LinkedIn Post" heading', () => {
      render(<PostsManager initialPosts={[]} />)
      expect(screen.getByText(/Add LinkedIn Post/i)).toBeInTheDocument()
    })

    test('renders title, URL, excerpt, date, and cover image inputs', () => {
      render(<PostsManager initialPosts={[]} />)
      expect(screen.getByPlaceholderText(/post title/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/linkedin\.com/i)).toBeInTheDocument()
      expect(screen.getByText(/Cover Image/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /add post/i })).toBeInTheDocument()
    })

    test('cover image file input is NOT required', () => {
      render(<PostsManager initialPosts={[]} />)
      const coverInputs = document.querySelectorAll('input[type="file"]')
      expect(coverInputs.length).toBeGreaterThan(0)
      const fileInput = coverInputs[0] as HTMLInputElement
      expect(fileInput.required).toBe(false)
    })

    test('cover image file input accepts only image/* types', () => {
      render(<PostsManager initialPosts={[]} />)
      const coverInputs = document.querySelectorAll('input[type="file"]')
      const fileInput = coverInputs[0] as HTMLInputElement
      expect(fileInput.accept).toContain('image/')
    })
  })

  describe('File preview', () => {
    test('no preview shown initially', () => {
      render(<PostsManager initialPosts={[]} />)
      const preview = document.querySelector('img[alt*="cover" i], img[alt*="preview" i]')
      expect(preview).toBeNull()
    })

    test('preview image is shown after selecting a file', async () => {
      render(<PostsManager initialPosts={[]} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      const file = makeMockFile()
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      // A preview img with the blob URL should appear
      const preview = document.querySelector('img[src="blob:preview-url"]')
      expect(preview).not.toBeNull()
    })
  })

  describe('Form submission — no file', () => {
    test('submits post without coverImage when no file is selected', async () => {
      const postsFetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...basePost, slug: 'linkedin-2026-05-01-new-post', title: 'New Post' }),
      })
      global.fetch = postsFetch

      render(<PostsManager initialPosts={[]} />)

      fireEvent.change(screen.getByPlaceholderText(/post title/i), { target: { value: 'New Post' } })
      fireEvent.change(screen.getByPlaceholderText(/linkedin\.com/i), { target: { value: 'https://www.linkedin.com/pulse/new' } })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add post/i }))
      })

      await waitFor(() => {
        const call = postsFetch.mock.calls[0]
        const body = JSON.parse(call[1].body)
        expect(body.coverImage).toBeUndefined()
      })
    })
  })

  describe('Form submission — with file', () => {
    test('calls /api/upload first, then /api/admin/posts with coverImage', async () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1/post-covers/cover.jpg'
      const mockFetch = jest.fn()
        // First call: /api/upload
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ result: { secure_url: cloudinaryUrl } }),
        })
        // Second call: /api/admin/posts
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ...basePost, slug: 'new-slug', coverImage: cloudinaryUrl }),
        })
      global.fetch = mockFetch

      render(<PostsManager initialPosts={[]} />)

      fireEvent.change(screen.getByPlaceholderText(/post title/i), { target: { value: 'Post Title' } })
      fireEvent.change(screen.getByPlaceholderText(/linkedin\.com/i), { target: { value: 'https://www.linkedin.com/pulse/test' } })

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = makeMockFile()
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add post/i }))
      })

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2))

      // First call must be to /api/upload
      expect(mockFetch.mock.calls[0][0]).toContain('/api/upload')

      // Second call must include coverImage
      const body = JSON.parse(mockFetch.mock.calls[1][1].body)
      expect(body.coverImage).toBe(cloudinaryUrl)
    })

    test('shows error and does NOT call /api/admin/posts if /api/upload fails', async () => {
      const mockFetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Upload service unavailable' }),
      })
      global.fetch = mockFetch

      render(<PostsManager initialPosts={[]} />)

      fireEvent.change(screen.getByPlaceholderText(/post title/i), { target: { value: 'Post Title' } })
      fireEvent.change(screen.getByPlaceholderText(/linkedin\.com/i), { target: { value: 'https://www.linkedin.com/pulse/test' } })

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = makeMockFile()
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add post/i }))
      })

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1)
        expect(screen.getByText(/upload/i)).toBeInTheDocument()
      })
    })

    test('resets file and preview after successful submission', async () => {
      const cloudinaryUrl = 'https://res.cloudinary.com/demo/image/upload/v1/post-covers/cover.jpg'
      const mockFetch = jest.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ result: { secure_url: cloudinaryUrl } }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ...basePost, slug: 'new', coverImage: cloudinaryUrl }) })
      global.fetch = mockFetch

      render(<PostsManager initialPosts={[]} />)

      fireEvent.change(screen.getByPlaceholderText(/post title/i), { target: { value: 'Post Title' } })
      fireEvent.change(screen.getByPlaceholderText(/linkedin\.com/i), { target: { value: 'https://www.linkedin.com/pulse/test' } })

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = makeMockFile()
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /add post/i }))
      })

      await waitFor(() => {
        // Preview should be gone after reset
        const preview = document.querySelector('img[src="blob:preview-url"]')
        expect(preview).toBeNull()
      })
    })
  })

  describe('Post list', () => {
    test('shows a thumbnail for posts that have a coverImage', () => {
      render(<PostsManager initialPosts={[basePostWithCover]} />)
      const thumb = document.querySelector(`img[src="${basePostWithCover.coverImage}"]`)
      expect(thumb).not.toBeNull()
    })

    test('does not render a broken thumbnail for posts without coverImage', () => {
      render(<PostsManager initialPosts={[basePost]} />)
      // No image with undefined or empty src
      const imgs = document.querySelectorAll('img')
      for (const img of imgs) {
        const src = img.getAttribute('src')
        expect(src).not.toBe('undefined')
        expect(src).not.toBe('')
      }
    })
  })

  describe('Edge cases', () => {
    test('selecting a zero-byte file does not crash the component', async () => {
      render(<PostsManager initialPosts={[]} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const emptyFile = makeMockFile('empty.jpg', 'image/jpeg', 0)

      await expect(
        act(async () => {
          fireEvent.change(fileInput, { target: { files: [emptyFile] } })
        })
      ).resolves.not.toThrow()
    })

    test('clearing file input removes the preview', async () => {
      render(<PostsManager initialPosts={[]} />)
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const file = makeMockFile()

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } })
      })

      // Clear the selection
      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [] } })
      })

      const preview = document.querySelector('img[src="blob:preview-url"]')
      expect(preview).toBeNull()
    })
  })
})
