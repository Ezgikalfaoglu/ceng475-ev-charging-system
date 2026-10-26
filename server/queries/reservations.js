// Reservation queries. OWNERS: Berfin (customer side) and Eda (admin overview).
// TODO(Berfin): createReservation (with conflict check inside db.write), cancelReservation.
// TODO(Eda): listAllReservations filters/pagination, updateReservationStatus.
import { camelRow, camelRows } from '../lib/rows.js';

const RESERVATION_SQL = `
  SELECT r.id, r.user_id, r.charger_id, r.start_time, r.end_time, r.status, r.created_at, r.cancelled_at,
         c.label AS charger_label, c.connector_type, c.power_kw, c.price_per_kwh,
         s.id AS station_id, s.name AS station_name, s.city AS station_city,
         u.name AS user_name, u.email AS user_email,
         cs.id AS session_id, cs.status AS session_status
    FROM reservations r
    JOIN chargers c ON c.id = r.charger_id
    JOIN stations s ON s.id = c.station_id
    JOIN users u ON u.id = r.user_id
    LEFT JOIN charging_sessions cs ON cs.reservation_id = r.id`;

/** All reservations of one customer, newest start first. */
export const listReservationsForUser = (db, userId) =>
  camelRows(db.all(`${RESERVATION_SQL} WHERE r.user_id = ? ORDER BY r.start_time DESC`, [userId]));

export const getReservation = (db, id) => camelRow(db.get(`${RESERVATION_SQL} WHERE r.id = ?`, [id]));

/** Admin view: every reservation, optionally filtered by status. */
export function listAllReservations(db, { status } = {}) {
  const where = status ? 'WHERE r.status = ?' : '';
  return camelRows(db.all(`${RESERVATION_SQL} ${where} ORDER BY r.start_time DESC`, status ? [status] : []));
}
