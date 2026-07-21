"use client"

import { useEffect, useRef, useState } from "react"
import { motion, type Variants } from "framer-motion"
import { Mail } from "lucide-react"
import { NewsletterForm } from "@/components/newsletter-form"

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

export function NewsletterSection() {
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
      { threshold: 0.2 }
    )
    const current = ref.current
    if (current) observer.observe(current)
    return () => {
      if (current) observer.unobserve(current)
    }
  }, [])

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 md:py-28"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-primary/5" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div
        className="container relative"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <div className="mx-auto max-w-xl text-center">
          {/* Icon */}
          <motion.div
            variants={itemVariants}
            className="mb-6 flex justify-center"
          >
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <Mail className="size-8 text-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-extrabold tracking-tight md:text-5xl"
          >
            No te pierdas ningún evento
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-4 text-lg text-muted-foreground"
          >
            Recibe los mejores eventos en tu correo cada semana
          </motion.p>

          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="mx-auto mt-8 max-w-md"
          >
            <NewsletterForm />
          </motion.div>

          {/* Trust text */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-xs text-muted-foreground/60"
          >
            Sin spam. Solo los mejores eventos de atletismo en Colombia.
            Puedes cancelar tu suscripción cuando quieras.
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
