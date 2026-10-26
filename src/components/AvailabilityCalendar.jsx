// Day view of charger slots: one row per charger, one button per 30-minute slot. OWNER: PM
// (interface fixed; Berfin builds the page, date navigation and range selection around it).
//
// Props:
//   chargers   array from GET /api/availability: [{ id, label, connectorType, powerKw, status, slots: [{ start, end, state }] }]
//   selected   { chargerId, start, end } | null   highlighted range
//   onSelect   (slot, charger) => void             called when a free slot is clicked
//   interactive  false renders a read-only view
// Slot states: free | booked | blocked | past | unavailable. Only "free" slots can be clicked.
import { timeOf } from '../../shared/time.js';

const STATE_LABEL = { free: 'free', booked: 'already booked', blocked: 'blocked by the operator', past: 'in the past', unavailable: 'charger not available' };

export default function AvailabilityCalendar({ chargers, selected = null, onSelect, interactive = true }) {
  if (!chargers?.length) return null;
  const slotCount = chargers[0].slots.length;
  const firstStart = chargers[0].slots[0]?.start;

  // Hour labels above the grid: two 30-minute slots per label.
  const hourLabels = [];
  for (let i = 0; i < slotCount; i += 2) hourLabels.push(timeOf(chargers[0].slots[i].start));

  const isSelected = (charger, slot) =>
    selected && selected.chargerId === charger.id && slot.start >= selected.start && slot.end <= selected.end;

  return (
    <div className="avail" role="group" aria-label="Charger availability for the selected day">
      <div className="avail__grid">
        {firstStart && (
          <div className="avail__hours" aria-hidden="true">
            {hourLabels.map((label) => (
              <div key={label} className="avail__hour">
                {label}
              </div>
            ))}
          </div>
        )}
        {chargers.map((charger) => (
          <div key={charger.id} className="avail__row">
            <div className="avail__label">
              <strong>Charger {charger.label}</strong>
              <span>
                {charger.connectorType} · {charger.powerKw} kW
              </span>
            </div>
            {charger.slots.map((slot) => {
              const chosen = isSelected(charger, slot);
              const clickable = interactive && slot.state === 'free';
              return (
                <button
                  key={slot.start}
                  type="button"
                  className={`slot slot--${slot.state} ${chosen ? 'slot--selected' : ''}`}
                  disabled={!clickable}
                  aria-pressed={chosen}
                  aria-label={`Charger ${charger.label}, ${timeOf(slot.start)} to ${timeOf(slot.end)}, ${STATE_LABEL[slot.state]}`}
                  title={`${timeOf(slot.start)} to ${timeOf(slot.end)} · ${STATE_LABEL[slot.state]}`}
                  onClick={() => onSelect?.(slot, charger)}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="avail__legend" aria-hidden="true">
        <span><i style={{ background: 'var(--slot-free)', borderColor: 'var(--slot-free-border)' }} /> Free</span>
        <span><i style={{ background: 'var(--slot-selected)' }} /> Selected</span>
        <span><i style={{ background: 'var(--slot-booked)' }} /> Booked</span>
        <span><i style={{ background: 'var(--slot-blocked)', borderColor: 'var(--warning)' }} /> Blocked</span>
        <span><i style={{ background: 'var(--grey-100)' }} /> Not available</span>
      </div>
    </div>
  );
}
