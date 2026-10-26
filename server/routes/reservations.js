// Customer reservations. OWNER: Berfin (branch dev/berfin-ozcelik). Mounted at /api/reservations.
// Baseline: list own reservations and read one (owner or admin only).
// TODO(Berfin): POST / (create) and PATCH /:id/cancel. Creating must, inside ONE db.write():
//   validate input, require a future start, enforce min/max duration, detect overlap on the same
//   charger (including admin blocks), insert the reservation, and create a
//   'reservation_confirmed' notification. On conflict answer 409 SLOT_UNAVAILABLE and include
//   at least three alternatives in error.details.alternatives.
import { Router } from 'express';
import { forbidden, notFound, notImplemented } from '../lib/errors.js';
import { parseId } from '../lib/validate.js';
import { getReservation, listReservationsForUser } from '../queries/reservations.js';
import { BERFIN } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ reservations: listReservationsForUser(req.db, req.user.id) });
});

router.get('/:id', (req, res) => {
  const reservation = getReservation(req.db, parseId(req.params.id));
  if (!reservation) throw notFound('Reservation');
  // A customer may only read their own reservation.
  if (reservation.userId !== req.user.id && req.user.role !== 'admin') {
    throw forbidden('You can only view your own reservations.');
  }
  res.json({ reservation });
});

router.post('/', () => {
  throw notImplemented(BERFIN, 'Create reservation');
});

router.patch('/:id/cancel', () => {
  throw notImplemented(BERFIN, 'Cancel reservation');
});

export default router;
