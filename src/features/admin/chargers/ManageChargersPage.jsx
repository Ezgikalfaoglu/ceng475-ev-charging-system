// Manage chargers and time slots. OWNER: Eda (dev/turkan-eda-ulucay).
// Baseline on main: read-only list of every charger. Add / edit / delete and "block a time window"
// are disabled until the API endpoints are implemented.
// TODO(Eda): add / edit charger in a <Modal> with validation, delete with <ConfirmDialog>
//            (refuse when future reservations exist), change status (operational / maintenance /
//            offline), block and unblock time windows per charger (availability_blocks table).
import Button from '../../../components/Button.jsx';
import DataTable from '../../../components/DataTable.jsx';
import ErrorState from '../../../components/ErrorState.jsx';
import LoadingState from '../../../components/LoadingState.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import StarterNotice from '../../../components/StarterNotice.jsx';
import { StatusBadge } from '../../../components/Badge.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { api } from '../../../lib/api.js';
import { formatPrice } from '../../../lib/format.js';
import { EDA } from '../../../../shared/owners.js';

const COLUMNS = [
  { key: 'stationName', header: 'Station', sortable: true },
  { key: 'label', header: 'Charger', sortable: true },
  { key: 'connectorType', header: 'Connector', sortable: true },
  { key: 'powerKw', header: 'Power', numeric: true, sortable: true, render: (c) => `${c.powerKw} kW` },
  { key: 'pricePerKwh', header: 'Price', numeric: true, sortable: true, render: (c) => formatPrice(c.pricePerKwh) },
  { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
      <span className="row">
        <Button size="sm" variant="secondary" icon="edit" disabled>Edit</Button>
        <Button size="sm" variant="secondary" icon="clock" disabled>Block time</Button>
      </span>
    ),
  },
];

export default function ManageChargersPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/admin/chargers'), []);
  return (
    <>
      <PageHeader title="Chargers and time slots" subtitle="Keep chargers up to date and block time windows for maintenance." actions={<Button variant="accent" icon="plus" disabled>Add charger</Button>} />
      <StarterNotice owner={EDA} todo={['Add, edit and delete chargers', 'Change charger status', 'Block and unblock time windows']} />
      {loading && <LoadingState label="Loading chargers..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && <DataTable columns={COLUMNS} rows={data.chargers} caption="All chargers" searchable searchPlaceholder="Search chargers..." />}
    </>
  );
}
