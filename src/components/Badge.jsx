// Small status pill. OWNER: PM.
//   <Badge tone="success">Active</Badge>
//   <StatusBadge status="confirmed" />     picks the colour and label from the status text
import { capitalize } from '../lib/format.js';

export default function Badge({ tone = 'neutral', live = false, children, className = '' }) {
  const toneClass = tone === 'neutral' ? '' : `badge--${tone}`;
  return <span className={`badge ${toneClass} ${live ? 'badge--live' : ''} ${className}`.trim()}>{children}</span>;
}

// One place that defines how every status in the system looks.
const STATUS_TONES = {
  // reservations
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'info',
  // sessions
  scheduled: 'info',
  charging: 'accent',
  // chargers
  operational: 'success',
  maintenance: 'warning',
  offline: 'danger',
  // stations
  active: 'success',
  inactive: 'neutral',
};

export function StatusBadge({ status }) {
  return (
    <Badge tone={STATUS_TONES[status] ?? 'neutral'} live={status === 'charging'}>
      {capitalize(status ?? 'unknown')}
    </Badge>
  );
}
