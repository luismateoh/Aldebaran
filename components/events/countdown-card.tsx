"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCountdown } from "@/hooks/useCountdown"

export interface CountdownCardProps {
  targetDate: string | Date
  size?: "compact" | "default" | "large"
  className?: string
}

interface TimeUnitProps {
  value: number
  label: string
  sizeClass: string
}

function TimeUnit({ value, label, sizeClass }: TimeUnitProps) {
  const prevValue = useRef(value)

  useEffect(() => {
    prevValue.current = value
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("relative overflow-hidden rounded-lg bg-surface px-3 py-2 font-heading tabular-nums", sizeClass)}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: value > prevValue.current ? 20 : -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: value > prevValue.current ? -20 : 20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="block text-foreground"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

export function CountdownCard({
  targetDate,
  size = "default",
  className,
}: CountdownCardProps) {
  const [isClient, setIsClient] = useState(false)
  const [days, hours, minutes, seconds] = useCountdown(targetDate)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isPast = days < 0 || (days === 0 && hours < 0 && minutes < 0 && seconds < 0)
  const isToday = days === 0 && hours >= 0 && minutes >= 0 && seconds >= 0

  const sizeMap = {
    compact: {
      container: "gap-2",
      time: "text-lg",
      label: "text-[10px]",
      icon: "h-4 w-4",
    },
    default: {
      container: "gap-3",
      time: "text-2xl",
      label: "text-xs",
      icon: "h-5 w-5",
    },
    large: {
      container: "gap-4",
      time: "text-4xl md:text-5xl",
      label: "text-sm",
      icon: "h-6 w-6",
    },
  }

  const s = sizeMap[size]

  // Show skeleton during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className={cn("flex", s.container)}>
          {["Días", "Horas", "Min", "Seg"].map((label) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "rounded-lg bg-surface px-3 py-2 font-heading text-foreground",
                  s.time
                )}
              >
                --
              </div>
              <span
                className={cn(
                  "font-medium uppercase tracking-wider text-muted-foreground",
                  s.label
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isPast) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-6 text-center",
          className
        )}
      >
        <div className="text-3xl">🏁</div>
        <p className="font-heading text-lg font-semibold text-foreground">
          Evento finalizado
        </p>
        <p className="text-sm text-muted-foreground">
          Este evento ya se realizó
        </p>
      </motion.div>
    )
  }

  if (isToday) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "flex flex-col items-center gap-3",
          className
        )}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-full bg-warning/10 px-4 py-1.5 text-sm font-semibold text-warning"
        >
          ¡El evento es hoy!
        </motion.div>
        <div className={cn("flex", s.container)}>
          <TimeUnit value={hours} label="Horas" sizeClass={s.time} />
          <TimeUnit value={minutes} label="Min" sizeClass={s.time} />
          <TimeUnit value={seconds} label="Seg" sizeClass={s.time} />
        </div>
      </motion.div>
    )
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("flex", s.container)}>
        <TimeUnit value={days} label="Días" sizeClass={s.time} />
        <TimeUnit value={hours} label="Horas" sizeClass={s.time} />
        <TimeUnit value={minutes} label="Min" sizeClass={s.time} />
        <TimeUnit value={seconds} label="Seg" sizeClass={s.time} />
      </div>
      {size !== "compact" && (
        <p className="text-xs text-muted-foreground">
          Tiempo restante para el evento
        </p>
      )}
    </div>
  )
}
