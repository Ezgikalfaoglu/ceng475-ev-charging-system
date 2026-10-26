// Database layer tests. OWNER: PM.
// Covers: schema + seed, constraints, foreign keys, serialized writes, rollback, persistence.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Database } from '../db/database.js';
import { ensureDatabase } from '../db/init.js';

const tempFile = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'voltflow-db-')), 'db.sqlite');
process.env.BCRYPT_ROUNDS = '4';

test('a new database gets the schema and demo data', async () => {
  const file = tempFile();
  const db = await Database.open(file);
  await ensureDatabase(db);
  assert.equal(db.get('SELECT COUNT(*) AS n FROM users').n, 5);
  assert.ok(db.get('SELECT COUNT(*) AS n FROM stations').n >= 6);
  assert.ok(db.get('SELECT COUNT(*) AS n FROM chargers').n >= 15);
  assert.ok(db.get('SELECT COUNT(*) AS n FROM reservations').n > 20);
  assert.equal(db.get('SELECT COUNT(*) AS n FROM charging_sessions WHERE status = ?', ['charging']).n, 1);
  await db.close();
});

test('db.run() outside db.write() is refused', async () => {
  const db = await Database.open(null);
  assert.throws(() => db.run('SELECT 1'), /inside db\.write/);
  await db.close();
});

test('CHECK constraints and foreign keys are enforced', async () => {
  const db = await Database.open(tempFile());
  await ensureDatabase(db);
  await assert.rejects(
    db.write((tx) => tx.run("INSERT INTO users (name, email, password_hash, role) VALUES ('Bad', 'bad@x.io', 'h', 'superuser')")),
    /CHECK constraint/
  );
  await assert.rejects(
    db.write((tx) => tx.run("INSERT INTO chargers (station_id, label, connector_type, power_kw, price_per_kwh) VALUES (9999, 'Z', 'CCS2', 50, 0.4)")),
    /FOREIGN KEY/
  );
  await assert.rejects(
    db.write((tx) => tx.run("INSERT INTO users (name, email, password_hash) VALUES ('Dup', 'AYSE@voltflow.demo', 'h')")),
    /UNIQUE constraint/ // e-mail is unique and case-insensitive
  );
  await db.close();
});

test('foreign keys stay enforced after the file has been saved (sql.js export resets the pragma)', async () => {
  const db = await Database.open(tempFile());
  await ensureDatabase(db);
  await db.write((tx) => tx.run("UPDATE stations SET city = 'Ankara' WHERE id = 1")); // triggers a save
  await assert.rejects(db.write((tx) => tx.run('DELETE FROM chargers WHERE id = 1')), /FOREIGN KEY/); // has reservations
  await db.close();
});

test('a failed write is rolled back completely', async () => {
  const db = await Database.open(tempFile());
  await ensureDatabase(db);
  const before = db.get('SELECT COUNT(*) AS n FROM stations').n;
  await assert.rejects(
    db.write((tx) => {
      tx.run("INSERT INTO stations (name, address, city) VALUES ('Temp', 'x', 'y')");
      throw new Error('boom');
    }),
    /boom/
  );
  assert.equal(db.get('SELECT COUNT(*) AS n FROM stations').n, before);
  await db.close();
});

test('many parallel writes are serialized and none is lost', async () => {
  const file = tempFile();
  const db = await Database.open(file);
  await ensureDatabase(db);
  const before = db.get('SELECT COUNT(*) AS n FROM stations').n;
  await Promise.all(
    Array.from({ length: 40 }, (_, i) =>
      db.write((tx) => tx.run("INSERT INTO stations (name, address, city) VALUES (?, 'addr', 'Ankara')", [`Parallel ${i}`]))
    )
  );
  assert.equal(db.get('SELECT COUNT(*) AS n FROM stations').n, before + 40);
  await db.close();

  const reopened = await Database.open(file); // everything must be on disk
  assert.equal(reopened.get('SELECT COUNT(*) AS n FROM stations').n, before + 40);
  await reopened.close();
});

test('a second process-level opener is refused while the database is open', async () => {
  const file = tempFile();
  const db = await Database.open(file);
  await assert.rejects(Database.open(file), /already open/);
  await db.close();
  const again = await Database.open(file); // lock released on close
  await again.close();
});

test('an old schema version is rejected with a helpful message', async () => {
  const file = tempFile();
  const db = await Database.open(file);
  await ensureDatabase(db);
  await db.write((tx) => tx.exec('PRAGMA user_version = 0'));
  await assert.rejects(ensureDatabase(db), /npm run db:reset/);
  await db.close();
});
