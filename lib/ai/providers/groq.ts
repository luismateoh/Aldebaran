import type { AIProvider, ChatOptions, ChatResponse } from '../types'

export class GroqProvider implements AIProvider {
  readonly name = 'groq'

  constructor(
    private model: string,
    private apiKey: string,
    private baseUrl: string
  ) {}

  isAvailable(): boolean {
    return !!(this.apiKey && this.apiKey !== 'demo' && this.model)
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new Error('Groq provider no está configurado. Verifica GROQ_API_KEY.')
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 2048,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Groq API error (${response.status}): ${error}`)
    }

    const data = await response.json()
    const choice = data.choices?.[0]

    return {
      content: choice?.message?.content?.trim() || '',
      model: data.model || this.model,
      tokens: data.usage
        ? {
            prompt: data.usage.prompt_tokens,
            completion: data.usage.completion_tokens,
            total: data.usage.total_tokens,
          }
        : undefined,
    }
  }
}
