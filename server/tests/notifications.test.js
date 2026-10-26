// Notification tests. OWNER: Melike (dev/melike-sahin).
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startTestServer } from './helpers/testServer.js';

let t;
before(async () => {
  t = await startTestServer();
});
after(() => t.close());

test('a user only sees their own notifications, newest first', async () => {
  const token = await t.loginCustomer();
  const { status, body } = await t.request('GET', '/api/notifications', { token });
  assert.equal(status, 200);
  assert.ok(body.notifications.length >= 4);
  const ids = body.notifications.map((n) => n.userId);
  assert.ok(ids.every((id) => id === ids[0]), 'all notifications belong to one user');
  const times = body.notifications.map((n) => n.createdAt);
  assert.deepEqual(times, [...times].sort().reverse());
});

test('unread filter and unread count agree', async () => {
  const token = await t.loginCustomer();
  const unread = await t.request('GET', '/api/notifications?unread=1', { token });
  const count = await t.request('GET', '/api/notifications/unread-count', { token });
  assert.equal(unread.body.notifications.length, count.body.count);
  assert.ok(unread.body.notifications.every((n) => n.isRead === false));
});

test.todo('PATCH /api/notifications/:id/read marks one notification as read and lowers the unread count');
test.todo('PATCH /api/notifications/read-all marks everything as read');
test.todo('a user cannot read or delete another user\'s notification (404)');
test.todo('DELETE /api/notifications/:id removes it');
test.todo('reminder job creates one reservation_reminder notification per upcoming reservation (no duplicates)');
