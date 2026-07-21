"use client"

import React from "react"
import Image from "next/image"
import { motion, type Variants } from "framer-motion"
import { cn } from "@/lib/utils"

export interface HeroBannerProps {
  title: string
  subtitle: string
  label?: string
  image: string
  actions?: React.ReactNode
  stats?: { value: string; label: string }[]
  className?: string
}

/* ── Animation variants ── */

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
}

const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
}

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
}

const staggerStats: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.6 },
  },
}

const statItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

/* ── Component ── */

export function HeroBanner({
  title,
  subtitle,
  label,
  image,
  actions,
  stats,
  className,
}: HeroBannerProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-screen items-center overflow-hidden",
        className
      )}
    >
      {/* Background image — 21:9 crop via object-cover */}
      <div className="absolute inset-0 z-0">
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Overlay: light 35% near top, dark 60% from bottom */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, hsl(0 0% 0% / 0.20) 0%, hsl(0 0% 0% / 0.35) 30%, hsl(0 0% 0% / 0.60) 70%, hsl(0 0% 0% / 0.80) 100%)",
        }}
      />

      {/* Decorative gradient orbs reusing the project style */}
      <div className="pointer-events-none absolute -right-40 top-1/4 z-[1] h-96 w-96 rounded-full bg-primary/15 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 z-[1] h-80 w-80 rounded-full bg-orange-600/10 blur-[100px]" />

      {/* Content grid: left 55-60%, right 40-45% */}
      <div className="container relative z-10 w-full py-24">
        <motion.div
          className="grid items-center gap-12 lg:grid-cols-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* ── Left column ── */}
          <div className="lg:col-span-7 xl:col-span-6">
            {/* Label */}
            {label && (
              <motion.div variants={fadeSlideUp}>
                <span className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-primary" />
                  </span>
                  {label}
                </span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              variants={fadeSlideUp}
              className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
            >
              {title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeSlideUp}
              className="mt-6 max-w-xl text-lg text-white/80 md:text-xl"
            >
              {subtitle}
            </motion.p>

            {/* Actions (CTAs) */}
            {actions && (
              <motion.div
                variants={fadeIn}
                className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                {actions}
              </motion.div>
            )}

            {/* Stats */}
            {stats && stats.length > 0 && (
              <motion.div
                variants={staggerStats}
                initial="hidden"
                animate="visible"
                className="mt-14 flex flex-wrap gap-x-10 gap-y-4"
              >
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    variants={statItem}
                    className="flex items-center gap-2 text-white/70"
                  >
                    <span className="text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                    <span className="text-sm text-white/60">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* ── Right column (optional — can hold complementary image / empty) ── */}
          <div className="hidden lg:col-span-5 lg:block xl:col-span-6" />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-6 text-white/50"
          aria-hidden="true"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </motion.div>
    </section>
  )
}
