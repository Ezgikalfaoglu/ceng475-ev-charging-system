// Admin station and pricing tests. OWNER: Melike (dev/melike-sahin).
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

test('admin station list includes inactive stations and charger counts', async () => {
  await t.db.write((tx) => tx.run("UPDATE stations SET status = 'inactive' WHERE id = 2"));
  const { status, body } = await t.request('GET', '/api/admin/stations', { token: admin });
  assert.equal(status, 200);
  const inactive = body.stations.find((s) => s.id === 2);
  assert.equal(inactive.status, 'inactive');
  assert.equal(inactive.chargerCount, 3);
});

test('pricing list shows every charger with its price', async () => {
  const { status, body } = await t.request('GET', '/api/admin/pricing', { token: admin });
  assert.equal(status, 200);
  assert.ok(body.chargers.length >= 20);
  assert.ok(body.chargers.every((c) => typeof c.pricePerKwh === 'number' && c.stationName));
});

// ---- Melike: implement these on dev/melike-sahin ---------------------------------------------
test.todo('POST /api/admin/stations creates a station (201) and the new station appears in the directory');
test.todo('POST /api/admin/stations validates name, address, city, coordinates and opening hours (400 with details)');
test.todo('POST /api/admin/stations rejects a duplicate station name (409)');
test.todo('PUT /api/admin/stations/:id updates the fields and can set the station inactive');
test.todo('DELETE /api/admin/stations/:id removes a station without history together with its chargers');
test.todo('DELETE /api/admin/stations/:id answers 409 for a station with reservation history and suggests "inactive"');
test.todo('PUT /api/admin/pricing/:chargerId changes the price and rejects negative or non-numeric values');
test.todo('PUT /api/admin/pricing/station/:stationId updates all chargers of a station in one transaction');
test.todo('a price change does not alter the cost of sessions that already started');
