import type { AIProvider, PlanStep, StepResult } from '../types'
import { WORKER_SYSTEM_PROMPT, buildWorkerPrompt } from '../prompt-templates'

export class WorkerAgent {
  constructor(private provider: AIProvider) {}

  async execute(
    step: PlanStep,
    context?: string,
    previousResults?: StepResult[]
  ): Promise<StepResult> {
    const contextNote = context
      ? `Contexto del plan: ${context}`
      : undefined

    const previousContext = previousResults?.length
      ? `Resultados de pasos anteriores:\n${previousResults
          .filter((r) => step.dependsOn.includes(r.stepId))
          .map((r) => `[${r.stepId}]: ${r.output.slice(0, 1000)}`)
          .join('\n\n')}`
      : undefined

    const fullContext = [contextNote, previousContext].filter(Boolean).join('\n\n')

    const messages = [
      { role: 'system' as const, content: WORKER_SYSTEM_PROMPT },
      {
        role: 'user' as const,
        content: buildWorkerPrompt({
          title: step.title,
          description: step.description,
          expectedOutput: step.expectedOutput,
          context: fullContext,
        }),
      },
    ]

    try {
      const response = await this.provider.chat({
        messages,
        temperature: 0.3,
        maxTokens: 2048,
      })

      return {
        stepId: step.id,
        success: true,
        output: response.content,
        modelUsed: response.model,
      }
    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Error desconocido',
        modelUsed: this.provider.name,
      }
    }
  }
}
