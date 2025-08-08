import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Función simplificada para crear placeholder SVG (sin dependencias externas)
function createEventPlaceholder(eventId: string) {
  try {
    const publicImagesDir = path.join(process.cwd(), 'public', 'images', 'events')
    
    // Verificar si el directorio existe, si no, crearlo
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true })
    }
    
    // Crear SVG simple
    const svgContent = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" fill="white" text-anchor="middle" dy=".3em" font-size="24" font-family="Arial, sans-serif">
        ${eventId.replace(/_/g, ' ').replace(/\d+/g, '').trim() || 'Evento'}
      </text>
    </svg>`
    
    const filePath = path.join(publicImagesDir, `${eventId}.svg`)
    fs.writeFileSync(filePath, svgContent)
    console.log(`✅ Placeholder SVG creado: ${filePath}`)
  } catch (error) {
    console.log(`❌ Error creando placeholder para ${eventId}:`, error)
  }
}

// Función para procesar imagen del evento en background (sin descargas externas en producción)
async function processEventImage(imageUrl: string, eventId: string) {
  try {
    // En producción, solo crear placeholder SVG local
    if (process.env.NODE_ENV === 'production') {
      createEventPlaceholder(eventId)
      console.log(`✅ Placeholder creado para evento en producción: ${eventId}`)
    } else {
      // En desarrollo, intentar descargar si la URL es válida
      if (imageUrl && imageUrl.startsWith('http')) {
        console.log(`🔄 En desarrollo - URL de imagen detectada: ${imageUrl}`)
        createEventPlaceholder(eventId) // Por simplicidad, solo crear placeholder
      } else {
        createEventPlaceholder(eventId)
        console.log(`✅ Placeholder creado para evento: ${eventId}`)
      }
    }
  } catch (error) {
    console.log(`❌ Error procesando imagen para ${eventId}:`, error)
    // Crear placeholder como fallback
    try {
      createEventPlaceholder(eventId)
    } catch (placeholderError) {
      console.log(`❌ Error creando placeholder:`, placeholderError)
    }
  }
}

// Groq es gratuito y muy rápido
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'demo', // Si no hay API key, usa fallback
})

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    console.log('🔍 Datos recibidos para mejorar evento:', {
      title: eventData.title,
      eventDate: eventData.eventDate,
      date: eventData.date,
      hasWebsite: !!eventData.website
    })
    
    // Primero intentar obtener información web si hay URL
    let webContent = ''
    if (eventData.website && eventData.website.startsWith('http')) {
      try {
        console.log(`🔍 Buscando información en: ${eventData.website}`)
        const response = await fetch('/api/web-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: eventData.website,
            query: `información evento ${eventData.title} ${eventData.municipality}` 
          })
        })
        
        if (response.ok) {
          const webData = await response.json()
          webContent = webData.content || ''
          console.log(`✅ Información web obtenida: ${webContent.length} caracteres`)
        }
      } catch (webError) {
        console.log('⚠️ No se pudo obtener información web, continuando sin ella')
      }
    }

    const prompt = `Genera una descripción mejorada para este evento de atletismo en Colombia.

DATOS DEL EVENTO:
- Título: ${eventData.title}
- Fecha: ${eventData.eventDate}
- Lugar: ${eventData.municipality}, ${eventData.department}
- Organizador: ${eventData.organizer || 'Por definir'}
- Distancias: ${eventData.distances?.join(', ') || 'Por definir'}
- Costo: ${eventData.registrationFeed || 'Por confirmar'}
${webContent ? `- Información adicional web: ${webContent.substring(0, 500)}...` : ''}

INSTRUCCIONES:
- Escribe SOLO una descripción fluida en español (máximo 200 palabras)
- Incluye detalles específicos sobre el lugar y la experiencia del evento
- Mantén un tono entusiasta pero profesional
- NO incluyas frontmatter, títulos, ni estructura markdown
- NO menciones información que no tengas (fechas específicas, precios, etc.)

