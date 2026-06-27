'use client'

import * as React from "react"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MainNavProps {
  items?: NavItem[]
  variant?: "default" | "transparent"
}

export function MainNav({ items, variant = "default" }: MainNavProps) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'
  const isTransparent = variant === "transparent"

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className={cn("flex items-center space-x-2", isTransparent && "text-white")}>
        <Icons.logo className="size-12" />
        <span className="inline-block text-2xl font-bold">
          {siteConfig.name}
        </span>
      </Link>
      
      {/* Desktop Navigation - Hidden on homepage */}
      {items?.length && !isHomePage ? (
        <nav className="hidden items-center gap-6 md:flex">
          {items?.map(
            (item, index) =>
              item.href && (
                <Button
                  key={index}
                  asChild
                  variant={item.title === "Proponer Evento" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    item.title === "Proponer Evento" && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
                    item.disabled && "cursor-not-allowed opacity-80",
                    isTransparent && "text-white hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Link href={item.href}>
                    {item.title}
                  </Link>
                </Button>
              )
          )}
        </nav>
      ) : null}

      {/* Mobile Navigation - Hidden on homepage */}
      {items?.length && !isHomePage ? (
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("px-2", isTransparent && "text-white hover:bg-white/10")}>
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {items?.map(
                (item, index) =>
                  item.href && (
                    <DropdownMenuItem key={index} asChild>
                      <Link 
                        href={item.href}
                        className={cn(
                          "w-full cursor-pointer",
                          item.title === "Proponer Evento" && "bg-primary/10 font-semibold text-primary"
                        )}
                      >
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}
    </div>
  )
}
