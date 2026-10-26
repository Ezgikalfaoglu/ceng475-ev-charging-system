// Routes of station management. OWNER: Melike (dev/melike-sahin).
import ManageStationsPage from './ManageStationsPage.jsx';
import { paths } from '../../../lib/paths.js';

export default [
  {
    path: paths.admin.stations,
    element: <ManageStationsPage />,
    access: 'admin',
    layout: 'app',
    title: 'Manage stations',
    nav: { label: 'Stations', icon: 'pin', group: 'Administration', order: 20 },
  },
];
