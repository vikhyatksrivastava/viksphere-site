'use client'
import { usePathname } from 'next/navigation'

type Props = {
  children: React.ReactNode
  nav: React.ReactNode
  hero: React.ReactNode
}

export default function PublicShell({ children, nav, hero }: Props) {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  const isAdmin = segments.length >= 2 && segments[1] === 'admin'

  if (isAdmin) return <>{children}</>

  const year = new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col">
      {nav}
      {hero}
      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-950">
        <div className="container-max px-6 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

            <div className="shrink-0">
              <span className="text-lg font-black tracking-tight gradient-text">VikSphere</span>
              <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500 max-w-[220px] leading-relaxed">
                A personal space to share creations, thoughts, experiments, and experiences.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              {[
                { href: '/',             label: 'Home'         },
                { href: '/vikhyat',      label: 'About'        },
                { href: '/photos',       label: 'Photography'  },
                { href: '/blog',         label: 'Blog'         },
                { href: '/artifacts',    label: 'Artifacts'    },
                { href: '/travel_board', label: 'Travel'       },
              ].map(({ href, label }) => (
                <a key={href} href={href} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-medium">
                  {label}
                </a>
              ))}
            </nav>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-600">
              © {year} VikSphere — All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
