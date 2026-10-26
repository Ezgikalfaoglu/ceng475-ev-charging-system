// Notification queries. OWNER: Melike.
// TODO(Melike): markRead, markAllRead, deleteNotification, reminder generation, "slot available" fan-out.
import { camelRows } from '../lib/rows.js';

const shape = (row) => ({ ...row, is_read: Boolean(row.is_read) });

export function listNotifications(db, userId, { unreadOnly = false } = {}) {
  const where = unreadOnly ? 'AND is_read = 0' : '';
  return camelRows(
    db.all(`SELECT * FROM notifications WHERE user_id = ? ${where} ORDER BY created_at DESC, id DESC`, [userId]).map(shape)
  );
}

export const countUnread = (db, userId) =>
  db.get('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0', [userId]).count;
