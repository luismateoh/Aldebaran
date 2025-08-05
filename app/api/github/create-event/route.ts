import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'

// Verificar autenticación
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }
  // Aquí podrías verificar el JWT si quisieras
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    if (!verifyAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { eventData, markdown } = await request.json()

    // Configurar Octokit con el token de GitHub
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    })

    // Generar nombre de archivo
    const date = new Date(eventData.eventDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const filename = `${year}-${month}-${day}_${eventData.municipality.toLowerCase()}_${eventData.title.toLowerCase().replace(/[^a-z0-9]/g, '')}.md`

    // Crear o actualizar archivo en GitHub
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER!,
      repo: process.env.GITHUB_REPO!,
      path: `events/${filename}`,
      message: `Add new event: ${eventData.title}`,
      content: Buffer.from(markdown).toString('base64'),
      committer: {
        name: 'Aldebaran Admin',
        email: process.env.ADMIN_EMAIL || 'admin@aldebaran.com',
      },
      author: {
        name: 'Aldebaran Admin',
        email: process.env.ADMIN_EMAIL || 'admin@aldebaran.com',
      },
    })

    return NextResponse.json({ 
      success: true,
      filename,
      commitSha: response.data.commit.sha,
      message: 'Event created and committed to GitHub successfully'
    })

  } catch (error: any) {
    console.error('GitHub API Error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to create event on GitHub',
      details: error.message 
    }, { status: 500 })
  }
}