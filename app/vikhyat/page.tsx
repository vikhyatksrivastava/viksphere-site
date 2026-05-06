import Image from 'next/image'
import fs from 'fs'
import path from 'path'
import { readJson } from '../../lib/adminData'

interface ExperienceItem { id: string; company: string; role: string; location?: string; period: string; description: string }
interface EducationItem  { id: string; institution: string; degree: string; period: string }
interface PortfolioFull {
  name: string; title: string; location?: string; about: string
  skills: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  certifications: string[]
  links: { linkedin?: string; github?: string; email?: string }
}

const DEFAULT: PortfolioFull = {
  name: 'Vikhyat Kumar Srivastava',
  title: 'Lead Data Engineer · Solution Designer',
  location: 'Greater Noida (West), Uttar Pradesh - India',
  about: '',
  skills: [], experience: [], education: [], certifications: [], links: {},
}

export default function VikhyatPage() {
  const p = readJson<PortfolioFull>('portfolio.json', DEFAULT)
  const hasProfile = fs.existsSync(path.join(process.cwd(), 'public', 'images', 'vikhyat-profile.jpg'))

  return (
    <main className="container-max px-6 py-16">

      {/* ── Identity ─────────────────────────────────────────────── */}
      <section className="flex flex-col sm:flex-row gap-10 items-start mb-20">
        <div className="shrink-0 w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
          {hasProfile ? (
            <Image
              src="/images/vikhyat-profile.jpg"
              alt={p.name}
              width={128}
              height={128}
              className="w-full h-full object-cover object-top"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center text-white text-5xl font-bold select-none">
              V
            </div>
          )}
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">{p.name}</h1>
          <p className="mt-1.5 text-lg font-medium text-teal-600 dark:text-teal-400">{p.title}</p>
          {p.location && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <PinIcon /> {p.location}
            </p>
          )}
          {p.about && (
            <p className="mt-5 text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">{p.about}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {p.links.linkedin && (
              <a href={p.links.linkedin} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A66C2] text-white text-sm font-medium hover:bg-[#004182] transition-colors shadow-sm">
                <LinkedInIcon /> LinkedIn
              </a>
            )}
            {p.links.github && (
              <a href={p.links.github} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm">
                <GitHubIcon /> GitHub
              </a>
            )}
            {p.links.email && (
              <a href={`mailto:${p.links.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <MailIcon /> {p.links.email}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── Skills ───────────────────────────────────────────────── */}
      {p.skills.length > 0 && (
        <section className="mb-20">
          <SectionHeading>Skills &amp; Technologies</SectionHeading>
          <div className="mt-6 flex flex-wrap gap-2">
            {p.skills.map(skill => (
              <span key={skill}
                className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Experience ───────────────────────────────────────────── */}
      {p.experience.length > 0 && (
        <section className="mb-20">
          <SectionHeading>Experience</SectionHeading>
          <div className="mt-6 space-y-4 relative">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-400 via-teal-300 to-teal-100 dark:from-teal-600 dark:via-teal-700 dark:to-teal-900 ml-[7px]" />
            {p.experience.map(exp => (
              <div key={exp.id} className="relative pl-8">
                <div className="absolute left-0 top-5 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white dark:border-slate-950 shadow" />
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{exp.role}</h3>
                      <p className="text-teal-600 dark:text-teal-400 text-sm mt-0.5">
                        {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-full whitespace-nowrap">{exp.period}</span>
                  </div>
                  {exp.description && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Education ────────────────────────────────────────────── */}
      {p.education.length > 0 && (
        <section className="mb-20">
          <SectionHeading>Education</SectionHeading>
          <div className="mt-6 space-y-4 relative">
            <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-slate-300 to-slate-100 dark:from-slate-600 dark:to-slate-800 ml-[7px]" />
            {p.education.map(edu => (
              <div key={edu.id} className="relative pl-8">
                <div className="absolute left-0 top-5 w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-950 shadow" />
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{edu.degree}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{edu.institution}</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-full whitespace-nowrap">{edu.period}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Certifications ───────────────────────────────────────── */}
      {p.certifications.length > 0 && (
        <section className="mb-20">
          <SectionHeading>Certifications</SectionHeading>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {p.certifications.map(cert => (
              <div key={cert}
                className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
                <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
                  <svg className="w-3 h-3 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{cert}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Connect ──────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 dark:from-teal-700 dark:to-teal-900 p-10 text-white text-center shadow-lg">
        <h2 className="text-2xl font-bold">Let's Connect</h2>
        <p className="mt-3 text-teal-100 max-w-md mx-auto">Whether it's a data challenge, a creative project, or just a good conversation — I'm always up for it.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {p.links.linkedin && (
            <a href={p.links.linkedin} target="_blank" rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-lg bg-white text-teal-800 font-medium text-sm hover:bg-teal-50 transition-colors shadow">
              LinkedIn
            </a>
          )}
          {p.links.github && (
            <a href={p.links.github} target="_blank" rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-lg bg-teal-900/50 text-white font-medium text-sm hover:bg-teal-900/80 transition-colors border border-teal-500/40">
              GitHub
            </a>
          )}
          {p.links.email && (
            <a href={`mailto:${p.links.email}`}
              className="px-6 py-2.5 rounded-lg bg-teal-900/50 text-white font-medium text-sm hover:bg-teal-900/80 transition-colors border border-teal-500/40">
              Email Me
            </a>
          )}
        </div>
      </section>

    </main>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white shrink-0">{children}</h2>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

function PinIcon() {
  return <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
}
function LinkedInIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
}
function GitHubIcon() {
  return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
}
function MailIcon() {
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
}
