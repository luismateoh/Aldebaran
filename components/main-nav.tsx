"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavItem } from "@/types/nav"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Compass,
  Calendar,
  Map,
  BookOpen,
  PlusCircle,
  Menu,
} from "lucide-react"

interface MainNavProps {
  items?: NavItem[]
}

const navIconMap: Record<string, React.ReactNode> = {
  Explorar: <Compass className="size-4" strokeWidth={1.75} />,
  Eventos: <Calendar className="size-4" strokeWidth={1.75} />,
  Mapa: <Map className="size-4" strokeWidth={1.75} />,
  Recursos: <BookOpen className="size-4" strokeWidth={1.75} />,
  "Proponer Evento": <PlusCircle className="size-4" strokeWidth={1.75} />,
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex w-full items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="size-10 md:size-11" />
        <span className="inline-block text-xl font-bold md:text-2xl">
          {siteConfig.name}
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden items-center gap-1 md:flex">
        {items?.map((item, index) => {
          if (!item.href) return null

          const isProponer = item.title === "Proponer Evento"

          return (
            <Button
              key={index}
              asChild
              variant={isProponer ? "default" : "ghost"}
              size="sm"
              className={cn(
                "relative",
                isProponer
                  ? "ml-3 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground",
                isActive(item.href) &&
                  !isProponer &&
                  "text-foreground after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4 after:-translate-x-1/2 after:rounded-full after:bg-primary",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              <Link href={item.href} className="flex items-center gap-1.5">
                {navIconMap[item.title]}
                <span>{item.title}</span>
              </Link>
            </Button>
          )
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="flex items-center gap-2 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/70 hover:text-foreground"
            >
              <Menu className="size-5" strokeWidth={1.75} />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <div className="flex flex-col gap-1 border-b border-border px-6 py-5">
              <Link href="/" className="flex items-center space-x-2">
                <Icons.logo className="size-9" />
                <span className="text-lg font-bold">{siteConfig.name}</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 px-3 py-4">
              <div className="flex flex-col gap-1">
                {items?.map((item, index) => {
                  if (!item.href) return null

                  const isProponer = item.title === "Proponer Evento"
                  const active = isActive(item.href)

                  return (
                    <SheetClose key={index} asChild>
                      {isProponer ? (
                        <Button
                          asChild
                          variant="default"
                          size="default"
                          className="mt-2 w-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                          <Link href={item.href} className="flex items-center gap-2">
                            {navIconMap[item.title]}
                            <span>{item.title}</span>
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          asChild
                          variant="ghost"
                          size="default"
                          className={cn(
                            "w-full justify-start text-muted-foreground hover:text-foreground",
                            active && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-2">
                            {navIconMap[item.title]}
                            <span>{item.title}</span>
                          </Link>
                        </Button>
                      )}
                    </SheetClose>
                  )
                })}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
