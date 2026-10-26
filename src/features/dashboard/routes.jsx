// Routes of the customer dashboard. OWNER: Eda (dev/turkan-eda-ulucay).
import CustomerDashboardPage from './CustomerDashboardPage.jsx';
import { paths } from '../../lib/paths.js';

export default [
  {
    path: paths.dashboard,
    element: <CustomerDashboardPage />,
    access: 'customer',
    layout: 'app',
    title: 'Dashboard',
    nav: { label: 'Dashboard', icon: 'home', group: 'Charging', order: 10 },
  },
];
