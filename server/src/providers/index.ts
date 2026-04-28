import { openaiProvider } from './openai.js';
import { anthropicProvider } from './anthropic.js';
import { geminiProvider } from './gemini.js';
import { stabilityProvider } from './stability.js';
import { replicateProvider } from './replicate.js';
import { elevenlabsProvider } from './elevenlabs.js';
import { huggingfaceProvider } from './huggingface.js';
import { ollamaProvider } from './ollama.js';
import { ChatRequest, ChatResponse, ImageRequest, ImageResponse, ProviderNotConfiguredError, TTSRequest, TTSResponse } from './types.js';

export const providers = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  stability: stabilityProvider,
  replicate: replicateProvider,
  elevenlabs: elevenlabsProvider,
  huggingface: huggingfaceProvider,
  ollama: ollamaProvider
};

export type ProviderName = keyof typeof providers;

export function pickChatProvider(preferred?: string): {
  provider: ProviderName;
  call: (req: ChatRequest) => Promise<ChatResponse>;
} {
  const order: ProviderName[] = preferred
    ? ([preferred, 'openai', 'anthropic', 'gemini', 'ollama'].filter((v, i, a) => a.indexOf(v) === i) as ProviderName[])
    : ['openai', 'anthropic', 'gemini', 'ollama'];
  for (const name of order) {
    const p = providers[name] as any;
    if (p?.chat && p.available?.()) {
      return { provider: name, call: (req: ChatRequest) => p.chat(req) };
    }
  }
  throw new ProviderNotConfiguredError('chat (no provider configured)');
}

export function pickImageProvider(preferred?: string): {
  provider: ProviderName;
  call: (req: ImageRequest) => Promise<ImageResponse>;
} {
  const order: ProviderName[] = preferred
    ? ([preferred, 'openai', 'stability', 'replicate'].filter((v, i, a) => a.indexOf(v) === i) as ProviderName[])
    : ['openai', 'stability', 'replicate'];
  for (const name of order) {
    const p = providers[name] as any;
    if (p?.image && p.available?.()) {
      return { provider: name, call: (req: ImageRequest) => p.image(req) };
    }
  }
  throw new ProviderNotConfiguredError('image (no provider configured)');
}

export function pickTTSProvider(preferred?: string): {
  provider: ProviderName;
  call: (req: TTSRequest) => Promise<TTSResponse>;
} {
  const order: ProviderName[] = preferred
    ? ([preferred, 'elevenlabs', 'openai'].filter((v, i, a) => a.indexOf(v) === i) as ProviderName[])
    : ['elevenlabs', 'openai'];
  for (const name of order) {
    const p = providers[name] as any;
    if (p?.tts && p.available?.()) {
      return { provider: name, call: (req: TTSRequest) => p.tts(req) };
    }
  }
  throw new ProviderNotConfiguredError('tts (no provider configured)');
}
