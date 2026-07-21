import { NextRequest, NextResponse } from 'next/server'
import { proposalsServiceAdmin } from '@/lib/proposals-firebase-admin'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    console.log('📡 API /api/proposals/publish - Publicando propuesta como evento...')

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { proposalId } = await request.json()
    
    if (!proposalId) {
      return NextResponse.json({ error: 'ID de propuesta requerido' }, { status: 400 })
    }

    // Obtener la propuesta
    const proposal = await proposalsServiceAdmin.getProposalById(proposalId)
    
    if (!proposal) {
      return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
    }

    if (proposal.status !== 'approved') {
      return NextResponse.json({ 
        error: 'Solo se pueden publicar propuestas aprobadas' 
      }, { status: 400 })
    }

    // Buscar si ya existe un evento draft de esta propuesta
    const existingEvents = await eventsServiceAdmin.getAllEvents()
    const existingEvent = existingEvents.find(event => 
      event.proposalId === proposalId && event.status === 'draft'
    )

    let publishedEvent

    if (existingEvent) {
      // Si ya existe un evento draft, actualizarlo a published
      if (!existingEvent.id) {
        return NextResponse.json({ error: 'Evento draft sin ID válido' }, { status: 500 })
      }
      publishedEvent = await eventsServiceAdmin.updateEvent(existingEvent.id, {
        status: 'published',
        draft: false,
        publishedAt: new Date().toISOString(),
        publishedBy: authResult.user?.email || 'Admin'
      })
      console.log(`✅ Evento draft actualizado a published: ${existingEvent.id}`)
    } else {
      // Si no existe, crear nuevo evento published
      const eventData = {
        title: proposal.title,
        eventDate: proposal.eventDate,
        municipality: proposal.municipality,
        department: proposal.department,
        organizer: proposal.organizer,
        website: proposal.website || '',
        description: proposal.description,
        distances: proposal.distances,
        registrationFee: proposal.registrationFee || '',
        category: proposal.category,
        status: 'published' as const,
        draft: false,
        author: authResult.user?.email || 'Admin',
        altitude: '1000m', // Valor por defecto
        cover: '',
        tags: [proposal.category.toLowerCase(), proposal.municipality.toLowerCase(), 'atletismo'],
        snippet: proposal.description.substring(0, 150),
        proposalId: proposal.id,
        publishedAt: new Date().toISOString(),
        publishedBy: authResult.user?.email || 'Admin'
      }

      publishedEvent = await eventsServiceAdmin.createEvent(eventData)
      console.log(`✅ Evento nuevo creado como published: ${publishedEvent?.id}`)
    }

    if (!publishedEvent) {
      return NextResponse.json({ error: 'Error publicando el evento' }, { status: 500 })
    }

    // Si la propuesta tiene email del remitente, enviar notificación de publicación
    if (proposal.submitterEmail && proposal.submitterEmail.trim()) {
      try {
        await sendPublicationNotificationEmail(proposal, publishedEvent)
        console.log(`✅ Email de publicación enviado a: ${proposal.submitterEmail}`)
      } catch (emailError) {
        console.error('❌ Error enviando email de publicación:', emailError)
        // No fallar la publicación por un error de email
      }
    }

    return NextResponse.json({ 
      success: true,
      event: publishedEvent,
      eventId: publishedEvent.id,
      message: `Propuesta "${proposal.title}" publicada como evento exitosamente`
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error publishing proposal as event:', error)
    return NextResponse.json({ 
      error: 'Error publicando propuesta como evento',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Función para enviar email de notificación de publicación
async function sendPublicationNotificationEmail(proposal: any, event: any) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })

  const eventUrl = `https://aldebaran-run.vercel.app/events/${event.id}`

  const emailBody = `
¡Tu evento ya está publicado! 🏃‍♂️✨

Hola ${proposal.submittedBy},

¡Excelentes noticias! Tu evento deportivo ya está **OFICIALMENTE PUBLICADO** en Aldebaran y disponible para que los corredores se inscriban.

📋 **TU EVENTO PUBLICADO:**
🏃 Evento: ${proposal.title}
📅 Fecha: ${proposal.eventDate}
📍 Lugar: ${proposal.municipality}, ${proposal.department}
🏢 Organizador: ${proposal.organizer}
💰 Costo: ${proposal.registrationFee || 'Por definir'}

🌐 **¡YA PUEDES VERLO EN VIVO!**
Tu evento está disponible en: ${eventUrl}

🏁 **DISTANCIAS DISPONIBLES:**
${proposal.distances?.length ? proposal.distances.map((d: string) => `• ${d}`).join('\n') : '• Por definir'}

📝 **DESCRIPCIÓN:**
${proposal.description}

---

🎯 **LO QUE PUEDEN HACER LOS CORREDORES AHORA:**
✅ Ver toda la información del evento
✅ Guardar el evento en sus favoritos  
✅ Compartirlo con otros corredores
✅ Comentar y hacer preguntas
✅ Acceder al sitio de registro (si proporcionaste el link)

📈 **ESTADÍSTICAS:**
Te enviaremos actualizaciones sobre el interés en tu evento y las interacciones de los usuarios.

💡 **¿NECESITAS ACTUALIZAR ALGO?**
Si necesitas hacer cambios a la información del evento, contáctanos respondiendo a este email.

🏆 **¡Gracias por fortalecer la comunidad atlética colombiana!**

¡A correr se ha dicho! 🏃‍♀️💨
El equipo de Aldebaran 🌟

---
🔗 Link directo: ${eventUrl}
📧 Este correo fue generado automáticamente.
🆔 ID del evento: ${event.id}
⏰ Fecha de publicación: ${new Date().toLocaleString('es-CO')}
  `

  const mailOptions = {
    from: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: proposal.submitterEmail,
    subject: `🏃‍♂️ ¡Tu evento "${proposal.title}" ya está publicado! - Aldebaran`,
    text: emailBody
  }

  await transporter.sendMail(mailOptions)
}