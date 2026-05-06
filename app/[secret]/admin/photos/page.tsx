import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { sessionOptions, SessionData } from '../../../../lib/session'
import { readJson } from '../../../../lib/adminData'
import PhotosManager from '../../../components/admin/PhotosManager'

type Props = { params: Promise<{ secret: string }> }

export default async function AdminPhotosPage({ params }: Props) {
  const { secret } = await params
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  if (!session.isLoggedIn) redirect(`/${secret}/admin/login`)

  const albums = readJson('albums.json', [])

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <a href={`/${secret}/admin`} className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          ← Dashboard
        </a>
        <h1 className="text-2xl font-semibold">Photographs</h1>
      </div>
      <PhotosManager initialAlbums={albums} />
    </main>
  )
}