Descripción:`

    let aiDescription = ''

    // Intentar con Groq primero (gratuito) - solo para generar descripción
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'demo') {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant", // Modelo más estable
          messages: [
            {
              role: "system",
              content: "Eres un experto en eventos deportivos en Colombia. Escribes descripciones atractivas y profesionales."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        })

        aiDescription = completion.choices[0]?.message?.content?.trim() || ''
        console.log(`✅ Descripción de IA generada: ${aiDescription.length} caracteres`)
      } catch (error) {
        console.log('⚠️ Groq failed, usando descripción básica:', error)
      }
    }

    // Generar markdown estructurado con la descripción de IA o básica
    const enhancedMarkdown = generateCleanMarkdown(eventData, aiDescription, webContent)

    // Procesar imagen del evento en paralelo (no bloquear la respuesta)
    let localImagePath = null
    if (eventData.cover && eventData.id) {
      try {
        // Intentar descargar imagen en background
        processEventImage(eventData.cover, eventData.id)
      } catch (imageError) {
        console.log('Error processing image (non-critical):', imageError)
      }
    }

    return NextResponse.json({ 
      markdown: enhancedMarkdown,
      success: true,
      provider: aiDescription ? 'ai' : 'basic',
      webContentUsed: !!webContent,
      imageProcessed: !!eventData.cover
    })

  } catch (error) {
    console.error('Error enhancing event:', error)
    
    // Fallback: generar markdown básico
    try {
      const eventData = await request.json()
      const fallbackMarkdown = generateCleanMarkdown(eventData, '', '')
      
      return NextResponse.json({ 
        markdown: fallbackMarkdown,
        success: false,
        provider: 'basic',
        message: 'Usando generación básica'
      })
    } catch (fallbackError) {
      return NextResponse.json({ 
        error: 'Error completo al generar contenido',
        success: false
      }, { status: 500 })
    }
  }
}

function generateCleanMarkdown(eventData: any, aiDescription: string = '', webContent: string = '') {
  // Manejar fecha de manera más robusta
  let date = new Date(eventData.eventDate || eventData.date)
  let formattedDate = 'Por definir'
  let year = new Date().getFullYear()
  let month = String(new Date().getMonth() + 1).padStart(2, '0')
  let day = String(new Date().getDate()).padStart(2, '0')
  
  // Verificar si la fecha es válida
  if (!isNaN(date.getTime())) {
    year = date.getFullYear()
    month = String(date.getMonth() + 1).padStart(2, '0')
    day = String(date.getDate()).padStart(2, '0')
    formattedDate = date.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } else {
    console.log('⚠️ Fecha inválida recibida:', eventData.eventDate || eventData.date)
    // Usar fecha de hoy como fallback
    date = new Date()
    formattedDate = 'Fecha por confirmar'
  }
  
  // Usar descripción de IA si está disponible, sino la básica, sino generar una
  let description = aiDescription || eventData.description
  
  if (!description) {
    description = `Únete a este emocionante evento de atletismo en ${eventData.municipality}, ${eventData.department}. Una experiencia deportiva que combina competencia, diversión y los hermosos paisajes de esta región colombiana.`
  }

  // Información de región simplificada
  const regionInfo = getSimpleRegionInfo(eventData.department)
  
  return `---
title: "${eventData.title || 'Evento de Atletismo'}"
author: "Luis Hincapie"
publishDate: "${new Date().toISOString().split('T')[0]}"
draft: false
category: "${eventData.category || 'Running'}"
tags:
  - "${(eventData.category || 'running').toLowerCase()}"
  - "${(eventData.municipality || 'colombia').toLowerCase()}"
  - "atletismo"
snippet: "${description.substring(0, 150).replace(/"/g, '\\"')}..."
altitude: "${regionInfo.altitude}"
eventDate: "${year}-${month}-${day}"
organizer: "${eventData.organizer || 'Por confirmar'}"
registrationDeadline: "${year}-${month}-${day}"
registrationFeed: "${eventData.registrationFeed || 'Por confirmar'}"
website: "${eventData.website || ''}"
distances:${eventData.distances?.map((d: string) => `\n  - "${d}"`).join('') || '\n  - "Por definir"'}
cover: ""
department: "${eventData.department || ''}"
municipality: "${eventData.municipality || ''}"
---

${description}

## Información del Evento

- Fecha: ${formattedDate}
- Lugar: ${eventData.municipality || 'Por definir'}, ${eventData.department || 'Colombia'}
- Organizador: ${eventData.organizer || 'Por confirmar'}
- Altitud: ${regionInfo.altitude}

${eventData.distances?.length ? `## Distancias Disponibles

${eventData.distances.map((d: string) => `- ${d} - ${getDistanceDescription(d)}`).join('\n')}` : ''}

## Información Importante

- Llegar con 30-45 minutos de anticipación
- Llevar documento de identidad
- Usar ropa deportiva adecuada
- Mantenerse hidratado durante el evento

${eventData.website ? `## Más Información

Sitio web oficial: ${eventData.website}` : ''}

---

