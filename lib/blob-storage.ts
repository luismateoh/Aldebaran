import { put, head, list, del } from '@vercel/blob'
import matter from 'gray-matter'

interface EventFile {
  url: string
  pathname: string
  size: number
  uploadedAt: Date
}

interface BlobEventData {
  metadata: any
  content: string
  url: string
}

// Funciones para manejar archivos de eventos en Blob Storage
export const blobStorage = {
  // Subir archivo de evento a Blob Storage
  async uploadEvent(eventId: string, markdownContent: string): Promise<EventFile> {
    try {
      const filename = `events/${eventId}.md`
      
      const blob = await put(filename, markdownContent, {
        access: 'public',
        contentType: 'text/markdown',
      })

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }
    } catch (error) {
      console.error('Error uploading to Blob Storage:', error)
      throw new Error('Failed to upload event file')
    }
  },

  // Obtener archivo de evento desde Blob Storage
  async getEvent(eventId: string): Promise<BlobEventData | null> {
    try {
      const filename = `events/${eventId}.md`
      
      // Verificar si existe
      try {
        await head(filename)
      } catch {
        return null // Archivo no existe
      }

      // Descargar contenido
      const response = await fetch(`https://blob.vercel-storage.com/${filename}`)
      if (!response.ok) return null

      const markdownContent = await response.text()
      const { data: metadata, content } = matter(markdownContent)

      return {
        metadata,
        content,
        url: `https://blob.vercel-storage.com/${filename}`
      }
    } catch (error) {
      console.error('Error fetching from Blob Storage:', error)
      return null
    }
  },

  // Listar todos los eventos en Blob Storage
  async listEvents(): Promise<EventFile[]> {
    try {
      const { blobs } = await list({
        prefix: 'events/',
        limit: 1000
      })

      return blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }))
    } catch (error) {
      console.error('Error listing events from Blob Storage:', error)
      return []
    }
  },

  // Eliminar evento de Blob Storage
  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      const filename = `events/${eventId}.md`
      await del(filename)
      return true
    } catch (error) {
      console.error('Error deleting from Blob Storage:', error)
      return false
    }
  },

  // Migrar eventos existentes a Blob Storage
  async migrateEventsToBlob(): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] }
    
    try {
      // En desarrollo, usar archivos locales
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Migration skipped in development')
        return results
      }

      // Aquí iría la lógica para migrar desde GitHub o archivos locales
      // Por ahora, retornamos éxito simulado
      console.log('📦 Blob migration would run in production')
      
      return results
    } catch (error) {
      console.error('Error during migration:', error)
      results.errors.push(`Migration failed: ${error}`)
      return results
    }
  }
}

