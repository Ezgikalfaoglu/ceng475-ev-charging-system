// Charging session tracking. OWNER: Eda (dev/turkan-eda-ulucay).
// Baseline on main: shows the stored values of the active (or selected) session and the history
// table. Charging is ALWAYS a simulation: no car or charger hardware is involved.
// TODO(Eda): "Start charging" / "Stop charging" buttons (POST /sessions/:id/start and /stop),
//            live progress that polls GET /sessions/:id/progress every 2 s, estimated finish time,
//            completion toast + notification, history filters, session summary after completion.
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import ChargingProgress from '../../components/ChargingProgress.jsx';
import DataTable from '../../components/DataTable.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import { StatusBadge } from '../../components/Badge.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatDateTime, formatKwh, formatMoney } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { EDA } from '../../../shared/owners.js';

const HISTORY_COLUMNS = [
  { key: 'reservationStart', header: 'Date', sortable: true, render: (s) => formatDateTime(s.reservationStart) },
  { key: 'stationName', header: 'Station', sortable: true },
  { key: 'chargerLabel', header: 'Charger' },
  { key: 'energyKwh', header: 'Energy', numeric: true, sortable: true, render: (s) => formatKwh(s.energyKwh) },
  { key: 'cost', header: 'Cost', numeric: true, sortable: true, render: (s) => formatMoney(s.cost) },
  { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  { key: 'open', header: '', render: (s) => <Link to={paths.chargingSession(s.id)}>Open</Link> },
];

export default function ChargingSessionPage() {
  const { id } = useParams();
  const sessions = useAsync(() => api.get('/sessions'), []);
  const current = useAsync(() => (id ? api.get(`/sessions/${id}`) : api.get('/sessions/active')), [id]);

  const session = current.data?.session ?? null;
  const loading = sessions.loading || current.loading;
  const error = sessions.error || current.error;

  return (
    <>
      <PageHeader title="Charging" subtitle="Follow your charging session and see past sessions." actions={<Button variant="secondary" to={paths.reservations} icon="calendar">My reservations</Button>} />
      <StarterNotice owner={EDA} todo={['Start and stop buttons', 'Live progress updates every 2 seconds', 'Completion notification']} />
      {loading && <LoadingState label="Loading charging sessions..." />}
      {error && <ErrorState error={error} onRetry={() => { sessions.reload(); current.reload(); }} />}
      {!loading && !error && (
        <>
          {session ? (
            <ChargingProgress
              status={session.status}
              progressPct={session.progressPct ?? 0}
              energyKwh={session.energyKwh}
              cost={session.cost}
              durationMinutes={session.durationMinutes ?? 0}
              estimatedCompletion={session.estimatedCompletion ?? null}
              powerKw={session.powerKw}
              stationName={session.stationName}
              chargerLabel={session.chargerLabel}
            />
          ) : (
            <div className="card">
              <EmptyState icon="bolt" title="No active charging session" message="When you start charging during a reservation, the progress appears here." action={<Button variant="accent" to={paths.stations}>Find a station</Button>} />
            </div>
          )}
          <h2 style={{ margin: 'var(--space-6) 0 var(--space-3)' }}>Session history</h2>
          <DataTable columns={HISTORY_COLUMNS} rows={sessions.data?.sessions ?? []} caption="Your charging sessions" emptyMessage="You have no charging sessions yet." />
        </>
      )}
    </>
  );
}
