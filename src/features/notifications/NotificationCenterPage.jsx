// Notification centre. OWNER: Melike (dev/melike-sahin).
// Baseline on main: lists the user's stored notifications with an All / Unread switch.
// Notifications are in-app only. Nothing is e-mailed or pushed, and the UI must not claim otherwise.
// TODO(Melike): "Mark as read" per item and "Mark all as read" (PATCH endpoints), delete,
//               call notifyNotificationsChanged() from hooks/useUnreadCount.js afterwards so the
//               bell updates, empty and error states, link each item to its reservation.
import { useState } from 'react';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Icon from '../../components/Icon.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatRelative } from '../../lib/format.js';
import { MELIKE } from '../../../shared/owners.js';

const TYPE_ICON = {
  reservation_confirmed: 'check',
  reservation_cancelled: 'x',
  reservation_reminder: 'clock',
  session_completed: 'bolt',
  slot_available: 'calendar',
  system: 'info',
};

export default function NotificationCenterPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/notifications'), []);
  const [filter, setFilter] = useState('all');

  const all = data?.notifications ?? [];
  const shown = filter === 'unread' ? all.filter((n) => !n.isRead) : all;
  const unread = all.filter((n) => !n.isRead).length;

  return (
    <>
      <PageHeader title="Notifications" subtitle="Confirmations, reminders and session updates." />
      <StarterNotice owner={MELIKE} todo={['Mark one / all as read', 'Delete a notification', 'Update the bell counter after changes']} />

      <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="tabs" role="tablist" aria-label="Filter notifications">
          <button type="button" role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>
            All ({all.length})
          </button>
          <button type="button" role="tab" aria-selected={filter === 'unread'} onClick={() => setFilter('unread')}>
            Unread ({unread})
          </button>
        </div>
      </div>

      {loading && <LoadingState label="Loading notifications..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && shown.length === 0 && (
        <div className="card">
          <EmptyState icon="bell" title={filter === 'unread' ? 'You are all caught up' : 'No notifications yet'} message="New confirmations and reminders will show up here." />
        </div>
      )}
      {!loading && !error && shown.length > 0 && (
        <ul className="card list" aria-label="Notifications">
          {shown.map((n) => (
            <li key={n.id} className={`list__item ${n.isRead ? '' : 'is-unread'}`}>
              <div className="list__icon">
                <Icon name={TYPE_ICON[n.type] ?? 'bell'} size={20} />
              </div>
              <div className="list__main">
                <strong>
                  {n.title}
                  {!n.isRead && <span className="sr-only"> (unread)</span>}
                </strong>
                <span className="muted">{n.message}</span>
              </div>
              <time className="list__time" dateTime={n.createdAt}>
                {formatRelative(n.createdAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
