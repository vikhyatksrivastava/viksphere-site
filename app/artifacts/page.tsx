import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Artifacts',
  description: 'Open-source projects and GitHub repositories by Vikhyat Kumar Srivastava.',
  openGraph: { title: 'Artifacts | VikSphere', type: 'website' },
}

type Repo = {
  id: number
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
}

export default async function ArtifactsPage() {
  // Fetch public repositories for the user and cache for 1 hour
  let repos: Repo[] = []
  try {
    const res = await fetch('https://api.github.com/users/vikhyatksrivastava/repos?per_page=100&sort=updated', {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
      next: { revalidate: 3600 }
    })
    if (res.ok) repos = (await res.json()) as Repo[]
  } catch (e) {
    // ignore and show fallback message
  }

  return (
    <main className="container-max px-6 py-12">
      <h1 className="text-3xl font-semibold">Artifacts & Repos</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">Public projects from GitHub for vikhyatksrivastava.</p>

      {repos.length === 0 ? (
        <div className="mt-6 text-slate-600">No repos available right now.</div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {repos.map((r) => (
            <Link key={r.id} href={r.html_url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-[var(--surface-muted)] dark:bg-slate-800 rounded-md shadow-card hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div className="text-lg font-medium text-slate-900 dark:text-slate-100">{r.name}</div>
                <div className="text-sm text-slate-500">{r.language ?? '—'}</div>
              </div>
              {r.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{r.description}</p>}
              <div className="mt-3 text-xs text-slate-500 flex items-center gap-3">
                <span>★ {r.stargazers_count}</span>
                <span className="ml-auto">View on GitHub →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
