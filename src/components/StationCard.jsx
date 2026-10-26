// Card for one charging station in the directory. OWNER: PM (Berfin uses it in the directory).
// Props:
//   station  object from GET /api/stations (name, city, address, status, chargerCount, operationalCount,
//            maxPowerKw, minPrice, connectorTypes)
//   to       where the card links to (defaults to the station details page)
import { Link } from 'react-router-dom';
import { StatusBadge } from './Badge.jsx';
import Icon from './Icon.jsx';
import { paths } from '../lib/paths.js';

export default function StationCard({ station, to = paths.station(station.id) }) {
  const free = station.operationalCount;
  return (
    <Link to={to} className="card station-card" aria-label={`${station.name}, ${station.city}`}>
      <div className="row row--between">
        <h3>{station.name}</h3>
        <StatusBadge status={station.status} />
      </div>
      <div className="station-card__meta">
        <Icon name="pin" size={16} />
        <span>
          {station.address}, {station.city}
        </span>
      </div>
      <div className="chip-list">
        {station.connectorTypes.map((type) => (
          <span key={type} className="chip">
            <Icon name="plug" size={12} />
            {type}
          </span>
        ))}
      </div>
      <div className="station-card__stats">
        <div>
          <strong>
            {free}/{station.chargerCount}
          </strong>
          <span>chargers ready</span>
        </div>
        <div>
          <strong>{station.maxPowerKw} kW</strong>
          <span>max power</span>
        </div>
        <div>
          <strong>{station.minPrice != null ? `${station.minPrice.toFixed(2)} €` : '-'}</strong>
          <span>from per kWh</span>
        </div>
      </div>
    </Link>
  );
}
