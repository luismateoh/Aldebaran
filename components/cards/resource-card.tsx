"use client"

import React from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

export interface ResourceCardProps {
  title: string
  description: string
  image: string
  icon?: LucideIcon
  href?: string
  className?: string
}

export function ResourceCard({
  title,
  description,
  image,
  icon: Icon,
  href,
  className,
}: ResourceCardProps) {
  const shared = (
    <>
      {/* Background image with fallback */}
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
        <ImageWithFallback
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          fallbackVariant="default"
        />
      </div>

      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          "bg-gradient-to-t from-black/80 via-black/30 to-transparent",
          "group-hover:from-black/60 group-hover:via-black/20"
        )}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Icon */}
        {Icon && (
          <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
            <Icon className="size-5 text-white" />
          </div>
        )}

        {/* Title */}
        <h3 className="mb-1.5 text-lg font-semibold text-white">
          {title}
        </h3>

        {/* Description */}
        <p className="mb-4 line-clamp-2 text-sm text-white/80">
          {description}
        </p>

        {/* Link indicator */}
        {href && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 transition-colors group-hover:text-white">
            Explorar
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        )}
      </div>
    </>
  )

  const baseClassName = cn(
    "group relative h-[300px] overflow-hidden rounded-[24px]",
    "transition-all duration-500 ease-out",
    "hover:-translate-y-1",
    className
  )

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {shared}
      </Link>
    )
  }

  return (
    <div className={baseClassName}>
      {shared}
    </div>
  )
}
