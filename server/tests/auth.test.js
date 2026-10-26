// Authentication tests. OWNER: Melike (dev/melike-sahin).
// Real tests cover the baseline login. Convert each test.todo into a real test while you build the feature.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer, DEMO_ACCOUNTS } from './helpers/testServer.js';

let t;
before(async () => {
  t = await startTestServer();
});
after(() => t.close());

test('login succeeds with the demo customer account and never returns the password hash', async () => {
  const { status, body } = await t.request('POST', '/api/auth/login', { body: DEMO_ACCOUNTS.customer });
  assert.equal(status, 200);
  assert.ok(body.token.length > 20);
  assert.equal(body.user.email, DEMO_ACCOUNTS.customer.email);
  assert.equal(body.user.role, 'customer');
  assert.equal(body.user.passwordHash, undefined);
  assert.equal(body.user.password_hash, undefined);
});

test('login is case-insensitive for the e-mail address', async () => {
  const { status } = await t.request('POST', '/api/auth/login', {
    body: { email: 'AYSE@VoltFlow.demo', password: DEMO_ACCOUNTS.customer.password },
  });
  assert.equal(status, 200);
});

test('login fails with a wrong password and gives the same message as an unknown e-mail', async () => {
  const wrong = await t.request('POST', '/api/auth/login', { body: { email: DEMO_ACCOUNTS.customer.email, password: 'WrongPass1!' } });
  const unknown = await t.request('POST', '/api/auth/login', { body: { email: 'nobody@voltflow.demo', password: 'WrongPass1!' } });
  assert.equal(wrong.status, 401);
  assert.equal(unknown.status, 401);
  assert.equal(wrong.body.error.code, 'INVALID_CREDENTIALS');
  assert.equal(wrong.body.error.message, unknown.body.error.message);
});

test('login validates its input and reports which fields are wrong', async () => {
  const { status, body } = await t.request('POST', '/api/auth/login', { body: { email: 'not-an-email', password: '' } });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
  assert.ok(body.error.details.email);
  assert.ok(body.error.details.password);
});

test('GET /api/auth/me returns the signed-in user', async () => {
  const token = await t.loginAdmin();
  const { status, body } = await t.request('GET', '/api/auth/me', { token });
  assert.equal(status, 200);
  assert.equal(body.user.role, 'admin');
});

// ---- Melike: implement these on dev/melike-sahin ---------------------------------------------
test.todo('register creates a customer account and returns a token');
test.todo('register rejects an e-mail that is already used (409) regardless of letter case');
test.todo('register rejects a weak password and an invalid e-mail with field messages (400)');
test.todo('register never lets the client choose the role (always "customer")');
test.todo('registered password is stored as a bcrypt hash, not as plain text');
test.todo('repeated failed logins are throttled (429) and recover after the lock window');
