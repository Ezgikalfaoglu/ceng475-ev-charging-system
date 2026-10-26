// Two-column layout for the sign-in and register pages. OWNER: PM.
import Attendant from '../components/Attendant.jsx';
import Icon from '../components/Icon.jsx';
import { Brand } from '../components/Navbar.jsx';

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth__panel">
        <Brand />
        <div>
          <h2>Charge smarter. Wait less.</h2>
          <p>Reserve a charger, see live availability and follow your session from anywhere.</p>
          <ul className="auth__points">
            <li><Icon name="calendar" /> Book slots at stations near you</li>
            <li><Icon name="bolt" /> Track your simulated charging session</li>
            <li><Icon name="bell" /> Get reminders in your notification centre</li>
          </ul>
        </div>
        <div className="auth__crew" aria-hidden="true">
          <Attendant pose="idle" look={0} />
          <Attendant pose="work" look={1} delay={-0.5} />
          <Attendant pose="done" look={2} delay={-1} />
        </div>
        <small style={{ color: 'var(--grey-400)' }}>Course project demo. No real payments or hardware.</small>
      </aside>
      <main id="main" className="auth__form-wrap">
        <div className="auth__form">{children}</div>
      </main>
    </div>
  );
}
