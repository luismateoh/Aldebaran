"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { BentoGrid, BentoCard } from "@/components/layout/bento-grid"
import { cn } from "@/lib/utils"
import {
  Trees,
  Zap,
  Flag,
  Mountain,
  Route,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import {
  ImageWithFallback,
  getFallbackFromCategory,
} from "@/components/ui/image-with-fallback"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CategoryConfig {
  id: string
  name: string
  description: string
  count: number
  icon: LucideIcon
  /** Gradient from‑to classes (e.g. "from-green-600 to-emerald-900"). */
  gradient: string
  /** Background image path (replaces gradient when available). */
  image?: string
}

export interface ExploreCategoriesProps {
  /** Categories to display. Falls back to defaults when omitted. */
  categories?: CategoryConfig[]
  /** Called when a category is clicked – overrides default Link navigation. */
  onCategoryClick?: (category: CategoryConfig) => void
}

// ─── Default categories ──────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  {
    id: "trail",
    name: "Trail Running",
    description: "Carreras por senderos de montaña y naturaleza",
    count: 24,
    icon: Trees,
    gradient: "from-emerald-600 to-emerald-950",
    image: "/images/categories/trail.jpg",
  },
  {
    id: "running",
    name: "Running",
    description: "Carreras de calle y ruta en toda Colombia",
    count: 42,
    icon: Zap,
    gradient: "from-orange-600 to-red-950",
    image: "/images/categories/running.jpg",
  },
  {
    id: "ultra",
    name: "Ultra",
    description: "Desafíos de ultrafondo y resistencia extrema",
    count: 12,
    icon: Flag,
    gradient: "from-purple-600 to-purple-950",
    image: "/images/categories/ultra.jpg",
  },
  {
    id: "montaña",
    name: "Montaña",
    description: "Ascensos y carreras de alta montaña",
    count: 18,
    icon: Mountain,
    gradient: "from-blue-600 to-blue-950",
    image: "/images/categories/montana.jpg",
  },
  {
    id: "asfalto",
    name: "Asfalto",
    description: "Ritmo urbano sobre el asfalto colombiano",
    count: 30,
    icon: Route,
    gradient: "from-red-600 to-rose-950",
    image: "/images/categories/asfalto.jpg",
  },
]

// ─── Animation variants ──────────────────────────────────────────────────────

const sectionVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

// ─── Category Card ───────────────────────────────────────────────────────────

interface CategoryCardProps {
  category: CategoryConfig
  featured?: boolean
  onCategoryClick?: (category: CategoryConfig) => void
}

function CategoryCard({
  category,
  featured,
  onCategoryClick,
}: CategoryCardProps) {
  const Icon = category.icon
  const href = `/events?category=${category.id}`

  const content = (
    <div className="relative flex h-full w-full flex-col justify-end overflow-hidden">
      {/* Background gradient (fallback while image loads, or if image is missing) */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", category.gradient)} />

      {/* Background image */}
      {category.image && (
        <div className="absolute inset-0">
          <ImageWithFallback
            src={category.image}
            alt=""
            fill
            className="object-cover"
            fallbackVariant={getFallbackFromCategory(category.id)}
            showSkeleton={false}
            wrapperClassName="h-full w-full"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={featured}
          />
        </div>
      )}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-6">
        {/* Icon */}
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon className="size-5 text-white" />
        </div>

        {/* Category name */}
        <h3 className="text-xl font-bold text-white md:text-2xl">
          {category.name}
        </h3>

        {/* Description (only for featured) */}
        {featured && (
          <p className="mt-1.5 text-sm text-white/70 line-clamp-2">
            {category.description}
          </p>
        )}

        {/* Event count + arrow */}
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            {category.count} carreras
          </span>
          <ArrowRight className="size-4 text-white/60 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  )

  if (onCategoryClick) {
    return (
      <button
        type="button"
        onClick={() => onCategoryClick(category)}
        className="block h-full w-full text-left focus-visible:outline-none"
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className="block h-full w-full focus-visible:outline-none"
      aria-label={`Ver eventos de ${category.name}`}
    >
      {content}
    </Link>
  )
}

// ─── Section component ───────────────────────────────────────────────────────

export function ExploreCategories({
  categories = DEFAULT_CATEGORIES,
  onCategoryClick,
}: ExploreCategoriesProps) {
  // First card is featured (larger), rest are secondary
  const [featured, ...rest] = categories

  return (
    <section className="section-spacing relative overflow-hidden">
      {/* Section heading */}
      <div className="container mb-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Explora por categoría
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Encuentra tu
            <span className="text-gradient"> estilo </span>
            de carrera
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Desde el asfalto de la ciudad hasta los senderos de montaña, elige tu
            próxima aventura
          </p>
        </div>
      </div>

      {/* Bento grid */}
      <div className="container">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <BentoGrid layout="explore">
            {/* Featured card — takes 2 columns */}
            <motion.div
              key={featured.id}
              variants={cardVariants}
              className="col-span-1 sm:col-span-2 lg:col-span-2"
            >
              <BentoCard
                size="xl"
                featured
                className="group overflow-hidden rounded-2xl border-0 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              >
                <CategoryCard
                  category={featured}
                  featured
                  onCategoryClick={onCategoryClick}
                />
              </BentoCard>
            </motion.div>

            {/* Secondary cards */}
            {rest.map((cat) => (
              <motion.div key={cat.id} variants={cardVariants}>
                <BentoCard
                  size="md"
                  className="group overflow-hidden rounded-2xl border-0 shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                >
                  <CategoryCard
                    category={cat}
                    onCategoryClick={onCategoryClick}
                  />
                </BentoCard>
              </motion.div>
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </section>
  )
}
