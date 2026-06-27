import type { AIProvider, HarnessConfig } from '../types'
import { GroqProvider } from './groq'
import { OpenRouterProvider } from './openrouter'

export function getDefaultConfig(): HarnessConfig {
  return {
    planner: {
      provider: 'openrouter',
      model: process.env.OPENROUTER_PLANNER_MODEL || 'moonshotai/kimi-2-7-code-thinking',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    },
    worker: {
      provider: 'groq',
      model: process.env.GROQ_WORKER_MODEL || 'llama-3.1-8b-instant',
      apiKey: process.env.GROQ_API_KEY || '',
      baseUrl: 'https://api.groq.com/openai/v1',
    },
  }
}

export function createPlanner(config?: Partial<HarnessConfig>): AIProvider {
  const full = { ...getDefaultConfig(), ...config }
  const { planner } = full

  if (planner.provider === 'openrouter') {
    return new OpenRouterProvider(planner.model, planner.apiKey, planner.baseUrl)
  }

  throw new Error(`Unsupported planner provider: ${planner.provider}`)
}

export function createWorker(config?: Partial<HarnessConfig>): AIProvider {
  const full = { ...getDefaultConfig(), ...config }
  const { worker } = full

  if (worker.provider === 'groq') {
    return new GroqProvider(worker.model, worker.apiKey, worker.baseUrl)
  }

  throw new Error(`Unsupported worker provider: ${worker.provider}`)
}

export { GroqProvider, OpenRouterProvider }
