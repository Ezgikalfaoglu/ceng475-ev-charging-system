// Admin dashboard, chargers, analytics and reservation overview tests. OWNER: Eda (dev/turkan-eda-ulucay).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let t;
let admin;
before(async () => {
  t = await startTestServer();
  admin = await t.loginAdmin();
});
after(() => t.close());

test('analytics summary returns headline numbers and 14 days of reservation counts', async () => {
  const { status, body } = await t.request('GET', '/api/admin/analytics/summary', { token: admin });
  assert.equal(status, 200);
  assert.equal(body.summary.customers, 4);
  assert.equal(body.summary.activeSessions, 1);
  assert.ok(body.summary.revenue > 0 && body.summary.energyKwh > 0);
  assert.equal(body.reservationsPerDay.length, 14);
  assert.ok(body.reservationsPerDay.some((d) => d.count > 0));
});

test('admin charger list can be filtered by station', async () => {
  const all = await t.request('GET', '/api/admin/chargers', { token: admin });
  const one = await t.request('GET', '/api/admin/chargers?stationId=1', { token: admin });
  assert.ok(all.body.chargers.length > one.body.chargers.length);
  assert.equal(one.body.chargers.length, 4);
});

test('the seeded maintenance block can be listed', async () => {
  const hubB1 = t.db.get("SELECT id FROM chargers WHERE station_id = 1 AND label = 'B1'").id;
  const { status, body } = await t.request('GET', `/api/admin/chargers/${hubB1}/blocks`, { token: admin });
  assert.equal(status, 200);
  assert.equal(body.blocks.length, 1);
  assert.equal(body.blocks[0].reason, 'Scheduled maintenance');
});

test('admin reservation list supports a status filter and rejects unknown statuses', async () => {
  const cancelled = await t.request('GET', '/api/admin/reservations?status=cancelled', { token: admin });
  assert.equal(cancelled.status, 200);
  assert.ok(cancelled.body.reservations.length >= 2);
  assert.ok(cancelled.body.reservations.every((r) => r.status === 'cancelled'));
  const bad = await t.request('GET', '/api/admin/reservations?status=bogus', { token: admin });
  assert.equal(bad.status, 400);
});

// ---- Eda: implement these on dev/turkan-eda-ulucay -------------------------------------------
test.todo('GET /api/admin/analytics/usage returns usage per station and charger for a date range');
test.todo('usage statistics: revenue and energy equal the sums of the completed sessions in the range');
test.todo('POST /api/admin/chargers creates a charger and validates connector, power and price');
test.todo('PUT /api/admin/chargers/:id changes status to maintenance/offline and the slot grid shows it');
test.todo('DELETE /api/admin/chargers/:id answers 409 when the charger has reservation history');
test.todo('POST /api/admin/chargers/:id/blocks refuses a window that overlaps a confirmed reservation (409)');
test.todo('DELETE /api/admin/chargers/blocks/:blockId removes a block');
test.todo('PATCH /api/admin/reservations/:id/status lets an admin cancel a reservation and notifies the customer');
