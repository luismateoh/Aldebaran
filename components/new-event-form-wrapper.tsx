'use client'

import { Suspense } from 'react'
import NewEventForm from './new-event-form'
import PublicEventForm from './public-event-form'

interface NewEventFormWrapperProps {
  isPublic?: boolean
}

export default function NewEventFormWrapper({ isPublic = false }: NewEventFormWrapperProps) {
  if (isPublic) {
    // For public version, use the component without searchParams
    return <PublicEventForm />
  }

  // For admin version, wrap with Suspense for searchParams
  return (
    <Suspense fallback={<div className="py-8 text-center">Cargando formulario...</div>}>
      <NewEventForm isPublic={false} />
    </Suspense>
  )
}