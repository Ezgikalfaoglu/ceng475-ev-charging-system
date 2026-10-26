// Routes of reservation management. OWNER: Eda (dev/turkan-eda-ulucay).
import ManageReservationsPage from './ManageReservationsPage.jsx';
import { paths } from '../../../lib/paths.js';

export default [
  {
    path: paths.admin.reservations,
    element: <ManageReservationsPage />,
    access: 'admin',
    layout: 'app',
    title: 'Manage reservations',
    nav: { label: 'Reservations', icon: 'calendar', group: 'Administration', order: 50 },
  },
];
