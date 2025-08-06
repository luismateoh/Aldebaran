import { useState, useEffect } from 'react'
import { eventsService } from '@/lib/events-firebase'
import type { EventData } from '@/types'

export function useEventsRealtime() {
  const [events, setEvents] = useState<EventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    
    // Suscribirse a cambios en tiempo real
    const unsubscribe = eventsService.subscribeToEvents((newEvents) => {
      setEvents(newEvents)
      setLoading(false)
      setError(null)
    })

    // Cleanup al desmontar
    return () => {
      unsubscribe()
    }
  }, [])

  const createEvent = async (eventData: Omit<EventData, 'id'>) => {
    try {
      // No necesitamos actualizar el estado manualmente
      // El listener se encarga automáticamente
      const newEvent = await eventsService.createEvent(eventData)
      return newEvent
    } catch (error) {
      setError('Error creando evento')
      throw error
    }
  }

  const updateEvent = async (id: string, updates: Partial<EventData>) => {
    try {
      // Firebase actualizará automáticamente vía listener
      const updatedEvent = await eventsService.updateEvent(id, updates)
      return updatedEvent
    } catch (error) {
      setError('Error actualizando evento')
      throw error
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      await eventsService.deleteEvent(id)
      // El listener se encarga de remover del estado automáticamente
    } catch (error) {
      setError('Error eliminando evento')
      throw error
    }
  }

  const searchEvents = async (query: string) => {
    try {
      setLoading(true)
      const results = await eventsService.searchEvents(query)
      setEvents(results)
      setLoading(false)
      return results
    } catch (error) {
      setError('Error buscando eventos')
      setLoading(false)
      throw error
    }
  }

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents
  }
}