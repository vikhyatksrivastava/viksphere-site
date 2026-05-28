import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '../../../../lib/requireAdmin'
import { readJson, writeJson } from '../../../../lib/adminData'

export interface Post {
  slug: string
  title: string
  url: string
  excerpt: string
  date: string
  coverImage?: string
}

export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny
  return NextResponse.json(await readJson<Post[]>('posts.json', []))
}

export async function POST(request: Request) {
  const deny = await requireAdmin()
  if (deny) return deny

  const body = await request.json().catch(() => null)
  if (!body?.title || !body?.url || !body?.date) {
    return NextResponse.json({ error: 'title, url, and date are required' }, { status: 400 })
  }

  const posts = await readJson<Post[]>('posts.json', [])
  const slug = `linkedin-${body.date}-${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}`

  const coverImage = typeof body.coverImage === 'string' && body.coverImage.trim()
    ? body.coverImage.trim()
    : undefined

  const post: Post = { slug, title: body.title, url: body.url, excerpt: body.excerpt ?? '', date: body.date, ...(coverImage ? { coverImage } : {}) }
  posts.unshift(post)
  await writeJson('posts.json', posts)
  revalidatePath('/blog')
  revalidatePath('/')

  return NextResponse.json(post, { status: 201 })
}

export async function DELETE(request: Request) {
  const deny = await requireAdmin()
  if (deny) return deny

  const { slug } = await request.json().catch(() => ({}))
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const posts = await readJson<Post[]>('posts.json', [])
  await writeJson('posts.json', posts.filter(p => p.slug !== slug))
  revalidatePath('/blog')
  revalidatePath('/')

  return NextResponse.json({ ok: true })
}
