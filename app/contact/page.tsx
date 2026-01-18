"use client"

export default function ContactArchived() {
  return (
    <main className="container-max px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">Contact — Archived</h1>
        <p className="mt-2">The contact form was archived on 2026-01-19. The original implementation is preserved at <strong>/archived/contact</strong>.</p>
        <p className="mt-4">If you need to restore contact functionality, review <code>/app/archived/contact/page.tsx</code>.</p>
      </div>
    </main>
  )
}
