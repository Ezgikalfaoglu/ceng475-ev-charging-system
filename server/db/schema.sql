-- VoltFlow database schema (SQLite via sql.js).
-- OWNER: PM. Any change needs a PM-reviewed pull request, a bump of SCHEMA_VERSION in
-- server/db/init.js, and an update of docs/DATABASE.md. After pulling a schema change run:
--     npm run db:reset
--
-- Conventions
--   * Audit timestamps (created_at ...) are UTC ISO strings with a trailing Z.
--   * Schedule times (start_time, end_time, started_at ...) are station-local strings
--     'YYYY-MM-DDTHH:mm' (see shared/time.js).
--   * Foreign keys are enforced (PRAGMA foreign_keys = ON is set on every open).

CREATE TABLE users (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT    NOT NULL CHECK (length(trim(name)) >= 2),
  email             TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash     TEXT    NOT NULL,
  role              TEXT    NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone             TEXT,
  vehicle_model     TEXT,
  vehicle_connector TEXT    CHECK (vehicle_connector IS NULL OR vehicle_connector IN ('CCS2', 'CHAdeMO', 'Type2')),
  battery_kwh       REAL    NOT NULL DEFAULT 60 CHECK (battery_kwh > 0),
  created_at        TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE stations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL UNIQUE CHECK (length(trim(name)) >= 2),
  address      TEXT    NOT NULL,
  city         TEXT    NOT NULL,
  latitude     REAL    CHECK (latitude  IS NULL OR latitude  BETWEEN -90  AND 90),
  longitude    REAL    CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
  description  TEXT,
  amenities    TEXT    NOT NULL DEFAULT '',          -- comma separated, e.g. 'Cafe,Restroom,Wi-Fi'
  opening_time TEXT    NOT NULL DEFAULT '06:00',     -- 'HH:mm'
  closing_time TEXT    NOT NULL DEFAULT '22:00',     -- 'HH:mm'
  status       TEXT    NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE chargers (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id     INTEGER NOT NULL REFERENCES stations (id) ON DELETE CASCADE,
  label          TEXT    NOT NULL,                   -- e.g. 'A1'
  connector_type TEXT    NOT NULL CHECK (connector_type IN ('CCS2', 'CHAdeMO', 'Type2')),
  power_kw       REAL    NOT NULL CHECK (power_kw > 0),
  status         TEXT    NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'offline')),
  price_per_kwh  REAL    NOT NULL CHECK (price_per_kwh >= 0),
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  UNIQUE (station_id, label)
);

-- RESTRICT on charger_id: a charger that has reservation history cannot be deleted by accident.
-- Deleting a user removes that user's reservations (and, through them, sessions).
CREATE TABLE reservations (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  charger_id   INTEGER NOT NULL REFERENCES chargers (id) ON DELETE RESTRICT,
  start_time   TEXT    NOT NULL,
  end_time     TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  cancelled_at TEXT,
  CHECK (end_time > start_time)
);
CREATE INDEX idx_reservations_charger_time ON reservations (charger_id, start_time, end_time);
CREATE INDEX idx_reservations_user ON reservations (user_id);

CREATE TABLE charging_sessions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  reservation_id INTEGER NOT NULL UNIQUE REFERENCES reservations (id) ON DELETE CASCADE,
  status         TEXT    NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'charging', 'completed', 'cancelled')),
  start_soc      INTEGER NOT NULL DEFAULT 20 CHECK (start_soc  BETWEEN 0 AND 100),  -- battery % at start
  target_soc     INTEGER NOT NULL DEFAULT 80 CHECK (target_soc BETWEEN 1 AND 100),  -- battery % goal
  started_at     TEXT,
  ended_at       TEXT,
  energy_kwh     REAL    NOT NULL DEFAULT 0 CHECK (energy_kwh >= 0),
  price_per_kwh  REAL    NOT NULL DEFAULT 0 CHECK (price_per_kwh >= 0),             -- price snapshot at start
  cost           REAL    NOT NULL DEFAULT 0 CHECK (cost >= 0),
  progress_pct   INTEGER NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  is_simulated   INTEGER NOT NULL DEFAULT 1 CHECK (is_simulated IN (0, 1)),         -- always 1: no real hardware
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE notifications (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type           TEXT    NOT NULL CHECK (type IN (
                   'reservation_confirmed', 'reservation_cancelled', 'reservation_reminder',
                   'session_completed', 'slot_available', 'system')),
  title          TEXT    NOT NULL,
  message        TEXT    NOT NULL,
  is_read        INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
  reservation_id INTEGER REFERENCES reservations (id) ON DELETE SET NULL,
  created_at     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX idx_notifications_user ON notifications (user_id, is_read);

-- Time windows an admin blocks on a charger (maintenance, private use). Seventh table: it
-- backs the "manage charger availability / time slots" admin page.
CREATE TABLE availability_blocks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  charger_id INTEGER NOT NULL REFERENCES chargers (id) ON DELETE CASCADE,
  start_time TEXT    NOT NULL,
  end_time   TEXT    NOT NULL,
  reason     TEXT    NOT NULL DEFAULT 'Maintenance',
  created_by INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  CHECK (end_time > start_time)
);
CREATE INDEX idx_blocks_charger_time ON availability_blocks (charger_id, start_time, end_time);
