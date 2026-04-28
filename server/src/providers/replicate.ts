import { env } from '../config/env.js';
import { ImageRequest, ImageResponse, ProviderNotConfiguredError } from './types.js';

export const replicateProvider = {
  available: () => !!env.REPLICATE_API_TOKEN,
  async image(req: ImageRequest): Promise<ImageResponse> {
    if (!env.REPLICATE_API_TOKEN) throw new ProviderNotConfiguredError('replicate');
    const model = req.model ?? 'black-forest-labs/flux-schnell';
    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'wait'
      },
      body: JSON.stringify({
        input: { prompt: req.prompt, num_outputs: req.n ?? 1 }
      })
    });
    if (!res.ok) throw new Error(`Replicate error: ${res.status} ${await res.text()}`);
    const data: any = await res.json();
    const urls: string[] = Array.isArray(data.output) ? data.output : data.output ? [data.output] : [];
    return {
      images: urls.map((url) => ({ url })),
      provider: 'replicate',
      model
    };
  },
  async video(prompt: string, model = 'minimax/video-01') {
    if (!env.REPLICATE_API_TOKEN) throw new ProviderNotConfiguredError('replicate');
    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'wait'
      },
      body: JSON.stringify({ input: { prompt } })
    });
    if (!res.ok) throw new Error(`Replicate error: ${res.status} ${await res.text()}`);
    return res.json();
  },
  async music(prompt: string, model = 'meta/musicgen') {
    if (!env.REPLICATE_API_TOKEN) throw new ProviderNotConfiguredError('replicate');
    const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'wait'
      },
      body: JSON.stringify({ input: { prompt, model_version: 'stereo-large', duration: 8 } })
    });
    if (!res.ok) throw new Error(`Replicate error: ${res.status} ${await res.text()}`);
    return res.json();
  }
};
