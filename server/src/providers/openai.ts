import OpenAI from 'openai';
import { env } from '../config/env.js';
import {
  ChatRequest,
  ChatResponse,
  EmbedRequest,
  EmbedResponse,
  ImageRequest,
  ImageResponse,
  ProviderNotConfiguredError,
  STTRequest,
  STTResponse,
  TTSRequest,
  TTSResponse
} from './types.js';

let _client: OpenAI | null = null;
function client() {
  if (!env.OPENAI_API_KEY) throw new ProviderNotConfiguredError('openai');
  if (!_client)
    _client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL
    });
  return _client;
}

export const openaiProvider = {
  available: () => !!env.OPENAI_API_KEY,

  async chat(req: ChatRequest): Promise<ChatResponse> {
    const c = client();
    const model = req.model ?? 'gpt-4o-mini';
    const completion = await c.chat.completions.create({
      model,
      messages: req.messages.map((m) => ({
        role: m.role === 'tool' ? 'user' : m.role,
        content: m.content
      })) as any,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.max_tokens ?? 1024
    });
    const text = completion.choices[0]?.message?.content ?? '';
    return {
      text,
      model,
      provider: 'openai',
      inputTokens: completion.usage?.prompt_tokens ?? 0,
      outputTokens: completion.usage?.completion_tokens ?? 0,
      raw: completion
    };
  },

  async image(req: ImageRequest): Promise<ImageResponse> {
    const c = client();
    const model = req.model ?? 'gpt-image-1';
    const result = await c.images.generate({
      model,
      prompt: req.prompt,
      n: req.n ?? 1,
      size: (req.size ?? '1024x1024') as any
    });
    const images = (result.data ?? []).map((d: any) => ({
      url: d.url,
      b64: d.b64_json
    }));
    return { images, provider: 'openai', model };
  },

  async tts(req: TTSRequest): Promise<TTSResponse> {
    const c = client();
    const model = req.model ?? 'gpt-4o-mini-tts';
    const voice = req.voice ?? 'alloy';
    const format = req.format ?? 'mp3';
    const speech = await c.audio.speech.create({
      model,
      voice: voice as any,
      input: req.text,
      response_format: format as any
    });
    const buf = Buffer.from(await speech.arrayBuffer());
    return {
      audioBase64: buf.toString('base64'),
      mimeType: format === 'mp3' ? 'audio/mpeg' : `audio/${format}`,
      provider: 'openai',
      model
    };
  },

  async stt(req: STTRequest): Promise<STTResponse> {
    const c = client();
    const model = req.model ?? 'whisper-1';
    const file = new File([new Uint8Array(req.audio)], req.filename ?? 'audio.webm', {
      type: 'audio/webm'
    });
    const result = await c.audio.transcriptions.create({
      file,
      model,
      language: req.language
    });
    return {
      text: result.text,
      provider: 'openai',
      model,
      language: req.language
    };
  },

  async embed(req: EmbedRequest): Promise<EmbedResponse> {
    const c = client();
    const model = req.model ?? 'text-embedding-3-small';
    const result = await c.embeddings.create({ model, input: req.texts });
    return {
      vectors: result.data.map((d) => d.embedding as unknown as number[]),
      model,
      provider: 'openai'
    };
  }
};
