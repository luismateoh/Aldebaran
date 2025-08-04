import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // En desarrollo, no enviamos email real
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Simulando envío de email en desarrollo:', eventData)
      return NextResponse.json({ 
        success: true, 
        message: 'Email simulado en desarrollo' 
      })
    }

    // Validaciones básicas
    if (!eventData.title || !eventData.eventDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Título y fecha son requeridos' 
      }, { status: 400 })
    }

    // Formatear el email
    const emailBody = `
🏃‍♂️ NUEVO EVENTO PROPUESTO - ALDEBARAN

📝 INFORMACIÓN BÁSICA:
• Título: ${eventData.title}
• Fecha: ${eventData.eventDate}
• Ciudad: ${eventData.municipality}, ${eventData.department}
• Organizador: ${eventData.organizer || 'No especificado'}
• Categoría: ${eventData.category}

💰 DETALLES ECONÓMICOS:
• Costo: ${eventData.registrationFeed || 'No especificado'}
• Sitio web: ${eventData.website || 'No especificado'}

🏃‍♀️ DISTANCIAS:
${eventData.distances?.length ? eventData.distances.map((d: string) => `• ${d}`).join('\n') : '• No especificadas'}

📋 DESCRIPCIÓN:
${eventData.description || 'Sin descripción proporcionada'}

---
💡 Este evento fue enviado desde el formulario de Aldebaran.
⏰ Fecha de envío: ${new Date().toLocaleString('es-CO')}

Para procesar este evento:
1. Copia esta información
2. Ve a http://localhost:3000/admin (en tu entorno local)
3. Completa el formulario y usa "🤖 Enriquecer con IA"
4. Guarda el archivo generado en /events/
5. Haz commit y push para publicar
`

    // Para producción real, aquí usarías un servicio de email
    // Por ahora, simularemos el envío
    
    // Ejemplo con diferentes servicios (descomenta el que prefieras):
    
    // OPCIÓN 1: EmailJS (Frontend)
    // Se maneja desde el cliente, más simple
    
    // OPCIÓN 2: Nodemailer (requiere SMTP)
    // const nodemailer = require('nodemailer')
    
    // OPCIÓN 3: SendGrid (requiere API key)
    // const sgMail = require('@sendgrid/mail')
    
    // OPCIÓN 4: Resend (moderno y fácil)
    // const { Resend } = require('resend')

    // Para ahora, simulamos el éxito
    console.log('📧 Email que se enviaría:', emailBody)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Evento enviado correctamente',
      preview: emailBody // Solo para desarrollo, remover en producción
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
