"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Evitar hydration mismatch: renderizar placeholder hasta mount
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn(className)}>
        <div className="size-5" />
        <span className="sr-only">Cambiar tema</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(className)}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {isDark ? (
            <Moon className="size-5" />
          ) : (
            <Sun className="h-6 w-[1.3rem]" />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