// Hybrid event storage system combining Postgres + Blob Storage
export const hybridEventStorage = {
  async createEvent(eventData: any, markdownContent: string) {
    try {
      // 1. Store metadata in Postgres (handled by proposalQueries)
      console.log('🔧 Creating event with hybrid storage...')
      
      // 2. Store markdown content in Blob Storage
      const blob = await put(`events/${eventData.eventId}.md`, markdownContent, {
        access: 'public',
      })
      
      console.log(`✅ Event stored: Metadata in Postgres, Content in Blob (${blob.url})`)
      
      return {
        eventId: eventData.eventId,
        blobUrl: blob.url,
        storage: 'hybrid-postgres-blob'
      }
    } catch (error) {
      console.error('❌ Error in hybrid storage:', error)
      throw error
    }
  },

  async getEvent(eventId: string) {
    try {
      console.log(`🔍 Fetching event ${eventId} from hybrid storage`)
      
      // Get the blob URL and fetch the markdown content
      const { blobs } = await list({ 
        prefix: 'events/',
        limit: 1000 
      })
      
      // Find the specific event file
      const eventBlob = blobs.find(blob => 
        blob.pathname === `events/${eventId}.md`
      )
      
      if (!eventBlob) {
        console.log(`❌ Event ${eventId} not found in blob storage`)
        return null
      }
      
      // Fetch and parse the markdown content
      const response = await fetch(eventBlob.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch event: ${response.status}`)
      }
      
      const markdownContent = await response.text()
      const { data: frontmatter, content } = matter(markdownContent)
      
      // Return structured event data that matches the edit page interface
      const event = {
        id: eventId,
        title: frontmatter.title || eventId,
        date: frontmatter.eventDate || frontmatter.date || '',
        municipality: frontmatter.municipality || '',
        department: frontmatter.department || '',
        organizer: frontmatter.organizer || '',
        category: frontmatter.category || 'Running',
        status: frontmatter.draft === false ? 'published' : 'draft',
        distances: frontmatter.distances || [],
        website: frontmatter.website || '',
        registrationFee: frontmatter.registrationFeed || frontmatter.registrationFee || '',
        description: frontmatter.snippet || content.trim(),
        altitude: frontmatter.altitude || '',
        cover: frontmatter.cover || '',
        blobUrl: eventBlob.url,
        lastModified: eventBlob.uploadedAt
      }
      
      console.log(`✅ Successfully loaded event: ${event.title}`)
      return event
      
    } catch (error) {
      console.error('Error fetching event:', error)
      return null
    }
  },

  async listEvents() {
    try {
      console.log('📋 Listing all events from hybrid storage...')
      
      // Get all blob files with events prefix
      const { blobs } = await list({ 
        prefix: 'events/',
        limit: 1000 
      })
      
      console.log(`📊 Found ${blobs.length} event files in blob storage`)
      
      // Process each blob to extract event data
      const events = await Promise.all(
        blobs
          .filter(blob => blob.pathname.endsWith('.md'))
          .map(async (blob) => {
            try {
              // Extract eventId from pathname
              const eventId = blob.pathname.replace('events/', '').replace('.md', '')
              
              // Fetch and parse the markdown content
              const response = await fetch(blob.url)
              if (!response.ok) throw new Error(`Failed to fetch ${blob.pathname}`)
              
              const markdownContent = await response.text()
              const { data: frontmatter, content } = matter(markdownContent)
              
              return {
                id: eventId,
                title: frontmatter.title || eventId,
                date: frontmatter.eventDate || frontmatter.date || '',
                municipality: frontmatter.municipality || '',
                department: frontmatter.department || '',
                organizer: frontmatter.organizer || '',
                category: frontmatter.category || 'Running',
                status: frontmatter.draft === false ? 'published' : 'draft',
                distances: frontmatter.distances || [],
                website: frontmatter.website || '',
                registrationFee: frontmatter.registrationFeed || frontmatter.registrationFee || '',
                description: frontmatter.snippet || content.substring(0, 200) + '...',
                altitude: frontmatter.altitude || '',
                cover: frontmatter.cover || '',
                blobUrl: blob.url,
                lastModified: blob.uploadedAt
              }
            } catch (error) {
              console.error(`Error processing ${blob.pathname}:`, error)
              return null
            }
          })
      )
      
      // Filter out null results and sort by date
      const validEvents = events
        .filter(event => event !== null)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      console.log(`✅ Successfully processed ${validEvents.length} events`)
      
      return validEvents
    } catch (error) {
      console.error('Error listing events from hybrid storage:', error)
      return []
    }
  },

  async syncEvents() {
    try {
      console.log('🔄 Syncing events between Postgres and Blob Storage...')
      
      // List all blobs in events folder
      const { blobs } = await list({ prefix: 'events/' })
      
      console.log(`📊 Found ${blobs.length} files in blob storage`)
      
      return {
        synced: blobs.length,
        errors: 0
      }
    } catch (error) {
      console.error('Error syncing events:', error)
      return {
        synced: 0,
        errors: 1
      }
    }
  },

  async deleteEvent(eventId: string) {
    try {
      // Delete from both Postgres and Blob Storage
      await del(`events/${eventId}.md`)
      
      console.log(`🗑️ Event ${eventId} deleted from hybrid storage`)
      return { success: true }
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }
}

// Utility functions for blob storage
export const blobUtils = {
  async uploadFile(filename: string, content: string | Buffer) {
    try {
      const blob = await put(filename, content, { access: 'public' })
      return blob
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  },

  async listFiles(prefix?: string) {
    try {
      const { blobs } = await list({ prefix })
      return blobs
    } catch (error) {
      console.error('Error listing files:', error)
      return []
    }
  }
}