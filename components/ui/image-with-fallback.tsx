'use client'

import { useState, useCallback, useEffect, useRef } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FallbackVariant =
  | "running"
  | "marathon"
  | "trail"
  | "city"
  | "default"
  | "5k"
  | "10k"
  | "21k"
  | "42k"

export interface ImageWithFallbackProps
  extends Omit<ImageProps, "onError" | "onLoad" | "src"> {
  /** Source URL — empty/falsy values trigger the fallback immediately */
  src?: string | null
  /** Category-based fallback variant */
  fallbackVariant?: FallbackVariant
  /** Object-fit behaviour */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  /** Extra wrapper className */
  wrapperClassName?: string
  /** Whether to show a subtle skeleton pulse while loading */
  showSkeleton?: boolean
  /** Force the image not to use next/image (useful for external dynamic sources) */
  unoptimized?: boolean
}

// ---------------------------------------------------------------------------
// SVG gradient fallback placeholders (inline — no external files needed)
// ---------------------------------------------------------------------------

const FALLBACK_SVGS: Record<FallbackVariant, string> = {
  running:
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6"/>
          <stop offset="100%" style="stop-color:#10B981"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <circle cx="400" cy="250" r="60" fill="rgba(255,255,255,0.15)"/>
        <path d="M340 380 Q400 320 460 380" stroke="rgba(255,255,255,0.3)" stroke-width="4" fill="none"/>
        <text x="400" y="450" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="system-ui">🏃 Running</text>
      </svg>`
    )}`,
  marathon:
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F59E42"/>
          <stop offset="100%" style="stop-color:#EF4444"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <circle cx="400" cy="250" r="60" fill="rgba(255,255,255,0.15)"/>
        <path d="M340 380 Q400 320 460 380" stroke="rgba(255,255,255,0.3)" stroke-width="4" fill="none"/>
        <text x="400" y="450" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="system-ui">🏅 Maratón</text>
      </svg>`
    )}`,
  trail:
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22C55E"/>
          <stop offset="100%" style="stop-color:#16A6F4"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <polygon points="200,350 400,150 600,350" fill="rgba(255,255,255,0.1)"/>
        <text x="400" y="450" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="system-ui">⛰️ Trail</text>
      </svg>`
    )}`,
  city:
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6"/>
          <stop offset="100%" style="stop-color:#A855F7"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <rect x="250" y="250" width="60" height="150" fill="rgba(255,255,255,0.15)" rx="4"/>
        <rect x="400" y="200" width="60" height="200" fill="rgba(255,255,255,0.1)" rx="4"/>
        <rect x="550" y="280" width="60" height="120" fill="rgba(255,255,255,0.15)" rx="4"/>
        <text x="400" y="500" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="system-ui">🏙️ Ciudad</text>
      </svg>`
    )}`,
  default:
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366F1"/>
          <stop offset="100%" style="stop-color:#8B5CF6"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <circle cx="400" cy="240" r="50" fill="rgba(255,255,255,0.12)"/>
        <path d="M350 340 Q400 300 450 340" stroke="rgba(255,255,255,0.25)" stroke-width="3" fill="none"/>
        <text x="400" y="440" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="system-ui">🏃 Evento</text>
        <text x="400" y="480" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="20" font-family="system-ui">de Atletismo</text>
      </svg>`
    )}`,
  "5k":
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#22C55E"/>
          <stop offset="100%" style="stop-color:#16A34A"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <text x="400" y="320" text-anchor="middle" fill="white" font-size="72" font-weight="bold" font-family="system-ui">5K</text>
        <text x="400" y="420" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="24" font-family="system-ui">Empieza a correr</text>
      </svg>`
    )}`,
  "10k":
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F97316"/>
          <stop offset="100%" style="stop-color:#EF4444"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <text x="400" y="320" text-anchor="middle" fill="white" font-size="72" font-weight="bold" font-family="system-ui">10K</text>
        <text x="400" y="420" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="24" font-family="system-ui">Supera tu récord</text>
      </svg>`
    )}`,
  "21k":
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#9333EA"/>
          <stop offset="100%" style="stop-color:#6B21A8"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <text x="400" y="320" text-anchor="middle" fill="white" font-size="72" font-weight="bold" font-family="system-ui">21K</text>
        <text x="400" y="420" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="24" font-family="system-ui">Medio Maratón</text>
      </svg>`
    )}`,
  "42k":
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#D97706"/>
          <stop offset="100%" style="stop-color:#CA8A04"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <text x="400" y="320" text-anchor="middle" fill="white" font-size="72" font-weight="bold" font-family="system-ui">42K</text>
        <text x="400" y="420" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="24" font-family="system-ui">Maratón Completo</text>
      </svg>`
    )}`,
}

