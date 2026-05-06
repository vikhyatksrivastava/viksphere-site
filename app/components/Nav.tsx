'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { resolveImage } from '../../lib/image'

const logoSrc = resolveImage('/images/logo.png')

const links = [
  { href: '/',          label: 'Home'        },
  { href: '/vikhyat',   label: 'Vikhyat'     },
  { href: '/photos',    label: 'Photography' },
  { href: '/blog',      label: 'Blog'        },
  { href: '/artifacts', label: 'Artifacts'   },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg backdrop-saturate-150">
      <div className="container-max px-6 h-16 flex items-center justify-between">

        <Link href="/" className="inline-flex items-center gap-2.5 shrink-0 group">
          <img src={logoSrc as string} alt="VikSphere" className="h-8 w-8 object-contain" />
          <span className="text-[1.1rem] font-black tracking-tight gradient-text">VikSphere</span>
        </Link>

        <div className="flex items-center gap-0.5 text-sm">
          {links.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3.5 py-2 rounded-lg font-medium transition-all ${
                  active
                    ? 'text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-900/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 bg-teal-500 dark:bg-teal-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>

      </div>
    </nav>
  )
}
