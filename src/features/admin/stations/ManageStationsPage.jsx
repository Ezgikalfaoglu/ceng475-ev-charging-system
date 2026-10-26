// Manage charging stations. OWNER: Melike (dev/melike-sahin).
// Baseline on main: read-only list of every station. Add / edit / delete are disabled until the
// API endpoints are implemented.
// TODO(Melike): add / edit station in a <Modal> (name, address, city, coordinates, opening hours,
//               amenities, status) with validation, delete with <ConfirmDialog> (refuse when future
//               reservations exist), toasts, reload after saving.
import Button from '../../../components/Button.jsx';
import DataTable from '../../../components/DataTable.jsx';
import ErrorState from '../../../components/ErrorState.jsx';
import LoadingState from '../../../components/LoadingState.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import StarterNotice from '../../../components/StarterNotice.jsx';
import { StatusBadge } from '../../../components/Badge.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { api } from '../../../lib/api.js';
import { MELIKE } from '../../../../shared/owners.js';

const COLUMNS = [
  { key: 'name', header: 'Station', sortable: true },
  { key: 'city', header: 'City', sortable: true },
  { key: 'address', header: 'Address' },
  { key: 'chargerCount', header: 'Chargers', numeric: true, sortable: true },
  { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
      <span className="row">
        <Button size="sm" variant="secondary" icon="edit" disabled>Edit</Button>
        <Button size="sm" variant="secondary" icon="trash" disabled>Delete</Button>
      </span>
    ),
  },
];

export default function ManageStationsPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/admin/stations'), []);
  return (
    <>
      <PageHeader title="Stations" subtitle="Create and maintain charging stations." actions={<Button variant="accent" icon="plus" disabled>Add station</Button>} />
      <StarterNotice owner={MELIKE} todo={['Add and edit stations with validation', 'Delete with confirmation', 'Toasts and reload']} />
      {loading && <LoadingState label="Loading stations..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && <DataTable columns={COLUMNS} rows={data.stations} caption="All stations" searchable searchPlaceholder="Search stations..." />}
    </>
  );
}
