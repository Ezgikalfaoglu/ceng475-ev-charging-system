// Admin charger and availability-block management. OWNER: Eda (branch dev/turkan-eda-ulucay).
// Mounted at /api/admin/chargers behind requireAuth + requireRole('admin').
// Baseline: list chargers (optionally ?stationId=) and list the blocks of one charger.
// TODO(Eda): POST / (create charger), PUT /:id (connector, power, status), DELETE /:id
//   (409 when the charger has reservation history), POST /:id/blocks, DELETE /blocks/:blockId.
//   Creating a block over a confirmed reservation must answer 409 and name the reservation.
import { Router } from 'express';
import { notImplemented } from '../lib/errors.js';
import { parseId } from '../lib/validate.js';
import { camelRows } from '../lib/rows.js';
import { listBlocksForCharger } from '../queries/availability.js';
import { EDA } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  const stationId = req.query.stationId ? parseId(req.query.stationId, 'stationId') : null;
  const chargers = camelRows(
    req.db.all(
      `SELECT c.id, c.station_id, c.label, c.connector_type, c.power_kw, c.status, c.price_per_kwh,
              s.name AS station_name
         FROM chargers c JOIN stations s ON s.id = c.station_id
        ${stationId ? 'WHERE c.station_id = ?' : ''}
        ORDER BY s.name, c.label`,
      stationId ? [stationId] : []
    )
  );
  res.json({ chargers });
});

router.get('/:id/blocks', (req, res) => {
  res.json({ blocks: listBlocksForCharger(req.db, parseId(req.params.id)) });
});

router.post('/', () => {
  throw notImplemented(EDA, 'Create charger');
});

router.post('/:id/blocks', () => {
  throw notImplemented(EDA, 'Block a time window');
});

router.delete('/blocks/:blockId', () => {
  throw notImplemented(EDA, 'Remove availability block');
});

router.put('/:id', () => {
  throw notImplemented(EDA, 'Update charger');
});

router.delete('/:id', () => {
  throw notImplemented(EDA, 'Delete charger');
});

export default router;
