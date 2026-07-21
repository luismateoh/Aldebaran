"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, MapPin, ChevronDown, Zap } from "lucide-react"
import Image from "next/image"

interface HeroProps {
  eventsCount: number
}

export function Hero({ eventsCount }: HeroProps) {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/hero-home.jpg"
          alt="Corredores de trail running en montaña"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 hero-overlay-side" />
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -right-40 top-1/4 z-0 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-20 bottom-0 z-0 h-80 w-80 rounded-full bg-orange-600/10 blur-[100px]" />

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {eventsCount > 0
              ? `${eventsCount} eventos activos en Colombia`
              : "La plataforma de atletismo de Colombia"}
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Corre
            <br />
            <span className="text-gradient animate-gradient">
              Colombia
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up delay-200 mt-6 max-w-xl text-lg text-white/80 md:text-xl">
            Descubre las mejores carreras y eventos de atletismo en todo el país.
            Desde maratones hasta trail running, encuentra tu próximo desafío.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up delay-300 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="group h-14 rounded-full px-8 text-base font-semibold animate-pulse-glow">
              <Link href="/events">
                <Calendar className="mr-2 size-5" />
                Explorar Eventos
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-14 rounded-full border border-white/20 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:text-white"
            >
              <Link href="/propose-event">
                <Zap className="mr-2 size-5" />
                Proponer Evento
              </Link>
            </Button>
          </div>

          {/* Quick stats inline */}
          <div className="animate-fade-in-up delay-500 mt-14 flex flex-wrap gap-x-10 gap-y-4">
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="size-5 text-primary" />
              <span className="text-sm font-medium">Todo Colombia</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="size-5 text-primary" />
              <span className="text-sm font-medium">Calendario actualizado</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Zap className="size-5 text-primary" />
              <span className="text-sm font-medium">100% Gratis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-float">
        <ChevronDown className="size-6 text-white/50" />
      </div>
    </section>
  )
}
