// Central server configuration. Every value has a safe default so the app runs without a .env file.
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 3001,
  dbPath: path.resolve(rootDir, process.env.DB_PATH || 'data/voltflow.db'),
  // Optional. When empty, a random secret is created once and stored in data/.jwt-secret.
  jwtSecret: process.env.JWT_SECRET || '',
  tokenTtl: '8h',
  // 10 is a good production value; tests lower it to keep them fast.
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  // Simulated charging: 1 real second equals this many simulated seconds.
  simSpeed: Number(process.env.SIM_SPEED) || 60,
};
