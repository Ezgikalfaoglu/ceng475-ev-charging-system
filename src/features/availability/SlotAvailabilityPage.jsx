// Free and booked slots for one station and day. OWNER: Berfin (dev/berfin-ozcelik).
// Baseline on main: station and date pickers, the shared <AvailabilityCalendar>, single-slot
// selection and a link to the reservation form. Slots booked by other customers are shown.
// TODO(Berfin): previous/next day buttons, "today" shortcut, drag or two-click RANGE selection
//               (start and end), keyboard navigation, blocked and past slots once the API returns them,
//               a summary of the selection (duration, price per kWh), mobile layout polish.
//               Put new components in this folder (e.g. DayNavigator.jsx, SlotLegend.jsx).
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AvailabilityCalendar from '../../components/AvailabilityCalendar.jsx';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import Input from '../../components/Input.jsx';
import LoadingState from '../../components/LoadingState.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Select from '../../components/Select.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { api, qs } from '../../lib/api.js';
import { formatTimeRange } from '../../lib/format.js';
import { paths } from '../../lib/paths.js';
import { todayLocal } from '../../../shared/time.js';
import { BERFIN } from '../../../shared/owners.js';

export default function SlotAvailabilityPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(null);

  const stationId = params.get('station') ?? '';
  const date = params.get('date') ?? todayLocal();

  const stations = useAsync(() => api.get('/stations'), []);
  const grid = useAsync(() => (stationId ? api.get(`/availability${qs({ stationId, date })}`) : Promise.resolve(null)), [stationId, date]);

  const update = (changes) => {
    setSelected(null);
    setParams({ station: stationId, date, ...changes });
  };

  const handleSelect = (slot, charger) => setSelected({ chargerId: charger.id, start: slot.start, end: slot.end });

  const goReserve = () => {
    if (!selected) {
      toast.warning('Choose a free slot in the calendar first.');
      return;
    }
    navigate(paths.newReservation(qs({ station: stationId, charger: selected.chargerId, start: selected.start, end: selected.end })));
  };

  return (
    <>
      <PageHeader title="Slot availability" subtitle="Pick a station and a day, then choose a free slot." />
      <StarterNotice owner={BERFIN} todo={['Day navigation and range selection (start and end time)', 'Blocked and past slots', 'Selection summary']} />

      <div className="filters">
        <Select
          label="Station"
          name="station"
          value={stationId}
          onChange={(event) => update({ station: event.target.value })}
          options={(stations.data?.stations ?? []).map((s) => ({ value: String(s.id), label: `${s.name} (${s.city})` }))}
          placeholder="Choose a station"
        />
        <Input label="Date" name="date" type="date" min={todayLocal()} value={date} onChange={(event) => event.target.value && update({ date: event.target.value })} />
      </div>

      {!stationId && <div className="card"><EmptyState icon="pin" title="Choose a station" message="Select a station above to see its chargers and time slots." /></div>}
      {stationId && grid.loading && <LoadingState label="Loading availability..." />}
      {stationId && grid.error && <ErrorState error={grid.error} onRetry={grid.reload} />}
      {stationId && grid.data && (
        <section className="card card__body" aria-label="Availability calendar">
          <AvailabilityCalendar chargers={grid.data.chargers} selected={selected} onSelect={handleSelect} />
          <div className="row row--between" style={{ marginTop: 'var(--space-5)' }}>
            <p aria-live="polite">{selected ? <>Selected: <strong>{formatTimeRange(selected.start, selected.end)}</strong></> : <span className="muted">No slot selected yet.</span>}</p>
            <Button variant="accent" icon="calendar" onClick={goReserve} disabled={!selected}>
              Reserve this slot
            </Button>
          </div>
        </section>
      )}
    </>
  );
}
