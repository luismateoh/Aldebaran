"use client"

import { Search, MousePointerClick, Trophy } from "lucide-react"
import Link from "next/link"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Descubre",
    description: "Explora carreras por distancia, ubicación o fecha. Filtra según tu nivel y preferencias.",
    image: "/images/home/runner-sunrise.jpg",
    gradient: "from-orange-500/90 to-red-600/90",
  },
  {
    icon: MousePointerClick,
    step: "02",
    title: "Regístrate",
    description: "Inscríbete con un solo clic. Accede al sitio oficial del evento con toda la información.",
    image: "/images/home/runners-sunset.jpg",
    gradient: "from-blue-500/90 to-cyan-600/90",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Corre",
    description: "Llega al día de la carrera preparado. Supera tus límites y cruza la meta.",
    image: "/images/home/pexels-marathon.jpg",
    gradient: "from-green-500/90 to-emerald-600/90",
  },
]

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />

      <div className="container relative">
        <div className="mb-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Simple y rápido
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            ¿Cómo funciona?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Tres pasos para encontrar tu próxima carrera en Colombia.
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Connecting line - desktop */}
          <div className="absolute inset-x-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block" />

          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.step}
                className="group relative overflow-hidden rounded-3xl border border-border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  animation: `fade-in-up 0.6s ease-out ${index * 0.15}s both`,
                }}
              >
                {/* Background image */}
                <div className="relative h-64 overflow-hidden md:h-80">
                  <ImageWithFallback
                    src={step.image}
                    alt={step.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    fallbackVariant="default"
                  />
                  <div className={cn("absolute inset-0 opacity-80 mix-blend-multiply", step.gradient)} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Step number */}
                  <span className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-md text-sm font-bold text-white shadow-lg">
                    {step.step}
                  </span>

                  {/* Icon overlay */}
                  <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 translate-y-1/2">
                    <div className="flex size-16 items-center justify-center rounded-2xl border-4 border-background bg-primary text-primary-foreground shadow-xl transition-transform duration-500 group-hover:scale-110">
                      <Icon className="size-7" />
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="bg-card px-6 pb-8 pt-12 text-center md:px-8">
                  <h3 className="mb-2 text-xl font-bold">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-14 text-center">
          <Button asChild size="lg" className="h-14 rounded-full px-10 text-base font-semibold">
            <Link href="/events">
              Empezar ahora
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
