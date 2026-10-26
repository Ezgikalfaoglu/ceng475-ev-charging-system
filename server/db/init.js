// Database initialisation: creates the tables and seed data when the database is empty.
// OWNER: PM.
//   npm run db:init     creates data/voltflow.db if it does not exist yet
//   npm run db:reset    deletes it and creates it again
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import { Database } from './database.js';
import { seedDatabase } from './seed.js';

/** Bump this whenever schema.sql changes. Old databases are rejected with a clear message. */
export const SCHEMA_VERSION = 1;

const schemaPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');

/** Create tables (and seed data) when the database is new; verify the version otherwise. */
export async function ensureDatabase(db, { seed = true } = {}) {
  const hasTables = db.get("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'");
  if (!hasTables) {
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await db.write((tx) => {
      tx.exec(sql);
      tx.exec(`PRAGMA user_version = ${SCHEMA_VERSION}`);
    });
    if (seed) await seedDatabase(db);
    return { created: true };
  }
  const { user_version: version } = db.get('PRAGMA user_version');
  if (version !== SCHEMA_VERSION) {
    throw new Error(
      `The local database has schema version ${version}, but the code expects ${SCHEMA_VERSION}. ` +
        'Run "npm run db:reset" to recreate it with the current schema and demo data.'
    );
  }
  return { created: false };
}

// Allow "node server/db/init.js" from the command line.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const db = await Database.open(config.dbPath);
  try {
    const { created } = await ensureDatabase(db);
    console.log(created ? `Database created and seeded: ${config.dbPath}` : `Database already exists: ${config.dbPath}`);
  } finally {
    await db.close();
  }
}
