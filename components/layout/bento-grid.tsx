import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type BentoCardSize = "xs" | "sm" | "md" | "lg" | "xl"

type BentoLayout = "default" | "explore" | "resources" | "custom"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Layout preset that controls the grid-template-areas arrangement */
  layout?: BentoLayout
  /** Number of columns (only used when layout="custom") */
  columns?: number
}

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Predefined size mapping to grid column/row spans */
  size?: BentoCardSize
  /** When true, renders as the featured/hero card */
  featured?: boolean
}

// ─── Size → span map ─────────────────────────────────────────────────────────

const sizeSpans: Record<
  BentoCardSize,
  { colSpan: string; rowSpan: string }
> = {
  xs: { colSpan: "col-span-1", rowSpan: "row-span-1" },
  sm: { colSpan: "col-span-1", rowSpan: "row-span-1" },
  md: { colSpan: "col-span-1 md:col-span-1", rowSpan: "row-span-1 md:row-span-1" },
  lg: { colSpan: "col-span-1 md:col-span-2", rowSpan: "row-span-1" },
  xl: { colSpan: "col-span-1 md:col-span-2 lg:col-span-2", rowSpan: "row-span-1 md:row-span-2" },
}

// ─── Layout presets ──────────────────────────────────────────────────────────

const layoutGrid: Record<
  BentoLayout,
  { gridClass: string; areasClass?: string }
> = {
  default: {
    gridClass:
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  },
  explore: {
    gridClass:
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  },
  resources: {
    gridClass:
      "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  },
  custom: {
    gridClass: "",
  },
}

// ─── BentoCard ───────────────────────────────────────────────────────────────

function BentoCard({
  className,
  size = "md",
  featured = false,
  children,
  ...props
}: BentoCardProps) {
  const spans = sizeSpans[size]

  return (
    <div
      className={cn(
        // Base card styles
        "group relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm",
        "transition-all duration-300 ease-out",
        // Subtle hover
        "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5",
        // Focus visible
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Featured card emphasis
        featured && "lg:shadow-md",
        // Spans
        spans.colSpan,
        spans.rowSpan,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

BentoCard.displayName = "BentoCard"

// ─── BentoGrid ───────────────────────────────────────────────────────────────

function BentoGrid({
  className,
  layout = "default",
  columns,
  children,
  ...props
}: BentoGridProps) {
  const preset = layoutGrid[layout]

  return (
    <div
      className={cn(
        // Base grid
        "grid auto-rows-auto",
        // Gap: 16px mobile → 20px tablet → 24px desktop
        "gap-4 sm:gap-5 lg:gap-6",
        // Layout preset
        layout === "custom"
          ? columns
            ? `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : preset.gridClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

BentoGrid.displayName = "BentoGrid"

export { BentoGrid, BentoCard }
export type { BentoGridProps, BentoCardProps, BentoCardSize, BentoLayout }
