import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';

import { env, providerStatus } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import imageRoutes from './routes/image.js';
import voiceRoutes from './routes/voice.js';
import codeRoutes from './routes/code.js';
import templatesRoutes from './routes/templates.js';
import translateRoutes from './routes/translate.js';
import detectorRoutes from './routes/detector.js';
import searchRoutes from './routes/search.js';
import ocrRoutes from './routes/ocr.js';
import documentsRoutes from './routes/documents.js';
import botsRoutes from './routes/bots.js';
import brandVoicesRoutes from './routes/brandVoices.js';
import agentsRoutes from './routes/agents.js';
import workflowsRoutes from './routes/workflows.js';
import videoRoutes from './routes/video.js';
import musicRoutes from './routes/music.js';
import workspacesRoutes from './routes/workspaces.js';
import usageRoutes from './routes/usage.js';
import adminRoutes from './routes/admin.js';
import providersRoutes from './routes/providers.js';
import plansRoutes from './routes/plans.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Static uploads
const uploadDir = path.resolve(env.UPLOAD_DIR);
fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'CodexFuse API', version: '0.1.0', providers: providerStatus() });
});

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/detect', detectorRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/bots', botsRoutes);
app.use('/api/brand-voices', brandVoicesRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/workflows', workflowsRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/plans', plansRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const port = env.PORT;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[codexfuse] api listening on :${port}`);
});