// ---------------------------------------------------------------------------
// CSS gradient fallbacks (when inline SVG isn't desired)
// ---------------------------------------------------------------------------

const FALLBACK_GRADIENTS: Record<FallbackVariant, string> = {
  running: "from-blue-500 to-emerald-500",
  marathon: "from-amber-500 to-red-500",
  trail: "from-green-500 to-sky-500",
  city: "from-violet-500 to-purple-500",
  default: "from-indigo-500 to-violet-500",
  "5k": "from-green-500 to-emerald-600",
  "10k": "from-orange-500 to-red-500",
  "21k": "from-purple-600 to-indigo-700",
  "42k": "from-amber-500 to-yellow-600",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Determine fallback variant from an event category string */
export function getFallbackFromCategory(
  category?: string | null,
): FallbackVariant {
  if (!category) return "default"
  const cat = category.toLowerCase()
  if (cat.includes("trail")) return "trail"
  if (cat.includes("ultra")) return "marathon"
  if (cat.includes("monta") || cat.includes("mountain")) return "trail"
  if (cat.includes("marat") || cat.includes("42")) return "marathon"
  if (cat.includes("asfalto") || cat.includes("road")) return "city"
  return "default"
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageWithFallback({
  src,
  alt,
  fallbackVariant = "default",
  objectFit = "cover",
  wrapperClassName,
  showSkeleton = true,
  unoptimized = false,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  ...rest
}: ImageWithFallbackProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error",
  )
  const [currentSrc, setCurrentSrc] = useState<string | null>(src ?? null)
  const isMounted = useRef(true)

  // Reset state when src changes
  useEffect(() => {
    isMounted.current = true
    if (src) {
      setStatus("loading")
      setCurrentSrc(src)
    } else {
      setStatus("error")
      setCurrentSrc(null)
    }
    return () => {
      isMounted.current = false
    }
  }, [src])

  const handleLoad = useCallback(() => {
    if (isMounted.current) setStatus("loaded")
  }, [])

  const handleError = useCallback(() => {
    if (isMounted.current) {
      setStatus("error")
      setCurrentSrc(null)
    }
  }, [])

  const showFallback = status === "error"
  const isLoading = status === "loading"

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        // Skeleton pulse while loading
        isLoading && showSkeleton && "animate-pulse bg-muted",
        wrapperClassName,
      )}
    >
      {/* Real image */}
      {currentSrc && !showFallback && (
        <>
          {unoptimized ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentSrc}
              alt={alt}
              className={cn(
                "size-full transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100",
                className,
              )}
              style={{
                objectFit,
                width: fill ? "100%" : undefined,
                height: fill ? "100%" : undefined,
              }}
              onLoad={handleLoad}
              onError={handleError}
              loading={priority ? "eager" : "lazy"}
            />
          ) : (
            <Image
              src={currentSrc}
              alt={alt}
              fill={fill}
              width={!fill ? width : undefined}
              height={!fill ? height : undefined}
              priority={priority}
              sizes={sizes}
              className={cn(
                "transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100",
                className,
              )}
              style={{ objectFit }}
              onLoad={handleLoad}
              onError={handleError}
            />
          )}
        </>
      )}

      {/* Fallback */}
      {showFallback && (
        <>
          {/* Inline SVG fallback (works everywhere) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FALLBACK_SVGS[fallbackVariant]}
            alt={alt}
            className={cn("size-full", className)}
            style={{ objectFit: "cover" }}
          />
        </>
      )}

      {/* Screen-reader only alt when fallback */}
      {showFallback && (
        <span className="sr-only">{alt}</span>
      )}
    </div>
  )
}
