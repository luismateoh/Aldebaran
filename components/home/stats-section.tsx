"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, MapPin, Ruler, Users } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StatsSectionProps {
  eventsCount: number
  departmentsCount: number
  /** Number of distinct distances offered across all events. */
  distancesCount?: number
  /** Community size in thousands (e.g. 50 = 50K+). */
  communityCount?: number
}

// ─── Count-up hook ───────────────────────────────────────────────────────────

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target, duration, start])

  return count
}

// ─── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

export function StatsSection({
  eventsCount,
  departmentsCount,
  distancesCount = 6,
  communityCount = 50,
}: StatsSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const events = useCountUp(eventsCount, 2000, isVisible)
  const depts = useCountUp(departmentsCount, 1800, isVisible)
  const dists = useCountUp(distancesCount, 1600, isVisible)
  const community = useCountUp(communityCount, 2400, isVisible)

  const stats = [
    { icon: Calendar, value: events, suffix: "+", label: "Eventos Activos" },
    { icon: MapPin, value: depts, suffix: "", label: "Departamentos" },
    { icon: Ruler, value: dists, suffix: "+", label: "Distancias" },
    { icon: Users, value: community, suffix: "K+", label: "Comunidad" },
  ] as const

  return (
    <section
      ref={ref}
      className="relative z-20 -mt-px border-y border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container py-12 md:py-16">
        <motion.div
          className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-0"
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="flex flex-col items-center justify-center gap-3 text-center md:border-r md:last:border-r-0 md:px-6"
              >
                {/* Icon */}
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="size-6 text-primary" />
                </div>

                {/* Animated value */}
                <div className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                  {stat.value.toLocaleString("es-CO")}
                  <span className="text-primary">{stat.suffix}</span>
                </div>

                {/* Label */}
                <div className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
