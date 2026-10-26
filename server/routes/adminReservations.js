// Admin reservation overview. OWNER: Eda (branch dev/turkan-eda-ulucay). Mounted at /api/admin/reservations.
// Baseline: GET list of all reservations (optional ?status=).
// TODO(Eda): filters (station, date range, customer), PATCH /:id/status (admin cancel/complete with a
//            notification to the customer), summary counts per status.
import { Router } from 'express';
import { badRequest, notImplemented } from '../lib/errors.js';
import { RESERVATION_STATUSES } from '../../shared/constants.js';
import { listAllReservations } from '../queries/reservations.js';
import { EDA } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  const { status } = req.query;
  if (status && !RESERVATION_STATUSES.includes(status)) {
    throw badRequest('Unknown status filter.', { status: `Use one of: ${RESERVATION_STATUSES.join(', ')}.` });
  }
  res.json({ reservations: listAllReservations(req.db, { status }) });
});

router.patch('/:id/status', () => {
  throw notImplemented(EDA, 'Change reservation status');
});

export default router;
