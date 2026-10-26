// Admin analytics. OWNER: Eda (branch dev/turkan-eda-ulucay). Mounted at /api/admin/analytics.
// Baseline: GET /summary (headline numbers and reservations per day).
// TODO(Eda): GET /usage?from=&to= with usage per station and charger, utilisation %,
//            revenue per day and peak hours, for the Usage Statistics page.
import { Router } from 'express';
import { notImplemented } from '../lib/errors.js';
import { getSummary, reservationsPerDay } from '../queries/analytics.js';
import { EDA } from '../../shared/owners.js';

const router = Router();

router.get('/summary', (req, res) => {
  res.json({ summary: getSummary(req.db), reservationsPerDay: reservationsPerDay(req.db, 14) });
});

router.get('/usage', () => {
  throw notImplemented(EDA, 'Usage statistics');
});

export default router;
