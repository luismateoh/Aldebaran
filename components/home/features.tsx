"use client"

import { Search, MapPin, Heart, Trophy, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface Feature {
  id: string
  icon: typeof Search
  title: string
  description: string
  image?: string
  gradient: string
  span: string
}

const FEATURES: Feature[] = [
  {
    id: "discover",
    icon: Search,
    title: "Descubre Eventos",
    description: "Explora carreras y competencias en todo el país con información detallada y actualizada.",
    image: "/images/home/runner-sunrise.jpg",
    gradient: "from-orange-500/90 to-red-600/90",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: "map",
    icon: MapPin,
    title: "Mapa Interactivo",
    description: "Visualiza eventos geográficamente y encuentra carreras cerca de tu ubicación.",
    gradient: "from-blue-500 to-cyan-500",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: "community",
    icon: Heart,
    title: "Comunidad Activa",
    description: "Conecta con otros corredores y comparte tus experiencias.",
    image: "/images/home/pexels-runner-1.jpg",
    gradient: "from-pink-500 to-rose-500",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: "races",
    icon: Trophy,
    title: "Todo Tipo de Carreras",
    description: "Desde 5K recreativos hasta maratones competitivos y trail running extremo.",
    image: "/images/home/trail-runner.jpg",
    gradient: "from-amber-500 to-orange-500",
    span: "md:col-span-2 md:row-span-1",
  },
]

export function Features() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mb-16 text-center">
        <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          Por qué Aldebaran
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Todo lo que necesitas para
          <br />
          <span className="text-gradient">tu próxima carrera</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          La plataforma más completa para descubrir y participar en eventos de atletismo en Colombia.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon
          const isLarge = feature.id === "discover"

          return (
            <Link
              key={feature.id}
              href={feature.id === "map" ? "/events" : `/events?feature=${feature.id}`}
              className={cn(
                "group relative flex min-h-[280px] flex-col overflow-hidden rounded-3xl border border-border p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:min-h-0",
                feature.span,
                isLarge && "min-h-[400px]"
              )}
              style={{
                animation: `fade-in-up 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Background image or gradient */}
              {feature.image ? (
                <>
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/20" />
                  <div className={cn("absolute inset-0 opacity-30 mix-blend-overlay", feature.gradient)} />
                </>
              ) : (
                <div className={cn("absolute inset-0 bg-gradient-to-br", feature.gradient)} />
              )}

              {/* Glow */}
              <div className="pointer-events-none absolute -right-16 -top-16 z-10 size-40 rounded-full bg-white/10 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

              {/* Content */}
              <div className="relative z-20 mt-auto">
                <div className={cn(
                  "mb-4 flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg backdrop-blur-md transition-transform duration-500 group-hover:scale-110",
                  isLarge && "md:size-16"
                )}>
                  <Icon className={cn("size-7", isLarge && "md:size-8")} />
                </div>

                <h3 className={cn(
                  "mb-2 font-bold text-white drop-shadow",
                  isLarge ? "text-2xl md:text-3xl" : "text-xl"
                )}>
                  {feature.title}
                </h3>

                <p className={cn(
                  "leading-relaxed text-white/80",
                  isLarge ? "text-base md:text-lg" : "text-sm"
                )}>
                  {feature.description}
                </p>

                <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-white transition-colors">
                  Explorar
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
