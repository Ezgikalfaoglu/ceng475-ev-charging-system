// Admin charging prices. OWNER: Melike (branch dev/melike-sahin). Mounted at /api/admin/pricing.
// Baseline: GET list of chargers with their current price.
// TODO(Melike): PUT /:chargerId (one charger), PUT /station/:stationId (all chargers of a station).
//   Validate the price (number, 0 to 5 EUR per kWh). A price change applies to new sessions only;
//   running sessions keep the price stored in charging_sessions.price_per_kwh.
import { Router } from 'express';
import { notImplemented } from '../lib/errors.js';
import { camelRows } from '../lib/rows.js';
import { MELIKE } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  const chargers = camelRows(
    req.db.all(
      `SELECT c.id, c.station_id, c.label, c.connector_type, c.power_kw, c.status, c.price_per_kwh,
              s.name AS station_name, s.city AS station_city
         FROM chargers c JOIN stations s ON s.id = c.station_id
        ORDER BY s.name, c.label`
    )
  );
  res.json({ chargers });
});

router.put('/station/:stationId', () => {
  throw notImplemented(MELIKE, 'Update prices for a station');
});

router.put('/:chargerId', () => {
  throw notImplemented(MELIKE, 'Update charger price');
});

export default router;
