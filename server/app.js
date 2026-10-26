// Express application factory. OWNER: PM.
// Kept separate from index.js so automated tests can start a private server with a temporary database.
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { config, rootDir } from './config.js';
import { Database } from './db/database.js';
import { ensureDatabase } from './db/init.js';
import { authenticate, loadJwtSecret } from './lib/auth.js';
import { apiNotFoundHandler, errorMiddleware } from './lib/errors.js';
import { registerRoutes } from './routes/index.js';

export async function createApp({ dbPath = config.dbPath, jwtSecret, seed = true, serveStatic = false } = {}) {
  const db = await Database.open(dbPath);
  try {
    await ensureDatabase(db, { seed });
  } catch (err) {
    await db.close();
    throw err;
  }

  const app = express();
  app.disable('x-powered-by');
  app.locals.jwtSecret = jwtSecret || loadJwtSecret(config.jwtSecret, dbPath ? path.dirname(dbPath) : null);

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'same-origin');
    req.db = db;
    next();
  });
  app.use(express.json({ limit: '100kb' }));
  app.use('/api', authenticate);

  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  registerRoutes(app);
  app.use('/api', apiNotFoundHandler);

  // Production mode: serve the built React app (npm run build) from the same port.
  const dist = path.join(rootDir, 'dist');
  if (serveStatic && fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get('/{*splat}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  app.use(errorMiddleware);
  return { app, db, close: () => db.close() };
}
