"use client"

import { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Calendar, MapPin, Heart, Share2, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import type { EventData } from "@/lib/types"
import { CategoryBadge } from "@/components/ui/category-badge"
import { Button } from "@/components/ui/button"
import { ImageWithFallback, getFallbackFromCategory } from "@/components/ui/image-with-fallback"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EventDetailHeroProps {
  event: EventData
  className?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatHeroDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const formatted = format(date, "EEEE, d 'de' MMMM 'del' yyyy", {
      locale: es,
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  } catch {
    return dateString
  }
}

// ---------------------------------------------------------------------------
// Animation variants — typed as const tuples for framer-motion v12
// ---------------------------------------------------------------------------

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const springUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

// ---------------------------------------------------------------------------
// EventDetailHero
// ---------------------------------------------------------------------------

export function EventDetailHero({ event, className }: EventDetailHeroProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formattedDate = formatHeroDate(event.eventDate)
  const location = [event.municipality, event.department].filter(Boolean).join(", ")

  // --- Category-based gradient fallback ---
  const gradientFallback = (() => {
    const cat = (event.category ?? "").toLowerCase()
    if (/trail/.test(cat))
      return "from-green-900 via-emerald-800 to-teal-900"
    if (/ultra/.test(cat))
      return "from-purple-900 via-violet-800 to-indigo-900"
    if (/montaña|montana|mountain/.test(cat))
      return "from-blue-900 via-sky-800 to-cyan-900"
    if (/asfalto|road/.test(cat))
      return "from-red-900 via-rose-800 to-orange-900"
    return "from-primary/90 via-primary/60 to-primary/40"
  })()

  const registrationHref = event.registrationUrl || event.website || "#"
  const registrationTarget =
    event.registrationUrl || event.website ? "_blank" : undefined

  return (
    <>
      {/* ============ HERO ============ */}
      <section
        className={cn(
          "relative h-[50vh] overflow-hidden md:h-[60vh] lg:h-[80vh]",
          className,
        )}
      >
        {/* Background image */}
        <div className="absolute inset-0">
          {event.cover ? (
            <ImageWithFallback
              src={event.cover}
              alt={event.title}
              fill
              priority
              sizes="100vw"
              fallbackVariant={getFallbackFromCategory(event.category)}
              wrapperClassName="absolute inset-0"
              className="object-cover"
              unoptimized={!event.cover.startsWith('/') && !event.cover.startsWith('data:')}
            />
          ) : null}

          {/* Gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t",
              event.cover
                ? "from-black/70 via-black/40 to-black/30"
                : `bg-gradient-to-br ${gradientFallback}`,
            )}
          />
        </div>

        {/* Foreground content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
          className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 lg:px-8"
        >
          {/* Badge */}
          <motion.div variants={springUp}>
            <CategoryBadge
              category={event.category || "running"}
              size="lg"
              variant="ghost"
              className="mb-4 border-white/30 text-white [&>span]:text-white"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={springUp}
            className="max-w-4xl font-heading text-hero-xl leading-tight text-white drop-shadow-lg"
          >
            {event.title}
          </motion.h1>

          {/* Location + date */}
          <motion.div
            variants={springUp}
            className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80"
          >
            {location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
          </motion.div>

          {/* Distances */}
          {event.distances &&
            Array.isArray(event.distances) &&
            event.distances.length > 0 && (
              <motion.div
                variants={springUp}
                className="mt-4 flex flex-wrap gap-2"
              >
                {event.distances.map((d: unknown, i: number) => {
                  const val =
                    typeof d === "string"
                      ? d
                      : (d as { value?: string })?.value ?? String(d)
                  return (
                    <span
                      key={`hero-dist-${i}`}
                      className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm"
                    >
                      {val}
                    </span>
                  )
                })}
              </motion.div>
            )}

          {/* Action buttons */}
          <motion.div
            variants={springUp}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              className="rounded-full px-8 font-semibold shadow-lg"
              asChild
            >
              <a
                href={registrationHref}
                target={registrationTarget}
                rel={registrationTarget ? "noopener noreferrer" : undefined}
              >
                Inscribirme
              </a>
            </Button>
            <Button variant="secondary" size="lg" className="rounded-full">
              <Heart className="h-4 w-4" />
              Guardar
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll-down indicator (desktop only) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block"
        >
          <ChevronDown aria-hidden="true" className="h-6 w-6 animate-bounce text-white/40" />
        </motion.div>
      </section>

      {/* ============ MOBILE FLOATING CTA ============ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 p-4 backdrop-blur-xl md:hidden">
        <Button
          size="lg"
          className="w-full rounded-full font-semibold shadow-lg"
          asChild
        >
          <a
            href={registrationHref}
            target={registrationTarget}
            rel={registrationTarget ? "noopener noreferrer" : undefined}
          >
            Inscribirme
          </a>
        </Button>
      </div>
    </>
  )
}
