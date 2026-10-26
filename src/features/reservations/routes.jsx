// Routes of the reservation feature. OWNER: Berfin (dev/berfin-ozcelik).
import CreateReservationPage from './CreateReservationPage.jsx';
import MyReservationsPage from './MyReservationsPage.jsx';
import { paths } from '../../lib/paths.js';

export default [
  {
    path: '/app/reservations/new',
    element: <CreateReservationPage />,
    access: 'customer',
    layout: 'app',
    title: 'New reservation',
    nav: { label: 'New reservation', icon: 'plus', group: 'Charging', order: 35 },
  },
  {
    path: paths.reservations,
    element: <MyReservationsPage />,
    access: 'customer',
    layout: 'app',
    title: 'My reservations',
    nav: { label: 'My reservations', icon: 'list', group: 'Charging', order: 40 },
  },
];
