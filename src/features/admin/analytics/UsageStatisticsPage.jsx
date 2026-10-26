// Usage statistics. OWNER: Eda (dev/turkan-eda-ulucay).
// Baseline on main: totals and reservations per day. Real usage reports need GET /admin/analytics/usage.
// TODO(Eda): date range filter, usage per station and per charger (busiest hours, utilisation %),
//            energy and revenue per day, CSV export of the table, more charts using <BarChart>.
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

export default function UsageStatisticsPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/admin/analytics/summary'), []);
  const s = data?.summary;
  return (
    <>
      <PageHeader title="Usage statistics" subtitle="How the network is used." />
      <StarterNotice owner={EDA} todo={['Date range filter', 'Usage per station and charger', 'Busiest hours', 'CSV export']} />
      {loading && <LoadingState label="Loading statistics..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {s && (
        <>
          <div className="grid grid--3" style={{ marginBottom: 'var(--space-6)' }}>
            <StatCard label="Energy delivered" value={formatKwh(s.energyKwh)} icon="battery" tone="navy" />
            <StatCard label="Revenue" value={formatMoney(s.revenue)} icon="euro" />
            <StatCard label="Charging now" value={s.activeSessions} icon="bolt" hint="Simulated sessions" />
          </div>
          <section className="card card__body">
            <h2 style={{ marginBottom: 'var(--space-3)' }}>Reservations per day</h2>
            <BarChart data={data.reservationsPerDay.map((d) => ({ label: d.day.slice(5), value: d.count }))} ariaLabel="Bar chart of reservations per day for the last 14 days" tickEvery={2} />
          </section>
        </>
      )}
    </>
  );
}
