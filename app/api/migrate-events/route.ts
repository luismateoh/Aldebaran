import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    // Verificar token de admin
    if (!token || token !== 'admin-token') {
      return NextResponse.json({ error: 'Token de admin requerido' }, { status: 401 })
    }

    console.log('🚀 Iniciando migración de eventos...')

    // Leer archivos de la carpeta events
    const eventsDir = path.join(process.cwd(), 'events')
    
    if (!fs.existsSync(eventsDir)) {
      return NextResponse.json({ 
        error: 'Carpeta /events/ no encontrada',
        migrated: 0,
        errors: 1,
        total: 0
      }, { status: 404 })
    }

    const files = fs.readdirSync(eventsDir)
    const markdownFiles = files.filter(file => file.endsWith('.md') && file !== '2024-1-1__template.md')
    
    console.log(`📁 Encontrados ${markdownFiles.length} archivos markdown`)

    let migrated = 0
    let errors = 0
    const errorDetails: string[] = []

    for (const file of markdownFiles) {
      try {
        const filePath = path.join(eventsDir, file)
        const fileContent = fs.readFileSync(filePath, 'utf8')
        const { data: frontmatter, content } = matter(fileContent)

        // Extraer información del nombre del archivo
        const fileBasename = path.basename(file, '.md')
        const [datePart, ...titleParts] = fileBasename.split('_')
        const titleFromFile = titleParts.join('_')

        // Crear ID único para el evento
        const eventId = fileBasename.replace(/[^a-z0-9_-]/gi, '')

        // Preparar datos del evento
        const eventData = {
          eventId,
          title: frontmatter.title || titleFromFile.toUpperCase(),
          date: frontmatter.eventDate || datePart,
          municipality: frontmatter.municipality || '',
          department: frontmatter.department || '',
          organizer: frontmatter.organizer || '',
          category: frontmatter.category || 'Running',
          status: frontmatter.draft === false ? 'published' : 'draft',
          distances: frontmatter.distances || [],
          website: frontmatter.website || '',
          registrationFee: frontmatter.registrationFeed || '',
          description: frontmatter.snippet || content.substring(0, 200) + '...',
          altitude: frontmatter.altitude || '',
          cover: frontmatter.cover || '',
          tags: frontmatter.tags || [frontmatter.category?.toLowerCase() || 'running'],
          publishDate: frontmatter.publishDate || new Date().toISOString().split('T')[0],
          author: frontmatter.author || 'Luis Hincapie'
        }

        // Usar la URL correcta para desarrollo local
        const baseUrl = process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : `http://localhost:${process.env.PORT || 3000}`

        // Enviar al sistema híbrido
        const response = await fetch(`${baseUrl}/api/hybrid-storage`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'create_event',
            eventData,
            markdownContent: fileContent
          })
        })

        if (response.ok) {
          migrated++
          console.log(`✅ Migrado: ${file}`)
        } else {
          const errorData = await response.json()
          throw new Error(`HTTP ${response.status}: ${errorData.error || 'Error desconocido'}`)
        }

      } catch (error) {
        errors++
        const errorMsg = `Error en ${file}: ${error instanceof Error ? error.message : 'Error desconocido'}`
        errorDetails.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }

    const result = {
      success: true,
      message: `Migración completada. ${migrated} eventos migrados, ${errors} errores`,
      migrated,
      errors,
      total: markdownFiles.length,
      errorDetails: errors > 0 ? errorDetails : undefined
    }

    console.log('📊 Resultado de migración:', result)

    return NextResponse.json(result)

  } catch (error) {
    console.error('💥 Error durante migración:', error)
    return NextResponse.json({ 
      error: 'Error durante la migración',
      details: error instanceof Error ? error.message : 'Error desconocido',
      migrated: 0,
      errors: 1,
      total: 0
    }, { status: 500 })
  }
}