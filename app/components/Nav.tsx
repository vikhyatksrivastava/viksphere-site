import Link from 'next/link'
import { resolveImage } from '../../lib/image'

const logoSrc = resolveImage('/images/logo.png')

export default function Nav() {
  return (
    <nav className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <Link href="/" className="inline-flex items-center gap-3">
          <img src={logoSrc as string} alt="VikSphere" className="h-8 w-8 object-contain" />
          <span className="text-xl font-serif font-bold text-[var(--color-primary)]">VikSphere</span>
        </Link>
      </div>
      <div className="space-x-6 text-sm">
        <Link href="/" className="text-slate-700 dark:text-slate-200 hover:text-[var(--color-primary)]">Home</Link>
        <Link href="/photos" className="text-slate-700 dark:text-slate-200 hover:text-[var(--color-primary)]">Photography</Link>
        <Link href="/blog" className="text-slate-700 dark:text-slate-200 hover:text-[var(--color-primary)]">Blog</Link>
        <Link href="/artifacts" className="text-slate-700 dark:text-slate-200 hover:text-[var(--color-primary)]">Artifacts</Link>
        
      </div>
    </nav>
  )
}
