import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { authRouter } from './routes/auth.js';
import { meRouter } from './routes/me.js';
import { ticketsRouter } from './routes/tickets.js';
import { usersRouter } from './routes/users.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || true,
      credentials: true
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/me', meRouter);
  app.use('/api/tickets', ticketsRouter);
  app.use('/api/users', usersRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

