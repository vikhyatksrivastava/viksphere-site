'use client'
import { useRef, useState } from 'react'

interface Post {
  slug: string
  title: string
  url: string
  excerpt: string
  date: string
  coverImage?: string
}

export default function PostsManager({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    // Revoke previous preview to avoid memory leaks
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    } else {
      setCoverFile(null)
      setCoverPreview(null)
    }
  }

  function resetForm() {
    setTitle('')
    setUrl('')
    setExcerpt('')
    setCoverFile(null)
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    let coverImageUrl: string | undefined

    // Step 1: upload cover image if one was chosen
    if (coverFile) {
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(coverFile)
      })

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok) {
        const errMsg = uploadData.error
          ? (typeof uploadData.error === 'string' ? uploadData.error : JSON.stringify(uploadData.error))
          : 'Image upload failed. Please try again.'
        setError(`Image upload failed: ${errMsg}`)
        setSaving(false)
        return
      }

      coverImageUrl = uploadData.result?.secure_url as string | undefined
    }

    // Step 2: create the post
    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, excerpt, date, ...(coverImageUrl ? { coverImage: coverImageUrl } : {}) }),
    })
    const data = await res.json()

    if (res.ok) {
      setPosts([data, ...posts])
      resetForm()
      setSuccess('Post added successfully.')
    } else {
      setError(data.error ?? 'Failed to add post')
    }
    setSaving(false)
  }

  async function handleDelete(slug: string) {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/admin/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (res.ok) setPosts(posts.filter(p => p.slug !== slug))
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-medium mb-4">Add LinkedIn Post</h2>
        <form onSubmit={handleAdd} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Post title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
            <input
              type="url" required value={url} onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="https://www.linkedin.com/pulse/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Excerpt</label>
            <textarea
              value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Short description shown on the blog page"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date" required value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          {/* ── Cover Image (optional) ─────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cover Image <span className="font-normal text-slate-400">(optional — replaces the default tile image)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300 hover:file:bg-slate-200 dark:hover:file:bg-slate-600 cursor-pointer"
            />
            {coverPreview && (
              <div className="mt-2 relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null)
                    if (coverPreview) URL.revokeObjectURL(coverPreview)
                    setCoverPreview(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/80"
                  aria-label="Remove cover image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
          <button
            type="submit" disabled={saving}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Add Post'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Published Posts ({posts.length})</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">No posts yet.</p>
        ) : (
          <ul className="space-y-3">
            {posts.map(p => (
              <li key={p.slug} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                {p.coverImage && (
                  <div className="shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.date} · <a href={p.url} target="_blank" rel="noopener noreferrer" className="underline">LinkedIn</a></p>
                  {p.excerpt && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.excerpt}</p>}
                </div>
                <button
                  onClick={() => handleDelete(p.slug)}
                  className="shrink-0 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
