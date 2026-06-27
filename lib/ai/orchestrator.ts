import type { AIProvider, TaskPlan, StepResult, ExecutionResult } from './types'
import { PlannerAgent } from './agents/planner'
import { WorkerAgent } from './agents/worker'

export class Orchestrator {
  private planner: PlannerAgent
  private worker: WorkerAgent

  constructor(plannerProvider: AIProvider, workerProvider: AIProvider) {
    this.planner = new PlannerAgent(plannerProvider)
    this.worker = new WorkerAgent(workerProvider)
  }

  async planTask(task: string, context?: string): Promise<TaskPlan> {
    return this.planner.plan(task, context)
  }

  async executeStep(
    step: TaskPlan['steps'][0],
    planContext: string,
    previousResults: StepResult[]
  ): Promise<StepResult> {
    return this.worker.execute(step, planContext, previousResults)
  }

  async runFull(task: string, context?: string): Promise<ExecutionResult> {
    const plan = await this.planner.plan(task, context)

    const result: ExecutionResult = {
      taskId: plan.taskId,
      plan,
      results: [],
      status: 'executing',
    }

    const completed = new Set<string>()
    const allResults: StepResult[] = []

    try {
      const steps = [...plan.steps]

      while (allResults.length < steps.length) {
        const ready = steps.filter(
          (s) =>
            !completed.has(s.id) &&
            s.dependsOn.every((d) => completed.has(d))
        )

        if (ready.length === 0 && allResults.length < steps.length) {
          const blocked = steps
            .filter((s) => !completed.has(s.id))
            .map((s) => s.title)
          throw new Error(
            `Pasos bloqueados por dependencias no resueltas: ${blocked.join(', ')}`
          )
        }

        const batchResults = await Promise.all(
          ready.map((step) =>
            this.worker.execute(step, plan.context, allResults).then((r) => {
              completed.add(step.id)
              return r
            })
          )
        )

        allResults.push(...batchResults)
      }

      result.results = allResults
      result.status = 'completed'
    } catch (error) {
      result.results = allResults
      result.status = 'failed'
      result.error = error instanceof Error ? error.message : 'Error desconocido'
    }

    return result
  }
}
