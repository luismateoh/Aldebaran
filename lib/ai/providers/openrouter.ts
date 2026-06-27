import type { AIProvider, ChatOptions, ChatResponse } from '../types'

export class OpenRouterProvider implements AIProvider {
  readonly name = 'openrouter'

  constructor(
    private model: string,
    private apiKey: string,
    private baseUrl: string
  ) {}

  isAvailable(): boolean {
    return !!(this.apiKey && this.model)
  }

  async chat(options: ChatOptions): Promise<ChatResponse> {
    if (!this.isAvailable()) {
      throw new Error(
        'OpenRouter provider no está configurado. Verifica OPENROUTER_API_KEY.'
      )
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aldebaran.vercel.app',
        'X-Title': 'Aldebaran',
      },
      body: JSON.stringify({
        model: this.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens ?? 4096,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error (${response.status}): ${error}`)
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
