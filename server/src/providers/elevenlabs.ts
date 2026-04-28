import { env } from '../config/env.js';
import { ProviderNotConfiguredError, TTSRequest, TTSResponse } from './types.js';

export const elevenlabsProvider = {
  available: () => !!env.ELEVENLABS_API_KEY,
  async tts(req: TTSRequest): Promise<TTSResponse> {
    if (!env.ELEVENLABS_API_KEY) throw new ProviderNotConfiguredError('elevenlabs');
    const voice = req.voice ?? 'EXAVITQu4vr4xnSDxMaL'; // default "Bella"
    const model = req.model ?? 'eleven_multilingual_v2';
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: 'POST',
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'content-type': 'application/json',
        accept: 'audio/mpeg'
      },
      body: JSON.stringify({ text: req.text, model_id: model })
    });
    if (!res.ok) throw new Error(`ElevenLabs error: ${res.status} ${await res.text()}`);
    const ab = await res.arrayBuffer();
    return {
      audioBase64: Buffer.from(ab).toString('base64'),
      mimeType: 'audio/mpeg',
      provider: 'elevenlabs',
      model
    };
  },
  async listVoices() {
    if (!env.ELEVENLABS_API_KEY) throw new ProviderNotConfiguredError('elevenlabs');
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': env.ELEVENLABS_API_KEY }
    });
    if (!res.ok) throw new Error(`ElevenLabs error: ${res.status}`);
    return res.json();
  }
};
