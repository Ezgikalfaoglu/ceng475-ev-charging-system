// The customer's own reservations. OWNER: Berfin (dev/berfin-ozcelik).
// Baseline on main: Upcoming and Past tabs using <ReservationCard>. No cancel button yet because
// PATCH /api/reservations/:id/cancel is still a placeholder (ReservationCard shows the button as
// soon as you pass an `onCancel` function).
// TODO(Berfin): onCancel with <ConfirmDialog>, api.patch(`/reservations/${id}/cancel`), toast,
//               reload the list, status filter, empty states with a "Book a slot" button.
import { useState } from 'react';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ReservationCard from '../../components/ReservationCard.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { paths } from '../../lib/paths.js';
import { nowLocalIso } from '../../../shared/time.js';
import { BERFIN } from '../../../shared/owners.js';

export default function MyReservationsPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/reservations'), []);
  const [tab, setTab] = useState('upcoming');

  const now = nowLocalIso();
  const all = data?.reservations ?? [];
  const upcoming = all.filter((r) => r.status === 'confirmed' && r.endTime > now).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const past = all.filter((r) => !(r.status === 'confirmed' && r.endTime > now));
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <>
      <PageHeader title="My reservations" subtitle="Your upcoming and past charging slots." actions={<Button variant="accent" icon="plus" to={paths.availability()}>Book a slot</Button>} />
      <StarterNotice owner={BERFIN} todo={['Cancel a reservation with confirmation', 'Status filter']} />

      <div className="tabs" role="tablist" aria-label="Reservation filter" style={{ marginBottom: 'var(--space-4)' }}>
        <button type="button" role="tab" aria-selected={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
          Upcoming ({upcoming.length})
        </button>
        <button type="button" role="tab" aria-selected={tab === 'past'} onClick={() => setTab('past')}>
          Past and cancelled ({past.length})
        </button>
      </div>

      {loading && <LoadingState label="Loading reservations..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && shown.length === 0 && (
        <div className="card">
          <EmptyState
            icon="calendar"
            title={tab === 'upcoming' ? 'No upcoming reservations' : 'Nothing here yet'}
            message={tab === 'upcoming' ? 'Find a station and book your next charge.' : 'Finished and cancelled reservations appear here.'}
            action={tab === 'upcoming' ? <Button variant="accent" to={paths.stations}>Find a station</Button> : undefined}
          />
        </div>
      )}
      {!loading && !error && shown.length > 0 && (
        <div className="stack">
          {shown.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </>
  );
}
