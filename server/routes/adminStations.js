// Admin station management. OWNER: Melike (branch dev/melike-sahin). Mounted at /api/admin/stations
// behind requireAuth + requireRole('admin') in routes/index.js.
// Baseline: GET list (all stations, including inactive).
// TODO(Melike): POST (create), PUT /:id (update), DELETE /:id.
//   Delete rule: refuse with 409 when the station has any reservation history; the message should
//   suggest setting the station to "inactive" instead. A station without history is deleted together
//   with its chargers (ON DELETE CASCADE).
import { Router } from 'express';
import { notImplemented } from '../lib/errors.js';
import { listAllStations } from '../queries/stations.js';
import { MELIKE } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ stations: listAllStations(req.db) });
});

router.post('/', () => {
  throw notImplemented(MELIKE, 'Create station');
});

router.put('/:id', () => {
  throw notImplemented(MELIKE, 'Update station');
});

router.delete('/:id', () => {
  throw notImplemented(MELIKE, 'Delete station');
});

export default router;
