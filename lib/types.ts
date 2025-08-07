// Re-export Firebase types for compatibility
import type { FirebaseEventData } from '../types'
export type EventData = FirebaseEventData

export type AllEvents = {
  eventsData: EventData[]
}
