import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

interface ImageOptimizationQueue {
  eventId: string
  imageUrl: string
  timestamp: number
}

// Cola en memoria para optimización diferida
const optimizationQueue: ImageOptimizationQueue[] = []

export async function POST(request: NextRequest) {
  try {
    const { eventId, imageUrl, priority = false } = await request.json()

    if (!eventId || !imageUrl) {
      return NextResponse.json(
        { error: 'eventId e imageUrl son requeridos' },
        { status: 400 }
      )
    }

    console.log(`🔄 Procesando imagen para evento: ${eventId}`)

    // Si es prioritario, procesar inmediatamente
    if (priority) {
      const result = await optimizeImageNow(imageUrl, eventId)
      return NextResponse.json(result)
    }

    // Si no es prioritario, agregar a la cola
    optimizationQueue.push({
      eventId,
      imageUrl,
      timestamp: Date.now()
    })

    console.log(`📋 Imagen agregada a la cola. Total en cola: ${optimizationQueue.length}`)

    // Procesar cola en background
    processQueueInBackground()

    return NextResponse.json({
      success: true,
      message: 'Imagen agregada a la cola de optimización',
      queuePosition: optimizationQueue.length,
      estimatedTime: optimizationQueue.length * 30 // 30 segundos por imagen estimado
    })

  } catch (error) {
    console.error('❌ Error en cola de optimización:', error)
    return NextResponse.json(
      { error: 'Error procesando solicitud' },
      { status: 500 }
    )
  }
}

// Procesar cola en background
async function processQueueInBackground() {
  if (optimizationQueue.length === 0) return

  // Evitar procesamiento paralelo
  if ((global as any).processingQueue) return
  ;(global as any).processingQueue = true

  console.log(`🚀 Iniciando procesamiento de cola: ${optimizationQueue.length} imágenes`)

  while (optimizationQueue.length > 0) {
    const item = optimizationQueue.shift()
    if (!item) break

    try {
      console.log(`⚙️ Procesando imagen para evento: ${item.eventId}`)
      await optimizeImageNow(item.imageUrl, item.eventId)
      console.log(`✅ Imagen optimizada: ${item.eventId}`)
    } catch (error) {
      console.error(`❌ Error optimizando ${item.eventId}:`, error)
    }

    // Pausa pequeña entre optimizaciones para no sobrecargar
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  ;(global as any).processingQueue = false
  console.log(`🏁 Cola de optimización completada`)
}

// Función principal de optimización
async function optimizeImageNow(imageUrl: string, eventId: string) {
  try {
    // Verificar si ya existe optimizada
    const existingCheck = await checkExistingOptimizedImage(eventId)
    if (existingCheck.exists) {
      console.log(`♻️ Imagen ya optimizada para evento: ${eventId}`)
      return {
        success: true,
        optimizedUrl: existingCheck.url,
        cached: true
      }
    }

    // Llamar a la API de optimización
    const optimizationResponse = await fetch('/api/optimize-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl,
        eventId
      })
    })

    const result = await optimizationResponse.json()
    return result

  } catch (error) {
    console.error('❌ Error en optimización inmediata:', error)
    throw error
  }
}

// Verificar si ya existe imagen optimizada
async function checkExistingOptimizedImage(eventId: string): Promise<{ exists: boolean; url?: string }> {
  try {
    const possibleUrls = [
      `https://aldebaran.vercel.app/_vercel/blob/events/${eventId}_optimized.webp`,
      `https://aldebaran.vercel.app/_vercel/blob/events/${eventId}.webp`
    ]

    for (const url of possibleUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          return { exists: true, url }
        }
      } catch {
        continue
      }
    }

    return { exists: false }
  } catch {
    return { exists: false }
  }
}

// GET para verificar estado de la cola
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (eventId) {
    // Verificar estado específico de un evento
    const inQueue = optimizationQueue.find(item => item.eventId === eventId)
    const existing = await checkExistingOptimizedImage(eventId)

    return NextResponse.json({
      eventId,
      inQueue: !!inQueue,
      queuePosition: inQueue ? optimizationQueue.findIndex(item => item.eventId === eventId) + 1 : null,
      optimized: existing.exists,
      optimizedUrl: existing.url
    })
  }

  // Información general de la cola
  return NextResponse.json({
    queueLength: optimizationQueue.length,
    processing: !!(global as any).processingQueue,
    nextItems: optimizationQueue.slice(0, 5).map(item => ({
      eventId: item.eventId,
      timestamp: item.timestamp
    }))
  })
}