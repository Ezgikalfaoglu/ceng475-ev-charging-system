// Headline number with an icon, used on dashboards. OWNER: PM.
// Props: label, value, hint (small text under the value), icon (<Icon> name), tone ('default' | 'navy')
import Icon from './Icon.jsx';

export default function StatCard({ label, value, hint, icon = 'bolt', tone = 'default' }) {
  return (
    <div className={`card stat-card ${tone === 'navy' ? 'stat-card--navy' : ''}`}>
      <div className="stat-card__icon">
        <Icon name={icon} size={24} />
      </div>
      <div>
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
        {hint && <div className="stat-card__hint">{hint}</div>}
      </div>
    </div>
  );
}
