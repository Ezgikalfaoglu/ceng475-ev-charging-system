// Sign-in page. OWNER: Melike (dev/melike-sahin).
// Baseline on main: working login with client validation, server error display and demo accounts.
// TODO(Melike): remember-me or session-expiry message, lockout message after repeated failures
//               (HTTP 429), polish and accessibility review, remove the demo box if the team agrees.
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Icon from '../../components/Icon.jsx';
import Input from '../../components/Input.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { emailError, hasErrors, requiredError, validateForm } from '../../lib/validators.js';
import { homePathFor, paths } from '../../lib/paths.js';

// Accounts created by the seed script (documented in the README).
const DEMO = [
  { label: 'Customer (Ayşe)', email: 'ayse@voltflow.demo', password: 'Customer123!' },
  { label: 'Administrator', email: 'admin@voltflow.demo', password: 'Admin123!' },
];

const RULES = { email: emailError, password: (value) => requiredError(value, 'Password') };

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' })); // clear a message as soon as the user fixes it
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    const found = validateForm(values, RULES);
    setErrors(found);
    if (hasErrors(found)) return;

    setBusy(true);
    try {
      const user = await login(values.email.trim(), values.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(location.state?.from ?? homePathFor(user), { replace: true });
    } catch (err) {
      if (err.details && Object.keys(err.details).length) setErrors(err.details);
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Sign in</h1>
      <p className="muted" style={{ margin: 'var(--space-2) 0 var(--space-5)' }}>
        Welcome back. Enter your details to continue.
      </p>

      <form className="stack" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="form-error" role="alert">
            <Icon name="alert" size={18} />
            {formError}
          </div>
        )}
        <Input label="E-mail" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} error={errors.email} required />
        <Input label="Password" name="password" type="password" autoComplete="current-password" value={values.password} onChange={handleChange} error={errors.password} required />
        <Button type="submit" variant="primary" size="lg" block loading={busy}>
          Sign in
        </Button>
      </form>

      <p className="auth__switch">
        New to VoltFlow? <Link to={paths.register}>Create an account</Link>
      </p>

      <div className="demo-box">
        <h2>Demo accounts</h2>
        <div className="row">
          {DEMO.map((account) => (
            <Button key={account.email} variant="secondary" size="sm" icon="user" onClick={() => { setValues({ email: account.email, password: account.password }); setErrors({}); setFormError(''); }}>
              {account.label}
            </Button>
          ))}
        </div>
        <p className="small muted" style={{ marginTop: 'var(--space-2)' }}>Fills the form for you. Then press "Sign in".</p>
      </div>
    </>
  );
}
