// Registration page. OWNER: Melike (dev/melike-sahin).
// Baseline on main: the layout and fields are in place but the form is disabled, because the
// POST /api/auth/register endpoint is still a 501 placeholder.
// TODO(Melike):
//   * state for values, errors, busy; validate with src/lib/validators.js (name, e-mail, password, confirm)
//   * call useAuth().register(...) and show server field errors (409 for a used e-mail)
//   * password strength hint, show/hide password (Input already supports it), redirect to the dashboard
//   * remove <StarterNotice> and the `disabled` flags
import { Link } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Input from '../../components/Input.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import { paths } from '../../lib/paths.js';
import { MELIKE } from '../../../shared/owners.js';

export default function RegisterPage() {
  return (
    <>
      <h1>Create your account</h1>
      <p className="muted" style={{ margin: 'var(--space-2) 0 var(--space-5)' }}>
        Reserve chargers and follow your sessions.
      </p>

      <StarterNotice owner={MELIKE} todo={['Form state, validation and submit', 'POST /api/auth/register and duplicate e-mail handling']} />

      <form className="stack" onSubmit={(event) => event.preventDefault()} noValidate>
        <fieldset disabled style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <Input label="Full name" name="name" autoComplete="name" required />
          <Input label="E-mail" name="email" type="email" autoComplete="email" required />
          <Input label="Password" name="password" type="password" autoComplete="new-password" hint="At least 8 characters, with letters and a number." required />
          <Input label="Confirm password" name="confirm" type="password" autoComplete="new-password" required />
        </fieldset>
        <Button type="submit" variant="primary" size="lg" block disabled title="Available after Melike's branch is merged">
          Create account
        </Button>
      </form>

      <p className="auth__switch">
        Already have an account? <Link to={paths.login}>Sign in</Link>
      </p>
    </>
  );
}
