import emailjs from '@emailjs/browser'
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

    // Para producción, usar EmailJS desde el cliente es más simple
    // El envío real se hará desde el componente usando emailjs.send()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Evento listo para envío',
      useEmailJS: true,
      eventData
    })

  } catch (error) {
    console.error('Error preparing email:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}
