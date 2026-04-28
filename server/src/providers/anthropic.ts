import { env } from '../config/env.js';
import { ChatRequest, ChatResponse, ProviderNotConfiguredError } from './types.js';

export const anthropicProvider = {
  available: () => !!env.ANTHROPIC_API_KEY,
  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!env.ANTHROPIC_API_KEY) throw new ProviderNotConfiguredError('anthropic');
    const model = req.model ?? 'claude-3-5-sonnet-latest';
    const system = req.messages.find((m) => m.role === 'system')?.content;
    const msgs = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: req.max_tokens ?? 1024,
        temperature: req.temperature ?? 0.7,
        system,
        messages: msgs
      })
    });
    if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    const text = (data.content ?? []).map((c: any) => c.text ?? '').join('');
    return {
      text,
      model,
      provider: 'anthropic',
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
      raw: data
    };
  }
};
