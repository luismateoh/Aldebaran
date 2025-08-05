import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    })

    const eventsDirectory = path.join(process.cwd(), 'events')
    const fileNames = fs.readdirSync(eventsDirectory)
    
    // Filtrar solo eventos de 2024
    const events2024 = fileNames.filter(name => name.startsWith('2024-'))
    
    const migratedEvents = []

    for (const fileName of events2024) {
      const filePath = path.join(eventsDirectory, fileName)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)

      // Calcular nueva fecha (2024 → 2025)
      const oldDate = new Date(data.eventDate)
      const newDate = new Date(oldDate)
      newDate.setFullYear(2025)

      // Actualizar metadata
      const newData = {
        ...data,
        eventDate: newDate.toISOString().split('T')[0],
        registrationDeadline: newDate.toISOString().split('T')[0],
        publishDate: new Date().toISOString().split('T')[0]
      }

      // Generar nuevo nombre de archivo
      const year = newDate.getFullYear()
      const month = String(newDate.getMonth() + 1).padStart(2, '0')
      const day = String(newDate.getDate()).padStart(2, '0')
      const newFileName = fileName.replace('2024-', `${year}-${month}-${day}_`)

      // Generar nuevo contenido markdown
      const newMarkdown = matter.stringify(content, newData)

      // Commit a GitHub
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: process.env.GITHUB_OWNER!,
        repo: process.env.GITHUB_REPO!,
        path: `events/${newFileName}`,
        message: `Migrate event to 2025: ${data.title}`,
        content: Buffer.from(newMarkdown).toString('base64'),
        committer: {
          name: 'Aldebaran Auto-Migration',
          email: process.env.ADMIN_EMAIL || 'admin@aldebaran.com',
        },
        author: {
          name: 'Aldebaran Auto-Migration',
          email: process.env.ADMIN_EMAIL || 'admin@aldebaran.com',
        },
      })

      migratedEvents.push({
        oldFile: fileName,
        newFile: newFileName,
        oldDate: data.eventDate,
        newDate: newData.eventDate,
        title: data.title
      })
    }

    return NextResponse.json({
      success: true,
      migratedCount: migratedEvents.length,
      events: migratedEvents,
      message: `Successfully migrated ${migratedEvents.length} events to 2025`
    })

  } catch (error: any) {
    console.error('Migration Error:', error)
    return NextResponse.json({ 
      error: 'Failed to migrate events',
      details: error.message 
    }, { status: 500 })
  }
}