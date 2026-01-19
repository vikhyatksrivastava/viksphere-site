import './globals.css'
import Nav from './components/Nav'
import DarkToggle from './components/DarkToggle'
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
        <div className="min-h-screen flex flex-col">
          <Nav />
          <Hero />
          <main className="flex-1">{children}</main>
          <footer className="p-4 text-sm text-center">© {new Date().getFullYear()} VikSphere</footer>
        </div>
        <DarkToggle />
      </body>
    </html>
  )
}
