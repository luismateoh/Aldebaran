"use client"

import { Search, MousePointerClick, Trophy } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Descubre",
    description: "Explora carreras por distancia, ubicación o fecha. Filtra según tu nivel y preferencias.",
    image: "/images/steps/discover.jpg",
  },
  {
    icon: MousePointerClick,
    step: "02",
    title: "Regístrate",
    description: "Inscríbete con un solo clic. Accede al sitio oficial del evento con toda la información.",
    image: "/images/steps/register.jpg",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Corre",
    description: "Llega al día de la carrera preparado. Supera tus límites y cruza la meta.",
    image: "/images/steps/run.jpg",
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

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connecting line */}
          <div className="absolute left-0 right-0 top-32 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.step}
                className="relative flex flex-col items-center"
                style={{
                  animation: `fade-in-up 0.6s ease-out ${index * 0.15}s both`,
                }}
              >
                {/* Image card */}
                <div className="relative z-10 mb-6 h-48 w-full max-w-xs overflow-hidden rounded-2xl border border-border shadow-lg">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-3 top-3 flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-lg">
                    {step.step}
                  </span>
                </div>

                {/* Icon overlay */}
                <div className="relative z-20 -mt-12 mb-4 flex size-14 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg">
                  <Icon className="size-6" />
                </div>

                <h3 className="mb-2 text-xl font-bold">
                  {step.title}
                </h3>
                <p className="max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
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
