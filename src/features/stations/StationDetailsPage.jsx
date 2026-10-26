// One station with its chargers. OWNER: Berfin (dev/berfin-ozcelik).
// Baseline on main: station facts, amenities and a read-only charger table.
// TODO(Berfin): per-charger "Check availability" button that opens the availability page with the
//               charger preselected, opening hours display, a map link built from latitude/longitude,
//               "not found" state with a way back to the directory.
import { useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import DataTable from '../../components/DataTable.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Icon from '../../components/Icon.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import { StatusBadge } from '../../components/Badge.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { formatPrice } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { BERFIN } from '../../../shared/owners.js';

const COLUMNS = [
  { key: 'label', header: 'Charger', sortable: true },
  { key: 'connectorType', header: 'Connector', sortable: true },
  { key: 'powerKw', header: 'Power', numeric: true, sortable: true, render: (c) => `${c.powerKw} kW` },
  { key: 'pricePerKwh', header: 'Price', numeric: true, sortable: true, render: (c) => formatPrice(c.pricePerKwh) },
  { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
];

export default function StationDetailsPage() {
  const { id } = useParams();
  const { data, error, loading, reload } = useAsync(() => api.get(`/stations/${id}`), [id]);
  const station = data?.station;

  if (loading) return <LoadingState label="Loading station..." />;
  if (error) {
    return (
      <>
        <PageHeader title="Station" actions={<Button variant="secondary" to={paths.stations} icon="chevronLeft">All stations</Button>} />
        <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} title={error.status === 404 ? 'This station does not exist' : undefined} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={station.name}
        subtitle={`${station.address}, ${station.city}`}
        actions={
          <>
            <Button variant="secondary" to={paths.stations} icon="chevronLeft">All stations</Button>
            <Button variant="accent" to={paths.availability(station.id)} icon="calendar">Check availability</Button>
          </>
        }
      />
      <StarterNotice owner={BERFIN} todo={['Per-charger availability shortcut', 'Opening hours and map link']} />

      <div className="grid grid--2" style={{ marginBottom: 'var(--space-5)' }}>
        <section className="card card__body">
          <h2 style={{ marginBottom: 'var(--space-3)' }}>About this station</h2>
          <p className="muted">{station.description}</p>
          <div className="chip-list" style={{ marginTop: 'var(--space-4)' }}>
            {station.amenities.map((item) => (
              <span key={item} className="chip">
                <Icon name="check" size={12} /> {item}
              </span>
            ))}
          </div>
        </section>
        <section className="card card__body">
          <h2 style={{ marginBottom: 'var(--space-3)' }}>Details</h2>
          <dl className="definition">
            <dt>Opening hours</dt>
            <dd>{station.openingTime} to {station.closingTime}</dd>
            <dt>Chargers</dt>
            <dd>{station.operationalCount} of {station.chargerCount} ready</dd>
            <dt>Highest power</dt>
            <dd>{station.maxPowerKw} kW</dd>
            <dt>Status</dt>
            <dd><StatusBadge status={station.status} /></dd>
          </dl>
        </section>
      </div>

      <h2 style={{ marginBottom: 'var(--space-3)' }}>Chargers</h2>
      <DataTable columns={COLUMNS} rows={station.chargers} caption={`Chargers at ${station.name}`} emptyMessage="This station has no chargers yet." />
    </>
  );
}
