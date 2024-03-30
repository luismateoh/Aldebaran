"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { Icons } from "./icons"

export function BackButton() {
  return (
    <Button
      onClick={() => window.history.back()}
      variant="ghost"
      className={cn(
        "absolute left-[-200px] top-10 hidden text-muted-foreground xl:inline-flex"
      )}
    >
      <Icons.chevronLeft className="mr-2 size-4" /> Atrás
    </Button>
  )
}
