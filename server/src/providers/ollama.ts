import { env } from '../config/env.js';
import { ChatRequest, ChatResponse } from './types.js';

export const ollamaProvider = {
  available: () => !!env.OLLAMA_BASE_URL,
  async chat(req: ChatRequest): Promise<ChatResponse> {
    const model = req.model ?? 'llama3.2';
    const res = await fetch(`${env.OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: req.messages,
        stream: false,
        options: { temperature: req.temperature ?? 0.7 }
      })
    });
    if (!res.ok) throw new Error(`Ollama error: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    return {
      text: data.message?.content ?? '',
      model,
      provider: 'ollama',
      inputTokens: data.prompt_eval_count ?? 0,
      outputTokens: data.eval_count ?? 0,
      raw: data
    };
  }
};
