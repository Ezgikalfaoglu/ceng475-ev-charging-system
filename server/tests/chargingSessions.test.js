// Charging session tests. OWNER: Eda (dev/turkan-eda-ulucay).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let t;
before(async () => {
  t = await startTestServer();
});
after(() => t.close());

test('the demo customer has one active simulated session', async () => {
  const token = await t.loginCustomer();
  const { status, body } = await t.request('GET', '/api/sessions/active', { token });
  assert.equal(status, 200);
  assert.equal(body.session.status, 'charging');
  assert.equal(body.session.isSimulated, true);
  assert.ok(body.session.progressPct >= 0 && body.session.progressPct < 100);
});

test('a customer without a live session gets null', async () => {
  const token = await t.loginCustomer({ email: 'can@voltflow.demo', password: 'Customer123!' });
  const { body } = await t.request('GET', '/api/sessions/active', { token });
  assert.equal(body.session, null);
});

test('session history lists completed sessions with energy and cost', async () => {
  const token = await t.loginCustomer();
  const { body } = await t.request('GET', '/api/sessions', { token });
  const completed = body.sessions.filter((s) => s.status === 'completed');
  assert.ok(completed.length > 0);
  assert.ok(completed.every((s) => s.energyKwh > 0 && s.cost > 0 && s.progressPct === 100));
});

// ---- Eda: implement these on dev/turkan-eda-ulucay -------------------------------------------
test.todo('POST /api/sessions/:id/start moves a scheduled session to "charging" only inside its reservation window');
test.todo('GET /api/sessions/:id/progress returns progress, duration, energy, cost and estimated completion');
test.todo('progress grows with elapsed time and never exceeds 100');
test.todo('reaching the target marks the session "completed" and creates a session_completed notification');
test.todo('POST /api/sessions/:id/stop ends the session early and stores partial energy and cost');
test.todo('price changes after the session started do not change its cost (price snapshot)');
test.todo('a customer cannot start or stop another customer\'s session (403)');
