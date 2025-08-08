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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
    <div className="container max-w-6xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Templates de Eventos</h1>
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