/**
 * Placeholder utilities for Aldebaran.
 *
 * Provides helpers for generating inline SVG gradient placeholders.
 * These avoid external dependencies and work offline.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PlaceholderVariant =
  | "running"
  | "marathon"
  | "trail"
  | "city"
  | "default"
  | "5k"
  | "10k"
  | "21k"
  | "42k"

// ---------------------------------------------------------------------------
// Gradient maps
// ---------------------------------------------------------------------------

/**
 * Tailwind CSS gradient classes per variant (from → to).
 * Use these as `bg-gradient-to-br ${gradient}`.
 */
export const PLACEHOLDER_GRADIENTS: Record<PlaceholderVariant, string> = {
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

/**
 * CSS custom property gradients per variant.
 * Use these for inline styles or non-Tailwind environments.
 */
export const PLACEHOLDER_CSS_GRADIENTS: Record<PlaceholderVariant, string> = {
  running: "linear-gradient(135deg, #3B82F6, #10B981)",
  marathon: "linear-gradient(135deg, #F59E42, #EF4444)",
  trail: "linear-gradient(135deg, #22C55E, #16A6F4)",
  city: "linear-gradient(135deg, #8B5CF6, #A855F7)",
  default: "linear-gradient(135deg, #6366F1, #8B5CF6)",
  "5k": "linear-gradient(135deg, #22C55E, #16A34A)",
  "10k": "linear-gradient(135deg, #F97316, #EF4444)",
  "21k": "linear-gradient(135deg, #9333EA, #6B21A8)",
  "42k": "linear-gradient(135deg, #D97706, #CA8A04)",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Get the appropriate placeholder variant from an event category string.
 */
export function getPlaceholderVariant(category?: string | null): PlaceholderVariant {
  if (!category) return "default"
  const cat = category.toLowerCase()
  if (cat.includes("trail")) return "trail"
  if (cat.includes("ultra")) return "marathon"
  if (cat.includes("monta") || cat.includes("mountain")) return "trail"
  if (cat.includes("marat") || cat.includes("42")) return "marathon"
  if (cat.includes("asfalto") || cat.includes("road")) return "city"
  return "default"
}

/**
 * Get a placeholder background URL for a given variant.
 * Returns a data-URI SVG gradient.
 */
export function getPlaceholderDataUri(variant: PlaceholderVariant): string {
  return PLACEHOLDER_SVGS[variant]
}

/**
 * Check if an image URL is valid (basic check).
 * Returns true for relative paths and absolute URLs.
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || url.trim() === "") return false
  return url.startsWith("/") || url.startsWith("http") || url.startsWith("data:")
}

// ---------------------------------------------------------------------------
// SVG data URIs (identical to ImageWithFallback's internal ones)
// ---------------------------------------------------------------------------

const PLACEHOLDER_SVGS: Record<PlaceholderVariant, string> = {
  running:
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6"/>
          <stop offset="100%" style="stop-color:#10B981"/>
        </linearGradient></defs>
        <rect width="800" height="600" fill="url(#g)"/>
        <circle cx="400" cy="250" r="60" fill="rgba(255,255,255,0.15)"/>
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