¡Prepárate para vivir una experiencia deportiva inolvidable!
`
}

function getSimpleRegionInfo(department: string) {
  const regions = {
    'Antioquia': { altitude: '1,495 msnm' },
    'Bogotá': { altitude: '2,640 msnm' },
    'Valle del Cauca': { altitude: '1,000 msnm' },
    'Atlántico': { altitude: '18 msnm' },
    'Cundinamarca': { altitude: '2,000 msnm' },
    'Santander': { altitude: '760 msnm' },
  } as any

  return regions[department] || { altitude: 'Variable' }
}

// Mantener la función anterior por compatibilidad
function generateEnhancedMarkdown(eventData: any) {
  const date = new Date(eventData.eventDate)
  const year = date.getFullYear()
  const month = date.toLocaleDateString('en', { month: 'short' }).toLowerCase()
  const day = date.getDate()
  
  // Información contextual basada en la región
  const regionInfo = getRegionInfo(eventData.department)
  const distanceInfo = getDistanceRecommendations(eventData.distances)
  
  return `---
title: ${eventData.title?.toUpperCase() || 'EVENTO DE ATLETISMO'}
author: Luis Hincapie
publishDate: ${new Date().toISOString().split('T')[0]}
draft: false
category: ${eventData.category || 'Running'}
tags:
  - ${eventData.category?.toLowerCase() || 'running'}
  - ${eventData.municipality?.toLowerCase() || 'colombia'}
snippet: ${eventData.description || `Únete a este emocionante evento de atletismo en ${eventData.municipality || 'Colombia'}. Una experiencia deportiva única que combina competencia, diversión y paisajes espectaculares.`}
altitude: ${regionInfo.altitude}
eventDate: ${year}-${month}-${day}
organizer: ${eventData.organizer || 'Por confirmar'}
registrationDeadline: ${year}-${month}-${day}
registrationFeed: ${eventData.registrationFeed || 'Por confirmar'}
website: ${eventData.website || ''}
distances:
${eventData.distances?.map((d: string) => `  - ${d}`).join('\n') || '  - Por definir'}
cover: 
department: ${eventData.department || ''}
municipality: ${eventData.municipality || ''}
---

${eventData.description || `Únete a este emocionante evento de atletismo en ${eventData.municipality}, ${eventData.department}. Una experiencia deportiva única que combina competencia, diversión y los hermosos paisajes de esta región colombiana.`}

${regionInfo.description}

## 📅 Información del Evento

