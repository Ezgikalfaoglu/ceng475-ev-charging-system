// One reservation as a card. OWNER: PM (Berfin uses it on My Reservations, Eda on the dashboard).
// Props:
//   reservation  object from GET /api/reservations
//   onCancel     (reservation) => void. When omitted, no cancel button is shown.
//   showCustomer shows the customer name (admin lists)
//   trackTo      link target for "Track charging" (shown when a session exists)
import Button from './Button.jsx';
import { StatusBadge } from './Badge.jsx';
import Icon from './Icon.jsx';
import { durationBetween, formatTimeRange } from '../lib/format.js';
import { nowLocalIso, parseLocalIso } from '../../shared/time.js';
import { paths } from '../lib/paths.js';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function ReservationCard({ reservation, onCancel, showCustomer = false, trackTo }) {
  const start = parseLocalIso(reservation.startTime);
  const isFuture = reservation.startTime > nowLocalIso();
  const canCancel = onCancel && reservation.status === 'confirmed' && isFuture;
  const canTrack = reservation.sessionId && reservation.sessionStatus !== 'cancelled';

  return (
    <article className={`card res-card res-card--${reservation.status}`}>
      <div className="res-card__date" aria-hidden="true">
        <strong>{start?.getDate()}</strong>
        <span>{start ? MONTHS[start.getMonth()] : ''}</span>
      </div>
      <div className="res-card__body">
        <div className="row">
          <h3>{reservation.stationName}</h3>
          <StatusBadge status={reservation.status} />
        </div>
        <p className="muted small row" style={{ gap: '0.4rem' }}>
          <Icon name="clock" size={14} />
          {formatTimeRange(reservation.startTime, reservation.endTime)} ({durationBetween(reservation.startTime, reservation.endTime)})
        </p>
        <p className="muted small row" style={{ gap: '0.4rem' }}>
          <Icon name="plug" size={14} />
          Charger {reservation.chargerLabel} · {reservation.connectorType} · {reservation.powerKw} kW
          {showCustomer && <> · {reservation.userName}</>}
        </p>
      </div>
      <div className="row">
        {canTrack && (
          <Button variant="secondary" size="sm" icon="bolt" to={trackTo ?? paths.chargingSession(reservation.sessionId)}>
            Track charging
          </Button>
        )}
        {canCancel && (
          <Button variant="ghost" size="sm" icon="x" onClick={() => onCancel(reservation)}>
            Cancel
          </Button>
        )}
      </div>
    </article>
  );
}
