// Routes of the administrator dashboard. OWNER: Eda (dev/turkan-eda-ulucay).
import AdminDashboardPage from './AdminDashboardPage.jsx';
import { paths } from '../../../lib/paths.js';

export default [
  {
    path: paths.admin.dashboard,
    element: <AdminDashboardPage />,
    access: 'admin',
    layout: 'app',
    title: 'Admin dashboard',
    nav: { label: 'Dashboard', icon: 'home', group: 'Administration', order: 10 },
  },
];
