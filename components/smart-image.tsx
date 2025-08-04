'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SmartImageProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackType?: 'running' | 'marathon' | 'trail' | 'city' | 'default'
  eventId?: string
  priority?: boolean
}

export default function SmartImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  fallbackType = 'default',
  eventId,
  priority = false
}: SmartImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Imágenes predeterminadas por tipo
  const fallbackImages = {
    running: '/images/defaults/running-default.svg',
    marathon: '/images/defaults/marathon-default.svg', 
    trail: '/images/defaults/trail-default.svg',
    city: '/images/defaults/city-default.svg',
    default: '/images/defaults/event-default.svg'
  }

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        // 1. Intentar imagen local específica del evento
        if (eventId) {
          const localEventImage = `/images/events/${eventId}.svg`
          if (await imageExists(localEventImage)) {
            setImageSrc(localEventImage)
            setIsLoading(false)
            return
          }
        }

        // 2. Intentar imagen externa proporcionada
        if (src && await imageExists(src)) {
          setImageSrc(src)
          setIsLoading(false)
          return
        }

        // 3. Usar imagen predeterminada por tipo
        const fallbackSrc = fallbackImages[fallbackType]
        if (await imageExists(fallbackSrc)) {
          setImageSrc(fallbackSrc)
        } else {
          // 4. Usar imagen por defecto absoluta
          setImageSrc(fallbackImages.default)
        }
      } catch (error) {
        console.error('Error loading image:', error)
        setImageSrc(fallbackImages.default)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [src, eventId, fallbackType])

  // Función para verificar si una imagen existe
  const imageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (url.startsWith('/images/')) {
        // Para imágenes locales, asumir que existen
        // En producción, Next.js las optimizará
        resolve(true)
        return
      }

      // Para imágenes externas, verificar disponibilidad
      const img = new window.Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
      
      // Timeout después de 3 segundos
      setTimeout(() => resolve(false), 3000)
    })
  }

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallbackImages.default)
    }
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando imagen...</p>
          </div>
        </div>
      )}
      
      {imageSrc && (
        <>
          {imageSrc.endsWith('.svg') ? (
            // Para SVGs, usar img estándar
            <img
              src={imageSrc}
              alt={alt}
              width={width}
              height={height}
              className={cn(
                "transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onError={handleImageError}
              onLoad={() => setIsLoading(false)}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: 'auto'
              }}
            />
          ) : (
            // Para JPG/PNG, usar Next.js Image
            <Image
              src={imageSrc}
              alt={alt}
              width={width}
              height={height}
              className={cn(
                "transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onError={handleImageError}
              onLoad={() => setIsLoading(false)}
              priority={priority}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: 'auto'
              }}
            />
          )}
        </>
      )}
      
      {hasError && !isLoading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-center p-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3 mx-auto">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">Imagen no disponible</p>
          </div>
        </div>
      )}
    </div>
  )
}
