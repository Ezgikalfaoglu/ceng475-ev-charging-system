// Routes of the charging session feature. OWNER: Eda (dev/turkan-eda-ulucay).
import ChargingSessionPage from './ChargingSessionPage.jsx';
import { paths } from '../../lib/paths.js';

export default [
  {
    path: paths.charging,
    element: <ChargingSessionPage />,
    access: 'customer',
    layout: 'app',
    title: 'Charging',
    nav: { label: 'Charging', icon: 'bolt', group: 'Charging', order: 50 },
  },
  { path: '/app/charging/:id', element: <ChargingSessionPage />, access: 'customer', layout: 'app', title: 'Charging session' },
];
