import { readJson } from '../../lib/adminData'

interface PortfolioData { headline: string; tagline: string; bio: string }
const DEFAULT: PortfolioData = {
  headline: 'VikSphere',
  tagline: 'This is my space, my sphere to share with the world. Explore my creations, thoughts, experiments and experiences.',
  bio: '— Vikhyat',
}

export default function Hero() {
  const portfolio = readJson<PortfolioData>('portfolio.json', DEFAULT)

  return (
    <div role="banner" className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50">
      {/* Gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-40 left-1/2 w-[800px] h-[600px] -translate-x-1/3 bg-teal-400/[0.08] dark:bg-teal-400/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -right-20 w-[560px] h-[560px] bg-indigo-400/[0.06] dark:bg-indigo-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[440px] h-[440px] -translate-y-1/2 bg-teal-300/[0.05] dark:bg-teal-300/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="container-max px-6 py-20 lg:py-28 relative">
        {/* Badge */}
        <span className="section-badge mb-6 inline-flex">Personal Space</span>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white max-w-3xl">
          {portfolio.headline}
        </h1>

        {/* Tagline */}
        <p className="mt-6 text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          {portfolio.tagline}
        </p>

        {/* Attribution */}
        {portfolio.bio && (
          <p className="mt-2 text-sm text-slate-400 dark:text-slate-500 italic">{portfolio.bio}</p>
        )}

        {/* CTA row */}
        <div className="mt-10 flex flex-wrap gap-3">
          <a href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:-translate-y-0.5">
            Read my Blog
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>

          <a href="/vikhyat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5">
            Know Vikhyat
          </a>

          <a href="/photos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 transition-all hover:-translate-y-0.5">
            Photography
          </a>

          <a href="/travel_board"
            className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl text-sm font-medium border border-slate-200/70 dark:border-slate-700/70 transition-all">
            My Footprints
          </a>
        </div>
      </div>
    </div>
  )
}
