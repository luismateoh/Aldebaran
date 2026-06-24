"use client"

import { useEffect, useRef, useState } from "react"
import { Calendar, MapPin, Users, TrendingUp } from "lucide-react"

interface StatsBarProps {
  eventsCount: number
  departmentsCount?: number
}

function useCountUp(target: number, duration: number = 2000, start: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target, duration, start])

  return count
}

export function StatsBar({ eventsCount, departmentsCount = 15 }: StatsBarProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const events = useCountUp(eventsCount, 2000, isVisible)
  const depts = useCountUp(departmentsCount, 1800, isVisible)
  const runners = useCountUp(eventsCount * 250, 2500, isVisible)

  const stats = [
    {
      icon: Calendar,
      value: events,
      label: "Eventos Activos",
      suffix: "+",
    },
    {
      icon: MapPin,
      value: depts,
      label: "Departamentos",
      suffix: "",
    },
    {
      icon: Users,
      value: runners,
      label: "Corredores",
      suffix: "+",
    },
    {
      icon: TrendingUp,
      value: 100,
      label: "Gratis",
      suffix: "%",
    },
  ]

  return (
    <section ref={ref} className="relative z-20 -mt-px border-y border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container">
        <div className="grid grid-cols-2 divide-x divide-border md:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center md:py-10"
                style={{
                  animation: isVisible
                    ? `fade-in-up 0.6s ease-out ${index * 0.1}s forwards`
                    : "none",
                  opacity: 0,
                }}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight md:text-4xl">
                  {stat.value.toLocaleString("es-CO")}
                  <span className="text-primary">{stat.suffix}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
