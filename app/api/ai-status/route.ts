import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const groqConfigured = !!process.env.GROQ_API_KEY
    const openaiConfigured = !!process.env.OPENAI_API_KEY
    const googleConfigured = !!process.env.GOOGLE_API_KEY
    const openrouterConfigured = !!process.env.OPENROUTER_API_KEY

    const aiConfig = {
      groq: {
        configured: groqConfigured,
        model: process.env.GROQ_MODEL || 'llama3-8b-8192',
        status: groqConfigured ? 'configured' : 'not_configured',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        description: 'Groq - Inferencia ultrarrápida',
      },
      openai: {
        configured: openaiConfigured,
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        status: openaiConfigured ? 'configured' : 'not_configured',
        endpoint: 'https://api.openai.com/v1/chat/completions',
      },
      google: {
        configured: googleConfigured,
        model: process.env.GOOGLE_MODEL || 'gemini-pro',
        status: googleConfigured ? 'configured' : 'not_configured',
        endpoint: 'https://generativelanguage.googleapis.com/v1/models',
      },
      openrouter: {
        configured: openrouterConfigured,
        model: process.env.OPENROUTER_PLANNER_MODEL || 'moonshotai/kimi-2-7-code-thinking',
        status: openrouterConfigured ? 'configured' : 'not_configured',
        endpoint: 'https://openrouter.ai/api/v1',
        description: 'OpenRouter - Acceso a Kimi 2.7 Code y otros modelos',
      },
      harness: {
        plannerConfigured: openrouterConfigured,
        workerConfigured: groqConfigured,
        plannerModel: process.env.OPENROUTER_PLANNER_MODEL || 'moonshotai/kimi-2-7-code-thinking',
        workerModel: process.env.GROQ_WORKER_MODEL || 'llama-3.1-8b-instant',
        endpoints: {
          plan: '/api/ai-harness/plan',
          execute: '/api/ai-harness/execute',
          full: '/api/ai-harness',
        },
        description:
          'Sistema multi-agente: Kimi 2.7 Code planifica, sub-agentes ejecutan',
      },
      enhanceApi: {
        endpoint: '/api/enhance-event',
        status: 'available',
        description: 'API para enriquecer eventos con IA',
      },
      features: {
        eventEnhancement: true,
        markdownGeneration: true,
        contentSuggestions: true,
        fastInference: groqConfigured,
        multiAgent: openrouterConfigured && groqConfigured,
      },
      primary: openrouterConfigured
        ? 'openrouter'
        : groqConfigured
          ? 'groq'
          : openaiConfigured
            ? 'openai'
            : googleConfigured
              ? 'google'
              : 'none',
      usage: {
        totalRequests: 0,
        lastUsed: null,
      },
    }

    return NextResponse.json(aiConfig)
  } catch (error) {
    console.error('Error getting AI status:', error)
    return NextResponse.json(
      {
        error: 'Error obteniendo estado de IA',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}
