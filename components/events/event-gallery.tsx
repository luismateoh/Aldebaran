'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Images, ImageOff, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { EventData } from '@/lib/types'

export interface EventGalleryProps {
  images?: string[]
  eventTitle?: string
  event?: EventData
  className?: string
}

// ─── Demo fallback images from the gallery ───────────────────────────────────

const GALLERY_FALLBACK_IMAGES: string[] = [
  '/images/gallery/gallery-01.jpg',
  '/images/gallery/gallery-02.jpg',
  '/images/gallery/gallery-03.jpg',
  '/images/gallery/gallery-04.jpg',
]

/**
 * EventGallery — Shows event images in a masonry-like grid with lightbox.
 * Uses native <img> for dynamic external images (faster, avoids SW constraints).
 * Falls back to demo gallery images when the event has no gallery.
 */
export function EventGallery({
  images,
  eventTitle,
  event,
  className,
}: EventGalleryProps) {
  // Resolve which images to display
  const userImages = images ?? (event?.cover ? [event.cover] : [])
  const hasUserImages =
    userImages.length > 0 &&
    userImages.some((src) => src && src.trim() !== '')
  const displayImages = hasUserImages ? userImages : GALLERY_FALLBACK_IMAGES
  const isDemoGallery = !hasUserImages

  const resolvedTitle = eventTitle ?? event?.title ?? ''
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen) return
      if (displayImages.length === 0) return
      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) =>
          prev === 0 ? displayImages.length - 1 : prev - 1,
        )
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) =>
          prev === displayImages.length - 1 ? 0 : prev + 1,
        )
      }
    },
    [lightboxOpen, displayImages.length],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  const hasImages =
    displayImages.length > 0 &&
    displayImages.some((src) => src && src.trim() !== '')

  if (!hasImages) {
    return (
      <section className={cn('mt-10', className)}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <Images className="size-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground md:text-xl">
              Galería
            </h3>
          </div>
        </motion.div>
        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 py-16">
          <ImageOff className="mx-auto mb-3 size-12 text-muted-foreground/60" />
          <p className="text-lg font-medium text-muted-foreground">
            Sin imágenes disponibles
          </p>
          <p className="text-sm text-muted-foreground/70">
            Este evento aún no tiene imágenes en su galería
          </p>
        </div>
      </section>
    )
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const goTo = (index: number) => {
    setCurrentIndex(index)
  }

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1,
    )
  }

  const goPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1,
    )
  }

  const handleImgError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index))
  }

  return (
    <section className={cn('mt-10', className)}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <Images className="size-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground md:text-xl">
            Galería
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {displayImages.length}{' '}
          {displayImages.length === 1 ? 'imagen' : 'imágenes'}
        </span>

        {/* Demo badge when showing fallback images */}
        {isDemoGallery && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Sparkles className="size-3" />
            Demo
          </span>
        )}
      </motion.div>

      <div className="columns-1 gap-3 sm:columns-2 lg:columns-3">
        {displayImages.map((src, index) => {
          const hasFailed = failedImages.has(index)
          if (hasFailed) return null

          return (
            <motion.button
              key={`${src}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: 'easeOut',
              }}
              onClick={() => openLightbox(index)}
              className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              type="button"
              aria-label={`Ver imagen ${index + 1} de ${resolvedTitle}`}
            >
              <div className="group relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${resolvedTitle} — Imagen ${index + 1}`}
                  className="w-full transform object-cover transition-all duration-500 group-hover:scale-105"
                  loading={index < 4 ? 'eager' : 'lazy'}
                  style={{
                    aspectRatio:
                      index % 3 === 0
                        ? '4/3'
                        : index % 3 === 1
                          ? '1/1'
                          : '3/4',
                  }}
                  onError={() => handleImgError(index)}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                  <span className="scale-0 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-lg transition-transform duration-300 group-hover:scale-100">
                    🔍 Ver
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}

        {/* Fallback gradient card if all images failed */}
        {failedImages.size === displayImages.length && (
          <div className="col-span-full flex items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 py-16">
            <div className="text-center">
              <ImageOff className="mx-auto mb-3 size-10 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                No se pudieron cargar las imágenes
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="flex size-full max-h-screen max-w-screen items-center justify-center border-0 bg-black/95 p-0 sm:rounded-none">
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute right-4 top-4 z-50 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                type="button"
                aria-label="Cerrar galería"
              >
                <X className="size-5" />
              </button>

              <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-sm">
                {currentIndex + 1} / {displayImages.length}
              </div>

              {displayImages.length > 1 && (
                <button
                  onClick={goPrev}
                  className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  type="button"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="size-6" />
                </button>
              )}

              <div className="flex max-h-[90vh] max-w-[90vw] items-center justify-center">
                <AnimatePresence mode="wait">
                  {failedImages.has(currentIndex) ? (
                    <div className="flex items-center justify-center rounded-lg bg-muted/20 p-16">
                      <div className="text-center text-white/60">
                        <ImageOff className="mx-auto mb-2 size-12" />
                        <p className="text-sm">Imagen no disponible</p>
                      </div>
                    </div>
                  ) : (
                    <motion.img
                      key={currentIndex}
                      src={displayImages[currentIndex]}
                      alt={`${resolvedTitle} — Imagen ${currentIndex + 1}`}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                      onError={() => handleImgError(currentIndex)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {displayImages.length > 1 && (
                <button
                  onClick={goNext}
                  className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                  type="button"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="size-6" />
                </button>
              )}

              {displayImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2">
                  {displayImages.map((thumbnail, idx) => (
                    <button
                      key={idx}
                      onClick={() => goTo(idx)}
                      className={cn(
                        'size-12 overflow-hidden rounded-lg border-2 transition-all duration-200',
                        idx === currentIndex
                          ? 'border-primary opacity-100'
                          : 'border-transparent opacity-50 hover:opacity-80',
                      )}
                      type="button"
                      aria-label={`Ir a imagen ${idx + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt=""
                        className="size-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </section>
  )
}
