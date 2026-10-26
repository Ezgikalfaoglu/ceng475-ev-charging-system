// Every URL of the app in one place. OWNER: PM.
// Use these helpers in <Link to=...> and navigate(...) instead of typing path strings, so a route
// can be renamed in one file. Customer pages live under /app, administrator pages under /admin.
export const paths = {
  home: '/',
  login: '/login',
  register: '/register',
  unauthorized: '/unauthorized',

  // Customer
  dashboard: '/app/dashboard',
  stations: '/app/stations',
  station: (id) => `/app/stations/${id}`,
  availability: (stationId) => (stationId ? `/app/availability?station=${stationId}` : '/app/availability'),
  newReservation: (query = '') => `/app/reservations/new${query}`,
  reservations: '/app/reservations',
  charging: '/app/charging',
  chargingSession: (id) => `/app/charging/${id}`,
  notifications: '/app/notifications',
  profile: '/app/profile',

  // Administrator
  admin: {
    dashboard: '/admin/dashboard',
    stations: '/admin/stations',
    chargers: '/admin/chargers',
    pricing: '/admin/pricing',
    reservations: '/admin/reservations',
    statistics: '/admin/statistics',
  },
};

/** Where a user lands after signing in. */
export const homePathFor = (user) => (user?.role === 'admin' ? paths.admin.dashboard : paths.dashboard);
