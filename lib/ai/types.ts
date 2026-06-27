export type PlannerProvider = 'openrouter' | 'moonshot'
export type WorkerProvider = 'groq'

export interface ModelConfig {
  provider: PlannerProvider | WorkerProvider
  model: string
  apiKey: string
  baseUrl: string
}

export interface HarnessConfig {
  planner: ModelConfig
  worker: ModelConfig
}

export interface PlanStep {
  id: string
  title: string
  description: string
  expectedOutput: string
  dependsOn: string[]
}

export interface TaskPlan {
  taskId: string
  originalTask: string
  objective: string
  steps: PlanStep[]
  estimatedComplexity: 'low' | 'medium' | 'high'
  context: string
}

export interface StepResult {
  stepId: string
  success: boolean
  output: string
  error?: string
  modelUsed: string
}

export interface ExecutionResult {
  taskId: string
  plan: TaskPlan
  results: StepResult[]
  status: 'planning' | 'executing' | 'completed' | 'failed'
  error?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

export interface ChatResponse {
  content: string
  model: string
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
}

export interface AIProvider {
  readonly name: string
  chat(options: ChatOptions): Promise<ChatResponse>
  isAvailable(): boolean
}
