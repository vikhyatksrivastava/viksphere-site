"use client"

import { useState } from 'react'

export default function ArchivedContactPage() {
  const [status, setStatus] = useState<string | null>(null)

  return (
    <main className="container-max px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">Contact (Archived)</h1>
        <p className="mt-2">This contact form was archived on 2026-01-19. The original form implementation is preserved in the archive.</p>
        <div className="mt-6 prose">
          <pre className="bg-slate-50 dark:bg-slate-800 p-4 rounded">Original contact form moved to archive file.</pre>
        </div>
      </div>
    </main>
  )
}
