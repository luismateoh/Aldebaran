'use client'

import { Button } from "@/components/ui/button"

interface EventShareButtonProps {
  title: string
  className?: string
}

export default function EventShareButton({ title, className }: EventShareButtonProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: title,
          text: `Mira este evento: ${title}`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
      }
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className={className}
    >
      Compartir Evento
    </Button>
  )
}