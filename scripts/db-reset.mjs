// Deletes the local database and recreates it with the seed data.
// Use this after pulling a schema change or when demo dates have gone stale.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbPath = path.resolve(root, process.env.DB_PATH || 'data/voltflow.db');
const lockPath = `${dbPath}.lock`;

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

if (fs.existsSync(lockPath)) {
  const pid = Number(fs.readFileSync(lockPath, 'utf8'));
  if (pid && isAlive(pid)) {
    console.error(`The server (process ${pid}) is still running. Stop it first (Ctrl+C), then run this again.`);
    process.exit(1);
  }
  fs.rmSync(lockPath, { force: true });
}

fs.rmSync(dbPath, { force: true });
fs.rmSync(`${dbPath}.tmp`, { force: true });
console.log('Old database removed. Creating a fresh one...');
execFileSync(process.execPath, [path.join(root, 'server', 'db', 'init.js')], { stdio: 'inherit', cwd: root });
