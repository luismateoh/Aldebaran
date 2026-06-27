"use client"

import { useEffect, useState } from "react"
import { siteConfig } from "@/config/site"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"

interface SiteHeaderProps {
  isHomePage?: boolean
}

export function SiteHeader({ isHomePage = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isHomePage) return

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  const isTransparent = isHomePage && !scrolled

  return (
    <header
      className={cn(
        "top-0 z-40 w-full transition-all duration-300",
        isHomePage ? "fixed" : "sticky",
        isTransparent
          ? "border-transparent bg-transparent"
          : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <MainNav items={siteConfig.mainNav} variant={isTransparent ? "transparent" : "default"} />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle
            className={cn(
              isTransparent && "text-white hover:bg-white/10 hover:text-white"
            )}
          />
          <UserMenu
            className={cn(
              isTransparent && "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            )}
          />
        </div>
      </div>
    </header>
  )
}
