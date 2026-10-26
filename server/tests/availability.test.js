// Slot availability tests. OWNER: Berfin (dev/berfin-ozcelik).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { addDays, todayLocal } from '../../shared/time.js';

let t;
let token;
const tomorrow = addDays(todayLocal(), 1);

before(async () => {
  t = await startTestServer();
  token = await t.loginCustomer();
});
after(() => t.close());

const stateAt = (charger, time) => charger.slots.find((s) => s.start.endsWith(time))?.state;

test('the grid covers the opening hours in 30-minute slots', async () => {
  const { status, body } = await t.request('GET', `/api/availability?stationId=1&date=${tomorrow}`, { token });
  assert.equal(status, 200);
  assert.equal(body.slotMinutes, 30);
  assert.equal(body.chargers.length, 4);
  assert.equal(body.chargers[0].slots.length, 34); // 06:00 to 23:00
  assert.equal(body.chargers[0].slots[0].start, `${tomorrow}T06:00`);
});

test('slots reflect existing reservations', async () => {
  const { body } = await t.request('GET', `/api/availability?stationId=1&date=${tomorrow}`, { token });
  const a1 = body.chargers.find((c) => c.label === 'A1');
  assert.equal(stateAt(a1, 'T08:30'), 'free');
  assert.equal(stateAt(a1, 'T09:00'), 'booked'); // Can 09:00-10:30
  assert.equal(stateAt(a1, 'T11:30'), 'booked'); // Elif 10:30-12:00
  assert.equal(stateAt(a1, 'T12:00'), 'free');
  assert.equal(stateAt(a1, 'T16:00'), 'free'); // cancelled reservation frees the slot
});

test('chargers under maintenance are unavailable for the whole day', async () => {
  const { body } = await t.request('GET', `/api/availability?stationId=3&date=${tomorrow}`, { token });
  const b2 = body.chargers.find((c) => c.label === 'B2');
  assert.equal(b2.status, 'maintenance');
  assert.ok(b2.slots.every((s) => s.state === 'unavailable'));
});

test('bad input is rejected with field messages', async () => {
  assert.equal((await t.request('GET', '/api/availability', { token })).status, 400);
  const date = await t.request('GET', '/api/availability?stationId=1&date=2026-02-31', { token });
  assert.equal(date.status, 400);
  assert.ok(date.body.error.details.date);
  assert.equal((await t.request('GET', '/api/availability?stationId=99999', { token })).status, 404);
});

test.todo('slots in the past are returned with state "past"');
test.todo('admin availability blocks are returned with state "blocked"');
test.todo('GET /api/availability/suggestions returns at least 3 free alternatives near the requested time');
test.todo('suggestions include other chargers at the same station when the requested charger is busy');
