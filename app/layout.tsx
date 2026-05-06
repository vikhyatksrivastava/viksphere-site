import './globals.css'
import DarkToggle from './components/DarkToggle'
import PublicShell from './components/PublicShell'
import Nav from './components/Nav'
import Hero from './components/Hero'

export const metadata = {
  title: 'VikSphere',
  description: 'Personal site for VikSphere',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href={`/api/r2?key=favicon.png`} />
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
