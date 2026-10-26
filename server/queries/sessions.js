// Charging session queries. OWNER: Eda.
// Baseline returns the values stored in the database. TODO(Eda): start/stop a session, compute the
// simulated progress from elapsed time, complete sessions and create the completion notification.
import { camelRow, camelRows } from '../lib/rows.js';

const SESSION_SQL = `
  SELECT cs.*, r.user_id, r.start_time AS reservation_start, r.end_time AS reservation_end,
         c.id AS charger_id, c.label AS charger_label, c.connector_type, c.power_kw,
         s.id AS station_id, s.name AS station_name,
         u.battery_kwh
    FROM charging_sessions cs
    JOIN reservations r ON r.id = cs.reservation_id
    JOIN chargers c ON c.id = r.charger_id
    JOIN stations s ON s.id = c.station_id
    JOIN users u ON u.id = r.user_id`;

const shape = (row) => {
  const session = camelRow(row);
  if (session) session.isSimulated = Boolean(session.isSimulated);
  return session;
};

export const listSessionsForUser = (db, userId) =>
  db.all(`${SESSION_SQL} WHERE r.user_id = ? ORDER BY r.start_time DESC`, [userId]).map(shape);

export const getSession = (db, id) => shape(db.get(`${SESSION_SQL} WHERE cs.id = ?`, [id]));

export const getActiveSessionForUser = (db, userId) =>
  shape(db.get(`${SESSION_SQL} WHERE r.user_id = ? AND cs.status = 'charging' ORDER BY cs.started_at DESC LIMIT 1`, [userId]));

export const countSessionsByStatus = (db) => camelRows(db.all('SELECT status, COUNT(*) AS count FROM charging_sessions GROUP BY status'));
