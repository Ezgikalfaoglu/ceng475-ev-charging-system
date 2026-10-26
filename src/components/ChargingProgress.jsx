// Circular progress with the live numbers of one charging session. OWNER: PM
// (Eda feeds it with real simulated data and keeps it updating).
//
// IMPORTANT: this project does NOT talk to cars or charger hardware. The "Simulation" label and
// the note below must stay visible so nobody believes a real vehicle is charging.
//
// Props: status ('scheduled' | 'charging' | 'completed' | 'cancelled'), progressPct (0-100),
//        energyKwh, cost, durationMinutes, estimatedCompletion ('YYYY-MM-DDTHH:mm' or null),
//        powerKw, stationName, chargerLabel
import Attendant from './Attendant.jsx';
import { StatusBadge } from './Badge.jsx';
import { formatDuration, formatKwh, formatMoney } from '../lib/format.js';

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// The attendant next to the ring reacts to the session state (decoration only).
const POSE = { scheduled: 'idle', charging: 'work', completed: 'done', cancelled: 'no' };

export default function ChargingProgress({ status, progressPct = 0, energyKwh = 0, cost = 0, durationMinutes = 0, estimatedCompletion = null, powerKw, stationName, chargerLabel }) {
  const pct = Math.max(0, Math.min(100, Math.round(progressPct)));
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  return (
    <section className={`card charge charge--${status}`} aria-label="Charging session progress">
      <div className="charge__visual">
      <div className="charge__ring" role="img" aria-label={`${pct} percent charged`}>
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="charge-gradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#5bffc0" />
              <stop offset="1" stopColor="#14b87d" />
            </linearGradient>
          </defs>
          <circle className="charge__track" cx="100" cy="100" r={RADIUS} />
          <circle className="charge__value" cx="100" cy="100" r={RADIUS} strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset} />
        </svg>
        <div className="charge__center">
          <strong>{pct}%</strong>
          <span>charged</span>
        </div>
      </div>
        <div className="charge__crew">
          <Attendant pose={POSE[status] ?? 'idle'} look={1} />
        </div>
      </div>
      <div>
        <div className="row">
          <StatusBadge status={status} />
          <span className="sim-chip">Simulation</span>
        </div>
        {(stationName || chargerLabel) && (
          <h2 style={{ marginTop: 'var(--space-3)' }}>
            {stationName}
            {chargerLabel && <span className="muted"> · Charger {chargerLabel}</span>}
          </h2>
        )}
        <div className="charge__metrics">
          <div className="charge__metric">
            <span>Duration</span>
            <strong>{formatDuration(durationMinutes)}</strong>
          </div>
          <div className="charge__metric">
            <span>Energy delivered</span>
            <strong>{formatKwh(energyKwh)}</strong>
          </div>
          <div className="charge__metric">
            <span>Cost so far</span>
            <strong>{formatMoney(cost)}</strong>
          </div>
          <div className="charge__metric">
            <span>{status === 'completed' ? 'Finished at' : 'Estimated completion'}</span>
            <strong>{estimatedCompletion ? estimatedCompletion.slice(11, 16) : '-'}</strong>
          </div>
          {powerKw != null && (
            <div className="charge__metric">
              <span>Charger power</span>
              <strong>{powerKw} kW</strong>
            </div>
          )}
        </div>
        <p className="charge__note">
          Simulated session for demonstration. No vehicle or charger hardware is connected, and all values shown are estimates.
        </p>
      </div>
    </section>
  );
}
