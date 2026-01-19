export type Activity = {
  slug: string
  title: string
  date: string // ISO
  excerpt?: string
  cover?: string // path under /images/
  content?: string // full HTML or markdown (kept simple)
}

export const activities: Activity[] = [
  {
    slug: 'linkedin-why-games-2026',
    title: 'Why games struggle to simulate India — preview',
    date: '2026-01-18',
    excerpt: 'Preview of my LinkedIn article on simulation and representation in games.',
    cover: 'photos/landscape-01.svg',
    kind: 'blog',
    content: '<p>Original post on LinkedIn: <a href="https://www.linkedin.com/pulse/why-games-struggle-simulate-india-what-reveals-indian-srivastava-lso4e" target="_blank" rel="noopener noreferrer">Read on LinkedIn</a></p>'
  },
  {
    slug: 'barcelona-new-year-2026',
    title: 'Barcelona — New Year Celebration 2026',
    date: '2026-01-01',
    excerpt: 'A short preview of the Barcelona New Year celebration: lights, music, and streets full of life.',
    cover: 'barcelona-new-year-20260101/PXL_20251231_183225520.jpg',
    content: '<p>Full gallery and notes about the Barcelona New Year trip.</p>'
  },
  {
    slug: 'horton-on-water-20240414',
    title: 'Horton on Water Visit 2024',
    date: '2026-01-01',
    excerpt: 'A short visit to contryside of England, exploring the beauty of nature and water bodies.',
    cover: 'horton-on-water-20240414/IMG_8112.JPG',
    content: '<p>Full gallery and notes about the Horton on Water trip</p>'
  },
  {
    slug: 'valencia-visit-20251224',
    title: 'Valencia Spain — Winter Holidays 2025',
    date: '2026-01-01',
    excerpt: 'A glimpse into the winter holidays spent in Valencia, Spain, capturing the festive spirit and local culture.',
    cover: 'valencia-visit-20251224/cover.jpg',
    content: '<p>Full gallery and notes about the Valencia visit</p>'
  }
]
