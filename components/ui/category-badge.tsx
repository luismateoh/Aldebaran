import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Categorías reconocidas por el sistema con su color asociado:
 * - Trail → Verde (success)
 * - Running → Naranja (primary)
 * - Ultra → Morado
 * - Montaña → Azul
 * - Asfalto → Rojo (destructive)
 */
const CATEGORY_CONFIG = {
  trail: {
    label: "Trail",
    color: {
      default: "bg-green-600 text-green-50 dark:bg-green-500 dark:text-green-950",
      outline: "border-green-600 text-green-600 dark:border-green-500 dark:text-green-400",
      ghost: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    },
  },
  running: {
    label: "Running",
    color: {
      default: "bg-primary text-primary-foreground",
      outline: "border-primary text-primary",
      ghost: "bg-primary/10 text-primary",
    },
  },
  ultra: {
    label: "Ultra",
    color: {
      default: "bg-purple-600 text-purple-50 dark:bg-purple-500 dark:text-purple-950",
      outline: "border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400",
      ghost: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    },
  },
  montaña: {
    label: "Montaña",
    color: {
      default: "bg-blue-600 text-blue-50 dark:bg-blue-500 dark:text-blue-950",
      outline: "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400",
      ghost: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    },
  },
  asfalto: {
    label: "Asfalto",
    color: {
      default: "bg-red-600 text-red-50 dark:bg-red-500 dark:text-red-950",
      outline: "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400",
      ghost: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    },
  },
} as const

const SIZE_CLASSES = {
  sm: "px-1.5 py-0.5 text-[10px] leading-3",
  default: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
} as const

export type CategoryKey = keyof typeof CATEGORY_CONFIG

/**
 * Normaliza un nombre de categoría a su clave canónica.
 * Soporta variaciones como "trail running", "montana" (sin tilde),
 * "asphalt", "road", "mountain", etc.
 */
function normalizeCategory(category: string): CategoryKey {
  const normalized = category.toLowerCase().trim()

  // Mapeo de variaciones conocidas
  if (/trail/.test(normalized)) return "trail"
  if (/running|calle|ruta/.test(normalized)) return "running"
  if (/ultra/.test(normalized)) return "ultra"
  if (/montaña|montana|mountain|montañ|senderismo/.test(normalized)) return "montaña"
  if (/asfalto|asphalt|road|pavimento|ciudad/.test(normalized)) return "asfalto"

  // Fallback: Running como categoría por defecto
  return "running"
}

export interface CategoryBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Nombre de la categoría (soporta español e inglés) */
  category: string
  /** Tamaño del badge */
  size?: keyof typeof SIZE_CLASSES
  /** Variante visual */
  variant?: "default" | "outline" | "ghost"
}

/**
 * Badge para categorías de carreras.
 * Cada categoría tiene un color distintivo:
 * Trail (verde), Running (naranja), Ultra (morado),
 * Montaña (azul), Asfalto (rojo).
 */
function CategoryBadge({
  className,
  category,
  size = "default",
  variant = "default",
  ...props
}: CategoryBadgeProps) {
  const key = normalizeCategory(category)
  const config = CATEGORY_CONFIG[key]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        SIZE_CLASSES[size],
        config.color[variant],
        variant !== "outline" && "border-transparent",
        className,
      )}
      aria-label={`Categoría: ${config.label}`}
      role="status"
      {...props}
    >
      {config.label}
    </span>
  )
}

export { CategoryBadge, normalizeCategory, CATEGORY_CONFIG }
