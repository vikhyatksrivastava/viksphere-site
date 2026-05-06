import { NextResponse } from 'next/server'
import { requireAdmin } from '../../../../lib/requireAdmin'
import { readJson, writeJson } from '../../../../lib/adminData'

export interface ExperienceItem { id: string; company: string; role: string; period: string; description: string }
export interface EducationItem  { id: string; institution: string; degree: string; period: string }

export interface PortfolioData {
  headline: string
  tagline: string
  bio: string
  name: string
  title: string
  location: string
  about: string
  skills: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  certifications: string[]
  links: { linkedin?: string; github?: string; email?: string }
}

const DEFAULT: PortfolioData = {
  headline: 'VikSphere',
  tagline: 'This is my space, my sphere to share with the world.',
  bio: '— Vikhyat',
  name: 'Vikhyat Kumar Srivastava',
  title: 'Lead Data Engineer · Solution Designer',
  location: 'Greater Noida (West), Uttar Pradesh - India',
  about: '',
  skills: [],
  experience: [],
  education: [],
  certifications: [],
  links: {},
}

export async function GET() {
  const deny = await requireAdmin()
  if (deny) return deny
  return NextResponse.json(readJson<PortfolioData>('portfolio.json', DEFAULT))
}

export async function PUT(request: Request) {
  const deny = await requireAdmin()
  if (deny) return deny

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const current = readJson<PortfolioData>('portfolio.json', DEFAULT)
  const updated: PortfolioData = {
    headline:       body.headline       ?? current.headline,
    tagline:        body.tagline        ?? current.tagline,
    bio:            body.bio            ?? current.bio,
    name:           body.name           ?? current.name,
    title:          body.title          ?? current.title,
    location:       body.location       ?? current.location,
    about:          body.about          ?? current.about,
    skills:         Array.isArray(body.skills)         ? body.skills         : current.skills,
    experience:     Array.isArray(body.experience)     ? body.experience     : current.experience,
    education:      Array.isArray(body.education)      ? body.education      : current.education,
    certifications: Array.isArray(body.certifications) ? body.certifications : current.certifications,
    links:          body.links          ?? current.links,
  }
  writeJson('portfolio.json', updated)
  return NextResponse.json(updated)
}
