import type { AIProvider, TaskPlan } from '../types'
import { PLANNER_SYSTEM_PROMPT, buildPlannerPrompt } from '../prompt-templates'

export class PlannerAgent {
  constructor(private provider: AIProvider) {}

  async plan(task: string, context?: string): Promise<TaskPlan> {
    const messages = [
      { role: 'system' as const, content: PLANNER_SYSTEM_PROMPT },
      { role: 'user' as const, content: buildPlannerPrompt(task, context) },
    ]

    const response = await this.provider.chat({
      messages,
      temperature: 0.2,
      maxTokens: 4096,
    })

    const plan = this.parsePlan(response.content, task)
    return plan
  }

  private parsePlan(raw: string, originalTask: string): TaskPlan {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No se pudo extraer un JSON válido de la respuesta del planificador')
    }

    let parsed: any
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      throw new Error('La respuesta del planificador no es un JSON válido')
    }

    if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error('El planificador no generó pasos válidos')
    }

    return {
      taskId: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      originalTask,
      objective: parsed.objective || originalTask,
      steps: parsed.steps.map((step: any, i: number) => ({
        id: step.id || `step-${i + 1}`,
        title: step.title || `Paso ${i + 1}`,
        description: step.description || '',
        expectedOutput: step.expectedOutput || '',
        dependsOn: Array.isArray(step.dependsOn) ? step.dependsOn : [],
      })),
      estimatedComplexity: parsed.estimatedComplexity || 'medium',
      context: parsed.context || '',
    }
  }
}
