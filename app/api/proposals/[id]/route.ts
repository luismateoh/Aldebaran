import { NextRequest, NextResponse } from 'next/server'
import { proposalsServiceAdmin } from '@/lib/proposals-firebase-admin'
import { eventsServiceAdmin } from '@/lib/events-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'
import nodemailer from 'nodemailer'

// GET - Obtener propuesta por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('📡 API /api/proposals/[id] - Verificando autenticación...')

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const proposal = await proposalsServiceAdmin.getProposalById(resolvedParams.id)
    
    if (!proposal) {
      return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      proposal: proposal,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error in proposals/[id]:', error)
    return NextResponse.json({ 
      error: 'Error obteniendo propuesta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// PATCH - Actualizar estado de propuesta
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log(`📡 API /api/proposals/[id] - Actualizando propuesta ${resolvedParams.id}`)

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status, rejectionReason } = await request.json()
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Estado inválido. Debe ser: pending, approved, o rejected' 
      }, { status: 400 })
    }

    const reviewedBy = authResult.user?.email || 'Admin'
    
    const updatedProposal = await proposalsServiceAdmin.updateProposalStatus(
      resolvedParams.id, 
      status,
      reviewedBy,
      rejectionReason
    )
    
    if (!updatedProposal) {
      return NextResponse.json({ error: 'Propuesta no encontrada' }, { status: 404 })
    }
    
    // Si la propuesta fue aprobada, crear evento draft y enviar notificación
    if (status === 'approved') {
      try {
        // Crear evento draft automáticamente
        const eventData = {
          title: updatedProposal.title,
          eventDate: updatedProposal.eventDate,
          municipality: updatedProposal.municipality,
          department: updatedProposal.department,
          organizer: updatedProposal.organizer,
          website: updatedProposal.website || '',
          description: updatedProposal.description,
          distances: updatedProposal.distances || [],
          registrationFee: updatedProposal.registrationFee || '',
          category: updatedProposal.category || 'Running',
          status: 'draft' as const,
          draft: true,
          author: authResult.user?.email || 'Admin',
          altitude: '1000m', // Valor por defecto
          cover: '',
          tags: [
            (updatedProposal.category || 'running').toLowerCase(), 
            updatedProposal.municipality.toLowerCase(), 
            'atletismo'
          ],
          snippet: updatedProposal.description.substring(0, 150),
          proposalId: updatedProposal.id // Referencia a la propuesta original
        }

        const newEvent = await eventsServiceAdmin.createEvent(eventData)
        console.log(`✅ Evento draft creado desde propuesta: ${newEvent.id}`)

        // Enviar email de aprobación si tiene email
        if (updatedProposal.submitterEmail && updatedProposal.submitterEmail.trim()) {
          await sendApprovalNotificationEmail(updatedProposal)
          console.log(`✅ Email de aprobación enviado a: ${updatedProposal.submitterEmail}`)
        }
      } catch (error) {
        console.error('❌ Error creando evento draft o enviando email:', error)
        // No fallar la aprobación por errores en la creación del evento o email
      }
    }
    
    return NextResponse.json({ 
      success: true,
      proposal: updatedProposal,
      message: `Propuesta ${status === 'approved' ? 'aprobada' : status === 'rejected' ? 'rechazada' : 'actualizada'} exitosamente`
    })

  } catch (error) {
    console.error('❌ Error updating proposal:', error)
    return NextResponse.json({ 
      error: 'Error actualizando propuesta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// DELETE - Eliminar propuesta
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log(`📡 API /api/proposals/[id] - Eliminando propuesta ${resolvedParams.id}`)

    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const success = await proposalsServiceAdmin.deleteProposal(resolvedParams.id)
    
    if (!success) {
      return NextResponse.json({ error: 'Error eliminando propuesta' }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Propuesta eliminada exitosamente'
    })

  } catch (error) {
    console.error('❌ Error deleting proposal:', error)
    return NextResponse.json({ 
      error: 'Error eliminando propuesta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Función para enviar email de notificación de aprobación
async function sendApprovalNotificationEmail(proposal: any) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })

  const emailBody = `
¡Excelentes noticias! 🎉

Hola ${proposal.submittedBy},

Tu propuesta de evento deportivo ha sido **APROBADA** y será publicada en Aldebaran.

📋 **DETALLES DE TU EVENTO:**
🏃 Evento: ${proposal.title}
📅 Fecha: ${proposal.eventDate}
📍 Lugar: ${proposal.municipality}, ${proposal.department}
🏢 Organizador: ${proposal.organizer}
💰 Costo: ${proposal.registrationFee || 'Por definir'}
🌐 Web: ${proposal.website || 'No especificado'}

🏁 **DISTANCIAS DISPONIBLES:**
${proposal.distances?.length ? proposal.distances.map((d: string) => `• ${d}`).join('\n') : '• Por definir'}

📝 **DESCRIPCIÓN:**
${proposal.description}

---

✅ **PRÓXIMOS PASOS:**
1. Tu evento será publicado en https://aldebaran-run.vercel.app en las próximas horas
2. Los corredores podrán encontrarlo y registrarse
3. Te enviaremos el enlace directo cuando esté público

💡 **¿NECESITAS HACER CAMBIOS?**
Si necesitas actualizar alguna información del evento, contáctanos respondiendo a este email.

🏃‍♀️ **¡Gracias por contribuir a la comunidad atlética de Colombia!**

Un abrazo,
El equipo de Aldebaran 🌟

---
📧 Este correo fue generado automáticamente. Si no solicitaste esta información, puedes ignorarlo.
🆔 ID de propuesta: ${proposal.id}
⏰ Fecha de aprobación: ${new Date().toLocaleString('es-CO')}
  `

  const mailOptions = {
    from: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: proposal.submitterEmail,
    subject: `🎉 ¡Tu evento "${proposal.title}" ha sido aprobado! - Aldebaran`,
    text: emailBody
  }

  await transporter.sendMail(mailOptions)
}