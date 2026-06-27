import { NextRequest, NextResponse } from 'next/server'
import { Orchestrator, createPlanner, createWorker } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { task, context } = await request.json()

    if (!task || !task.trim()) {
      return NextResponse.json(
        { error: 'La descripción de la tarea es requerida' },
        { status: 400 }
      )
    }

    const planner = createPlanner()
    const worker = createWorker()

    if (!planner.isAvailable()) {
      return NextResponse.json(
        {
          error:
            'Planner no configurado. Se requiere OPENROUTER_API_KEY en .env.local',
        },
        { status: 503 }
      )
    }

    const orch = new Orchestrator(planner, worker)
    const result = await orch.runFull(task, context)

    const statusCode = result.status === 'failed' ? 500 : 200
    return NextResponse.json(result, { status: statusCode })
  } catch (error) {
    console.error('Error en AI Harness:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error interno del servidor',
        status: 'failed',
      },
      { status: 500 }
    )
  }
}
