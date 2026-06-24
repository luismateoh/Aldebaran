"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Quote } from "lucide-react"

const MOTIVATIONAL_QUOTES = [
  {
    text: "No dejes para mañana la carrera que puedes correr hoy.",
    author: "Proverbio runner",
  },
  {
    text: "El dolor que sientes hoy es la fuerza que sentirás mañana.",
    author: "Anónimo",
  },
  {
    text: "Cada kilómetro te acerca a una mejor versión de ti mismo.",
    author: "Filosofía Aldebaran",
  },
]

export function MotivationalBanner() {
  const [scrollY, setScrollY] = useState(0)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0
      if (inView) {
        setScrollY(window.scrollY)
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const quote = MOTIVATIONAL_QUOTES[quoteIndex]

  return (
    <section ref={ref} className="relative my-20 flex min-h-[420px] items-center overflow-hidden md:my-28 md:min-h-[480px]">
      {/* Parallax background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `translateY(${scrollY * 0.15}px) scale(1.1)`,
        }}
      >
        <Image
          src="/images/hero/banner-motivacional.jpg"
          alt="Trail running en Colombia"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -left-32 top-1/2 z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/30 blur-[100px]" />

      {/* Content */}
      <div className="container relative z-20 py-16">
        <div className="max-w-3xl">
          <Quote className="mb-6 size-12 text-primary/70" />

          <blockquote
            key={quoteIndex}
            className="animate-fade-in-up text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl md:leading-tight"
          >
            &ldquo;{quote.text}&rdquo;
          </blockquote>

          <cite className="mt-6 block text-lg font-medium not-italic text-white/70 md:text-xl">
            — {quote.author}
          </cite>

          {/* Progress dots */}
          <div className="mt-10 flex gap-2">
            {MOTIVATIONAL_QUOTES.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === quoteIndex
                    ? "w-10 bg-primary"
                    : "w-4 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Cita ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
