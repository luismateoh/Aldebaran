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
    const plan = await orch.planTask(task, context)

    return NextResponse.json({ success: true, plan })
  } catch (error) {
    console.error('Error en planificación:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al planificar la tarea',
      },
      { status: 500 }
    )
  }
}
