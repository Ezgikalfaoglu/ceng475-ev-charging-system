// Manage reservations (administrator). OWNER: Eda (dev/turkan-eda-ulucay).
// Baseline on main: every reservation with a status filter (the filter is sent to the server).
// TODO(Eda): cancel / complete a reservation (PATCH /admin/reservations/:id/status) with a
//            <ConfirmDialog> and a notification to the customer, date filter, search by customer.
import { useState } from 'react';
import Button from '../../../components/Button.jsx';
import DataTable from '../../../components/DataTable.jsx';
import ErrorState from '../../../components/ErrorState.jsx';
import LoadingState from '../../../components/LoadingState.jsx';
import PageHeader from '../../../components/PageHeader.jsx';
import Select from '../../../components/Select.jsx';
import StarterNotice from '../../../components/StarterNotice.jsx';
import { StatusBadge } from '../../../components/Badge.jsx';
import { useAsync } from '../../../hooks/useAsync.js';
import { api, qs } from '../../../lib/api.js';
import { formatTimeRange } from '../../../lib/format.js';
import { RESERVATION_STATUSES } from '../../../../shared/constants.js';
import { EDA } from '../../../../shared/owners.js';

const COLUMNS = [
  { key: 'id', header: '#', numeric: true, sortable: true },
  { key: 'userName', header: 'Customer', sortable: true },
  { key: 'stationName', header: 'Station', sortable: true },
  { key: 'chargerLabel', header: 'Charger' },
  { key: 'startTime', header: 'Time', sortable: true, render: (r) => formatTimeRange(r.startTime, r.endTime) },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'actions', header: 'Actions', render: () => <Button size="sm" variant="secondary" disabled>Cancel</Button> },
];

export default function ManageReservationsPage() {
  const [status, setStatus] = useState('');
  const { data, error, loading, reload } = useAsync(() => api.get(`/admin/reservations${qs({ status })}`), [status]);

  return (
    <>
      <PageHeader title="Reservations" subtitle="All customer reservations." />
      <StarterNotice owner={EDA} todo={['Cancel or complete a reservation', 'Notify the customer', 'Date filter']} />
      <div className="filters">
        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={RESERVATION_STATUSES.map((value) => ({ value, label: value }))}
          placeholder="All statuses"
        />
      </div>
      {loading && <LoadingState label="Loading reservations..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && <DataTable columns={COLUMNS} rows={data.reservations} caption="All reservations" searchable searchPlaceholder="Search reservations..." />}
    </>
  );
}
