import Image from 'next/image'
import { isExternalImage } from '../../lib/image'

type Photo = { src: string; alt?: string }

const defaultPhotos: Photo[] = [
  { src: '/images/photos/landscape-01.svg', alt: 'Landscape 01' },
  { src: '/images/photos/portrait-02.svg', alt: 'Portrait 02' },
  { src: '/images/photos/abstract-03.svg', alt: 'Abstract 03' },
]

export default function PhotoGallery({ photos }: { photos?: Photo[] }) {
  const list = photos && photos.length > 0 ? photos : defaultPhotos
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((p) => (
        <div key={p.src} className="overflow-hidden rounded-md shadow-card bg-[var(--surface)] relative">
          <div className="glass-card p-0">
            {isExternalImage(p.src) ? (
              <img src={p.src} alt={p.alt ?? ''} className="w-full h-56 sm:h-48 lg:h-56 object-cover" />
            ) : (
              <Image src={p.src} alt={p.alt ?? ''} width={800} height={520} className="w-full h-56 sm:h-48 lg:h-56 object-cover" />
            )}
            <div className="p-3">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{p.alt}</div>
              <div className="mt-2">
                <div className="color-range" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
