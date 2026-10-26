// Tests for the shared time helpers. OWNER: PM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, addMinutes, diffMinutes, isValidLocalIso, overlaps, parseLocalIso, toLocalIso } from './time.js';

test('toLocalIso and parseLocalIso round-trip', () => {
  const iso = '2026-11-03T09:30';
  assert.equal(toLocalIso(parseLocalIso(iso)), iso);
});

test('impossible dates and times are rejected', () => {
  assert.equal(isValidLocalIso('2026-02-31T10:00'), false);
  assert.equal(isValidLocalIso('2026-02-10T25:00'), false);
  assert.equal(isValidLocalIso('2026-02-10 10:00'), false);
  assert.equal(isValidLocalIso(undefined), false);
});

test('addMinutes crosses midnight and month ends', () => {
  assert.equal(addMinutes('2026-10-31T23:30', 60), '2026-11-01T00:30');
});

test('diffMinutes is signed', () => {
  assert.equal(diffMinutes('2026-10-26T10:00', '2026-10-26T11:30'), 90);
  assert.equal(diffMinutes('2026-10-26T11:30', '2026-10-26T10:00'), -90);
});

test('overlaps treats touching ranges as free', () => {
  assert.equal(overlaps('10:00', '11:00', '10:30', '11:30'), true);
  assert.equal(overlaps('10:00', '11:00', '11:00', '12:00'), false);
  assert.equal(overlaps('10:00', '12:00', '10:30', '11:00'), true);
});

test('addDays works across month and year boundaries', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});
