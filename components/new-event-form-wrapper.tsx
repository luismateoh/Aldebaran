'use client'

import { Suspense } from 'react'
import NewEventForm from './new-event-form'

interface NewEventFormWrapperProps {
  isPublic?: boolean
}

export default function NewEventFormWrapper({ isPublic = false }: NewEventFormWrapperProps) {
  if (isPublic) {
    // For public version, don't use searchParams
    return <NewEventForm isPublic={true} />
  }

  // For admin version, wrap with Suspense for searchParams
  return (
    <Suspense fallback={<div className="text-center py-8">Cargando formulario...</div>}>
      <NewEventForm isPublic={false} />
    </Suspense>
  )
}