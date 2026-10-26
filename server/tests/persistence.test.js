// Persistence tests. OWNER: PM. Requirement: "Data persistence after server restart".
import test from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';
import { createNotification } from '../lib/notifications.js';

test('data written through the database layer is still there after a server restart', async () => {
  const t = await startTestServer();
  try {
    await t.db.write((tx) => {
      tx.run("UPDATE stations SET description = 'Changed before restart' WHERE id = 1");
      createNotification(tx, { userId: 2, type: 'system', title: 'Persist me', message: 'Written before the restart.' });
    });
    const token = await t.loginCustomer();
    const unreadBefore = (await t.request('GET', '/api/notifications/unread-count', { token })).body.count;

    await t.restart(); // closes the server and reopens the same database file

    const token2 = await t.loginCustomer();
    const station = await t.request('GET', '/api/stations/1');
    assert.equal(station.body.station.description, 'Changed before restart');
    const unreadAfter = (await t.request('GET', '/api/notifications/unread-count', { token: token2 })).body.count;
    assert.equal(unreadAfter, unreadBefore);
    const list = await t.request('GET', '/api/notifications', { token: token2 });
    assert.ok(list.body.notifications.some((n) => n.title === 'Persist me'));
  } finally {
    await t.close();
  }
});

test('restarting does not re-seed or duplicate demo data', async () => {
  const t = await startTestServer();
  try {
    const before = t.db.get('SELECT COUNT(*) AS n FROM users').n;
    await t.restart();
    assert.equal(t.db.get('SELECT COUNT(*) AS n FROM users').n, before);
  } finally {
    await t.close();
  }
});

test('createNotification rejects unknown types', async () => {
  const t = await startTestServer();
  try {
    await assert.rejects(
      t.db.write((tx) => createNotification(tx, { userId: 2, type: 'email_sent', title: 'x', message: 'y' })),
      /Unknown notification type/
    );
  } finally {
    await t.close();
  }
});
