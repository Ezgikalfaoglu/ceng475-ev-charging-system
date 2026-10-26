// Simple SVG bar chart (no chart library). OWNER: PM. Eda adds more chart types in
// src/features/admin/analytics/ using the same approach.
// Props: data [{ label, value }], height, ariaLabel, formatValue (number -> text), tickEvery (show every n-th x label)
const WIDTH = 640;
const PAD = { top: 22, right: 8, bottom: 30, left: 34 };

function niceMax(max) {
  // A multiple of 4 so the four grid steps (0, 25%, 50%, 75%, 100%) are always whole numbers.
  if (max <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(max / 4));
  return Math.ceil(max / (4 * magnitude)) * 4 * magnitude;
}

export default function BarChart({ data, height = 240, ariaLabel, formatValue = (v) => String(v), tickEvery = 1 }) {
  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const top = niceMax(Math.max(...data.map((d) => d.value), 0));
  const slot = innerW / Math.max(data.length, 1);
  const barW = Math.min(34, slot * 0.62);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f));

  return (
    <figure className="chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={ariaLabel}>
        {ticks.map((tick) => {
          const y = PAD.top + innerH - (tick / top) * innerH;
          return (
            <g key={tick}>
              <line className="chart__grid" x1={PAD.left} x2={WIDTH - PAD.right} y1={y} y2={y} />
              <text className="chart__label" x={PAD.left - 6} y={y + 4} textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.value / top) * innerH;
          const x = PAD.left + slot * i + (slot - barW) / 2;
          const y = PAD.top + innerH - h;
          return (
            <g key={d.label}>
              <rect className="chart__bar" x={x} y={y} width={barW} height={Math.max(h, d.value > 0 ? 2 : 0)} rx="5">
                <title>{`${d.label}: ${formatValue(d.value)}`}</title>
              </rect>
              {d.value > 0 && slot > 26 && (
                <text className="chart__value" x={x + barW / 2} y={y - 5} textAnchor="middle">
                  {formatValue(d.value)}
                </text>
              )}
              {i % tickEvery === 0 && (
                <text className="chart__label" x={x + barW / 2} y={height - 10} textAnchor="middle">
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
