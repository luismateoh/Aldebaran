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
    
    const prompt = `
Eres un experto en eventos de atletismo en Colombia. Basándote en la siguiente información básica de un evento, genera un archivo Markdown completo y atractivo con información enriquecida:

INFORMACIÓN BÁSICA:
- Título: ${eventData.title}
- Fecha: ${eventData.eventDate}
- Ciudad: ${eventData.municipality}, ${eventData.department}
- Organizador: ${eventData.organizer || 'Por definir'}
- Sitio web: ${eventData.website || 'Por definir'}
- Distancias: ${eventData.distances?.join(', ') || 'Por definir'}
- Descripción básica: ${eventData.description || 'Evento de atletismo'}
- Costo: ${eventData.registrationFeed || 'Por confirmar'}

INSTRUCCIONES:
1. Mantén el frontmatter YAML exactamente como se requiere para el sistema
2. Enriquece la descripción con información típica de eventos similares en Colombia
3. Agrega secciones útiles como: requisitos, recomendaciones, qué incluye la inscripción
4. Incluye información sobre clima típico de la región en esa época
5. Agrega consejos de entrenamiento específicos para las distancias disponibles
6. Mantén un tono profesional pero entusiasta
7. Incluye información sobre accesibilidad y servicios

Genera SOLO el archivo Markdown completo sin explicaciones adicionales:
`

    let enhancedMarkdown = ''

    // Intentar con Groq primero (gratuito)
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'demo') {
      try {
        const completion = await groq.chat.completions.create({
          model: "openai/gpt-oss-120b", // Modelo gratuito muy bueno
          messages: [
            {
              role: "system",
              content: "Eres un experto en eventos deportivos en Colombia. Generas contenido profesional y atractivo para eventos de atletismo en formato Markdown."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        })

        enhancedMarkdown = completion.choices[0]?.message?.content || ''
      } catch (error) {
        console.log('Groq failed, falling back to basic generation:', error)
      }
    }

    // Si no se pudo usar Groq o no hay API key, usar generación básica mejorada
    if (!enhancedMarkdown) {
      enhancedMarkdown = generateEnhancedMarkdown(eventData)
    }

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
      provider: enhancedMarkdown.includes('## Clima y Preparación') ? 'ai' : 'basic',
      imageProcessed: !!eventData.cover
    })

  } catch (error) {
    console.error('Error enhancing event:', error)
    
    // Fallback: generar markdown básico
    const eventData = await request.json()
    const fallbackMarkdown = generateEnhancedMarkdown(eventData)
    
    return NextResponse.json({ 
      markdown: fallbackMarkdown,
      success: false,
      message: 'Usando generación básica mejorada'
    })
  }
}

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
