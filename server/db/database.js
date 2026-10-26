// Persistent SQLite database built on sql.js (pure JavaScript/WebAssembly, no native build tools).
// OWNER: PM.
//
// sql.js keeps the whole database in memory, so this wrapper adds the safety the course
// project needs:
//   1. Reads (all/get) run directly against memory and are always consistent.
//   2. Every change goes through db.write(fn). Writes are queued one after another, wrapped
//      in a transaction (BEGIN/COMMIT/ROLLBACK), and the database file is saved after each
//      successful write. Two requests can therefore never overwrite each other's data.
//   3. The file is saved atomically: write data/voltflow.db.tmp, flush it, then rename it over
//      the real file. A crash in the middle never leaves a half-written database.
//   4. A lock file stops a second server process from opening the same database file.
//
// Usage in route code:
//   const rows = db.all('SELECT * FROM stations WHERE city = ?', [city]);   // read
//   const { lastInsertRowid } = await db.write((tx) => {                    // write
//     return tx.run('INSERT INTO stations (name, address, city) VALUES (?, ?, ?)', [a, b, c]);
//   });
// Always pass values as parameters (?), never build SQL by concatenating user input.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import initSqlJs from 'sql.js';

const SQL = await initSqlJs();

const openFiles = new Set(); // files opened by this process
const heldLocks = new Set(); // lock files created by this process

process.on('exit', () => {
  for (const lock of heldLocks) fs.rmSync(lock, { force: true });
});

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

function acquireLock(lockPath) {
  try {
    fs.writeFileSync(lockPath, String(process.pid), { flag: 'wx' });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
    const pid = Number(fs.readFileSync(lockPath, 'utf8'));
    if (pid && pid !== process.pid && isProcessAlive(pid)) {
      throw new Error(
        `The database is already in use by another VoltFlow server (process ${pid}). ` +
          'Stop that server first (Ctrl+C in its terminal).'
      );
    }
    fs.writeFileSync(lockPath, String(process.pid)); // stale lock from a crashed run
  }
  heldLocks.add(lockPath);
}

const cleanParams = (params) => params.map((p) => (p === undefined ? null : p));

export class Database {
  #db;
  #file;
  #lockPath;
  #queue = Promise.resolve();
  #writing = false;
  #closed = false;

  constructor(sqlDb, file) {
    this.#db = sqlDb;
    this.#file = file;
    this.#lockPath = file ? `${file}.lock` : null;
    this.#db.run('PRAGMA foreign_keys = ON');
  }

  /** Open (or create) the database. Pass null for a throw-away in-memory database. */
  static async open(file) {
    if (!file) return new Database(new SQL.Database(), null);

    const resolved = path.resolve(file);
    if (openFiles.has(resolved)) throw new Error(`Database file is already open in this process: ${resolved}`);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    const lockPath = `${resolved}.lock`;
    acquireLock(lockPath);
    try {
      const sqlDb = fs.existsSync(resolved) ? new SQL.Database(fs.readFileSync(resolved)) : new SQL.Database();
      openFiles.add(resolved);
      return new Database(sqlDb, resolved);
    } catch (err) {
      fs.rmSync(lockPath, { force: true });
      heldLocks.delete(lockPath);
      throw err;
    }
  }

  /** SELECT many rows. Returns an array of plain objects (snake_case column names). */
  all(sql, params = []) {
    const stmt = this.#db.prepare(sql);
    try {
      stmt.bind(cleanParams(params));
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      return rows;
    } finally {
      stmt.free();
    }
  }

  /** SELECT one row (or undefined). */
  get(sql, params = []) {
    return this.all(sql, params)[0];
  }

  /** INSERT / UPDATE / DELETE. Only allowed inside db.write(). */
  run(sql, params = []) {
    this.#assertWriting('run');
    this.#db.run(sql, cleanParams(params));
    const changes = this.#db.getRowsModified();
    const lastInsertRowid = this.get('SELECT last_insert_rowid() AS id').id;
    return { changes, lastInsertRowid };
  }

  /** Run several statements without parameters (schema scripts). Only allowed inside db.write(). */
  exec(sql) {
    this.#assertWriting('exec');
    this.#db.exec(sql);
  }

  /**
   * Run `fn(tx)` as one transaction, then save the file. Calls are queued, so writes never
   * overlap. `fn` must be synchronous. Throwing inside `fn` rolls everything back.
   */
  write(fn) {
    const task = this.#queue.then(async () => {
      if (this.#closed) throw new Error('Database is closed.');
      let result;
      this.#writing = true;
      try {
        this.#db.exec('BEGIN');
        result = fn(this);
        if (result && typeof result.then === 'function') {
          throw new Error('db.write() callback must be synchronous (do not use await inside it).');
        }
        this.#db.exec('COMMIT');
      } catch (err) {
        try {
          this.#db.exec('ROLLBACK');
        } catch {
          /* no open transaction */
        }
        throw err;
      } finally {
        this.#writing = false;
      }
      await this.#persist();
      return result;
    });
    this.#queue = task.catch(() => {}); // a failed write must not block later writes
    return task;
  }

  #assertWriting(method) {
    if (!this.#writing) throw new Error(`db.${method}() must be called inside db.write(...).`);
  }

  async #persist() {
    if (!this.#file) return;
    const data = this.#db.export();
    // export() resets connection settings in sql.js, so turn foreign keys back on.
    this.#db.run('PRAGMA foreign_keys = ON');
    const tmp = `${this.#file}.tmp`;
    const handle = await fsp.open(tmp, 'w');
    try {
      await handle.writeFile(data);
      await handle.sync();
    } finally {
      await handle.close();
    }
    await fsp.rename(tmp, this.#file);
  }

  /** Wait for queued writes, then release the file and lock. */
  async close() {
    await this.#queue;
    if (this.#closed) return;
    this.#closed = true;
    this.#db.close();
    if (this.#file) {
      openFiles.delete(this.#file);
      fs.rmSync(this.#lockPath, { force: true });
      heldLocks.delete(this.#lockPath);
    }
  }
}
