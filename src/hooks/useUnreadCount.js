// Keeps the notification bell number up to date. OWNER: PM.
// It refreshes every 30 seconds and whenever any page announces a change with
// notifyNotificationsChanged() (Melike calls it after marking notifications as read).
import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const EVENT = 'voltflow:notifications-changed';
export const notifyNotificationsChanged = () => window.dispatchEvent(new Event(EVENT));

export function useUnreadCount(enabled) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const refresh = () =>
      api
        .get('/notifications/unread-count')
        .then((data) => active && setCount(data.count))
        .catch(() => {}); // the bell is a convenience; failures stay silent
    refresh();
    const timer = setInterval(refresh, 30_000);
    window.addEventListener(EVENT, refresh);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener(EVENT, refresh);
    };
  }, [enabled]);

  return count;
}
