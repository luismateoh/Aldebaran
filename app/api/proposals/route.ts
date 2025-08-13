import { NextRequest, NextResponse } from 'next/server'
import { proposalsServiceAdmin } from '@/lib/proposals-firebase-admin'
import { verifyAdminToken } from '@/lib/auth-server'
import nodemailer from 'nodemailer'

// GET - Obtener todas las propuestas (solo admin)
export async function GET(request: NextRequest) {
  try {
    console.log('📡 API /api/proposals - Verificando autenticación...')

    // Verificar autenticación de admin
    const authResult = await verifyAdminToken(request)
    if (!authResult.success) {
      console.log('❌ Admin verification failed:', authResult.error)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Admin verified:', authResult.user?.email)
    console.log('📡 API /api/proposals - Obteniendo propuestas desde Firebase...')

    const proposals = await proposalsServiceAdmin.getAllProposals()

    console.log(`✅ API /api/proposals - ${proposals.length} propuestas encontradas`)

    return NextResponse.json({ 
      proposals: proposals,
      total: proposals.length,
      source: 'firebase'
    })

  } catch (error) {
    console.error('❌ Error in proposals API:', error)
    return NextResponse.json({ 
      error: 'Error cargando propuestas desde Firebase',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// POST - Crear nueva propuesta (público, sin autenticación)
export async function POST(request: NextRequest) {
  try {
    console.log('📡 API /api/proposals - Creando nueva propuesta...')

    const proposalData = await request.json()
    
    // Validar campos requeridos
    if (!proposalData.title || !proposalData.eventDate || !proposalData.municipality || !proposalData.department) {
      return NextResponse.json({ 
        error: 'Campos requeridos: título, fecha del evento, municipio y departamento' 
      }, { status: 400 })
    }

    // Obtener información del request
    const userAgent = request.headers.get('user-agent') || ''
    const forwarded = request.headers.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

    const enrichedProposalData = {
      ...proposalData,
      submittedBy: proposalData.submittedBy || 'Usuario anónimo',
      userAgent,
      ipAddress,
      status: 'pending' as const
    }

    const newProposal = await proposalsServiceAdmin.createProposal(enrichedProposalData)

    console.log(`✅ API /api/proposals - Propuesta creada: ${newProposal.id}`)

    // Enviar email de notificación al admin
    try {
      await sendProposalNotificationEmail(newProposal)
      console.log('✅ Email de notificación enviado')
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError)
      // No fallar la creación de la propuesta por un error de email
    }

    return NextResponse.json({ 
      success: true,
      proposal: newProposal,
      message: 'Propuesta enviada exitosamente. Será revisada por nuestro equipo.'
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating proposal:', error)
    return NextResponse.json({ 
      error: 'Error creando propuesta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

// Función para enviar email de notificación
async function sendProposalNotificationEmail(proposal: any) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD // Necesitarás generar una contraseña de aplicación
    }
  })

  const emailBody = `
🏃‍♂️ NUEVA PROPUESTA DE EVENTO - ALDEBARAN

📝 INFORMACIÓN BÁSICA:
• Título: ${proposal.title}
• Fecha: ${proposal.eventDate}
• Ciudad: ${proposal.municipality}, ${proposal.department}
• Organizador: ${proposal.organizer || 'No especificado'}
• Categoría: ${proposal.category}

💰 DETALLES ECONÓMICOS:
• Costo: ${proposal.registrationFee || 'No especificado'}
• Sitio web: ${proposal.website || 'No especificado'}

🏃‍♀️ DISTANCIAS:
${proposal.distances?.length ? proposal.distances.map((d: string) => `• ${d}`).join('\n') : '• No especificadas'}

📋 DESCRIPCIÓN:
${proposal.description || 'Sin descripción proporcionada'}

👤 INFORMACIÓN DEL REMITENTE:
• Nombre: ${proposal.submittedBy || 'Usuario anónimo'}
• Email: ${proposal.submitterEmail || 'No proporcionado'}
• IP: ${proposal.ipAddress}

---
💡 Esta propuesta fue enviada desde el formulario público de Aldebaran.
⏰ Fecha de envío: ${new Date().toLocaleString('es-CO')}
🆔 ID de propuesta: ${proposal.id}

Para procesar este evento:
1. Ve a https://aldebaran-run.vercel.app/admin/proposals
2. Revisa y aprueba la propuesta
3. El evento será publicado automáticamente
  `

  const mailOptions = {
    from: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    to: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    subject: `🏃‍♂️ Nueva Propuesta: ${proposal.title}`,
    text: emailBody
  }

  await transporter.sendMail(mailOptions)
}