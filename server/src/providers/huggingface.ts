import { env } from '../config/env.js';
import { ProviderNotConfiguredError } from './types.js';

export const huggingfaceProvider = {
  available: () => !!env.HUGGINGFACE_API_KEY,
  async runModel<T = unknown>(model: string, body: unknown): Promise<T> {
    if (!env.HUGGINGFACE_API_KEY) throw new ProviderNotConfiguredError('huggingface');
    const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`HuggingFace error: ${res.status} ${await res.text()}`);
    const ct = res.headers.get('content-type') ?? '';
    if (ct.startsWith('application/json')) return (await res.json()) as T;
    const ab = await res.arrayBuffer();
    return Buffer.from(ab) as unknown as T;
  }
};
