'use client'

import { useEffect } from 'react'

interface GiscusCommentsProps {
  eventId: string
}

export default function GiscusComments({ eventId }: GiscusCommentsProps) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://giscus.app/client.js'
    script.setAttribute('data-repo', 'luismateoh/Aldebaran') // Cambia por tu repo
    script.setAttribute('data-repo-id', 'R_kgDONAqW8w') // Lo obtienes de giscus.app
    script.setAttribute('data-category', 'Comentarios')
    script.setAttribute('data-category-id', 'DIC_kwDONAqW884CjVkf') // Lo obtienes de giscus.app
    script.setAttribute('data-mapping', 'specific')
    script.setAttribute('data-term', `evento-${eventId}`)
    script.setAttribute('data-strict', '0')
    script.setAttribute('data-reactions-enabled', '1')
    script.setAttribute('data-emit-metadata', '0')
    script.setAttribute('data-input-position', 'bottom')
    script.setAttribute('data-theme', 'preferred_color_scheme')
    script.setAttribute('data-lang', 'es')
    script.setAttribute('data-loading', 'lazy')
    script.crossOrigin = 'anonymous'
    script.async = true

    const commentsDiv = document.getElementById('giscus-comments')
    if (commentsDiv) {
      commentsDiv.appendChild(script)
    }

    return () => {
      const commentsDiv = document.getElementById('giscus-comments')
      if (commentsDiv) {
        commentsDiv.innerHTML = ''
      }
    }
  }, [eventId])

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">💬 Comentarios de la Comunidad</h3>
      <p className="text-muted-foreground mb-4">
        Comparte tu experiencia, haz preguntas o conecta con otros corredores
      </p>
      <div id="giscus-comments" className="giscus-comments" />
    </div>
  )
}
