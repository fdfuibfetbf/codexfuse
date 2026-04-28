import { env } from '../config/env.js';
import { ImageRequest, ImageResponse, ProviderNotConfiguredError } from './types.js';

export const stabilityProvider = {
  available: () => !!env.STABILITY_API_KEY,
  async image(req: ImageRequest): Promise<ImageResponse> {
    if (!env.STABILITY_API_KEY) throw new ProviderNotConfiguredError('stability');
    const model = req.model ?? 'sd3.5-large';
    const form = new FormData();
    form.append('prompt', req.prompt);
    if (req.negativePrompt) form.append('negative_prompt', req.negativePrompt);
    form.append('output_format', 'png');
    const res = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STABILITY_API_KEY}`,
        Accept: 'image/*'
      },
      body: form
    });
    if (!res.ok) throw new Error(`Stability error: ${res.status} ${await res.text()}`);
    const ab = await res.arrayBuffer();
    const b64 = Buffer.from(ab).toString('base64');
    return { images: [{ b64 }], provider: 'stability', model };
  }
};
