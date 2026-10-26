// Reservation tests. OWNER: Berfin (dev/berfin-ozcelik).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let t;
before(async () => {
  t = await startTestServer();
});
after(() => t.close());

test('a customer lists only their own reservations', async () => {
  const token = await t.loginCustomer();
  const { status, body } = await t.request('GET', '/api/reservations', { token });
  assert.equal(status, 200);
  assert.ok(body.reservations.length >= 5);
  assert.ok(body.reservations.every((r) => r.userId === body.reservations[0].userId));
  assert.ok(['confirmed', 'cancelled', 'completed'].includes(body.reservations[0].status));
});

test('a customer can read their own reservation', async () => {
  const token = await t.loginCustomer();
  const list = await t.request('GET', '/api/reservations', { token });
  const one = await t.request('GET', `/api/reservations/${list.body.reservations[0].id}`, { token });
  assert.equal(one.status, 200);
  assert.equal(one.body.reservation.id, list.body.reservations[0].id);
});

test('unknown reservation id gives 404', async () => {
  const token = await t.loginCustomer();
  assert.equal((await t.request('GET', '/api/reservations/99999', { token })).status, 404);
});

// ---- Berfin: implement these on dev/berfin-ozcelik -------------------------------------------
test.todo('POST /api/reservations creates a confirmed reservation and a reservation_confirmed notification');
test.todo('POST /api/reservations rejects a start time in the past (400 with field message)');
test.todo('POST /api/reservations rejects end before start, durations below 30 or above 240 minutes');
test.todo('POST /api/reservations rejects an overlapping reservation on the same charger (409 SLOT_UNAVAILABLE)');
test.todo('the 409 response lists at least 3 alternative slots in error.details.alternatives');
test.todo('back-to-back reservations (end equals next start) are allowed');
test.todo('two simultaneous requests for the same slot: exactly one succeeds');
test.todo('POST /api/reservations rejects chargers that are in maintenance/offline or blocked by an admin');
test.todo('PATCH /api/reservations/:id/cancel cancels own reservation, frees the slot and notifies the user');
test.todo('PATCH /api/reservations/:id/cancel on another user\'s reservation answers 403');
test.todo('a past or already cancelled reservation cannot be cancelled again (409)');
