import * as React from "react"
import Link from "next/link"
import { useState } from "react"

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
}

export function MainNav({ items }: MainNavProps) {
  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="size-12" />
        <span className="inline-block text-2xl font-bold">
          {siteConfig.name}
        </span>
      </Link>
      
      {/* Desktop Navigation */}
      {items?.length ? (
        <nav className="hidden md:flex gap-6 items-center">
          {items?.map(
            (item, index) =>
              item.href && (
                <Button
                  key={index}
                  asChild
                  variant={item.title === "Proponer Evento" ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    item.title === "Proponer Evento" && "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
                    item.disabled && "cursor-not-allowed opacity-80"
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

      {/* Mobile Navigation */}
      {items?.length ? (
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2">
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
                          item.title === "Proponer Evento" && "bg-primary/10 text-primary font-semibold"
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
