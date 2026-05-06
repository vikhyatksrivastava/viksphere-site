'use client'
import { useState } from 'react'

interface Post {
  slug: string
  title: string
  url: string
  excerpt: string
  date: string
}

export default function PostsManager({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/admin/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url, excerpt, date }),
    })
    const data = await res.json()

    if (res.ok) {
      setPosts([data, ...posts])
      setTitle('')
      setUrl('')
      setExcerpt('')
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
              <li key={p.slug} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="min-w-0">
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
