// Shared helper for creating in-app notifications. OWNER: PM.
// Notifications are stored in the database and shown in the Notification Center. No real
// e-mail or push message is sent, and the UI must never claim that one was.
//
// Call it inside the same db.write(...) as the change it announces, so both succeed or fail
// together:
//   await db.write((tx) => {
//     const { lastInsertRowid } = tx.run('INSERT INTO reservations ...', [...]);
//     createNotification(tx, { userId, type: 'reservation_confirmed', title, message, reservationId: lastInsertRowid });
//   });
import { NOTIFICATION_TYPES } from '../../shared/constants.js';

export function createNotification(tx, { userId, type, title, message, reservationId = null }) {
  if (!NOTIFICATION_TYPES.includes(type)) throw new Error(`Unknown notification type: ${type}`);
  return tx.run(
    'INSERT INTO notifications (user_id, type, title, message, reservation_id) VALUES (?, ?, ?, ?, ?)',
    [userId, type, title, message, reservationId]
  );
}
