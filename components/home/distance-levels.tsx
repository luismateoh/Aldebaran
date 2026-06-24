"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Flame, Zap, Mountain, Crown } from "lucide-react"
import Image from "next/image"
import type { EventData } from "@/types"

interface DistanceLevelsProps {
  events: EventData[]
}

interface DistanceLevel {
  id: string
  label: string
  range: string
  title: string
  description: string
  icon: typeof Flame
  gradient: string
  glow: string
  level: string
  tip: string
}

const DISTANCE_LEVELS: DistanceLevel[] = [
  {
    id: "5k",
    label: "5K",
    range: "3-7 km",
    title: "Empieza a correr",
    description: "La distancia perfecta para iniciarte. Ideal para principiantes y carreras familiares.",
    icon: Zap,
    gradient: "from-green-500 to-emerald-600",
    glow: "bg-green-500/20",
    level: "Principiante",
    tip: "~30 min de carrera",
    image: "/images/distances/5k.jpg",
  },
  {
    id: "10k",
    label: "10K",
    range: "8-12 km",
    title: "Supera tu récord",
    description: "El desafío favorito de los corredores populares. Fuerza, ritmo y constancia.",
    icon: Flame,
    gradient: "from-orange-500 to-red-500",
    glow: "bg-orange-500/20",
    level: "Intermedio",
    tip: "~50-60 min de carrera",
    image: "/images/distances/10k.jpg",
  },
  {
    id: "21k",
    label: "21K",
    range: "15-25 km",
    title: "Medio maratón",
    description: "Para corredores con experiencia. Resistencia, estrategia y mentalidad fuerte.",
    icon: Mountain,
    gradient: "from-purple-600 to-indigo-700",
    glow: "bg-purple-500/20",
    level: "Avanzado",
    tip: "~1h 45min - 2h 30min",
    image: "/images/distances/21k.jpg",
  },
  {
    id: "42k",
    label: "42K",
    range: "30+ km",
    title: "El gran reto",
    description: "El maratón completo. El máximo desafío del running. Solo para los más preparados.",
    icon: Crown,
    gradient: "from-amber-500 to-yellow-600",
    glow: "bg-amber-500/20",
    level: "Experto",
    tip: "~3h 30min - 5h",
    image: "/images/distances/42k.jpg",
  },
]

export function DistanceLevels({ events }: DistanceLevelsProps) {
  const countEventsByDistance = (levelId: string, range: string) => {
    const [min, max] = range.split("-").map(s => parseInt(s.match(/\d+/)?.[0] || "0"))
    return events.filter(event => {
      if (!event.distances || event.distances.length === 0) return false
      return event.distances.some(d => {
        const val = typeof d === "string" ? d : d.value
        const num = parseInt(val.match(/\d+/)?.[0] || "0")
        return num >= min && num <= max
      })
    }).length
  }

  return (
    <section className="relative py-20 md:py-28">
      <div className="container">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Elige tu desafío
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            ¿Hasta dónde quieres
            <span className="text-gradient"> llegar?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Desde tu primera carrera hasta el legendario maratón. Encuentra eventos según tu nivel y distancia.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DISTANCE_LEVELS.map((level, index) => {
            const Icon = level.icon
            const count = countEventsByDistance(level.id, level.range)

            return (
              <Link
                key={level.id}
                href={`/events?distance=${level.label}`}
                className="group relative flex h-[440px] flex-col overflow-hidden rounded-3xl border border-border bg-card p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={level.image}
                    alt={level.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${level.gradient} opacity-90 mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                </div>

                {/* Glow background */}
                <div className={`pointer-events-none absolute -right-16 -top-16 z-10 h-40 w-40 rounded-full ${level.glow} blur-3xl transition-opacity duration-500 group-hover:opacity-80`} />

                {/* Level badge */}
                <div className="relative z-20 mb-auto flex items-center justify-between">
                  <Badge className="border-white/20 bg-white/10 text-xs font-medium text-white backdrop-blur-md">
                    {level.level}
                  </Badge>
                  <span className="text-xs font-medium text-white/80">
                    {count > 0 ? `${count} eventos` : "Próximamente"}
                  </span>
                </div>

                {/* Icon */}
                <div className={`relative z-20 mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className="size-7" />
                </div>

                {/* Distance */}
                <div className="relative z-20 mb-1">
                  <span className="text-5xl font-extrabold text-white drop-shadow-lg">
                    {level.label}
                  </span>
                </div>

                {/* Title */}
                <h3 className="relative z-20 mb-1.5 text-lg font-bold text-white drop-shadow">
                  {level.title}
                </h3>

                {/* Description */}
                <p className="relative z-20 mb-4 text-sm leading-relaxed text-white/80">
                  {level.description}
                </p>

                {/* Tip */}
                <div className="relative z-20 mb-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-white/90 backdrop-blur-sm">
                  <span className="font-semibold">⏱</span>
                  {level.tip}
                </div>

                {/* CTA */}
                <div className="relative z-20 flex items-center gap-1.5 text-sm font-semibold text-white transition-colors group-hover:text-white/90">
                  Explorar carreras {level.label}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
