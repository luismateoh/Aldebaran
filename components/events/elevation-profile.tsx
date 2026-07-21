"use client"

import { useState, useRef, useMemo, useCallback } from "react"
import { motion } from "framer-motion"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ElevationPoint {
  distance: number // km
  elevation: number // m
}

export interface ElevationProfileProps {
  data: ElevationPoint[]
  className?: string
}

interface TooltipState {
  distance: number
  elevation: number
  x: number
  y: number
  visible: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Linear interpolation between two points */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Format elevation in metres — show "X m" */
const fmtElev = (m: number): string => `${Math.round(m)} m`

/** Format distance — show "X.Y km" or "X.Y km" */
const fmtDist = (km: number): string => `${km.toFixed(1)} km`

/**
 * Build an SVG path string (smooth curve via Catmull-Rom → cubic bezier).
 * Based on the standard centripetal Catmull-Rom to cubic bezier conversion.
 */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return ""
  if (points.length === 1) return `M${points[0].x},${points[0].y}`

  const segments: string[] = []
  segments.push(`M${points[0].x},${points[0].y}`)

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    const tension = 0.3
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension

    segments.push(`C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`)
  }

  return segments.join(" ")
}

// ---------------------------------------------------------------------------
// ElevationProfile component
// ---------------------------------------------------------------------------

