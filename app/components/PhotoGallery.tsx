import Image from 'next/image'
import { isExternalImage } from '../../lib/image'

type Photo = { src: string; alt?: string }

const defaultPhotos: Photo[] = [
  { src: '/images/photos/landscape-01.svg', alt: 'Landscape 01' },
  { src: '/images/photos/portrait-02.svg',  alt: 'Portrait 02'  },
  { src: '/images/photos/abstract-03.svg',  alt: 'Abstract 03'  },
]

export default function PhotoGallery({ photos }: { photos?: Photo[] }) {
  const list = photos && photos.length > 0 ? photos : defaultPhotos

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {list.map((p, i) => (
        <div
          key={p.src + i}
          className={`group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 ${i === 0 ? 'col-span-2 sm:col-span-2' : ''}`}
        >
          <div className={`relative w-full ${i === 0 ? 'h-64 sm:h-72' : 'h-40 sm:h-48'}`}>
            {isExternalImage(p.src) ? (
              <img
                src={p.src}
                alt={p.alt ?? ''}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image
                src={p.src}
                alt={p.alt ?? ''}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {p.alt && (
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-xs font-semibold truncate drop-shadow">{p.alt}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
