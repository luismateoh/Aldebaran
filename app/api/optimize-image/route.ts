import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, eventId } = await request.json()

    if (!imageUrl || !eventId) {
      return NextResponse.json(
        { error: 'imageUrl y eventId son requeridos' },
        { status: 400 }
      )
    }

    console.log(`🔄 Optimizando imagen para evento: ${eventId}`)
    console.log(`📥 URL original: ${imageUrl}`)

    // 1. Descargar la imagen
    const downloadResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AldebaranBot/1.0)'
      }
    })

    if (!downloadResponse.ok) {
      throw new Error(`Error descargando imagen: ${downloadResponse.status}`)
    }

    const imageBuffer = Buffer.from(await downloadResponse.arrayBuffer())
    const originalSize = imageBuffer.length

    console.log(`📊 Tamaño original: ${Math.round(originalSize / 1024)} KB`)

    // 2. Obtener metadatos de la imagen
    const metadata = await sharp(imageBuffer).metadata()
    console.log(`🔍 Imagen original: ${metadata.width}x${metadata.height} ${metadata.format}`)

    // 3. Optimizar la imagen
    let optimizedBuffer: Buffer
    let outputFormat = 'webp' // Formato más eficiente

    // Configuración de optimización basada en el tamaño original
    const isLargeImage = (metadata.width || 0) > 1200 || (metadata.height || 0) > 1200
    const targetWidth = isLargeImage ? 1200 : metadata.width
    const targetHeight = isLargeImage ? Math.round((targetWidth || 0) * ((metadata.height || 0) / (metadata.width || 1))) : metadata.height

    optimizedBuffer = await sharp(imageBuffer)
      .resize(targetWidth, targetHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: 85, // Calidad alta pero optimizada
        effort: 6   // Máximo esfuerzo de compresión
      })
      .toBuffer()

    const optimizedSize = optimizedBuffer.length
    const compressionRatio = Math.round(((originalSize - optimizedSize) / originalSize) * 100)

    console.log(`🎯 Tamaño optimizado: ${Math.round(optimizedSize / 1024)} KB`)
    console.log(`📉 Compresión: ${compressionRatio}%`)

    // 4. Subir a Vercel Blob Storage
    const filename = `events/${eventId}_optimized.webp`
    
    const blob = await put(filename, optimizedBuffer, {
      access: 'public',
      contentType: 'image/webp'
    })

    console.log(`✅ Imagen subida a: ${blob.url}`)

    // 5. Generar también una versión thumbnail
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(400, 300, {
        fit: 'cover',
        position: 'center'
      })
      .webp({
        quality: 80,
        effort: 6
      })
      .toBuffer()

    const thumbnailBlob = await put(`events/${eventId}_thumb.webp`, thumbnailBuffer, {
      access: 'public',
      contentType: 'image/webp'
    })

    console.log(`🖼️ Thumbnail creado: ${thumbnailBlob.url}`)

    return NextResponse.json({
      success: true,
      optimizedUrl: blob.url,
      thumbnailUrl: thumbnailBlob.url,
      originalSize,
      optimizedSize,
      compressionRatio,
      metadata: {
        originalFormat: metadata.format,
        originalDimensions: `${metadata.width}x${metadata.height}`,
        optimizedDimensions: `${targetWidth}x${targetHeight}`,
        outputFormat
      }
    })

  } catch (error) {
    console.error('❌ Error optimizando imagen:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: 'No se pudo descargar u optimizar la imagen'
      },
      { status: 500 }
    )
  }
}

// Función helper para validar URLs de imagen
function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    
    // Extensiones válidas
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    return validExtensions.some(ext => pathname.endsWith(ext)) ||
           urlObj.hostname.includes('unsplash.com') ||
           urlObj.hostname.includes('pexels.com') ||
           urlObj.hostname.includes('pixabay.com')
  } catch {
    return false
  }
}

// Endpoint GET para verificar estado de optimización
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')

  if (!eventId) {
    return NextResponse.json(
      { error: 'eventId es requerido' },
      { status: 400 }
    )
  }

  try {
    // Verificar si ya existe imagen optimizada
    const possibleUrls = [
      `https://aldebaran.vercel.app/_vercel/blob/events/${eventId}_optimized.webp`,
      `https://aldebaran.vercel.app/_vercel/blob/events/${eventId}_thumb.webp`
    ]

    const checks = await Promise.all(
      possibleUrls.map(async (url) => {
        try {
          const response = await fetch(url, { method: 'HEAD' })
          return { url, exists: response.ok }
        } catch {
          return { url, exists: false }
        }
      })
    )

    return NextResponse.json({
      eventId,
      optimizedImage: checks.find(c => c.url.includes('_optimized'))?.exists || false,
      thumbnail: checks.find(c => c.url.includes('_thumb'))?.exists || false,
      urls: checks.filter(c => c.exists).map(c => c.url)
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Error verificando estado' },
      { status: 500 }
    )
  }
}