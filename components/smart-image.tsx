'use client'

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
  autoOptimize?: boolean // Nueva prop para optimización automática
}

interface ImageOptimizationResult {
  success: boolean
  optimizedUrl?: string
  error?: string
}

export default function SmartImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  fallbackType = 'default',
  eventId,
  priority = false,
  autoOptimize = true // Activado por defecto
}: SmartImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Imágenes predeterminadas por tipo con gradientes atractivos
  const fallbackImages = {
    running: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJydW5uaW5nIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojM0I4MkY2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzEwQjk4MTtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNydW5uaW5nKSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPvCfj4MgUnVubmluZzwvdGV4dD48L3N2Zz4=',
    marathon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJtYXJhdGhvbiIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0Y1OUU0MjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRjQ0NDQ7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjbWFyYXRob24pIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+8J+PhiBNYXJhdGhvbjwvdGV4dD48L3N2Zz4=',
    trail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJ0cmFpbCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzIyQzU1RTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMxNkE2RjQ7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9InVybCgjdHJhaWwpIi8+PHRleHQgeD0iMjAwIiB5PSIxNjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCI+8J+PlSBUcmFpbDwvdGV4dD48L3N2Zz4=',
    city: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJjaXR5IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOEI1Q0Y2O3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0E4NTVGNztzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNjaXR5KSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTYwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPvCfj4cgQ2l1ZGFkPC90ZXh0Pjwvc3ZnPg==',
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJkZWZhdWx0IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NkYxO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhCNUNGNjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0idXJsKCNkZWZhdWx0KSIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPvCfj4QgRXZlbnRvPC90ZXh0Pjx0ZXh0IHg9IjIwMCIgeT0iMTgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxOCIgb3BhY2l0eT0iMC44Ij5kZSBBdGxldGlzbW88L3RleHQ+PC9zdmc+'
  }

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true)
      setHasError(false)

      try {
        // Usar imagen externa si está disponible
        if (src && await imageExists(src)) {
          console.log('✅ Usando imagen externa original')
          setImageSrc(src)
          setIsLoading(false)
          return
        }

        // Usar imagen predeterminada por tipo
        console.log(`🎨 Usando imagen predeterminada: ${fallbackType}`)
        setImageSrc(fallbackImages[fallbackType])
        
      } catch (error) {
        console.error('❌ Error loading image:', error)
        setImageSrc(fallbackImages.default)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [src, fallbackType])


  // Función mejorada para verificar si una imagen existe
  const imageExists = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (url.startsWith('data:image/')) {
        // SVGs base64 embebidos siempre existen
        resolve(true)
        return
      }

      // Para imágenes externas, verificar disponibilidad
      const img = new window.Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = url
      
      // Timeout después de 5 segundos
      setTimeout(() => resolve(false), 5000)
    })
  }

  const handleImageError = () => {
    if (!hasError) {
      console.log('⚠️ Error cargando imagen, usando fallback')
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
            <div className="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Cargando imagen...</p>
          </div>
        </div>
      )}
      
      {imageSrc && (
        <>
          {imageSrc.startsWith('data:image/svg') ? (
            // Para SVGs base64, usar img estándar
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
              onLoad={() => {
                setIsLoading(false)
              }}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: 'auto'
              }}
            />
          ) : (
            // Para JPG/PNG/WebP, usar img estándar
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
              onLoad={() => {
                setIsLoading(false)
              }}
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
            <div className="size-16 bg-gray-300 rounded-full flex items-center justify-center mb-3 mx-auto">
              <svg className="size-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
