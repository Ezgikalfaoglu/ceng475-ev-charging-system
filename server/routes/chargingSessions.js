// Simulated charging sessions. OWNER: Eda (branch dev/turkan-eda-ulucay). Mounted at /api/sessions.
// Every session in this project is a SIMULATION: no vehicle or charger hardware is connected.
// Baseline: list own sessions, the active session, one session (owner or admin only).
// TODO(Eda): POST /:id/start, POST /:id/stop, GET /:id/progress. Progress is computed from the
//   elapsed time since started_at (see config.simSpeed); when the target is reached mark the
//   session 'completed', store energy and cost, and create a 'session_completed' notification.
import { Router } from 'express';
import { forbidden, notFound, notImplemented } from '../lib/errors.js';
import { parseId } from '../lib/validate.js';
import { getActiveSessionForUser, getSession, listSessionsForUser } from '../queries/sessions.js';
import { EDA } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ sessions: listSessionsForUser(req.db, req.user.id) });
});

// Declared before "/:id" so "active" is not read as an id.
router.get('/active', (req, res) => {
  res.json({ session: getActiveSessionForUser(req.db, req.user.id) ?? null });
});

router.get('/:id', (req, res) => {
  const session = getSession(req.db, parseId(req.params.id));
  if (!session) throw notFound('Charging session');
  if (session.userId !== req.user.id && req.user.role !== 'admin') {
    throw forbidden('You can only view your own charging sessions.');
  }
  res.json({ session });
});

router.post('/:id/start', () => {
  throw notImplemented(EDA, 'Start charging session');
});

router.post('/:id/stop', () => {
  throw notImplemented(EDA, 'Stop charging session');
});

router.get('/:id/progress', () => {
  throw notImplemented(EDA, 'Live charging progress');
});

export default router;
