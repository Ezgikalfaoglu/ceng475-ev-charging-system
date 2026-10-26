// Shown when a signed-in user opens a page that belongs to another role. OWNER: PM.
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor, paths } from '../lib/paths.js';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  return (
    <div className="page-center">
      <div className="big-code" aria-hidden="true">403</div>
      <h1>You do not have access to this page</h1>
      <p className="muted">
        {user
          ? `Your account role is "${user.role}". This area is for a different role.`
          : 'Please sign in with an account that is allowed to open this page.'}
      </p>
      <div className="row">
        {user ? (
          <Button variant="accent" to={homePathFor(user)}>
            Go to my dashboard
          </Button>
        ) : (
          <Button variant="accent" to={paths.login}>
            Sign in
          </Button>
        )}
      </div>
    </div>
  );
}
