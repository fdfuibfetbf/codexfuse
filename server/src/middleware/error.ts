import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../utils/errors.js';
import { ZodError } from 'zod';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation error', details: err.flatten() });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('[unhandled]', err);
  res.status(500).json({ error: err?.message ?? 'Server error' });
};
