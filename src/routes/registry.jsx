// CENTRAL ROUTE REGISTRY. OWNER: PM.
//
// Every feature folder has its own routes.jsx that exports an array of route definitions.
// This file only collects them, so a developer who adds or changes a page edits THEIR routes.jsx
// and never this file. That is what keeps pull requests free of merge conflicts.
//
// Route definition:
//   {
//     path:    '/app/stations',          use helpers from src/lib/paths.js
//     element: <StationDirectoryPage />,
//     access:  'public' | 'guest' | 'user' | 'customer' | 'admin',
//                public   anyone
//                guest    only people who are signed out (login, register)
//                user     any signed-in user (customers and admins)
//                customer / admin   only that role (enforced here AND on the server)
//     layout:  'public' | 'auth' | 'app',
//     title:   'Stations'                browser tab title
//     nav:     { label, icon, group, order }   optional: shows a sidebar link
//   }
import pageRoutes from '../pages/routes.jsx';
import authRoutes from '../features/auth/routes.jsx';
import profileRoutes from '../features/profile/routes.jsx';
import notificationRoutes from '../features/notifications/routes.jsx';
import adminStationRoutes from '../features/admin/stations/routes.jsx';
import adminPricingRoutes from '../features/admin/pricing/routes.jsx';
import stationRoutes from '../features/stations/routes.jsx';
import availabilityRoutes from '../features/availability/routes.jsx';
import reservationRoutes from '../features/reservations/routes.jsx';
import chargingRoutes from '../features/charging/routes.jsx';
import dashboardRoutes from '../features/dashboard/routes.jsx';
import adminDashboardRoutes from '../features/admin/dashboard/routes.jsx';
import adminChargerRoutes from '../features/admin/chargers/routes.jsx';
import adminAnalyticsRoutes from '../features/admin/analytics/routes.jsx';
import adminReservationRoutes from '../features/admin/reservations/routes.jsx';

export const routes = [
  ...pageRoutes,
  ...authRoutes,
  ...dashboardRoutes,
  ...stationRoutes,
  ...availabilityRoutes,
  ...reservationRoutes,
  ...chargingRoutes,
  ...notificationRoutes,
  ...profileRoutes,
  ...adminDashboardRoutes,
  ...adminStationRoutes,
  ...adminChargerRoutes,
  ...adminPricingRoutes,
  ...adminReservationRoutes,
  ...adminAnalyticsRoutes,
];

/** Sidebar links for the signed-in user, sorted by group and order. */
export function navItemsFor(user) {
  if (!user) return [];
  const allowed = routes.filter((r) => r.nav && (r.access === 'user' || r.access === user.role));
  const groupRank = { Charging: 1, Administration: 1, Account: 9 };
  return allowed
    .map((r) => ({ to: r.nav.to ?? r.path, label: r.nav.label, icon: r.nav.icon, group: r.nav.group, order: r.nav.order ?? 50 }))
    .sort((a, b) => (groupRank[a.group] ?? 5) - (groupRank[b.group] ?? 5) || a.order - b.order);
}
