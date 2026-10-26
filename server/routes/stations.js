// Customer-facing station directory (public read access). OWNER: Berfin (branch dev/berfin-ozcelik).
// Baseline: list all active stations and show one station with its chargers.
// TODO(Berfin): query parameters q (name/address text), city, connector, minPower, available=1
//               for GET /. Keep the response shape in docs/API_CONTRACTS.md.
import { Router } from 'express';
import { notFound } from '../lib/errors.js';
import { parseId } from '../lib/validate.js';
import { getStation, listActiveStations, listChargersByStation } from '../queries/stations.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ stations: listActiveStations(req.db) });
});

router.get('/:id', (req, res) => {
  const id = parseId(req.params.id);
  const station = getStation(req.db, id);
  if (!station || station.status !== 'active') throw notFound('Station');
  res.json({ station: { ...station, chargers: listChargersByStation(req.db, id) } });
});

export default router;
