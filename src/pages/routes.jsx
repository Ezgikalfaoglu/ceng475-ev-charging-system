// Routes of the shared public pages. OWNER: PM.
import LandingPage from './LandingPage.jsx';
import UnauthorizedPage from './UnauthorizedPage.jsx';
import { paths } from '../lib/paths.js';

export default [
  { path: paths.home, element: <LandingPage />, access: 'public', layout: 'public', title: 'EV charging made simple' },
  { path: paths.unauthorized, element: <UnauthorizedPage />, access: 'public', layout: 'public', title: 'Access denied' },
];
