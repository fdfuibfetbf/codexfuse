import { env } from '../config/env.js';
import { ChatRequest, ChatResponse, ProviderNotConfiguredError } from './types.js';

export const geminiProvider = {
  available: () => !!env.GEMINI_API_KEY,
  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!env.GEMINI_API_KEY) throw new ProviderNotConfiguredError('gemini');
    const model = req.model ?? 'gemini-1.5-flash';
    const sys = req.messages.find((m) => m.role === 'system')?.content;
    const contents = req.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
    const body: any = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.max_tokens ?? 1024
      }
    };
    if (sys) body.systemInstruction = { role: 'system', parts: [{ text: sys }] };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
    return {
      text,
      model,
      provider: 'gemini',
      inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      raw: data
    };
  }
};
