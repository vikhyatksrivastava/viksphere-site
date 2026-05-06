import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionOptions, SessionData } from '../../../lib/session'

type Props = {
  params: Promise<{ secret: string }>
}

export default async function AdminDashboard({ params }: Props) {
  const { secret } = await params
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)

  if (!session.isLoggedIn) {
    redirect(`/${secret}/admin/login`)
  }

  async function logout() {
    'use server'
    const s = await getIronSession<SessionData>(await cookies(), sessionOptions)
    s.destroy()
    redirect(`/${secret}/admin/login`)
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold">VikSphere Admin</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Signed in as <span className="font-medium">{session.username}</span>
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminCard title="LinkedIn Posts" description="Add and manage LinkedIn article links on your blog" href={`/${secret}/admin/posts`} />
        <AdminCard title="Photographs" description="Upload photos and create albums" href={`/${secret}/admin/photos`} />
        <AdminCard title="Portfolio" description="Edit your headline, tagline, and bio" href={`/${secret}/admin/portfolio`} />
      </div>
    </main>
  )
}

function AdminCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <a
      href={href}
      className="block p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 hover:shadow-sm transition-all"
    >
      <h2 className="font-medium">{title}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </a>
  )
}
