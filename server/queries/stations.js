// Station and charger queries.
// OWNERS: Berfin (customer-facing reads, filters) and Melike (admin create/update/delete).
// TODO(Berfin): filters for search text, city, connector type, minimum power, "has free chargers".
// TODO(Melike): createStation, updateStation, deleteStation (see docs/API_CONTRACTS.md for the rules).
import { camelRow, camelRows } from '../lib/rows.js';

const STATION_LIST_SQL = `
  SELECT s.*,
         COUNT(c.id)                                                  AS charger_count,
         COALESCE(SUM(CASE WHEN c.status = 'operational' THEN 1 ELSE 0 END), 0) AS operational_count,
         COALESCE(MAX(c.power_kw), 0)                                 AS max_power_kw,
         MIN(c.price_per_kwh)                                         AS min_price,
         COALESCE(GROUP_CONCAT(DISTINCT c.connector_type), '')        AS connector_types
    FROM stations s
    LEFT JOIN chargers c ON c.station_id = s.id`;

function shapeStation(row) {
  const station = camelRow(row);
  station.connectorTypes = station.connectorTypes ? station.connectorTypes.split(',').sort() : [];
  station.amenities = station.amenities ? station.amenities.split(',') : [];
  return station;
}

/** Active stations for customers (public). */
export function listActiveStations(db) {
  return db.all(`${STATION_LIST_SQL} WHERE s.status = 'active' GROUP BY s.id ORDER BY s.city, s.name`).map(shapeStation);
}

/** Every station, including inactive ones (admin screens). */
export function listAllStations(db) {
  return db.all(`${STATION_LIST_SQL} GROUP BY s.id ORDER BY s.city, s.name`).map(shapeStation);
}

export function getStation(db, id) {
  const row = db.get(`${STATION_LIST_SQL} WHERE s.id = ? GROUP BY s.id`, [id]);
  return row ? shapeStation(row) : null;
}

export const listChargersByStation = (db, stationId) =>
  camelRows(db.all('SELECT * FROM chargers WHERE station_id = ? ORDER BY label', [stationId]));

export const getCharger = (db, id) => camelRow(db.get('SELECT * FROM chargers WHERE id = ?', [id]));
