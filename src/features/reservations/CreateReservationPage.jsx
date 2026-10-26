// Create a reservation. OWNER: Berfin (dev/berfin-ozcelik).
// Baseline on main: shows a read-only summary of the slot chosen on the availability page
// (station, charger, time, price). The confirm button stays disabled until POST /api/reservations exists.
// TODO(Berfin):
//   * a real form: station, charger, date, start time, end time (state + validation: required,
//     future start, end after start, 30 to 240 minutes)
//   * submit with api.post('/reservations', ...) and show a success toast, then go to My reservations
//   * on 409 SLOT_UNAVAILABLE show a clear warning (<Modal> or inline alert) and render the
//     alternatives from err.details.alternatives as buttons that fill the form
//   * remove <StarterNotice> and the `disabled` flag
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { durationBetween, formatPrice, formatTimeRange } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { BERFIN } from '../../../shared/owners.js';

export default function CreateReservationPage() {
  const [params] = useSearchParams();
  const stationId = params.get('station');
  const chargerId = Number(params.get('charger'));
  const start = params.get('start');
  const end = params.get('end');
  const hasSlot = stationId && chargerId && start && end;

  const { data, error, loading, reload } = useAsync(() => (hasSlot ? api.get(`/stations/${stationId}`) : Promise.resolve(null)), [stationId, hasSlot]);
  const station = data?.station;
  const charger = station?.chargers.find((c) => c.id === chargerId);

  return (
    <>
      <PageHeader title="New reservation" subtitle="Review your slot, then confirm." />
      <StarterNotice owner={BERFIN} todo={['Reservation form with validation', 'Conflict warning and three alternative times', 'POST /api/reservations']} />

      {!hasSlot && (
        <div className="card">
          <EmptyState
            icon="calendar"
            title="No slot selected"
            message="Choose a free time slot first, then come back here to confirm it."
            action={<Button variant="accent" to={paths.availability()}>Choose a slot</Button>}
          />
        </div>
      )}
      {hasSlot && loading && <LoadingState label="Loading your slot..." />}
      {hasSlot && error && <ErrorState error={error} onRetry={reload} />}
      {hasSlot && station && !charger && <ErrorState error={{ message: 'That charger does not belong to this station.' }} />}
      {hasSlot && station && charger && (
        <section className="card card__body" aria-label="Reservation summary">
          <dl className="definition">
            <dt>Station</dt>
            <dd><Link to={paths.station(station.id)}>{station.name}</Link></dd>
            <dt>Charger</dt>
            <dd>{charger.label} · {charger.connectorType} · {charger.powerKw} kW</dd>
            <dt>Time</dt>
            <dd>{formatTimeRange(start, end)}</dd>
            <dt>Duration</dt>
            <dd>{durationBetween(start, end)}</dd>
            <dt>Price</dt>
            <dd>{formatPrice(charger.pricePerKwh)} (you pay for the energy delivered)</dd>
          </dl>
          <div className="row" style={{ marginTop: 'var(--space-5)' }}>
            <Button variant="accent" icon="check" disabled title="Available after Berfin's branch is merged">Confirm reservation</Button>
            <Button variant="secondary" to={paths.availability(station.id)}>Choose another slot</Button>
          </div>
        </section>
      )}
    </>
  );
}
