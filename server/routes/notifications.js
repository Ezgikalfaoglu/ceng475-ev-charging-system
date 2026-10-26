// Notification routes (always scoped to the signed-in user). OWNER: Melike (branch dev/melike-sahin).
// Baseline: list and unread count.
// TODO(Melike): PATCH /:id/read, PATCH /read-all, DELETE /:id. A user may only touch their own
//               notifications (answer 404 for another user's id).
import { Router } from 'express';
import { notImplemented } from '../lib/errors.js';
import { countUnread, listNotifications } from '../queries/notifications.js';
import { MELIKE } from '../../shared/owners.js';

const router = Router();

router.get('/', (req, res) => {
  const unreadOnly = req.query.unread === '1' || req.query.unread === 'true';
  res.json({ notifications: listNotifications(req.db, req.user.id, { unreadOnly }) });
});

// Declared before "/:id" routes so "unread-count" is not read as an id.
router.get('/unread-count', (req, res) => {
  res.json({ count: countUnread(req.db, req.user.id) });
});

router.patch('/read-all', () => {
  throw notImplemented(MELIKE, 'Mark all notifications as read');
});

router.patch('/:id/read', () => {
  throw notImplemented(MELIKE, 'Mark notification as read');
});

router.delete('/:id', () => {
  throw notImplemented(MELIKE, 'Delete notification');
});

export default router;
