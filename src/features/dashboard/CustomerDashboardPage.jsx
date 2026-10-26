// Customer dashboard. OWNER: Eda (dev/turkan-eda-ulucay).
// Baseline on main: greeting, headline numbers computed from the user's reservations and sessions,
// and the next upcoming reservation.
// TODO(Eda): active-session shortcut with live progress, recent notifications, quick actions,
//            monthly energy/cost summary, skeleton loading.
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import ReservationCard from '../../components/ReservationCard.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import StatCard from '../../components/StatCard.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatKwh, formatMoney } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { nowLocalIso } from '../../../shared/time.js';
import { EDA } from '../../../shared/owners.js';

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const reservations = useAsync(() => api.get('/reservations'), []);
  const sessions = useAsync(() => api.get('/sessions'), []);
  const loading = reservations.loading || sessions.loading;
  const error = reservations.error || sessions.error;

  const now = nowLocalIso();
  const all = reservations.data?.reservations ?? [];
  const upcoming = all.filter((r) => r.status === 'confirmed' && r.endTime > now).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const done = (sessions.data?.sessions ?? []).filter((s) => s.status === 'completed');
  const energy = done.reduce((sum, s) => sum + s.energyKwh, 0);
  const spent = done.reduce((sum, s) => sum + s.cost, 0);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(' ')[0]}`}
        subtitle="Here is what is happening with your charging."
        actions={<Button variant="accent" icon="plus" to={paths.availability()}>Book a slot</Button>}
      />
      <StarterNotice owner={EDA} todo={['Active session shortcut with live progress', 'Recent notifications', 'Monthly summary']} />
      {loading && <LoadingState label="Loading your dashboard..." />}
      {error && <ErrorState error={error} onRetry={() => { reservations.reload(); sessions.reload(); }} />}
      {!loading && !error && (
        <>
          <div className="grid grid--4" style={{ marginBottom: 'var(--space-6)' }}>
            <StatCard label="Upcoming reservations" value={upcoming.length} icon="calendar" tone="navy" />
            <StatCard label="Completed sessions" value={done.length} icon="check" />
            <StatCard label="Energy charged" value={formatKwh(energy)} icon="battery" />
            <StatCard label="Total spent" value={formatMoney(spent)} icon="euro" />
          </div>
          <h2 style={{ marginBottom: 'var(--space-3)' }}>Next reservation</h2>
          {upcoming.length > 0 ? (
            <ReservationCard reservation={upcoming[0]} />
          ) : (
            <div className="card">
              <EmptyState icon="calendar" title="Nothing booked yet" message="Find a station and reserve a free slot." action={<Button variant="accent" to={paths.stations}>Find a station</Button>} />
            </div>
          )}
        </>
      )}
    </>
  );
}
