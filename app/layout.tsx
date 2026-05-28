import './globals.css'
import type { Metadata } from 'next'
import DarkToggle from './components/DarkToggle'
import PublicShell from './components/PublicShell'
import Nav from './components/Nav'
import Hero from './components/Hero'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://viksphere.com'),
  title: {
    default: 'VikSphere',
    template: '%s | VikSphere',
  },
  description: 'Vikhyat Kumar Srivastava — Lead Data Engineer, traveller, photographer and writer based in India.',
  openGraph: {
    siteName: 'VikSphere',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/images/logo.png', width: 1200, height: 630, alt: 'VikSphere' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2985339146715287"
          crossOrigin="anonymous"></script>
      </head>
      <body>
        <PublicShell nav={<Nav />} hero={<Hero />}>{children}</PublicShell>
        <DarkToggle />
      </body>
    </html>
  )
}