export function ElevationProfile({ data, className = "" }: ElevationProfileProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    distance: 0,
    elevation: 0,
    x: 0,
    y: 0,
    visible: false,
  })

  // ── Layout constants ──────────────────────────────────────────────
  const PADDING = { top: 24, right: 16, bottom: 40, left: 48 }
  const ASPECT_RATIO = 3.2 // width / height

  // ── Derived stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return { totalDistance: 0, elevationGain: 0, maxElevation: 0, minElevation: 0 }
    }

    const totalDistance = data[data.length - 1].distance - data[0].distance
    let elevationGain = 0
    for (let i = 1; i < data.length; i++) {
      const diff = data[i].elevation - data[i - 1].elevation
      if (diff > 0) elevationGain += diff
    }
    const elevations = data.map((p) => p.elevation)
    return {
      totalDistance,
      elevationGain: Math.round(elevationGain),
      maxElevation: Math.round(Math.max(...elevations)),
      minElevation: Math.round(Math.min(...elevations)),
    }
  }, [data])

  // ── SVG coordinate mapping ────────────────────────────────────────
  const { points, path, areaPath, xScale, yScale } = useMemo(() => {
    if (!data || data.length < 2) {
      return { points: [], path: "", areaPath: "", xScale: 0, yScale: 0 }
    }

    const minDist = data[0].distance
    const maxDist = data[data.length - 1].distance
    const distRange = maxDist - minDist || 1

    const elevations = data.map((p) => p.elevation)
    const minElev = Math.min(...elevations)
    const maxElev = Math.max(...elevations)
    const elevRange = maxElev - minElev || 1

    // Chart dimensions (relative, before responsive scaling)
    const chartW = 800
    const chartH = chartW / ASPECT_RATIO

    const xScaleVal = (chartW - PADDING.left - PADDING.right) / distRange
    const yScaleVal = (chartH - PADDING.top - PADDING.bottom) / elevRange

    const pts = data.map((d) => ({
      x: PADDING.left + (d.distance - minDist) * xScaleVal,
      y: chartH - PADDING.bottom - (d.elevation - minElev) * yScaleVal,
      distance: d.distance,
      elevation: d.elevation,
    }))

    const linePath = buildSmoothPath(pts)

    // Area path (closed under the chart)
    const lastPt = pts[pts.length - 1]
    const firstPt = pts[0]
    const bottomY = chartH - PADDING.bottom
    const areaPathStr = `${linePath} L${lastPt.x},${bottomY} L${firstPt.x},${bottomY} Z`

    return {
      points: pts,
      path: linePath,
      areaPath: areaPathStr,
      xScale: xScaleVal,
      yScale: yScaleVal,
    }
  }, [data])

  // ── Y-axis ticks ──────────────────────────────────────────────────
  const yTicks = useMemo(() => {
    if (!data || data.length < 2) return []
    const elevations = data.map((p) => p.elevation)
    const minElev = Math.min(...elevations)
    const maxElev = Math.max(...elevations)
    const range = maxElev - minElev || 1
    const step = Math.pow(10, Math.floor(Math.log10(range)))
    const niceStep = step * (range / step <= 3 ? 0.5 : range / step <= 7 ? 1 : 2)
    const ticks: number[] = []
    let t = Math.ceil(minElev / niceStep) * niceStep
    while (t <= maxElev) {
      ticks.push(t)
      t += niceStep
    }
    return ticks
  }, [data])

  // ── X-axis ticks ──────────────────────────────────────────────────
  const xTicks = useMemo(() => {
    if (!data || data.length < 2) return []
    const total = data[data.length - 1].distance
    const step = total <= 5 ? 1 : total <= 10 ? 2 : total <= 25 ? 5 : total <= 50 ? 10 : 20
    const ticks: number[] = []
    let t = 0
    while (t <= total) {
      ticks.push(t)
      t += step
    }
    return ticks
  }, [data])

  // ── Mouse handler ──────────────────────────────────────────────────
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || points.length === 0) return
      const rect = svgRef.current.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const svgW = rect.width
      const svgH = rect.height

      // Convert mouse pixel to chart coordinate
      const chartW = 800
      const scaleX = svgW / chartW
      const chartX = mouseX / scaleX

      // Find closest point
      let closest = points[0]
      let minDist = Infinity
      for (const pt of points) {
        const d = Math.abs(pt.x - chartX)
        if (d < minDist) {
          minDist = d
          closest = pt
        }
      }

      // Tooltip position: clamp Y so tooltip doesn't overflow
      const elevRange =
        Math.max(...data.map((p) => p.elevation)) -
        Math.min(...data.map((p) => p.elevation)) || 1
      const chartHval = chartW / ASPECT_RATIO
      const normY = (closest.y - PADDING.top) / (chartHval - PADDING.top - PADDING.bottom)

      // Convert pixel position relative to the SVG element
      const pixelX = closest.x * scaleX
      const pixelY = (closest.y / chartHval) * svgH

      setTooltip({
        distance: closest.distance,
        elevation: closest.elevation,
        x: pixelX,
        y: pixelY,
        visible: true,
      })
    },
    [points, data],
  )

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }))
  }, [])

  // ── Empty state ────────────────────────────────────────────────────
  if (!data || data.length < 2) {
    return (
      <div className={`flex h-48 items-center justify-center rounded-xl bg-muted text-center text-sm text-muted-foreground ${className}`}>
        Se necesitan al menos 2 puntos de elevación para mostrar el perfil.
      </div>
    )
  }

  const chartW = 800
  const chartH = chartW / ASPECT_RATIO

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full ${className}`}
    >
      {/* ── Chart ─────────────────────────────────────────────────── */}
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="h-auto w-full select-none"
          preserveAspectRatio="xMidYMid meet"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          role="img"
          aria-label="Perfil de elevación de la ruta"
        >
          {/* Background grid lines */}
          {yTicks.map((tick) => {
            const minElev = Math.min(...data.map((p) => p.elevation))
            const maxElev = Math.max(...data.map((p) => p.elevation))
            const r = maxElev - minElev || 1
            const y = chartH - PADDING.bottom - ((tick - minElev) / r) * (chartH - PADDING.top - PADDING.bottom)
            return (
              <g key={`ygrid-${tick}`}>
                <line
                  x1={PADDING.left}
                  x2={chartW - PADDING.right}
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeWidth={1}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-muted-foreground text-[11px]"
                >
                  {tick}
                </text>
              </g>
            )
          })}

          {xTicks.map((tick) => {
            const minDist = data[0].distance
            const maxDist = data[data.length - 1].distance
            const dr = maxDist - minDist || 1
            const x = PADDING.left + ((tick - minDist) / dr) * (chartW - PADDING.left - PADDING.right)
            return (
              <text
                key={`xgrid-${tick}`}
                x={x}
                y={chartH - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {tick}
              </text>
            )
          })}

          {/* Area fill */}
          <path d={areaPath} fill="hsl(var(--primary) / 0.12)" />

          {/* Elevation line */}
          <path
            d={path}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover indicator line */}
          {tooltip.visible && (
            <line
              x1={tooltip.x}
              x2={tooltip.x}
              y1={PADDING.top}
              y2={chartH - PADDING.bottom}
              stroke="hsl(var(--primary))"
              strokeOpacity={0.4}
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          )}

          {/* Hover dot */}
          {tooltip.visible && (
            <circle
              cx={tooltip.x}
              cy={tooltip.y}
              r={5}
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
            />
          )}

          {/* Axis labels */}
          <text
            x={chartW / 2}
            y={chartH - 2}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
          >
            Distancia (km)
          </text>
          <text
            x={10}
            y={chartH / 2}
            textAnchor="middle"
            transform={`rotate(-90, 10, ${chartH / 2})`}
            className="fill-muted-foreground text-[10px]"
          >
            Altitud (m)
          </text>
        </svg>

        {/* ── Tooltip overlay ─────────────────────────────────────── */}
        {tooltip.visible && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{
              left: `${(tooltip.x / chartW) * 100}%`,
              top: `${(tooltip.y / chartH) * 100}%`,
            }}
          >
            <div className="mb-2 rounded-lg border bg-background px-3 py-2 shadow-lg">
              <p className="whitespace-nowrap text-sm font-semibold">
                {fmtDist(tooltip.distance)}
              </p>
              <p className="whitespace-nowrap text-xs text-muted-foreground">
                {fmtElev(tooltip.elevation)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats grid ────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Distancia total" value={fmtDist(stats.totalDistance)} />
        <StatCard label="Desnivel positivo" value={fmtElev(stats.elevationGain)} />
        <StatCard label="Altitud máxima" value={fmtElev(stats.maxElevation)} />
        <StatCard label="Altitud mínima" value={fmtElev(stats.minElevation)} />
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-card-foreground">{value}</p>
    </div>
  )
}
