import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '../../../../lib/requireAdmin'
import { readJson, writeJson } from '../../../../lib/adminData'
import { listKeys } from '../../../../lib/r2'

export interface Album {
  slug: string
  title: string
  date: string
  excerpt: string
  cover: string
}

export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny
  return NextResponse.json(await readJson<Album[]>('albums.json', []))
}

export async function POST(request: Request) {
  const deny = await requireAdmin()
  if (deny) return deny

  const body = await request.json().catch(() => null)
  const { title, date, excerpt = '', r2Folder } = body ?? {}

  if (!title || !date || !r2Folder) {
    return NextResponse.json({ error: 'title, date, and r2Folder are required' }, { status: 400 })
  }

  // Use the R2 folder name as the slug so /photos/[slug] can list keys from it
  const slug = r2Folder.replace(/\/$/, '')

  // Find the first image in that R2 folder to use as the cover
  const keys = await listKeys(`${slug}/`)
  const coverKey = keys.find(k => /\.(jpe?g|png|webp|svg)$/i.test(k)) ?? ''

  if (!coverKey) {
    return NextResponse.json({ error: `No images found in R2 folder "${slug}/"` }, { status: 400 })
  }

  const albums = await readJson<Album[]>('albums.json', [])
  if (albums.some(a => a.slug === slug)) {
    return NextResponse.json({ error: `Album "${slug}" already exists` }, { status: 409 })
  }

  const album: Album = { slug, title, date, excerpt, cover: coverKey }
  albums.unshift(album)
  await writeJson('albums.json', albums)
  revalidatePath('/photos')
  revalidatePath(`/photos/${slug}`)
  revalidatePath('/')

  return NextResponse.json(album, { status: 201 })
}

export async function DELETE(request: Request) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { slug } = await request.json().catch(() => ({}))
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const albums = await readJson<Album[]>('albums.json', [])
  await writeJson('albums.json', albums.filter(a => a.slug !== slug))
  revalidatePath('/photos')
  revalidatePath('/')

  return NextResponse.json({ ok: true })
}
