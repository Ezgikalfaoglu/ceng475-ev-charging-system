// 404 page. OWNER: PM.
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { homePathFor, paths } from '../lib/paths.js';

export default function NotFoundPage() {
  const { user } = useAuth();
  return (
    <div className="page-center">
      <div className="big-code" aria-hidden="true">404</div>
      <h1>We could not find that page</h1>
      <p className="muted">The address may be misspelled, or the page has moved.</p>
      <div className="row">
        <Button variant="accent" to={user ? homePathFor(user) : paths.home}>
          {user ? 'Back to my dashboard' : 'Back to the home page'}
        </Button>
      </div>
    </div>
  );
}
