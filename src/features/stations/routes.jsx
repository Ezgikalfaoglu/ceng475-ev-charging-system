// Routes of the station directory feature. OWNER: Berfin (dev/berfin-ozcelik).
import StationDirectoryPage from './StationDirectoryPage.jsx';
import StationDetailsPage from './StationDetailsPage.jsx';
import { paths } from '../../lib/paths.js';

export default [
  {
    path: paths.stations,
    element: <StationDirectoryPage />,
    access: 'customer',
    layout: 'app',
    title: 'Find a station',
    nav: { label: 'Find stations', icon: 'pin', group: 'Charging', order: 20 },
  },
  { path: '/app/stations/:id', element: <StationDetailsPage />, access: 'customer', layout: 'app', title: 'Station details' },
];
