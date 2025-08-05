#!/usr/bin/env node

/**
 * Script para descargar y optimizar imágenes de eventos
 * Se puede llamar desde el formulario de eventos
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const EVENTS_DIR = path.join(__dirname, '../public/images/events')

/**
 * Descarga una imagen desde una URL y la guarda localmente
 * @param {string} imageUrl - URL de la imagen a descargar
 * @param {string} eventId - ID del evento
 * @returns {Promise<string>} - Ruta local de la imagen guardada
 */
async function downloadEventImage(imageUrl, eventId) {
  try {
    console.log(`📥 Descargando imagen para evento: ${eventId}`)
    
    if (!imageUrl || !imageUrl.startsWith('http')) {
      throw new Error('URL de imagen inválida')
    }

    // Crear directorio si no existe
    if (!fs.existsSync(EVENTS_DIR)) {
      fs.mkdirSync(EVENTS_DIR, { recursive: true })
    }

    // Determinar extensión de archivo
    const urlPath = new URL(imageUrl).pathname
    const extension = path.extname(urlPath) || '.jpg'
    const filename = `${eventId}${extension}`
    const filepath = path.join(EVENTS_DIR, filename)

    // Descargar imagen
    await downloadImage(imageUrl, filepath)
    
    console.log(`✅ Imagen guardada: ${filename}`)
    return `/images/events/${filename}`
    
  } catch (error) {
    console.error(`❌ Error descargando imagen:`, error.message)
    
    // Crear placeholder si la descarga falla
    await createEventPlaceholder(eventId)
    return `/images/events/${eventId}.svg`
  }
}

/**
 * Descarga una imagen desde una URL
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    
    const request = https.get(url, (response) => {
      // Manejar redirecciones
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close()
        fs.unlink(filepath, () => {}) 
        return downloadImage(response.headers.location, filepath).then(resolve).catch(reject)
      }
      
      if (response.statusCode !== 200) {
        file.close()
        fs.unlink(filepath, () => {})
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        resolve()
      })
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {})
        reject(err)
      })
    })

    request.on('error', reject)
    request.setTimeout(10000, () => {
      request.destroy()
      reject(new Error('Timeout de descarga'))
    })
  })
}

/**
 * Crea un placeholder SVG para un evento específico
 */
async function createEventPlaceholder(eventId) {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#84cc16', '#8b5cf6', '#ec4899']
  const color = colors[eventId.length % colors.length]
  
  // Extraer información del ID del evento
  const parts = eventId.split('_')
  const date = parts[0] || ''
  const city = (parts[1] || 'evento').toUpperCase()
  const name = (parts[2] || 'atletismo').replace(/([A-Z])/g, ' $1').trim()
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${eventId.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}60;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad${eventId.replace(/[^a-zA-Z0-9]/g, '')})"/>
  <circle cx="400" cy="280" r="80" fill="white" opacity="0.15"/>
  <text x="400" y="240" font-family="Arial, sans-serif" font-size="32" fill="white" text-anchor="middle" font-weight="bold">
    🏃‍♂️
  </text>
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
    ${city}
  </text>
  <text x="400" y="310" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.9">
    ${name}
  </text>
  <text x="400" y="340" font-family="Arial, sans-serif" font-size="14" fill="white" text-anchor="middle" opacity="0.7">
    ${date}
  </text>
  <text x="400" y="400" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.6">
    ALDEBARAN • Atletismo Colombia
  </text>
</svg>`

  const svgPath = path.join(EVENTS_DIR, `${eventId}.svg`)
  fs.writeFileSync(svgPath, svg)
  
  console.log(`✅ Placeholder SVG creado: ${eventId}.svg`)
}

/**
 * Optimiza todas las imágenes de un directorio
 */
async function optimizeImages() {
  console.log('🔧 Optimizando imágenes...')
  
  const files = fs.readdirSync(EVENTS_DIR)
  const imageFiles = files.filter(file => 
    file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
  )
  
  console.log(`📊 Encontradas ${imageFiles.length} imágenes para optimizar`)
  
  // Aquí podrías agregar lógica de optimización real
  // Por ejemplo, usando sharp para redimensionar/comprimir
  
  return imageFiles.length
}

/**
 * Limpia imágenes huérfanas (sin evento correspondiente)
 */
async function cleanupOrphanImages() {
  console.log('🧹 Limpiando imágenes huérfanas...')
  
  const eventsPath = path.join(__dirname, '../events')
  if (!fs.existsSync(eventsPath)) {
    console.log('❌ Carpeta de eventos no encontrada')
    return
  }
  
  const eventFiles = fs.readdirSync(eventsPath)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace('.md', ''))
  
  const imageFiles = fs.readdirSync(EVENTS_DIR)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.svg') || file.endsWith('.png'))
  
  let cleanedCount = 0
  
  for (const imageFile of imageFiles) {
    const eventId = path.parse(imageFile).name
    if (!eventFiles.includes(eventId)) {
      const imagePath = path.join(EVENTS_DIR, imageFile)
      fs.unlinkSync(imagePath)
      console.log(`🗑️ Eliminada imagen huérfana: ${imageFile}`)
      cleanedCount++
    }
  }
  
  console.log(`✅ Limpieza completada: ${cleanedCount} imágenes eliminadas`)
}

// Función principal para uso desde línea de comandos
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'download':
      const imageUrl = args[1]
      const eventId = args[2]
      if (!imageUrl || !eventId) {
        console.error('Uso: npm run download-image <url> <eventId>')
        process.exit(1)
      }
      await downloadEventImage(imageUrl, eventId)
      break
      
    case 'optimize':
      await optimizeImages()
      break
      
    case 'cleanup':
      await cleanupOrphanImages()
      break
      
    case 'placeholder':
      const placeholderEventId = args[1]
      if (!placeholderEventId) {
        console.error('Uso: npm run image-tools placeholder <eventId>')
        process.exit(1)
      }
      await createEventPlaceholder(placeholderEventId)
      break
      
    default:
      console.log('🖼️ Herramientas de imágenes para Aldebaran')
      console.log('')
      console.log('Comandos disponibles:')
      console.log('  npm run image-tools download <url> <eventId>  - Descargar imagen para evento')
      console.log('  npm run image-tools optimize                  - Optimizar todas las imágenes')
      console.log('  npm run image-tools cleanup                   - Limpiar imágenes huérfanas')
      console.log('  npm run image-tools placeholder <eventId>     - Crear placeholder para evento')
      break
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(console.error)
}

module.exports = {
  downloadEventImage,
  createEventPlaceholder,
  optimizeImages,
  cleanupOrphanImages
}
