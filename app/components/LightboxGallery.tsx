"use client"
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { isExternalImage } from '../../lib/image'

type Props = { images: string[] }

export default function LightboxGallery({ images }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index])

  function openAt(i: number) {
    setIndex(i)
    setOpen(true)
  }

  function next() {
    setIndex((i) => (i + 1) % images.length)
  }

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length)
  }

  if (!images || images.length === 0) return null

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => openAt(i)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow"
            aria-label={`Open image ${i + 1}`}
          >
            {isExternalImage(src) ? (
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw" />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex flex-col items-center max-w-[92vw] max-h-[92vh]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 text-white/70 hover:text-white transition-colors"
              aria-label="Previous"
            >
              <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-white/70 hover:text-white transition-colors"
              aria-label="Next"
            >
              <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {isExternalImage(images[index]) ? (
              <img src={images[index]} alt={`Image ${index + 1}`} className="max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl" />
            ) : (
              <Image
                src={images[index]}
                alt={`Image ${index + 1}`}
                width={1600}
                height={1200}
                className="max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            )}

            <div className="mt-4 text-sm text-white/60">{index + 1} / {images.length}</div>
          </div>
        </div>
      )}
    </div>
  )
}
