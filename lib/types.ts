export type EventData = {
  id: string
  title: string
  author: string
  publishDate: string
  draft: boolean
  category: string
  tags: string[]
  snippet: string
  altitude: string
  eventDate: string
  organizer: string
  registrationDeadline: string
  registrationFeed: string
  website: string
  distances: string[]
  cover: string
  department: string
  municipality: string
  contentHtml: string
}

export type AllEvents = {
  eventsData: EventData[]
}
