"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import {
  ArrowDown,
  MapIcon,
  X,
  SlidersHorizontal,
  ChevronDown,
  Search,
  MapPin,
} from "lucide-react"

import { useEventsRealtime } from "@/hooks/use-events-realtime"
import type { EventData } from "@/lib/types"
import { cn } from "@/lib/utils"

import { EventSearch } from "@/components/search/event-search"
import { FilterChips, type FilterOption } from "@/components/filters/filter-chips"
import { EventsMapWrapper } from "@/components/home/events-map-wrapper"
import EventCard from "@/components/cards/event-card"
import FeaturedEventCard from "@/components/cards/featured-event-card"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { OrganizerCTA } from "@/components/cta/organizer-cta"
import { Button } from "@/components/ui/button"

/* ── Sort options ── */
type SortOption = "date-asc" | "date-desc" | "popular" | "name"

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-asc", label: "Más próximas" },
  { value: "date-desc", label: "Más lejanas" },
  { value: "popular", label: "Más populares" },
  { value: "name", label: "A–Z" },
]

/* ── Quick filter chips ── */
const QUICK_FILTERS: FilterOption[] = [
  { value: "trail", label: "Trail" },
  { value: "running", label: "Running" },
  { value: "ultra", label: "Ultra" },
  { value: "5k", label: "5K" },
  { value: "10k", label: "10K" },
  { value: "21k", label: "21K" },
  { value: "42k", label: "42K" },
]

/* ── Config ── */
const FEATURED_INTERVAL = 7
const PAGE_SIZE = 12

/* ── Card animation variants ── */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeOut" as const },
  }),
}

