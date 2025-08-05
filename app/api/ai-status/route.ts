import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar si las APIs de IA están configuradas
    const groqConfigured = !!process.env.GROQ_API_KEY
    const openaiConfigured = !!process.env.OPENAI_API_KEY
    const googleConfigured = !!process.env.GOOGLE_API_KEY
    
    // Probar conectividad si las APIs están configuradas
    let groqStatus = 'not_configured'
    let openaiStatus = 'not_configured'
    let googleStatus = 'not_configured'
    
    if (groqConfigured) {
      try {
        // Test básico de Groq (sin hacer llamada real para no gastar tokens)
        groqStatus = 'configured'
      } catch (error) {
        groqStatus = 'error'
      }
    }
    
    if (openaiConfigured) {
      try {
        openaiStatus = 'configured'
      } catch (error) {
        openaiStatus = 'error'
      }
    }

    if (googleConfigured) {
      try {
        googleStatus = 'configured'
      } catch (error) {
        googleStatus = 'error'
      }
    }

    const aiConfig = {
      groq: {
        configured: groqConfigured,
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        status: groqStatus,
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        description: 'Groq - Inferencia ultrarrápida'
      },
      openai: {
        configured: openaiConfigured,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        status: openaiStatus,
        endpoint: 'https://api.openai.com/v1/chat/completions'
      },
      google: {
        configured: googleConfigured,
        model: process.env.GOOGLE_MODEL || 'gemini-pro',
        status: googleStatus,
        endpoint: 'https://generativelanguage.googleapis.com/v1/models'
      },
      enhanceApi: {
        endpoint: '/api/enhance-event',
        status: 'available',
        description: 'API para enriquecer eventos con IA'
      },
      features: {
        eventEnhancement: true,
        markdownGeneration: true,
        contentSuggestions: true,
        fastInference: groqConfigured // Groq es conocido por su velocidad
      },
      primary: groqConfigured ? 'groq' : openaiConfigured ? 'openai' : googleConfigured ? 'google' : 'none',
      usage: {
        totalRequests: 0, // En el futuro se puede trackear
        lastUsed: null
      }
    }

    return NextResponse.json(aiConfig)
  } catch (error) {
    console.error('Error getting AI status:', error)
    return NextResponse.json({
      error: 'Error obteniendo estado de IA',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}