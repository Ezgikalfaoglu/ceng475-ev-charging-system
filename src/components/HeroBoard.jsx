// Decorative booking board for the landing page. OWNER: PM.
// It only illustrates how the slot lanes look (the data is made up and not read from the API).
// A 90 minute selection hops between windows that really are free in LAYOUT while the attendant
// of that lane plugs in. With reduced motion it stays on the first window.
import { useEffect, useState } from 'react';
import Attendant from './Attendant.jsx';

// 16 half-hour slots from 12:00. 'b' booked, 'f' free.
const LAYOUT = [
  { label: 'A1', spec: 'CCS2 · 150 kW', slots: 'bbffffffbbfffbbf' },
  { label: 'A2', spec: 'CCS2 · 150 kW', slots: 'ffbbffffffffbbff' },
  { label: 'B1', spec: 'Type2 · 22 kW', slots: 'fffffbbbbffffffb' },
];
const HOPS = [[1, 4], [2, 0], [0, 2], [1, 8], [2, 9], [0, 10]];
const HOURS = Array.from({ length: 8 }, (_, h) => `${12 + h}:00`);

export default function HeroBoard({ stationName = 'Example station' }) {
  const [hop, setHop] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const timer = setInterval(() => setHop((n) => n + 1), 3600);
    return () => clearInterval(timer);
  }, []);

  const [selLane, selAt] = HOPS[hop % HOPS.length];

  return (
    <div className="board" role="img" aria-label="Illustration of a booking board. Free times are outlined in green, booked times are hatched, and a 90 minute selection moves between free times while the attendant of that charger plugs in.">
      <div className="board__head" aria-hidden="true">
        <strong>{stationName}</strong>
        <span>Example day</span>
      </div>
      <div className="board__hours" aria-hidden="true">
        {HOURS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {LAYOUT.map((lane, r) => {
        const mine = r === selLane;
        return (
          <div key={lane.label} className="board__lane" aria-hidden="true">
            <div className="board__who">
              <Attendant pose={mine ? 'work' : 'idle'} look={r} delay={-r * 0.5} />
            </div>
            <div className="board__main">
              <div className="board__name">
                <strong>{lane.label}</strong>
                <span>{lane.spec}</span>
              </div>
              <div className="board__strip">
                {lane.slots.split('').map((k, i) => {
                  const chosen = mine && i >= selAt && i < selAt + 3;
                  return <span key={i} className={`board__cell ${k === 'b' ? 'is-booked' : ''} ${chosen ? 'is-chosen' : ''}`} />;
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
