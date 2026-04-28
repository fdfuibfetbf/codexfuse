export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatResponse {
  text: string;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  raw?: unknown;
}

export interface ImageRequest {
  prompt: string;
  negativePrompt?: string;
  size?: string;
  n?: number;
  model?: string;
}

export interface ImageResponse {
  images: { url?: string; b64?: string }[];
  provider: string;
  model: string;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  model?: string;
  format?: 'mp3' | 'wav' | 'opus';
}

export interface TTSResponse {
  audioBase64: string;
  mimeType: string;
  provider: string;
  model: string;
}

export interface STTRequest {
  audio: Buffer;
  filename?: string;
  language?: string;
  model?: string;
}

export interface STTResponse {
  text: string;
  language?: string;
  provider: string;
  model: string;
  durationSec?: number;
}

export interface EmbedRequest {
  texts: string[];
  model?: string;
}

export interface EmbedResponse {
  vectors: number[][];
  model: string;
  provider: string;
}

export class ProviderNotConfiguredError extends Error {
  constructor(provider: string) {
    super(
      `Provider "${provider}" is not configured. Set the corresponding API key in your .env to enable this feature.`
    );
    this.name = 'ProviderNotConfiguredError';
  }
}