**Fecha:** ${date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
**Lugar:** ${eventData.municipality || 'Por definir'}, ${eventData.department || 'Colombia'}
**Organizador:** ${eventData.organizer || 'Por confirmar'}
**Altitud:** ${regionInfo.altitude}

## 🏃‍♂️ Distancias Disponibles

${eventData.distances?.map((d: string) => `- **${d}** - ${getDistanceDescription(d)}`).join('\n') || '- Por definir'}

## 📋 Requisitos

- ✅ Certificado médico deportivo vigente (no mayor a 6 meses)
- ✅ Documento de identidad
- ✅ Edad mínima según la distancia seleccionada
- ✅ Firma de deslinde de responsabilidad

## 🎯 Recomendaciones

### Antes del Evento
- 🕐 Llegar con 30-45 minutos de anticipación
- 👕 Usar ropa deportiva adecuada para el clima
- 👟 Calzado deportivo en buen estado
- 🧢 Gorra y protector solar

### Durante el Evento
- 💧 Mantenerse hidratado en los puntos de hidratación
- 📱 Llevar identificación y contacto de emergencia
- 👥 Respetar a otros participantes y voluntarios

## 🌤️ Clima y Preparación

${regionInfo.climate}

## 🏋️‍♂️ Plan de Entrenamiento

${distanceInfo}

## 📦 Incluye tu Inscripción

- 🏅 Medalla finisher
- 👕 Camiseta oficial del evento
- 📦 Kit de corredor
- 🥤 Hidratación durante el recorrido
- 🍌 Refrigerio post-carrera
- 📸 Fotografías del evento
- 🏥 Asistencia médica
- 📍 Chip de cronometraje

## ♿ Accesibilidad

Este evento está comprometido con la inclusión y cuenta con:
- 🚗 Parqueadero accesible
- 🚻 Baños adaptados
- 👥 Personal de apoyo especializado
- 🏃‍♀️ Categorías inclusivas

## 📞 Contacto

${eventData.website ? `🌐 **Sitio Web:** [${eventData.website}](${eventData.website})` : '📧 **Email:** Por confirmar'}
📱 **WhatsApp:** Por confirmar
📍 **Punto de encuentro:** Por confirmar

---

*¡Prepárate para vivir una experiencia deportiva inolvidable en ${eventData.municipality}!*
`
}

function getRegionInfo(department: string) {
  const regions = {
    'Antioquia': {
      altitude: '1,495 msnm',
      description: 'La región antioqueña ofrece un clima templado perfecto para el running, con sus montañas y valles que brindan paisajes espectaculares.',
      climate: 'El clima en Antioquia es templado durante todo el año, con temperaturas entre 18-24°C. Ideal para eventos deportivos. Se recomienda ropa ligera y mantenerse hidratado.'
    },
    'Bogotá': {
      altitude: '2,640 msnm',
      description: 'La capital colombiana, ubicada en la sabana cundiboyacense, ofrece un clima frío ideal para el atletismo de resistencia.',
      climate: 'Bogotá tiene un clima frío de montaña con temperaturas entre 8-19°C. Se recomienda ropa térmica para el calentamiento y mantenerse bien hidratado debido a la altitud.'
    },
    'Valle del Cauca': {
      altitude: '1,000 msnm',
      description: 'El valle geográfico del río Cauca ofrece condiciones climáticas ideales y paisajes únicos para eventos deportivos.',
      climate: 'Clima cálido tropical con temperaturas entre 22-30°C. Usar ropa ligera, protección solar y mantener hidratación constante.'
    },
    'Atlántico': {
      altitude: '18 msnm',
      description: 'La región caribeña brinda un ambiente tropical único con la calidez de su gente y la brisa del mar.',
      climate: 'Clima tropical cálido y húmedo con temperaturas entre 26-32°C. Eventos generalmente temprano en la mañana. Hidratación abundante es clave.'
    }
  } as any

  return regions[department] || {
    altitude: 'Variable',
    description: 'Una hermosa región colombiana que ofrece paisajes únicos y condiciones ideales para el atletismo.',
    climate: 'Consulta las condiciones climáticas locales. Se recomienda ropa deportiva adecuada y mantenerse hidratado.'
  }
}

function getDistanceDescription(distance: string) {
  const descriptions = {
    '1k': 'Ideal para niños y principiantes',
    '2k': 'Perfecta para toda la familia',
    '3k': 'Distancia recreativa',
    '5k': 'Clásica distancia popular',
    '8k': 'Distancia intermedia',
    '10k': 'Distancia olímpica',
    '15k': 'Resistencia media',
    '21k': 'Media maratón',
    '25k': 'Distancia de resistencia',
    '30k': 'Ultra distancia',
    '42k': 'Maratón completo',
    '50k': 'Ultra maratón',
    '100k': 'Ultra trail'
  } as any

  return descriptions[distance] || 'Distancia deportiva'
}

function getDistanceRecommendations(distances: string[]) {
  if (!distances || distances.length === 0) {
    return '**Entrena gradualmente** y consulta con un profesional para definir tu distancia ideal.'
  }

  const maxDistance = distances.includes('42k') ? '42k' : 
                     distances.includes('21k') ? '21k' : 
                     distances.includes('10k') ? '10k' : '5k'

  const plans = {
    '5k': `**Para 5K (4-6 semanas):**
- Semana 1-2: 3 entrenamientos/semana, 20-30 min corriendo/caminando
- Semana 3-4: 3 entrenamientos/semana, 30-40 min con más tiempo corriendo
- Semana 5-6: Incluir un día de tempo y uno de intervalos`,

    '10k': `**Para 10K (6-8 semanas):**
- Base aeróbica: 3-4 entrenamientos/semana
- Incluir una carrera larga semanal (aumentar 10% cada semana)
- 1 día de tempo o fartlek
- 1 día de intervalos
- Tiempo objetivo: completar sin parar`,

    '21k': `**Para Media Maratón (12-16 semanas):**
- 4-5 entrenamientos/semana
- Carrera larga progresiva (llegar a 18-20K)
- 2 días de velocidad/tempo por semana
- Incluir carreras de práctica de 10K y 15K
- Trabajar nutrición e hidratación`,

    '42k': `**Para Maratón (16-20 semanas):**
- 5-6 entrenamientos/semana con días de descanso
- Carreras largas progresivas (llegar a 32-35K)
- Periodización con semanas de descarga
- Práctica de nutrición en carreras largas
- Simulacros de ritmo objetivo`
  } as any

  return plans[maxDistance] || '**Entrena de forma progresiva** y adapta el plan a tu nivel actual.'
}