export default function EventsPage() {
  /* ── Data ── */
  const { events, loading, error } = useEventsRealtime()

  /* ── Local state ── */
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("date-asc")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [mapVisible, setMapVisible] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  /* ── Handlers ── */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleFiltersChange = useCallback((filters: string[]) => {
    setSelectedFilters(filters)
  }, [])

  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedFilters([])
  }, [])

  const handleMapSelect = useCallback((id: string) => {
    setSelectedEventId(id)
  }, [])

  /* ── Client-side filtering & sorting ── */
  const filteredEvents = useMemo(() => {
    let result = [...events]

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.municipality?.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.distances?.some((d) => {
            const dStr = typeof d === "string" ? d : (d as { value: string }).value
            return dStr?.toLowerCase().includes(q)
          }),
      )
    }

    // Filter chips
    if (selectedFilters.length > 0) {
      result = result.filter((e) =>
        selectedFilters.some((filter) => {
          const f = filter.toLowerCase()
          if (e.category?.toLowerCase().includes(f)) return true
          if (
            e.distances?.some((d) => {
              const dStr = typeof d === "string" ? d : (d as { value: string }).value
              return dStr?.toLowerCase().includes(f)
            })
          )
            return true
          return false
        }),
      )
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        case "date-desc":
          return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        case "popular":
          return (b.likesCount ?? 0) - (a.likesCount ?? 0)
        case "name":
          return (a.title ?? "").localeCompare(b.title ?? "")
        default:
          return 0
      }
    })

    return result
  }, [events, searchQuery, selectedFilters, sortBy])

  const visibleEvents = useMemo(
    () => filteredEvents.slice(0, visibleCount),
    [filteredEvents, visibleCount],
  )

  const totalCount = filteredEvents.length
  const hasActiveFilters = searchQuery.trim().length > 0 || selectedFilters.length > 0

  return (
    <>
      {/* ════════════════════════════════════════
          HERO (420–500 px)
          ════════════════════════════════════════ */}
      <section className="relative flex min-h-[420px] items-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 md:min-h-[500px]">
        {/* Decorative blobs */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-orange-500/8 blur-[100px]" />

        <div className="container relative z-10 w-full py-16 md:py-20">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Title */}
            <h1 className="font-heading text-heading-1 font-bold md:text-hero">
              Encuentra tu{" "}
              <span className="text-gradient">próxima carrera</span>
            </h1>

            {/* Subtitle with event count */}
            <p className="mt-4 text-body-large text-muted-foreground">
              {loading
                ? "Cargando eventos…"
                : `${events.length} ${events.length === 1 ? "carrera" : "carreras"} en Colombia esperan por ti`}
            </p>

            {/* EventSearch */}
            <div className="mx-auto mt-8 max-w-xl">
              <EventSearch
                value={searchQuery}
                onSearch={handleSearch}
                onChange={(q) => setSearchQuery(q)}
                placeholder="Buscar por nombre, lugar, distancia…"
              />
            </div>

            {/* FilterChips */}
            <div className="mt-6 flex justify-center">
              <FilterChips
                options={QUICK_FILTERS}
                selected={selectedFilters}
                onChange={handleFiltersChange}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          MAIN: Map sidebar + Results grid
          ════════════════════════════════════════ */}
      <section className="section-spacing bg-background">
        <div className="wide-container">
          {/* ── Toolbar: count + sort ── */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-body font-semibold text-foreground">
                {loading ? (
                  <span className="inline-block h-5 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  <>
                    <span className="text-primary">{totalCount}</span>{" "}
                    {totalCount === 1
                      ? "carrera encontrada"
                      : "carreras encontradas"}
                  </>
                )}
              </p>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-3" />
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                aria-label="Ordenar eventos"
                aria-expanded={showSortDropdown}
                aria-haspopup="true"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface-hover"
              >
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <span className="hidden sm:inline">Ordenar:</span>
                <span className="font-medium">
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    showSortDropdown && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-surface py-1 shadow-xl"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value)
                          setShowSortDropdown(false)
                        }}
                        className={cn(
                          "flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors",
                          sortBy === option.value
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-foreground hover:bg-surface-hover",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Map + Results flex layout ── */}
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Map sidebar — 40% on desktop, collapsible on mobile */}
            <div
              className={cn(
                "lg:w-[40%] lg:shrink-0",
                "max-lg:mb-4",
                mapVisible ? "block" : "hidden lg:block",
              )}
            >
              <div className="lg:sticky lg:top-24">
                <div className="overflow-hidden rounded-2xl border border-border shadow-md">
                  <EventsMapWrapper
                    events={filteredEvents}
                    selectedEvent={selectedEventId}
                    onSelectEvent={handleMapSelect}
                    height="600px"
                    showPopup
                  />
                </div>
              </div>
            </div>

            {/* Results — 60% on desktop */}
            <div className="min-w-0 flex-1">
              {/* ── Loading state ── */}
              {loading && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} variant="event-card" count={1} />
                  ))}
                </div>
              )}

              {/* ── Error state ── */}
              {error && !loading && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-12 text-center">
                  <div className="mb-4 rounded-full bg-destructive/10 p-4">
                    <Search className="size-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    Error al cargar eventos
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              )}

              {/* ── Empty state ── */}
              {!loading && !error && totalCount === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-16 text-center"
                >
                  <div className="mb-6 rounded-full bg-muted p-6">
                    <MapPin className="size-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-heading-4 font-semibold">
                    No encontramos carreras
                  </h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    {hasActiveFilters
                      ? "Intenta con otros filtros o cambia tu búsqueda"
                      : "Aún no hay eventos publicados. ¡Vuelve pronto!"}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      className="mt-6"
                      onClick={handleClearFilters}
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </motion.div>
              )}

              {/* ── Results grid ── */}
              {!loading && !error && totalCount > 0 && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {visibleEvents.map((event, index) => {
                      const showFeatured =
                        (index + 1) % FEATURED_INTERVAL === 0 && index > 0

                      if (showFeatured) {
                        return (
                          <motion.div
                            key={`featured-${event.id}`}
                            className="md:col-span-2 lg:col-span-3"
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            custom={index}
                          >
                            <FeaturedEventCard
                              event={event}
                              saved={savedIds.has(event.id ?? "")}
                              onSave={handleSave}
                            />
                          </motion.div>
                        )
                      }

                      return (
                        <motion.div
                          key={event.id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          custom={index}
                        >
                          <EventCard
                            event={event}
                            saved={savedIds.has(event.id ?? "")}
                            onSave={handleSave}
                          />
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Load more */}
                  {visibleCount < totalCount && (
                    <motion.div
                      className="mt-10 flex justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-2 rounded-xl px-8"
                        onClick={() =>
                          setVisibleCount((prev) => prev + PAGE_SIZE)
                        }
                      >
                        <ArrowDown className="size-4" />
                        Mostrar más carreras
                        <span className="text-muted-foreground">
                          ({totalCount - visibleCount} restantes)
                        </span>
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          Organizer CTA
          ════════════════════════════════════════ */}
      <OrganizerCTA />

      {/* ════════════════════════════════════════
          Floating map toggle (mobile / tablet)
          ════════════════════════════════════════ */}
      <AnimatePresence>
        {!mapVisible && (
          <motion.button
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            aria-label="Ver mapa"
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 lg:hidden"
            onClick={() => setMapVisible(true)}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-xl">
              <MapIcon className="size-4" />
              Ver mapa
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile map overlay */}
      <AnimatePresence>
        {mapVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background lg:hidden"
          >
            <div className="relative h-full">
              <EventsMapWrapper
                events={filteredEvents}
                selectedEvent={selectedEventId}
                onSelectEvent={handleMapSelect}
                height="100%"
                showPopup
              />
              <button
                onClick={() => setMapVisible(false)}
                aria-label="Cerrar mapa"
                className="absolute left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-surface-hover"
              >
                <X className="size-4" />
                Cerrar mapa
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
