// Decorative night scene for the landing page: a city skyline, a charging post, a car and an
// attendant holding the cable. OWNER: PM. Pure illustration, drawn in SVG, no external images.
import { AttendantSvg } from './Attendant.jsx';

const W = 1440;
const H = 330;
const GROUND = 292;

// Small seeded random generator so the skyline is the same on every render.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSkyline() {
  const rnd = mulberry32(475);
  const int = (min, max) => min + Math.floor(rnd() * (max - min + 1));
  const buildings = [];
  const windows = [];
  [
    { fill: '#0B2147', hMin: 70, hMax: 190, lit: true },
    { fill: '#0E2D5C', hMin: 40, hMax: 140, lit: false },
  ].forEach((layer) => {
    let x = -10;
    while (x < W) {
      const w = int(34, 86);
      const h = int(layer.hMin, layer.hMax);
      buildings.push({ x, y: GROUND - h, w, h, fill: layer.fill });
      if (layer.lit) {
        for (let wy = GROUND - h + 12; wy < GROUND - 8; wy += 17) {
          for (let wx = x + 8; wx < x + w - 8; wx += 13) {
            if (rnd() < 0.22) {
              const blink = rnd() < 0.35;
              windows.push({ x: wx, y: wy, blink, dur: 2 + rnd() * 3, delay: rnd() * 3 });
            }
          }
        }
      }
      x += w + int(2, 14);
    }
  });
  return { buildings, windows };
}

const { buildings, windows } = buildSkyline();

export default function NightScene() {
  return (
    <div className="night">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" role="img" aria-label="Illustration: an electric car plugged into a charging post in front of a city skyline at night">
        <defs>
          <linearGradient id="n-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#06122B" stopOpacity="0" />
            <stop offset="1" stopColor="#0B3A4A" stopOpacity=".55" />
          </linearGradient>
          <linearGradient id="n-car" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1B5FB0" />
            <stop offset="1" stopColor="#0A2552" />
          </linearGradient>
          <linearGradient id="n-post" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#14397A" />
            <stop offset="1" stopColor="#0A2552" />
          </linearGradient>
          <radialGradient id="n-moon" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#2BE59E" stopOpacity=".55" />
            <stop offset="1" stopColor="#2BE59E" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="#06122B" />
        <rect width={W} height={H} fill="url(#n-sky)" />
        <g className="night__moon">
          <circle cx="1180" cy="86" r="120" fill="url(#n-moon)" />
          <circle cx="1180" cy="86" r="34" fill="#BFFBE3" opacity=".9" />
        </g>
        {buildings.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.fill} />
        ))}
        {windows.map((w, i) => (
          <rect
            key={i}
            x={w.x}
            y={w.y}
            width="5"
            height="7"
            rx="1"
            fill="#2BE59E"
            opacity=".7"
            className={w.blink ? 'night__window' : undefined}
            style={w.blink ? { animationDuration: `${w.dur.toFixed(1)}s`, animationDelay: `${w.delay.toFixed(1)}s` } : undefined}
          />
        ))}
        {/* road */}
        <rect y={GROUND} width={W} height={H - GROUND} fill="#040D20" />
        <line x1="0" y1={GROUND} x2={W} y2={GROUND} stroke="#2BE59E" strokeOpacity=".5" strokeWidth="2" />
        <line x1="0" y1={GROUND + 26} x2={W} y2={GROUND + 26} stroke="#8FA6BE" strokeOpacity=".35" strokeWidth="3" strokeDasharray="46 40" />
        {/* charging post */}
        <g transform="translate(560 0)">
          <rect x="0" y="150" width="54" height={GROUND - 150} rx="14" fill="url(#n-post)" stroke="#2BE59E" strokeOpacity=".5" />
          <rect x="9" y="164" width="36" height="30" rx="6" fill="#04122A" />
          <rect x="14" y="170" width="26" height="4" rx="2" fill="#2BE59E" />
          <rect x="14" y="178" width="16" height="4" rx="2" fill="#2BE59E" opacity=".6" />
          <circle cx="27" cy="212" r="5" fill="#2BE59E" className="night__ping" />
          <rect x="-14" y={GROUND - 9} width="82" height="9" rx="4" fill="#0A2552" />
        </g>
        {/* cable */}
        <path d="M614 232 C700 232 720 270 826 262" fill="none" stroke="#0A2552" strokeWidth="9" strokeLinecap="round" />
        <path d="M614 232 C700 232 720 270 826 262" fill="none" stroke="#2BE59E" strokeWidth="3" strokeLinecap="round" strokeDasharray="10 8" className="night__flow" />
        {/* attendant holding the cable */}
        <AttendantSvg pose="work" look={1} delay={-0.6} x="705" y="150" width="112" height="140" />
        {/* car */}
        <g transform="translate(820 180)">
          <ellipse cx="180" cy="114" rx="190" ry="12" fill="#2BE59E" opacity=".25" />
          <path d="M6 82 C6 68 24 62 50 58 L94 34 C110 24 142 18 180 18 L240 20 C268 22 286 40 302 56 C332 60 354 66 358 80 L358 94 L6 94 Z" fill="url(#n-car)" stroke="#2BE59E" strokeOpacity=".7" strokeWidth="1.5" />
          <path d="M100 54 L122 36 C136 29 156 26 180 26 L180 54 Z" fill="#071A3A" stroke="#2BE59E" strokeOpacity=".35" />
          <path d="M190 26 L236 28 C252 30 264 42 274 54 L190 54 Z" fill="#071A3A" stroke="#2BE59E" strokeOpacity=".35" />
          <path d="M40 76 L330 76" stroke="#2BE59E" strokeOpacity=".5" strokeWidth="2" />
          <rect x="342" y="64" width="14" height="5" rx="2.5" fill="#BFFBE3" />
          <rect x="6" y="64" width="12" height="5" rx="2.5" fill="#2BE59E" opacity=".6" />
          <circle cx="16" cy="82" r="3.5" fill="#2BE59E" className="night__ping" />
          {[84, 280].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="96" r="22" fill="#030A18" stroke="#2BE59E" strokeOpacity=".6" strokeWidth="2" />
              <circle cx={cx} cy="96" r="9" fill="#0E2D5C" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
