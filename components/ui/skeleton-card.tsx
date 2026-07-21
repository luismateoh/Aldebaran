import * as React from "react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

/* -------------------------------------------------------------------------- */
/*  Variantes de SkeletonCard                                                 */
/* -------------------------------------------------------------------------- */

export type SkeletonCardVariant =
  | "event-card"
  | "featured-event-card"
  | "resource-card"
  | "stat-card"
  | "hero"

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variante del skeleton */
  variant?: SkeletonCardVariant
  /** Número de elementos a mostrar (solo para variantes que lo soporten) */
  count?: number
}

/**
 * Componente SkeletonCard - Esqueletos para cards y secciones.
 *
 * Variantes:
 * - event-card:           Card de evento estándar (imagen + info + badge)
 * - featured-event-card:  Card de evento destacado (más grande)
 * - resource-card:        Card de recurso/artículo
 * - stat-card:            Card de estadística (número + etiqueta)
 * - hero:                 Sección hero completa
 */
function SkeletonCard({
  className,
  variant = "event-card",
  count = 1,
  ...props
}: SkeletonCardProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCardInner key={i} variant={variant} />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Inner render por variante                                                 */
/* -------------------------------------------------------------------------- */

function SkeletonCardInner({ variant }: { variant: SkeletonCardVariant }) {
  switch (variant) {
    case "featured-event-card":
      return <FeaturedEventCardSkeleton />
    case "resource-card":
      return <ResourceCardSkeleton />
    case "stat-card":
      return <StatCardSkeleton />
    case "hero":
      return <HeroSkeleton />
    case "event-card":
    default:
      return <EventCardSkeleton />
  }
}

/* -------------------------------------------------------------------------- */
/*  Event Card                                                                */
/* -------------------------------------------------------------------------- */

function EventCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Image placeholder */}
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-16 rounded-full" />
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        {/* Meta info */}
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Featured Event Card (más grande)                                          */
/* -------------------------------------------------------------------------- */

function FeaturedEventCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card shadow-md">
      {/* Large image */}
      <Skeleton className="aspect-[21/9] w-full rounded-none sm:aspect-[3/1]" />
      {/* Overlay effect */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-full max-w-lg bg-white/20" />
        <Skeleton className="h-8 w-3/4 max-w-md bg-white/20" />
        <div className="flex items-center gap-4 pt-1">
          <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
          <Skeleton className="h-5 w-32 bg-white/20" />
          <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
          <Skeleton className="h-5 w-28 bg-white/20" />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Resource Card (artículo / blog)                                           */
/* -------------------------------------------------------------------------- */

function ResourceCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Thumbnail */}
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        {/* Badge */}
        <Skeleton className="h-4 w-14 rounded-full" />
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        {/* Description */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        {/* Author & date */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Stat Card (estadísticas / métricas)                                       */
/* -------------------------------------------------------------------------- */

function StatCardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border bg-card p-6 shadow-sm">
      {/* Icon */}
      <Skeleton className="h-10 w-10 rounded-full" />
      {/* Number */}
      <Skeleton className="h-9 w-20" />
      {/* Label */}
      <Skeleton className="h-4 w-28" />
      {/* Trend indicator */}
      <Skeleton className="mt-1 h-3 w-16" />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Hero Section                                                              */
/* -------------------------------------------------------------------------- */

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-none">
      {/* Background */}
      <Skeleton className="h-[60vh] w-full rounded-none sm:h-[70vh]" />
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        {/* Tagline */}
        <Skeleton className="h-5 w-40 bg-white/20" />
        {/* Main title */}
        <Skeleton className="h-12 w-full max-w-2xl bg-white/20" />
        <Skeleton className="h-12 w-3/4 max-w-xl bg-white/20" />
        {/* Description */}
        <Skeleton className="mt-2 h-5 w-full max-w-lg bg-white/20" />
        <Skeleton className="h-5 w-2/3 max-w-md bg-white/20" />
        {/* CTA buttons */}
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-11 w-36 rounded-lg bg-white/30" />
          <Skeleton className="h-11 w-36 rounded-lg bg-white/20" />
        </div>
      </div>
    </div>
  )
}

export { SkeletonCard }
