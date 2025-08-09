import { NextRequest, NextResponse } from 'next/server'
import { UI_CONSTANTS } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { url, query } = await request.json()
    
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'URL válida requerida' }, { status: 400 })
    }

    console.log(`🔍 Buscando información en: ${url}`)
    
    // Usar WebFetch para obtener contenido de la página
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), UI_CONSTANTS.SEARCH_TIMEOUT)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    
    // Extraer contenido relevante básico (sin librerías de parsing)
    const textContent = extractTextFromHTML(html)
    
    // Filtrar contenido relevante para eventos deportivos
    const relevantContent = extractRelevantEventInfo(textContent, query)
    
    console.log(`✅ Contenido extraído: ${relevantContent.length} caracteres`)
    
    return NextResponse.json({
      success: true,
      content: relevantContent,
      url: url
    })

  } catch (error) {
    console.error('❌ Error en web-search:', error)
    
    return NextResponse.json({
      success: false,
      content: '',
      error: 'No se pudo obtener información de la URL'
    })
  }
}

function extractTextFromHTML(html: string): string {
  // Remover scripts y estilos
  let text = html.replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<style[^>]*>.*?<\/style>/gi, '')
                
  // Extraer texto de tags relevantes
  const titleMatch = text.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1] : ''
  
  // Buscar meta description
  const metaDescMatch = text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)
  const metaDesc = metaDescMatch ? metaDescMatch[1] : ''
  
  // Extraer contenido de párrafos y headers
  const paragraphs = text.match(/<[ph][^>]*>(.*?)<\/[ph][^>]*>/gi) || []
  const paragraphTexts = paragraphs.map(p => p.replace(/<[^>]*>/g, ' ')).join(' ')
  
  // Combinar todo el texto
  const fullText = `${title} ${metaDesc} ${paragraphTexts}`
    .replace(/<[^>]*>/g, ' ')  // Remover tags HTML restantes
    .replace(/\s+/g, ' ')      // Normalizar espacios
    .trim()
  
  return fullText.substring(0, 2000) // Limitar a 2000 caracteres
}

function extractRelevantEventInfo(text: string, query: string): string {
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  
  // Palabras clave para eventos deportivos
  const eventKeywords = [
    'carrera', 'maratón', 'atletismo', 'running', 'fecha', 'inscripciones', 
    'distancia', 'kilómetros', 'meta', 'salida', 'recorrido', 'participantes',
    'premios', 'costo', 'precio', 'entrada', 'registro', 'horario', 'lugar',
    'organiza', 'patrocina', 'apoyo', 'ruta', 'clima', 'temperatura'
  ]
  
  // Buscar secciones relevantes
  const sentences = text.split(/[.!?]+/)
  const relevantSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase()
    return eventKeywords.some(keyword => lowerSentence.includes(keyword)) ||
           lowerQuery.split(' ').some(queryWord => lowerSentence.includes(queryWord))
  })
  
  // Si no encontramos contenido relevante, usar el primer párrafo
  if (relevantSentences.length === 0) {
    return text.substring(0, 500)
  }
  
  const relevantText = relevantSentences.slice(0, 5).join('. ')
  return relevantText.length > 1000 ? relevantText.substring(0, 1000) + '...' : relevantText
}