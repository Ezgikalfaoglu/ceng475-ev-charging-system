// Tests for the display helpers. OWNER: PM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateTime, formatDuration, formatKwh, formatMoney, formatRelative, formatTimeRange, initials } from './format.js';

test('formatDuration', () => {
  assert.equal(formatDuration(45), '45 min');
  assert.equal(formatDuration(60), '1 h');
  assert.equal(formatDuration(95), '1 h 35 min');
  assert.equal(formatDuration(-5), '0 min');
});

test('formatMoney uses euros and tolerates bad input', () => {
  assert.match(formatMoney(12.5), /12\.50/);
  assert.equal(formatMoney('abc'), '-');
});

test('formatKwh rounds to one decimal', () => {
  assert.equal(formatKwh(12.345), '12.3 kWh');
});

test('formatDateTime and formatTimeRange', () => {
  assert.equal(formatDateTime('2026-10-27T18:00'), 'Tue 27 Oct, 18:00');
  assert.equal(formatTimeRange('2026-10-27T18:00', '2026-10-27T19:30'), 'Tue 27 Oct, 18:00 to 19:30');
  assert.match(formatTimeRange('2026-10-27T23:00', '2026-10-28T00:30'), /Wed 28 Oct, 00:30$/);
  assert.equal(formatDateTime('garbage'), '-');
});

test('formatRelative', () => {
  const now = new Date('2026-10-26T12:00:00Z');
  assert.equal(formatRelative('2026-10-26T11:59:40Z', now), 'just now');
  assert.equal(formatRelative('2026-10-26T11:30:00Z', now), '30 min ago');
  assert.equal(formatRelative('2026-10-26T06:00:00Z', now), '6 h ago');
  assert.equal(formatRelative('2026-10-24T12:00:00Z', now), '2 d ago');
});

test('initials', () => {
  assert.equal(initials('Ayşe Demir'), 'AD');
  assert.equal(initials(''), '');
});
