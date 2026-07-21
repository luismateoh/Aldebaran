"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"
import { Eye, Zap, Users, ArrowRight } from "lucide-react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrganizerCTAProps {
  title?: string
  subtitle?: string
  image?: string
  className?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BENEFITS = [
  {
    icon: Eye,
    label: "Más visibilidad",
    description: "Tu evento llegará a miles de atletas en todo Colombia",
  },
  {
    icon: Zap,
    label: "Fácil y rápido",
    description: "Publica en minutos sin complicaciones técnicas",
  },
  {
    icon: Users,
    label: "Comunidad activa",
    description: "Conecta con una red apasionada por el atletismo",
  },
] as const

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrganizerCTA({
  title = "¿Organizas eventos de atletismo?",
  subtitle = "Publica tu carrera en Aldebaran y llega a la comunidad runner más grande de Colombia. Es gratis, fácil y efectivo.",
  image = "/images/cta/organizadores.jpg",
  className = "",
}: OrganizerCTAProps) {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 },
    )

    const current = ref.current
    if (current) observer.observe(current)
    return () => {
      if (current) observer.unobserve(current)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setScrollY(window.scrollY)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section
      ref={ref}
      className={`relative flex min-h-[520px] items-center overflow-hidden md:min-h-[560px] ${className}`}
    >
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.12}px) scale(1.1)` }}
      >
        <Image
          src={image}
          alt="Organizadores de eventos de atletismo"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/40" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-32 top-1/2 z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />

      {/* Content */}
      <motion.div
        className="container relative z-20 py-20"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <div className="max-w-3xl">
          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="font-heading text-heading-1 font-bold text-white md:text-hero"
          >
            {title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-4 max-w-xl text-body-large text-white/80 md:text-heading-4"
          >
            {subtitle}
          </motion.p>

          {/* Benefits */}
          <motion.div
            variants={itemVariants}
            className="mt-10 grid gap-4 sm:grid-cols-3"
          >
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div
                  key={benefit.label}
                  className="flex items-start gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/30">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {benefit.label}
                    </p>
                    <p className="mt-0.5 text-xs text-white/70">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants} className="mt-8">
            <Link
              href="/crear-evento"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/40"
            >
              Publicar mi evento
              <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
