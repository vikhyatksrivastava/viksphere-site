'use client'
import { useState } from 'react'

interface Album {
  slug: string
  title: string
  date: string
  excerpt: string
  cover: string
}

export default function PhotosManager({ initialAlbums }: { initialAlbums: Album[] }) {
  const [albums, setAlbums] = useState<Album[]>(initialAlbums)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [excerpt, setExcerpt] = useState('')
  const [r2Folder, setR2Folder] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/admin/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, excerpt, r2Folder: r2Folder.replace(/\/$/, '') }),
    })
    const data = await res.json()

    if (res.ok) {
      setAlbums([data, ...albums])
      setTitle('')
      setExcerpt('')
      setR2Folder('')
      setSuccess('Album created.')
    } else {
      setError(data.error ?? 'Failed to create album')
    }
    setSaving(false)
  }

  async function handleDelete(slug: string) {
    if (!confirm('Remove this album entry? (Photos in R2 are not deleted)')) return
    const res = await fetch('/api/admin/photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    if (res.ok) setAlbums(albums.filter(a => a.slug !== slug))
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-medium mb-4">Add Album from Cloudflare R2</h2>
        <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">Album Title</label>
            <input
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Barcelona — Spring 2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date" required value={date} onChange={e => setDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Short description of the album"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">R2 Folder</label>
            <input
              type="text" required value={r2Folder} onChange={e => setR2Folder(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 font-mono"
              placeholder="barcelona-new-year-20260101"
            />
            <p className="mt-1 text-xs text-slate-400">Folder name in your R2 bucket. The first image found will be used as the album cover.</p>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {success && <p className="text-sm text-green-600 dark:text-green-400">{success}</p>}
          <button
            type="submit" disabled={saving}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-300 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Creating…' : 'Create Album'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium mb-4">Albums ({albums.length})</h2>
        {albums.length === 0 ? (
          <p className="text-sm text-slate-500">No albums yet.</p>
        ) : (
          <ul className="space-y-3">
            {albums.map(a => (
              <li key={a.slug} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="min-w-0">
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{a.date} · <span className="font-mono">{a.slug}</span></p>
                  {a.excerpt && <p className="text-xs text-slate-400 mt-1">{a.excerpt}</p>}
                </div>
                <button
                  onClick={() => handleDelete(a.slug)}
                  className="shrink-0 text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
