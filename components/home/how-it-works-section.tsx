'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { Search, ClipboardCheck, Flag } from "lucide-react"

import {
  SectionLabel,
  SectionTitle,
  SectionSubtitle,
} from "@/components/typography/section-typography"
import { Button } from "@/components/ui/button"

/* ──────────────────────────────────────────────────────────
 * Steps data
 * ────────────────────────────────────────────────────────── */
interface Step {
  number: string
  icon: typeof Search
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: "01",
    icon: Search,
    title: "Descubre",
    description:
      "Explora carreras por distancia, ubicación o tipo. Encuentra el evento perfecto para tu nivel y preferencias.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Regístrate",
    description:
      "Encuentra toda la información del evento, precios y fechas. Inscríbete directamente desde nuestra plataforma.",
  },
  {
    number: "03",
    icon: Flag,
    title: "Corre",
    description:
      "Vive la experiencia, supera tus límites y comparte tus logros con la comunidad de corredores.",
  },
]

/* ── Animation variants ── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.18 },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

const ctaVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: 0.4 },
  },
}

/* ──────────────────────────────────────────────────────────
 * HowItWorksSection
 * ──────────────────────────────────────────────────────────
 * Sección de 3 pasos con diseño limpio: números grandes,
 * iconos, títulos y descripciones. Línea conectadora entre
 * pasos en desktop. Botón CTA "Explorar eventos".
 * Animaciones al hacer scroll (stagger + fade-up).
 *
 * Layout (desktop):
 * ┌─────────────────┬─────────────────┬─────────────────┐
 * │      "01"       │      "02"       │      "03"       │
 * │   [Search]      │ [ClipboardCheck]│    [Flag]       │
 * │   Descubre      │   Regístrate    │     Corre       │
 * │   descripción   │   descripción   │   descripción   │
 * └─────────────────┴─────────────────┴─────────────────┘
 *   ←─── línea conectora horizontal ───→
 *
 *               [ Explorar eventos ]
 * ────────────────────────────────────────────────────────── */
export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />

      <div className="container relative">
        {/* ── Header ── */}
        <div className="mb-16 text-center">
          <SectionLabel align="center">Cómo funciona</SectionLabel>
          <SectionTitle align="center" className="mt-2">
            Tres pasos para tu próxima aventura
          </SectionTitle>
          <SectionSubtitle align="center" className="mt-3">
            Descubre, inscríbete y corre — así de fácil es encontrar tu próxima
            carrera en Colombia
          </SectionSubtitle>
        </div>

        {/* ── Steps grid ── */}
        <motion.div
          className="relative grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Connecting line — horizontal bar across all 3 columns */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[2.25rem] top-24 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block md:inset-x-0 md:top-[5.5rem]"
          />

          {STEPS.map((step) => {
            const Icon = step.icon

            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                className="relative flex flex-col items-center text-center"
              >
                {/* Número grande decorativo */}
                <span
                  aria-hidden="true"
                  className="select-none text-[5rem] font-bold leading-none text-primary/10 md:text-[6.5rem]"
                >
                  {step.number}
                </span>

                {/* Icono con fondo */}
                <div className="relative -mt-12 mb-5 flex size-[4.5rem] items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
                  <Icon className="size-9 text-primary-foreground" />
                </div>

                {/* Título */}
                <h3 className="text-2xl font-bold">{step.title}</h3>

                {/* Descripción */}
                <p className="mt-3 max-w-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── CTA ── */}
        <motion.div
          className="mt-14 text-center"
          variants={ctaVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Button
            asChild
            size="lg"
            className="h-14 rounded-full px-10 text-base font-semibold"
          >
            <Link href="/events">Explorar eventos</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
