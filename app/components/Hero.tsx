import Image from 'next/image'
import { resolveImage, isExternalImage } from '../../lib/image'

export default function Hero() {
  const heroSrc = resolveImage('/images/logo.png')
  const isLogo = typeof heroSrc === 'string' && /\blogo\.png$/i.test(heroSrc)

  return (
    <div role="banner" className="bg-gradient-to-r from-surface-muted to-white dark:from-slate-800 dark:to-slate-900">
      <div className="container-max px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative z-20">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-slate-900 dark:text-white">VikSphere</h1>
            <p className="mt-4 text-lg text-slate-700 dark:text-slate-300 max-w-xl">This is my space, my sphere to share with the world. Explore my creations, thoughts, experiments and experiences. </p>
            <p className="mt-2 text-sm text-slate-500">— Vikhyat</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-md">Read my blog</a>
              <a href="/photos" className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-700 text-slate-900 dark:text-white rounded-md border border-slate-200">View photos</a>
              <button disabled aria-disabled="true" className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-700 text-slate-400 dark:text-slate-400 rounded-md border border-slate-200 opacity-50 cursor-not-allowed">Listen</button>
            </div>
          </div>
          <div className="relative w-full h-36 lg:h-44 rounded-[var(--radius-md)] overflow-hidden shadow-card bg-slate-50 dark:bg-slate-900">
            <div className="absolute inset-0 z-30">
              {isExternalImage(heroSrc) ? (
                <img src={heroSrc as string} alt="Hero" className={`w-full h-full ${isLogo ? 'object-contain' : 'object-cover'} object-center`} />
              ) : (
                <Image src={heroSrc} alt="Hero" fill className={`${isLogo ? 'object-contain' : 'object-cover'} object-center`} priority />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent mix-blend-multiply pointer-events-none z-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
