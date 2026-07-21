import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: "default" | "lg" | "sm" | "none"
  surface?: boolean
}

export function SectionWrapper({
  className,
  spacing = "default",
  surface = false,
  children,
  ...props
}: SectionWrapperProps) {
  return (
    <section
      className={cn(
        "w-full",
        spacing === "lg" && "py-20 md:py-28 lg:py-32",
        spacing === "default" && "py-16 md:py-20 lg:py-24",
        spacing === "sm" && "py-12 md:py-16",
        spacing === "none" && "py-0",
        surface && "bg-surface",
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}
