// Manage charging prices. OWNER: Melike (dev/melike-sahin).
// Baseline on main: read-only price list per charger. Editing is disabled until the API exists.
// TODO(Melike): inline price edit per charger and "set price for the whole station" (a <Modal>),
//               validation (greater than 0, at most 2 decimals, upper limit), toast, reload.
import Button from '../../../components/Button.jsx';
import DataTable from '../../../components/DataTable.jsx';
import ErrorState from '../../../components/ErrorState.jsx';
import LoadingState from '../../../components/LoadingState.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import StarterNotice from '../../../components/StarterNotice.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { api } from '../../../lib/api.js';
import { formatPrice } from '../../../lib/format.js';
import { MELIKE } from '../../../../shared/owners.js';

const COLUMNS = [
  { key: 'stationName', header: 'Station', sortable: true },
  { key: 'stationCity', header: 'City', sortable: true },
  { key: 'label', header: 'Charger', sortable: true },
  { key: 'connectorType', header: 'Connector' },
  { key: 'powerKw', header: 'Power', numeric: true, sortable: true, render: (c) => `${c.powerKw} kW` },
  { key: 'pricePerKwh', header: 'Price', numeric: true, sortable: true, render: (c) => formatPrice(c.pricePerKwh) },
  { key: 'actions', header: 'Actions', render: () => <Button size="sm" variant="secondary" icon="edit" disabled>Change price</Button> },
];

export default function ManagePricingPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/admin/pricing'), []);
  return (
    <>
      <PageHeader title="Prices" subtitle="Price per kWh of every charger." />
      <StarterNotice owner={MELIKE} todo={['Edit a charger price', 'Set a price for a whole station', 'Validation']} />
      {loading && <LoadingState label="Loading prices..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && <DataTable columns={COLUMNS} rows={data.chargers} caption="Prices per charger" searchable searchPlaceholder="Search chargers..." />}
    </>
  );
}
