// Charging station directory. OWNER: Berfin (dev/berfin-ozcelik).
// Baseline on main: shows every active station as a <StationCard>.
// TODO(Berfin): search box (name/address), filters (city, connector type, minimum power,
//               "has ready chargers"), sort, result count, "no results" state with a reset button,
//               send the filters to GET /api/stations as query parameters, keep them in the URL.
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import StationCard from '../../components/StationCard.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api } from '../../lib/api.js';
import { BERFIN } from '../../../shared/owners.js';

export default function StationDirectoryPage() {
  const { data, error, loading, reload } = useAsync(() => api.get('/stations'), []);
  const stations = data?.stations ?? [];

  return (
    <>
      <PageHeader title="Find a charging station" subtitle="Choose a station to see its chargers and free time slots." />
      <StarterNotice owner={BERFIN} todo={['Search and filters (city, connector, power, availability)', 'Result count and reset']} />
      {loading && <LoadingState label="Loading stations..." />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && stations.length === 0 && <EmptyState icon="pin" title="No stations yet" message="Check back soon." />}
      {!loading && !error && stations.length > 0 && (
        <div className="grid grid--auto">
          {stations.map((station) => (
            <StationCard key={station.id} station={station} />
          ))}
        </div>
      )}
    </>
  );
}
