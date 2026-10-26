// Station directory tests. OWNER: Berfin (dev/berfin-ozcelik).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let t;
before(async () => {
  t = await startTestServer();
});
after(() => t.close());

test('station listing returns active stations with charger summaries', async () => {
  const { status, body } = await t.request('GET', '/api/stations');
  assert.equal(status, 200);
  assert.ok(body.stations.length >= 6);
  const hub = body.stations.find((s) => s.name === 'VoltFlow Kızılay Hub');
  assert.equal(hub.chargerCount, 4);
  assert.deepEqual(hub.connectorTypes, ['CCS2', 'CHAdeMO', 'Type2']);
  assert.equal(hub.maxPowerKw, 150);
  assert.ok(Array.isArray(hub.amenities));
});

test('inactive stations are hidden from customers', async () => {
  await t.db.write((tx) => tx.run("UPDATE stations SET status = 'inactive' WHERE name = 'VoltFlow Pilot Point'"));
  const list = await t.request('GET', '/api/stations');
  assert.ok(!list.body.stations.some((s) => s.name === 'VoltFlow Pilot Point'));
  const id = t.db.get("SELECT id FROM stations WHERE name = 'VoltFlow Pilot Point'").id;
  assert.equal((await t.request('GET', `/api/stations/${id}`)).status, 404);
});

test('station details include the chargers', async () => {
  const { status, body } = await t.request('GET', '/api/stations/1');
  assert.equal(status, 200);
  assert.equal(body.station.chargers.length, 4);
  assert.deepEqual(Object.keys(body.station.chargers[0]).sort(), ['connectorType', 'createdAt', 'id', 'label', 'powerKw', 'pricePerKwh', 'stationId', 'status']);
});

test('unknown and malformed ids give 404 and 400', async () => {
  assert.equal((await t.request('GET', '/api/stations/99999')).status, 404);
  const bad = await t.request('GET', '/api/stations/abc');
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error.code, 'VALIDATION_ERROR');
});

test.todo('GET /api/stations?q=kizilay matches name or address text, ignoring case and accents');
test.todo('GET /api/stations?connector=CHAdeMO&minPower=50 filters by connector type and minimum power');
test.todo('GET /api/stations?city=Istanbul filters by city');
test.todo('GET /api/stations?available=1 only returns stations with at least one operational charger');
