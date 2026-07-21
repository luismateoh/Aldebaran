'use client'

/**
 * @deprecated Use `ImageWithFallback` from `@/components/ui/image-with-fallback` instead.
 *
 * SmartImage ahora es un wrapper ligero que delega en ImageWithFallback
 * para mantener compatibilidad con código existente.
 */

import { ImageWithFallback, getFallbackFromCategory } from "@/components/ui/image-with-fallback"
import type { FallbackVariant } from "@/components/ui/image-with-fallback"


export interface SmartImageProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackType?: 'running' | 'marathon' | 'trail' | 'city' | 'default'
  eventId?: string
  priority?: boolean
  autoOptimize?: boolean
}

const variantMap: Record<string, FallbackVariant> = {
  running: 'running',
  marathon: 'marathon',
  trail: 'trail',
  city: 'city',
  default: 'default',
}

export default function SmartImage({
  src,
  alt,
  width = 400,
  height = 300,
  className,
  fallbackType = 'default',
  priority = false,
}: SmartImageProps) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      width={width}
      height={height}
      fallbackVariant={variantMap[fallbackType] ?? 'default'}
      className={className}
      priority={priority}
      wrapperClassName={className}
      objectFit="cover"
      unoptimized={!src?.startsWith('/') && !src?.startsWith('data:')}
    />
  )
}
