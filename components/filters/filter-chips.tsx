"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { motion, LayoutGroup } from "framer-motion"

import { cn } from "@/lib/utils"
import { CATEGORY_CONFIG, normalizeCategory } from "@/components/ui/category-badge"

export interface FilterOption {
  /** Valor único del chip */
  value: string
  /** Texto visible */
  label: string
  /** Icono opcional (Lucide) */
  icon?: LucideIcon
  /** Cantidad de resultados para mostrar */
  count?: number
  /** Deshabilitado (no interactivo) */
  disabled?: boolean
  /** Color personalizado (clase Tailwind) — sobreescribe el mapeo automático */
  color?: string
}

export interface FilterChipsProps {
  /** Lista de opciones disponibles */
  options: FilterOption[]
  /** Valores seleccionados actualmente */
  selected: string[]
  /** Callback al cambiar selección */
  onChange: (selected: string[]) => void
  /** Clases adicionales al contenedor */
  className?: string
}

/**
 * Obtiene el color de un chip basado en su valor.
 * Primero usa el color personalizado si existe,
 * luego intenta mapear al sistema de categorías,
 * y finalmente asigna colores por tipo de distancia o ubicación.
 */
function getChipColor(value: string, customColor?: string): string {
  if (customColor) return customColor

  const key = normalizeCategory(value)

  // Mapeo del sistema de categorías (mismos colores que CategoryBadge)
  const colorMap: Record<string, string> = {
    trail: "border-green-600 text-green-600 dark:border-green-500 dark:text-green-400",
    running: "border-primary text-primary",
    ultra: "border-purple-600 text-purple-600 dark:border-purple-500 dark:text-purple-400",
    montaña: "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400",
    asfalto: "border-red-600 text-red-600 dark:border-red-500 dark:text-red-400",
  }

  if (key in colorMap) {
    return colorMap[key]
  }

  // Colores dinámicos por tipo de distancia (5K, 10K, 21K, 42K)
  if (/^\d+k$/i.test(value.trim())) {
    const distColorMap: Record<string, string> = {
      "5k": "border-emerald-500 text-emerald-600 dark:text-emerald-400",
      "10k": "border-cyan-500 text-cyan-600 dark:text-cyan-400",
      "21k": "border-orange-500 text-orange-600 dark:text-orange-400",
      "42k": "border-rose-500 text-rose-600 dark:text-rose-400",
    }
    const normalizedDist = value.trim().toLowerCase()
    if (normalizedDist in distColorMap) {
      return distColorMap[normalizedDist]
    }
  }

  // Colores para ubicaciones (departamentos/ciudades)
  const locationColors: Record<string, string> = {
    medellín: "border-pink-500 text-pink-600 dark:text-pink-400",
    antioquia: "border-pink-500 text-pink-600 dark:text-pink-400",
    bogotá: "border-yellow-500 text-yellow-600 dark:text-yellow-400",
    cundinamarca: "border-yellow-500 text-yellow-600 dark:text-yellow-400",
    cali: "border-violet-500 text-violet-600 dark:text-violet-400",
    valle: "border-violet-500 text-violet-600 dark:text-violet-400",
    bosque: "border-lime-500 text-lime-600 dark:text-lime-400",
  }

  const normalizedValue = value.toLowerCase().trim()
  if (normalizedValue in locationColors) {
    return locationColors[normalizedValue]
  }

  // Color por defecto
  return "border-muted-foreground text-muted-foreground"
}

/**
 * Colores de fondo para chip seleccionado según la categoría.
 */
function getChipSelectedBg(value: string, customColor?: string): string {
  if (customColor) return customColor

  const key = normalizeCategory(value)

  const bgMap: Record<string, string> = {
    trail: "bg-green-600 text-green-50 dark:bg-green-500 dark:text-green-950",
    running: "bg-primary text-primary-foreground",
    ultra: "bg-purple-600 text-purple-50 dark:bg-purple-500 dark:text-purple-950",
    montaña: "bg-blue-600 text-blue-50 dark:bg-blue-500 dark:text-blue-950",
    asfalto: "bg-red-600 text-red-50 dark:bg-red-500 dark:text-red-950",
  }

  if (key in bgMap) {
    return bgMap[key]
  }

  if (/^\d+k$/i.test(value.trim())) {
    const distBgMap: Record<string, string> = {
      "5k": "bg-emerald-500 text-white",
      "10k": "bg-cyan-500 text-white",
      "21k": "bg-orange-500 text-white",
      "42k": "bg-rose-500 text-white",
    }
    const normalizedDist = value.trim().toLowerCase()
    if (normalizedDist in distBgMap) {
      return distBgMap[normalizedDist]
    }
  }

  const locationBgMap: Record<string, string> = {
    medellín: "bg-pink-500 text-white",
    antioquia: "bg-pink-500 text-white",
    bogotá: "bg-yellow-500 text-white",
    cundinamarca: "bg-yellow-500 text-white",
    cali: "bg-violet-500 text-white",
    valle: "bg-violet-500 text-white",
    bosque: "bg-lime-500 text-white",
  }

  const normalizedValue = value.toLowerCase().trim()
  if (normalizedValue in locationBgMap) {
    return locationBgMap[normalizedValue]
  }

  // Fallback: color neutral
  return "bg-foreground text-background"
}

/**
 * FilterChips — Chips horizontales con scroll nativo para filtrar por categorías.
 *
 * - Sin selects tradicionales: chips inline con scroll horizontal suave
 * - Tres estados visuales: default, selected, disabled
 * - Animación Framer Motion: spring + cambio de color al seleccionar
 * - Colores automáticos por categoría (Trail, Running, Ultra, etc.)
 * - Soporta distancias (5K, 10K, 21K, 42K) y ubicaciones (Medellín, Bogotá)
 * - Contador opcional de resultados por chip
 */
export function FilterChips({
  options,
  selected,
  onChange,
  className,
}: FilterChipsProps) {
  const handleToggle = (option: FilterOption) => {
    if (option.disabled) return

    const isSelected = selected.includes(option.value)
    if (isSelected) {
      onChange(selected.filter((s) => s !== option.value))
    } else {
      onChange([...selected, option.value])
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto scroll-smooth-hide py-1",
        className,
      )}
      role="group"
      aria-label="Filtros"
    >
      <LayoutGroup>
        {options.map((option) => {
          const isSelected = selected.includes(option.value)
          const Icon = option.icon

          return (
            <motion.button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => handleToggle(option)}
              layout
              initial={false}
              animate={{
                scale: isSelected ? 1.05 : 1,
              }}
              whileTap={{ scale: 0.92 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.5,
              }}
              className={cn(
                "relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                // Default: outline sutil
                !isSelected &&
                  !option.disabled &&
                  "border-border bg-transparent text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                // Selected: fondo coloreado
                isSelected && !option.disabled && getChipSelectedBg(option.value, option.color),
                // Disabled
                option.disabled &&
                  "cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/40",
              )}
              aria-pressed={isSelected}
              aria-disabled={option.disabled}
            >
              {/* Icono */}
              {Icon && (
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    isSelected ? "text-current" : "text-muted-foreground",
                  )}
                />
              )}

              {/* Label */}
              <span>{option.label}</span>

              {/* Contador */}
              {option.count !== undefined && (
                <motion.span
                  layout
                  className={cn(
                    "-mr-0.5 inline-flex items-center justify-center rounded-full px-1.5 py-0 text-[10px] leading-tight tabular-nums",
                    isSelected
                      ? "bg-white/20 text-current"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {option.count}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </LayoutGroup>
    </div>
  )
}
