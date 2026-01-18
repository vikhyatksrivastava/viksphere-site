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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => openAt(i)}
            className="overflow-hidden rounded-md shadow-card bg-[var(--surface)]"
            aria-label={`Open image ${i + 1}`}
          >
            {isExternalImage(src) ? (
              // Use plain img for external/signed URLs so the browser requests the presigned URL directly
              // and Next's image optimizer doesn't attempt to fetch/optimize it.
              <img src={src} alt={`Photo ${i + 1}`} className="w-full h-auto object-cover" />
            ) : (
              <Image src={src} alt={`Photo ${i + 1}`} width={1200} height={800} className="w-full h-auto object-cover" />
            )}
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-w-[90vw] max-h-[90vh] w-full">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 z-50 bg-white/80 dark:bg-slate-800/80 rounded-full p-2"
              aria-label="Close"
            >
              ✕
            </button>

            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 bg-white/80 dark:bg-slate-800/80 rounded-full p-2"
              aria-label="Previous"
            >
              ‹
            </button>

            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 bg-white/80 dark:bg-slate-800/80 rounded-full p-2"
              aria-label="Next"
            >
              ›
            </button>

            <div className="w-full h-full flex items-center justify-center">
              {isExternalImage(images[index]) ? (
                <img src={images[index]} alt={`Image ${index + 1}`} className="max-h-[80vh] object-contain" />
              ) : (
                <Image
                  src={images[index]}
                  alt={`Image ${index + 1}`}
                  width={1200}
                  height={800}
                  className="max-h-[80vh] object-contain"
                />
              )}
            </div>

            <div className="mt-2 text-center text-sm text-white">{`${index + 1} / ${images.length}`}</div>
          </div>
        </div>
      )}
    </div>
  )
}
