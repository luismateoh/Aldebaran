'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import EventTemplates from '@/components/event-templates'

export default function TemplatesPage() {
  const router = useRouter()
  const { user, isAdmin, loading } = useAuth()

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/login')
    }
  }, [user, isAdmin, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <p>Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user || !isAdmin) {
    return null
  }

  const handleSelectTemplate = (template: any) => {
    // Navegar al formulario con template pre-seleccionado
    const params = new URLSearchParams({
      template: template.key,
      title: template.title,
      category: template.category,
      distances: template.distances.join(','),
      price: template.price,
      description: template.description
    })
    router.push(`/admin/events/new?${params.toString()}`)
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Templates de Eventos</h1>
            <p className="text-sm text-muted-foreground">
              Crea eventos rápidamente usando plantillas predefinidas optimizadas para móvil
            </p>
          </div>
        </div>
      </div>

      {/* Templates Component */}
      <EventTemplates onSelectTemplate={handleSelectTemplate} />
    </div>
  )
}