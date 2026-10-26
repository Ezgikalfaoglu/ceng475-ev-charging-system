// Slot availability. OWNER: Berfin.
//
// Baseline (main): builds the slot grid for one station and one day and marks slots that overlap
// a confirmed reservation as "booked" and slots of non-operational chargers as "unavailable".
// TODO(Berfin):
//   * mark slots in the past as "past"
//   * mark slots covered by availability_blocks as "blocked" (admin maintenance windows)
//   * respect the station opening hours for partial days
//   * suggestAlternatives(...): at least three free alternatives for a rejected request
//   * checkConflict(...): used by the reservation POST inside db.write()
import { SLOT_MINUTES } from '../../shared/constants.js';
import { addMinutes, combine, overlaps } from '../../shared/time.js';
import { camelRows } from '../lib/rows.js';

/** Slot states used by the API and the AvailabilityCalendar component. */
export const SLOT_STATES = ['free', 'booked', 'blocked', 'past', 'unavailable'];

export function buildDayGrid(db, station, chargers, date) {
  const dayStart = combine(date, '00:00');
  const dayEnd = combine(date, '23:59');
  const reservations = db.all(
    `SELECT r.charger_id, r.start_time, r.end_time
       FROM reservations r JOIN chargers c ON c.id = r.charger_id
      WHERE c.station_id = ? AND r.status = 'confirmed' AND r.start_time <= ? AND r.end_time >= ?`,
    [station.id, dayEnd, dayStart]
  );

  const slotStarts = [];
  let cursor = combine(date, station.openingTime);
  const close = combine(date, station.closingTime);
  while (addMinutes(cursor, SLOT_MINUTES) <= close) {
    slotStarts.push(cursor);
    cursor = addMinutes(cursor, SLOT_MINUTES);
  }

  return chargers.map((charger) => ({
    id: charger.id,
    label: charger.label,
    connectorType: charger.connectorType,
    powerKw: charger.powerKw,
    status: charger.status,
    pricePerKwh: charger.pricePerKwh,
    slots: slotStarts.map((start) => {
      const end = addMinutes(start, SLOT_MINUTES);
      let state = 'free';
      if (charger.status !== 'operational') state = 'unavailable';
      else if (reservations.some((r) => r.charger_id === charger.id && overlaps(start, end, r.start_time, r.end_time))) state = 'booked';
      return { start, end, state };
    }),
  }));
}

export const listBlocksForCharger = (db, chargerId) =>
  camelRows(db.all('SELECT * FROM availability_blocks WHERE charger_id = ? ORDER BY start_time', [chargerId]));
