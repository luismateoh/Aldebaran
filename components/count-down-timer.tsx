"use client"

import React from "react"

import { useCountdown } from "@/hooks/useCountdown"

export default function CountDownTimer({
  targetDate,
}: {
  targetDate: string | number | Date
}) {
  const [days, hours, minutes, seconds] = useCountdown(targetDate)

  if (days + hours + minutes + seconds == 0) {
    return <span className="text-2xl font-medium">¡El evento es Hoy!</span>
  }
  if (days + hours + minutes + seconds < 0) {
    return <span className="text-2xl font-medium">¡El evento ya pasó!</span>
  }
  return (
    <div className="grid grid-cols-4 items-center justify-center gap-2">
      <div className="flex flex-col items-center rounded-md border p-0.5">
        <div className="text-xl font-semibold">{days}</div>
        <div className="opacity-70">Dias</div>
      </div>
      <div className="flex flex-col items-center rounded-md border p-0.5">
        <div className="text-xl font-semibold">{hours}</div>
        <div className="opacity-70">Horas</div>
      </div>
      <div className="flex flex-col items-center rounded-md border p-0.5">
        <div className="text-xl font-semibold">{minutes}</div>
        <div className="opacity-70">Mins</div>
      </div>
      <div className="flex flex-col items-center rounded-md border p-0.5">
        <div className="text-xl font-semibold">{seconds}</div>
        <div className="opacity-70">Segs</div>
      </div>
    </div>
  )
}
