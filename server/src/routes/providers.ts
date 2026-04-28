import { Router } from 'express';
import { providerStatus } from '../config/env.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(providerStatus());
});

router.get('/status', (_req, res) => {
  res.json(providerStatus());
});

export default router;
