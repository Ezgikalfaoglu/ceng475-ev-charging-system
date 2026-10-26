// Routes of charger and time slot management. OWNER: Eda (dev/turkan-eda-ulucay).
import ManageChargersPage from './ManageChargersPage.jsx';
import { paths } from '../../../lib/paths.js';

export default [
  {
    path: paths.admin.chargers,
    element: <ManageChargersPage />,
    access: 'admin',
    layout: 'app',
    title: 'Chargers and time slots',
    nav: { label: 'Chargers and slots', icon: 'plug', group: 'Administration', order: 30 },
  },
];
