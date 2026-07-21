import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "wide" | "narrow"
}

export function Container({
  className,
  variant = "default",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        variant === "default" && "max-w-[1280px]",
        variant === "wide" && "max-w-[1440px]",
        variant === "narrow" && "max-w-[960px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
