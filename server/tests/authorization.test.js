// Authorization tests. OWNER: PM (cross-feature regression: "unauthorized route access", "admin-only operations").
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, DEMO_ACCOUNTS } from './helpers/testServer.js';

let t;
let customerToken;
let adminToken;

before(async () => {
  t = await startTestServer();
  customerToken = await t.loginCustomer();
  adminToken = await t.loginAdmin();
});
after(() => t.close());

const ADMIN_ENDPOINTS = [
  ['GET', '/api/admin/stations'],
  ['POST', '/api/admin/stations'],
  ['PUT', '/api/admin/stations/1'],
  ['DELETE', '/api/admin/stations/1'],
  ['GET', '/api/admin/pricing'],
  ['PUT', '/api/admin/pricing/1'],
  ['GET', '/api/admin/chargers'],
  ['POST', '/api/admin/chargers'],
  ['GET', '/api/admin/reservations'],
  ['PATCH', '/api/admin/reservations/1/status'],
  ['GET', '/api/admin/analytics/summary'],
  ['GET', '/api/admin/analytics/usage'],
];

const SIGNED_IN_ENDPOINTS = [
  ['GET', '/api/auth/me'],
  ['GET', '/api/users/profile'],
  ['GET', '/api/notifications'],
  ['GET', '/api/availability?stationId=1'],
  ['GET', '/api/reservations'],
  ['POST', '/api/reservations'],
  ['GET', '/api/sessions'],
];

test('admin endpoints reject anonymous visitors with 401', async () => {
  for (const [method, url] of ADMIN_ENDPOINTS) {
    const { status, body } = await t.request(method, url);
    assert.equal(status, 401, `${method} ${url}`);
    assert.equal(body.error.code, 'UNAUTHENTICATED');
  }
});

test('admin endpoints reject customers with 403 (even for write requests)', async () => {
  for (const [method, url] of ADMIN_ENDPOINTS) {
    const { status, body } = await t.request(method, url, { token: customerToken });
    assert.equal(status, 403, `${method} ${url}`);
    assert.equal(body.error.code, 'FORBIDDEN');
  }
});

test('admins pass the role check on every admin endpoint', async () => {
  for (const [method, url] of ADMIN_ENDPOINTS) {
    const { status } = await t.request(method, url, { token: adminToken });
    assert.ok(status !== 401 && status !== 403, `${method} ${url} answered ${status}`);
  }
});

test('signed-in endpoints reject anonymous visitors with 401', async () => {
  for (const [method, url] of SIGNED_IN_ENDPOINTS) {
    const { status } = await t.request(method, url);
    assert.equal(status, 401, `${method} ${url}`);
  }
});

test('station directory is public', async () => {
  const { status } = await t.request('GET', '/api/stations');
  assert.equal(status, 200);
});

test('a forged or expired token gets 401 TOKEN_INVALID on protected routes but public routes still work', async () => {
  const bad = 'Bearer-looking.garbage.token';
  const protectedCall = await t.request('GET', '/api/reservations', { token: bad });
  assert.equal(protectedCall.status, 401);
  assert.equal(protectedCall.body.error.code, 'TOKEN_INVALID');
  const publicCall = await t.request('GET', '/api/stations', { token: bad });
  assert.equal(publicCall.status, 200);
});

test('a customer cannot read another customer\'s reservation or session', async () => {
  const other = t.db.get(
    "SELECT r.id FROM reservations r JOIN users u ON u.id = r.user_id WHERE u.email = 'can@voltflow.demo' LIMIT 1"
  );
  const { status, body } = await t.request('GET', `/api/reservations/${other.id}`, { token: customerToken });
  assert.equal(status, 403);
  assert.equal(body.error.code, 'FORBIDDEN');

  const otherSession = t.db.get(
    "SELECT cs.id FROM charging_sessions cs JOIN reservations r ON r.id = cs.reservation_id JOIN users u ON u.id = r.user_id WHERE u.email = 'can@voltflow.demo' LIMIT 1"
  );
  const s = await t.request('GET', `/api/sessions/${otherSession.id}`, { token: customerToken });
  assert.equal(s.status, 403);
});

test('unknown API routes answer with the standard JSON error', async () => {
  const { status, body } = await t.request('GET', '/api/does-not-exist');
  assert.equal(status, 404);
  assert.equal(body.error.code, 'NOT_FOUND');
});

test('demo accounts exist for both roles', () => {
  assert.equal(DEMO_ACCOUNTS.admin.email, 'admin@voltflow.demo');
  assert.equal(t.db.get("SELECT role FROM users WHERE email = ?", [DEMO_ACCOUNTS.admin.email]).role, 'admin');
  assert.equal(t.db.get("SELECT role FROM users WHERE email = ?", [DEMO_ACCOUNTS.customer.email]).role, 'customer');
});
