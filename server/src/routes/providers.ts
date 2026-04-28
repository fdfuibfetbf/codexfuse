import { Router } from 'express';
import { providerStatus } from '../config/env.js';

const router = Router();

router.get('/status', (_req, res) => {
  res.json(providerStatus());
});

export default router;
