// Test helper: starts the real Express app on a random port with a temporary database file.
// OWNER: PM. Use it in every API test:
//   const t = await startTestServer();
//   const { status, body } = await t.request('GET', '/api/stations');
//   await t.close();
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '4'; // fast hashing in tests

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const { createApp } = await import('../../app.js');
const { DEMO_ACCOUNTS } = await import('../../db/seed.js');

export { DEMO_ACCOUNTS };

export async function startTestServer({ dir } = {}) {
  const folder = dir ?? fs.mkdtempSync(path.join(os.tmpdir(), 'voltflow-test-'));
  const dbPath = path.join(folder, 'test.db');
  let ctx;
  let server;
  let base;

  async function boot() {
    ctx = await createApp({ dbPath, jwtSecret: 'test-secret' });
    server = await new Promise((resolve) => {
      const s = ctx.app.listen(0, '127.0.0.1', () => resolve(s));
    });
    base = `http://127.0.0.1:${server.address().port}`;
  }

  async function shutdown() {
    await new Promise((resolve) => server.close(resolve));
    await ctx.close();
  }

  await boot();

  const api = {
    get db() {
      return ctx.db;
    },
    dir: folder,
    dbPath,
    /** Returns { status, body }. `token` adds the Authorization header. */
    async request(method, url, { token, body } = {}) {
      const response = await fetch(base + url, {
        method,
        headers: {
          ...(body ? { 'content-type': 'application/json' } : {}),
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await response.text();
      return { status: response.status, body: text ? JSON.parse(text) : null };
    },
    /** Log in and return the token. */
    async login(email, password) {
      const { status, body } = await api.request('POST', '/api/auth/login', { body: { email, password } });
      if (status !== 200) throw new Error(`Login failed for ${email}: ${status} ${JSON.stringify(body)}`);
      return body.token;
    },
    loginAdmin: () => api.login(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.password),
    loginCustomer: (account = DEMO_ACCOUNTS.customer) => api.login(account.email, account.password),
    /** Stop the server and reopen it on the same database file (simulates a restart). */
    async restart() {
      await shutdown();
      await boot();
    },
    async close({ keepFiles = false } = {}) {
      await shutdown();
      if (!keepFiles) fs.rmSync(folder, { recursive: true, force: true });
    },
  };
  return api;
}
