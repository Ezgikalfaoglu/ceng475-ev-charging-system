// Profile tests. OWNER: Melike (dev/melike-sahin).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let t;
before(async () => {
  t = await startTestServer();
});
after(() => t.close());

test('GET /api/users/profile returns the signed-in user', async () => {
  const token = await t.loginCustomer();
  const { status, body } = await t.request('GET', '/api/users/profile', { token });
  assert.equal(status, 200);
  assert.equal(body.user.name, 'Ayşe Demir');
  assert.equal(body.user.vehicleConnector, 'CCS2');
});

test.todo('PUT /api/users/profile updates name, phone and vehicle, and rejects invalid values (400)');
test.todo('PUT /api/users/profile cannot change role or e-mail to an address that is already used');
test.todo('PUT /api/users/password needs the current password and enforces the password rules');
test.todo('DELETE /api/users/profile removes the account after password confirmation');
