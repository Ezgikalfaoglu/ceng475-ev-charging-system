// Public landing page. OWNER: PM (finished on main).
import Button from '../components/Button.jsx';
import HeroBoard from '../components/HeroBoard.jsx';
import Icon from '../components/Icon.jsx';
import NightScene from '../components/NightScene.jsx';
import StationCard from '../components/StationCard.jsx';
import { useAsync } from '../hooks/useAsync.js';
import { api } from '../lib/api.js';
import { paths } from '../lib/paths.js';

const FEATURES = [
  { icon: 'calendar', title: 'Reserve a slot', text: 'Pick a station, a charger and a time. We prevent double bookings and suggest other times when a slot is taken.' },
  { icon: 'bolt', title: 'Follow your session', text: 'See progress, energy and cost while you charge. Sessions in this demo are simulated.' },
  { icon: 'bell', title: 'Stay informed', text: 'Confirmations, reminders and completed sessions appear in your notification centre.' },
  { icon: 'chart', title: 'Run the network', text: 'Operators manage stations, chargers and prices, and read usage statistics in one place.' },
];

export default function LandingPage() {
  const { data } = useAsync(() => api.get('/stations'), []);
  const stations = data?.stations ?? [];
  const chargerCount = stations.reduce((sum, s) => sum + s.chargerCount, 0);
  const topPower = stations.reduce((max, s) => Math.max(max, s.maxPowerKw), 0);

  return (
    <>
      <section className="hero">
        <div className="hero__inner">
          <div>
            <h1>
              Pick a time. <em>Plug in.</em>
            </h1>
            <p className="lead">Every charger has its own attendant and every half hour is a slot on the board. Book a green one and follow your session, while operators manage chargers, prices and usage in one platform.</p>
            <div className="row">
              <Button variant="accent" size="lg" to={paths.register}>
                Create a free account
              </Button>
              <Button variant="outline-light" size="lg" to={paths.login}>
                Sign in
              </Button>
            </div>
          </div>
          <div className="hero__card" aria-label="Network at a glance">
            <HeroBoard stationName={stations[0]?.name} />
            <div className="hero__stats">
              <div className="hero__stat">
                <strong>{stations.length || '-'}</strong>
                <span>stations</span>
              </div>
              <div className="hero__stat">
                <strong>{chargerCount || '-'}</strong>
                <span>chargers</span>
              </div>
              <div className="hero__stat">
                <strong>{topPower ? `${topPower} kW` : '-'}</strong>
                <span>top charging power</span>
              </div>
              <div className="hero__stat">
                <strong>3</strong>
                <span>connector types</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NightScene />

      <section className="section">
        <div className="section__inner">
          <div className="section__title">
            <h2>Everything for charging, in one place</h2>
            <p>Built for drivers and station operators.</p>
          </div>
          <div className="grid grid--4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card feature">
                <div className="feature__icon">
                  <Icon name={feature.icon} size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p className="muted small" style={{ marginTop: 'var(--space-2)' }}>
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="section__inner">
          <div className="section__title">
            <h2>How it works</h2>
          </div>
          <ol className="steps">
            <li>
              <h3>Find a station</h3>
              <p className="muted">Browse the directory and check which chargers fit your car.</p>
            </li>
            <li>
              <h3>Book your slot</h3>
              <p className="muted">Choose a free time. If it is taken, we suggest the closest alternatives.</p>
            </li>
            <li>
              <h3>Charge and track</h3>
              <p className="muted">Follow progress, energy and cost until your session is complete.</p>
            </li>
          </ol>
        </div>
      </section>

      {stations.length > 0 && (
        <section className="section">
          <div className="section__inner">
            <div className="section__title">
              <h2>Stations on the network</h2>
              <p>Sign in to see live availability and reserve a slot.</p>
            </div>
            <div className="grid grid--auto">
              {stations.slice(0, 3).map((station) => (
                <StationCard key={station.id} station={station} to={paths.login} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
