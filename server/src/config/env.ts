import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  APP_URL: process.env.APP_URL ?? 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_SECRET: required('JWT_SECRET', 'dev-secret-change-me-please-32-bytes!!'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me-please-32!!'),
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',

  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  STABILITY_API_KEY: process.env.STABILITY_API_KEY ?? '',
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN ?? '',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ?? '',
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY ?? '',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',

  UPLOAD_DIR: process.env.UPLOAD_DIR ?? './uploads',
  PUBLIC_UPLOAD_BASE_URL: process.env.PUBLIC_UPLOAD_BASE_URL ?? 'http://localhost:4000/uploads',

  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL ?? 'admin@codexfuse.app',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!'
};

export function providerStatus() {
  return {
    openai: !!env.OPENAI_API_KEY,
    anthropic: !!env.ANTHROPIC_API_KEY,
    gemini: !!env.GEMINI_API_KEY,
    stability: !!env.STABILITY_API_KEY,
    replicate: !!env.REPLICATE_API_TOKEN,
    elevenlabs: !!env.ELEVENLABS_API_KEY,
    huggingface: !!env.HUGGINGFACE_API_KEY,
    ollama: true // assumed local
  };
}
