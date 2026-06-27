import { NextRequest, NextResponse } from 'next/server'
import { WorkerAgent, createWorker } from '@/lib/ai'
import type { PlanStep, StepResult } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { step, context, previousResults } = await request.json()

    if (!step || !step.id) {
      return NextResponse.json(
        { error: 'Se requiere un paso con id, title, description y expectedOutput' },
        { status: 400 }
      )
    }

    const provider = createWorker()
    if (!provider.isAvailable()) {
      return NextResponse.json(
        {
          error:
            'Worker no configurado. Se requiere GROQ_API_KEY en .env.local',
        },
        { status: 503 }
      )
    }

    const worker = new WorkerAgent(provider)
    const planStep: PlanStep = {
      id: step.id,
      title: step.title || 'Sin título',
      description: step.description || '',
      expectedOutput: step.expectedOutput || '',
      dependsOn: step.dependsOn || [],
    }

    const result: StepResult = await worker.execute(
      planStep,
      context,
      previousResults as StepResult[] | undefined
    )

    return NextResponse.json({ success: result.success, result })
  } catch (error) {
    console.error('Error ejecutando paso:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al ejecutar el paso',
      },
      { status: 500 }
    )
  }
}
