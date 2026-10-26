import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { findViolations, ownerOfBranch, ownerOfFile } from './ownership.mjs';

const config = JSON.parse(readFileSync(new URL('../ownership.json', import.meta.url), 'utf8'));

test('branches map to owners', () => {
  assert.equal(ownerOfBranch(config, 'dev/melike-sahin'), 'melike');
  assert.equal(ownerOfBranch(config, 'dev/berfin-ozcelik'), 'berfin');
  assert.equal(ownerOfBranch(config, 'dev/turkan-eda-ulucay'), 'eda');
  assert.equal(ownerOfBranch(config, 'main'), 'pm');
  assert.equal(ownerOfBranch(config, 'chore/readme'), 'pm');
  assert.equal(ownerOfBranch(config, 'random-branch'), null);
});

test('files map to owners and unknown files belong to the PM', () => {
  assert.equal(ownerOfFile(config, 'src/features/reservations/MyReservationsPage.jsx'), 'berfin');
  assert.equal(ownerOfFile(config, 'server/routes/pricing.js'), 'melike');
  assert.equal(ownerOfFile(config, 'server/queries/sessions.js'), 'eda');
  assert.equal(ownerOfFile(config, 'src/routes/registry.jsx'), 'pm');
  assert.equal(ownerOfFile(config, 'server/db/schema.sql'), 'pm');
  assert.equal(ownerOfFile(config, 'package.json'), 'pm');
});

test('a developer may edit own files and add new files in own folders', () => {
  const files = ['src/features/stations/StationFilters.jsx', 'server/services/reservations/conflicts.js', 'server/tests/reservations.test.js'];
  assert.deepEqual(findViolations(config, 'dev/berfin-ozcelik', files), []);
});

test('a developer touching another owner or shared files is reported', () => {
  const violations = findViolations(config, 'dev/berfin-ozcelik', ['src/features/charging/ChargingSessionPage.jsx', 'package.json', 'src/components/Modal.jsx']);
  assert.deepEqual(violations.map((v) => v.file), ['src/features/charging/ChargingSessionPage.jsx', 'package.json', 'src/components/Modal.jsx']);
  assert.equal(violations[0].owner, 'eda');
  assert.equal(violations[1].owner, 'pm');
});

test('DEVELOPER_README.md is allowed on every branch', () => {
  assert.deepEqual(findViolations(config, 'dev/berfin-ozcelik', ['DEVELOPER_README.md']), []);
});

test('PM branches may change anything, unknown branches nothing', () => {
  assert.deepEqual(findViolations(config, 'main', ['package.json']), []);
  assert.equal(findViolations(config, 'typo-branch', ['src/features/stations/StationDirectoryPage.jsx']).length, 1);
});
