// Starts the API server and the Vite dev server together.
// Uses only Node's child_process (no shell), so it behaves the same in
// macOS Terminal and Windows PowerShell.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const children = [
  { name: 'api ', proc: spawn(process.execPath, ['--watch', 'server/index.js'], { cwd: root, stdio: 'inherit' }) },
  { name: 'web ', proc: spawn(process.execPath, [viteBin], { cwd: root, stdio: 'inherit' }) },
];

let stopping = false;
function stopAll(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const { proc } of children) proc.kill();
  // Give children a moment to release the database lock, then exit.
  setTimeout(() => process.exit(code), 300);
}

for (const { name, proc } of children) {
  proc.on('exit', (code) => {
    if (!stopping) {
      console.error(`[dev] ${name.trim()} process exited with code ${code}. Stopping everything.`);
      stopAll(code ?? 1);
    }
  });
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
console.log('[dev] API on http://localhost:3001  |  App on http://localhost:5173  (Ctrl+C to stop)');
