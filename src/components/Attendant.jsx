// Animated charging-station attendant (the "pompacı"). OWNER: PM.
// Purely decorative: it is hidden from screen readers, the information it shows is always
// available as text next to it.
//
// Props:
//   pose   'idle' (waves) | 'work' (plugging in) | 'no' (shakes head) | 'out' (asleep) | 'done' (cheers)
//   look   0..3, picks one of four skin / hair / glasses / moustache variants
//   delay  seconds, offsets the idle animation so a row of attendants does not move in sync
//   className  extra classes for sizing (the SVG fills its parent)
// Written as two components so the same drawing can sit inside HTML and inside the night scene.
const LOOKS = [
  { skin: '#F2C7A5', hair: '#2B1B12', stache: 'none', glasses: 'none' },
  { skin: '#C98F63', hair: '#0F0F12', stache: 'inline', glasses: 'none' },
  { skin: '#8D5A3B', hair: '#2B1B12', stache: 'none', glasses: 'inline' },
  { skin: '#E6B48E', hair: '#9A6B3C', stache: 'none', glasses: 'none' },
];

// The drawing itself. Use it directly only inside another <svg> (give it x, y, width, height);
// everywhere else use <Attendant>.
export function AttendantSvg({ pose = 'idle', look = 0, delay = 0, ...svgProps }) {
  const v = LOOKS[Math.abs(look) % LOOKS.length];
  const style = { '--skin': v.skin, '--hair': v.hair, '--st': v.stache, '--gl': v.glasses, '--d': `${delay}s` };
  return (
      <svg className={`att p-${pose}`} style={style} viewBox="0 0 120 150" focusable="false" aria-hidden="true" {...svgProps}>
        <ellipse cx="60" cy="146" rx="30" ry="4.5" fill="rgba(10,31,68,.18)" />
        <g className="body">
          <rect x="43" y="104" width="13" height="36" rx="5" fill="#12305F" />
          <rect x="64" y="104" width="13" height="36" rx="5" fill="#12305F" />
          <ellipse cx="48" cy="141" rx="10" ry="5" fill="#04122A" />
          <ellipse cx="72" cy="141" rx="10" ry="5" fill="#04122A" />
          <g className="arm-w">
            <line x1="38" y1="70" x2="28" y2="100" stroke="#12305F" strokeWidth="11" strokeLinecap="round" />
            <circle cx="27" cy="102" r="6.5" className="sk" />
            <rect x="21" y="92" width="13" height="5" rx="2.5" fill="#2BE59E" transform="rotate(-18 27 94)" />
          </g>
          <rect x="30" y="58" width="60" height="52" rx="16" fill="#12305F" />
          <path d="M36 62 Q44 58 52 62 L60 76 L68 62 Q76 58 84 62 L86 108 L34 108 Z" fill="#2BE59E" />
          <rect x="34.5" y="90" width="51" height="5" fill="#FFFFFF" opacity=".92" />
          <path d="M47 70 l-6 10 h5 l-1 7 6 -10 h-5z" fill="#04122A" />
          <g className="arm-g">
            <line x1="82" y1="70" x2="92" y2="100" stroke="#12305F" strokeWidth="11" strokeLinecap="round" />
            <path d="M93 104 C98 128 82 134 70 141" stroke="#0A1F44" strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="90" y="95" width="17" height="10" rx="3.5" fill="#0A1F44" />
            <rect x="105" y="97" width="8" height="6" rx="2" fill="#2BE59E" className="gun-tip" />
            <circle cx="93" cy="102" r="6.5" className="sk" />
          </g>
          <g className="head">
            <circle cx="39.5" cy="41" r="4.5" className="sk" />
            <circle cx="80.5" cy="41" r="4.5" className="sk" />
            <circle cx="60" cy="38" r="21" className="sk" />
            <path d="M39 36 Q40 24 60 22 Q80 24 81 36 L78 32 Q60 28 42 32Z" className="hr" />
            <circle cx="46" cy="49" r="3.6" fill="#FF9A8A" opacity=".38" />
            <circle cx="74" cy="49" r="3.6" fill="#FF9A8A" opacity=".38" />
            <g className="eyes">
              <circle cx="52" cy="42" r="2.7" fill="#0A1F44" />
              <circle cx="68" cy="42" r="2.7" fill="#0A1F44" />
            </g>
            <g className="eyes-closed" stroke="#0A1F44" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M48.5 42 Q52 45.5 55.5 42" />
              <path d="M64.5 42 Q68 45.5 71.5 42" />
            </g>
            <g className="glasses" stroke="#0A1F44" strokeWidth="1.8" fill="rgba(255,255,255,.25)">
              <circle cx="52" cy="42" r="6.2" />
              <circle cx="68" cy="42" r="6.2" />
              <path d="M58 42 H62" fill="none" />
            </g>
            <path className="stache hr" d="M50 49 Q55 44.5 60 47.5 Q65 44.5 70 49 Q65 52 60 50 Q55 52 50 49Z" />
            <path className="m-smile" d="M52 51 Q60 58 68 51" stroke="#0A1F44" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path className="m-flat" d="M53 53 H67" stroke="#0A1F44" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path className="m-open" d="M52 50 Q60 63 68 50 Z" fill="#0A1F44" />
            <path d="M38 32 Q38 11 60 11 Q82 11 82 32 Z" fill="#0A1F44" />
            <path d="M37 31 Q60 26 97 31 Q97 37 90 37 L37 37Z" fill="#12305F" />
            <path d="M40 24 Q60 18 80 24" stroke="#2BE59E" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="60" cy="18" r="3.4" fill="#2BE59E" />
          </g>
          <g className="bubble">
            <circle cx="94" cy="10" r="12.5" fill="#FFFFFF" stroke="#0A1F44" strokeWidth="1.6" />
            <g className="b b-bolt"><path d="M95 2 L89 12 H94 L93 18 L99 8 H94Z" fill="#14B87D" /></g>
            <g className="b b-x"><path d="M89 5 L99 15 M99 5 L89 15" stroke="#D6402F" strokeWidth="2.8" strokeLinecap="round" /></g>
            <g className="b b-z"><text x="87" y="16" fontSize="15" fontWeight="800" fill="#0A1F44" fontFamily="Hanken Grotesk, sans-serif">z</text></g>
            <g className="b b-ok"><path d="M88 10 L92.5 15 L100 5" stroke="#14B87D" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
          </g>
        </g>
      </svg>
  );
}

export default function Attendant({ className = '', ...props }) {
  return (
    <span className={`att-wrap ${className}`} aria-hidden="true">
      <AttendantSvg {...props} />
    </span>
  );
}
