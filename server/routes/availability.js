// Slot availability and alternative suggestions. OWNER: Berfin (branch dev/berfin-ozcelik).
// Baseline: GET / returns the slot grid for one station and day (booked slots from reservations).
// TODO(Berfin): blocked + past slot states, and GET /suggestions (3 or more free alternatives).
import { Router } from 'express';
import { badRequest, notFound, notImplemented } from '../lib/errors.js';
import { isValidLocalIso, parseLocalIso, todayLocal } from '../../shared/time.js';
import { SLOT_MINUTES } from '../../shared/constants.js';
import { parseId } from '../lib/validate.js';
import { getStation, listChargersByStation } from '../queries/stations.js';
import { buildDayGrid } from '../queries/availability.js';
import { BERFIN } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  const stationId = parseId(req.query.stationId, 'stationId');
  const date = req.query.date ?? todayLocal();
  if (!isValidLocalIso(`${date}T00:00`) || !parseLocalIso(`${date}T00:00`)) {
    throw badRequest('Choose a valid date.', { date: 'Use the format YYYY-MM-DD.' });
  }
  const station = getStation(req.db, stationId);
  if (!station || station.status !== 'active') throw notFound('Station');

  const chargers = buildDayGrid(req.db, station, listChargersByStation(req.db, stationId), date);
  res.json({
    stationId,
    date,
    slotMinutes: SLOT_MINUTES,
    openingTime: station.openingTime,
    closingTime: station.closingTime,
    chargers,
  });
});

router.get('/suggestions', () => {
  throw notImplemented(BERFIN, 'Alternative slot suggestions');
});

export default router;
