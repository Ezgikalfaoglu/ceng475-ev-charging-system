// Wraps one route with its access rule and layout. OWNER: PM.
// This is the client-side half of role-based authorization. It gives a good user experience
// (redirects), but the real protection is on the server: every API route checks the role again.
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import LoadingState from '../components/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../layouts/AppLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import PublicLayout from '../layouts/PublicLayout.jsx';
import { homePathFor, paths } from '../lib/paths.js';

const LAYOUTS = { public: PublicLayout, auth: AuthLayout, app: AppLayout };

export default function RouteShell({ route }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    document.title = route.title ? `${route.title} | VoltFlow` : 'VoltFlow | EV Charging Reservations';
  }, [route.title]);

  if (loading) return <LoadingState label="Checking your session..." />;

  if (route.access === 'guest' && user) return <Navigate to={homePathFor(user)} replace />;

  if (['user', 'customer', 'admin'].includes(route.access)) {
    // Not signed in: go to the login page and come back afterwards.
    if (!user) return <Navigate to={paths.login} replace state={{ from: location.pathname + location.search }} />;
    // Signed in with the wrong role.
    if (route.access !== 'user' && user.role !== route.access) return <Navigate to={paths.unauthorized} replace />;
  }

  const Layout = LAYOUTS[route.layout] ?? PublicLayout;
  return <Layout>{route.element}</Layout>;
}
