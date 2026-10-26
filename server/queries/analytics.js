// Admin analytics and admin charger queries. OWNER: Eda.
// Baseline: headline numbers and a per-day reservation count.
// TODO(Eda): usage per station and per charger, utilisation %, revenue by day, peak hours,
//            charger CRUD, availability blocks CRUD.
import { addDays, nowLocalIso, todayLocal } from '../../shared/time.js';
import { camelRows } from '../lib/rows.js';

export function getSummary(db) {
  const today = todayLocal();
  const now = nowLocalIso();
  const one = (sql, params = []) => db.get(sql, params).value;
  return {
    customers: one("SELECT COUNT(*) AS value FROM users WHERE role = 'customer'"),
    stations: one("SELECT COUNT(*) AS value FROM stations WHERE status = 'active'"),
    chargers: one('SELECT COUNT(*) AS value FROM chargers'),
    operationalChargers: one("SELECT COUNT(*) AS value FROM chargers WHERE status = 'operational'"),
    reservationsToday: one("SELECT COUNT(*) AS value FROM reservations WHERE status != 'cancelled' AND substr(start_time, 1, 10) = ?", [today]),
    upcomingReservations: one("SELECT COUNT(*) AS value FROM reservations WHERE status = 'confirmed' AND start_time > ?", [now]),
    activeSessions: one("SELECT COUNT(*) AS value FROM charging_sessions WHERE status = 'charging'"),
    energyKwh: Math.round(one("SELECT COALESCE(SUM(energy_kwh), 0) AS value FROM charging_sessions WHERE status IN ('completed', 'charging')") * 10) / 10,
    revenue: Math.round(one("SELECT COALESCE(SUM(cost), 0) AS value FROM charging_sessions WHERE status IN ('completed', 'charging')") * 100) / 100,
  };
}

/** Reservations per day for the last `days` days (cancelled ones excluded). */
export function reservationsPerDay(db, days = 14) {
  const from = addDays(todayLocal(), -(days - 1));
  const rows = camelRows(
    db.all(
      `SELECT substr(start_time, 1, 10) AS day, COUNT(*) AS count
         FROM reservations
        WHERE status != 'cancelled' AND substr(start_time, 1, 10) >= ? AND substr(start_time, 1, 10) <= ?
        GROUP BY day`,
      [from, todayLocal()]
    )
  );
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(from, i);
    return { day, count: byDay.get(day) ?? 0 };
  });
}
