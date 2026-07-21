"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import type { EventData } from "@/lib/types"
import { RaceInformation } from "@/components/events/race-information"
import { CountdownCard } from "@/components/events/countdown-card"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EventDetailInfoProps {
  event: EventData
  eventDate: Date
  className?: string
}

// ---------------------------------------------------------------------------
// EventDetailInfo
// ---------------------------------------------------------------------------

export function EventDetailInfo({
  event,
  eventDate,
  className,
}: EventDetailInfoProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
      className={cn("border-b border-border bg-background", className)}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Race metadata */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <RaceInformation event={event} />
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-center font-heading text-heading-4 font-semibold text-foreground">
                Cuenta regresiva
              </h3>
              <CountdownCard targetDate={eventDate} size="large" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
