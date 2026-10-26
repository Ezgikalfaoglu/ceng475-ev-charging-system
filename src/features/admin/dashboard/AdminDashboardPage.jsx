// Administrator dashboard. OWNER: Eda (dev/turkan-eda-ulucay).
// Baseline on main: headline numbers and a reservations-per-day chart from GET /admin/analytics/summary.
// TODO(Eda): live "charging now" list, chargers needing attention, quick links, auto refresh.
import BarChart from '../../../components/BarChart.jsx';
import ErrorState from '../../../components/ErrorState.jsx';
import LoadingState from '../../../components/LoadingState.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import StarterNotice from '../../../components/StarterNotice.jsx';
import StatCard from '../../../components/StatCard.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { api } from '../../../lib/api.js';
import { formatKwh, formatMoney } from '../../../lib/format.js';
import { EDA } from '../../../../shared/owners.js';

export default function AdminDashboardPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/admin/analytics/summary'), []);
  const s = data?.summary;

  return (
    <>
      <PageHeader title="Administration" subtitle="Overview of the whole charging network." />
      <StarterNotice owner={EDA} todo={['Charging-now list', 'Chargers that need attention', 'Auto refresh']} />
      {loading && <LoadingState label="Loading overview..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {s && (
        <>
          <div className="grid grid--4" style={{ marginBottom: 'var(--space-6)' }}>
            <StatCard label="Active stations" value={s.stations} icon="pin" tone="navy" />
            <StatCard label="Chargers ready" value={`${s.operationalChargers} / ${s.chargers}`} icon="plug" />
            <StatCard label="Reservations today" value={s.reservationsToday} icon="calendar" />
            <StatCard label="Charging now" value={s.activeSessions} icon="bolt" hint="Simulated sessions" />
            <StatCard label="Customers" value={s.customers} icon="user" />
            <StatCard label="Upcoming reservations" value={s.upcomingReservations} icon="clock" />
            <StatCard label="Energy delivered" value={formatKwh(s.energyKwh)} icon="battery" />
            <StatCard label="Revenue" value={formatMoney(s.revenue)} icon="euro" />
          </div>
          <section className="card card__body">
            <h2 style={{ marginBottom: 'var(--space-3)' }}>Reservations per day (last 14 days)</h2>
            <BarChart
              data={data.reservationsPerDay.map((d) => ({ label: d.day.slice(5), value: d.count }))}
              ariaLabel="Bar chart of reservations per day for the last 14 days"
              tickEvery={2}
            />
          </section>
        </>
      )}
    </>
  );
}
