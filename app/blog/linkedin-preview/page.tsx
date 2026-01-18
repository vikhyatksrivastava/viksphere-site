"use client"
import { useEffect } from 'react'

export default function LinkedInPreviewPage() {
  const url = 'https://www.linkedin.com/pulse/why-games-struggle-simulate-india-what-reveals-indian-srivastava-lso4e'

  useEffect(() => {
    // Auto-redirect to LinkedIn as a fallback; keep the page for users who want to read locally first.
    window.location.replace(url)
  }, [])

  return (
    <main className="container-max px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold">Redirecting to LinkedIn…</h1>
        <p className="mt-3 text-sm text-slate-600">If you are not redirected, <a href={url} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)]">click here to open the article on LinkedIn</a>.</p>
      </div>
    </main>
  )
}
