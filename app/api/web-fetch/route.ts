import { NextRequest, NextResponse } from 'next/server'

interface WebFetchRequest {
  url: string
  prompt: string
}

export async function POST(request: NextRequest) {
  try {
    const { url, prompt }: WebFetchRequest = await request.json()

    if (!url || !prompt) {
      return NextResponse.json(
        { error: 'URL y prompt son requeridos' },
        { status: 400 }
      )
    }

    // Validar URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'URL inválida' },
        { status: 400 }
      )
    }

    console.log(`🌐 Obteniendo contenido de: ${url}`)
    console.log(`📝 Prompt: ${prompt}`)

    // Fetch el contenido de la página
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Aldebaran-EventBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    
    // Limpiar HTML básico - extraer texto principal
    const cleanText = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
      .replace(/<style[^>]*>.*?<\/style>/gi, '') // Remover estilos
      .replace(/<[^>]*>/g, ' ') // Remover todas las etiquetas HTML
      .replace(/\s+/g, ' ') // Normalizar espacios
      .replace(/&nbsp;/g, ' ') // Convertir &nbsp;
      .replace(/&[^;]+;/g, ' ') // Remover otras entidades HTML
      .trim()

    // Limitar longitud para evitar que sea demasiado largo
    const maxLength = 5000
    const truncatedText = cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...' 
      : cleanText

    console.log(`✅ Contenido extraído: ${truncatedText.length} caracteres`)

    return NextResponse.json({
      success: true,
      url,
      content: truncatedText,
      contentLength: truncatedText.length,
      originalLength: cleanText.length,
      truncated: cleanText.length > maxLength
    })

  } catch (error) {
    console.error('❌ Error en web-fetch:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    
    return NextResponse.json(
      { 
        error: `Error obteniendo contenido: ${errorMessage}`,
        details: 'Verifica que la URL sea accesible y válida'
      },
      { status: 500 }
    )
  }
}