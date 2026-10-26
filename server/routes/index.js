// Central API route registry. OWNER: PM.
//
// Each feature owner edits only their own route file. Authentication and role checks are applied
// HERE, once, so a route file can never forget them:
//   * public            -> no middleware
//   * requireAuth       -> any signed-in user
//   * admin (+ role)    -> signed in AND role === 'admin' (enforced on the server)
// Adding a new endpoint to an existing file never requires touching this file.
import { requireAuth, requireRole } from '../lib/auth.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import notificationsRouter from './notifications.js';
import adminStationsRouter from './adminStations.js';
import pricingRouter from './pricing.js';
import stationsRouter from './stations.js';
import availabilityRouter from './availability.js';
import reservationsRouter from './reservations.js';
import chargingSessionsRouter from './chargingSessions.js';
import adminChargersRouter from './adminChargers.js';
import analyticsRouter from './analytics.js';
import adminReservationsRouter from './adminReservations.js';

const admin = [requireAuth, requireRole('admin')];

export function registerRoutes(app) {
  // Public
  app.use('/api/auth', authRouter); // login/register are public; /me checks auth itself
  app.use('/api/stations', stationsRouter); // station directory is readable without an account

  // Signed-in users (customers and admins)
  app.use('/api/users', requireAuth, usersRouter);
  app.use('/api/notifications', requireAuth, notificationsRouter);
  app.use('/api/availability', requireAuth, availabilityRouter);
  app.use('/api/reservations', requireAuth, reservationsRouter);
  app.use('/api/sessions', requireAuth, chargingSessionsRouter);

  // Administrators only
  app.use('/api/admin/stations', ...admin, adminStationsRouter);
  app.use('/api/admin/pricing', ...admin, pricingRouter);
  app.use('/api/admin/chargers', ...admin, adminChargersRouter);
  app.use('/api/admin/reservations', ...admin, adminReservationsRouter);
  app.use('/api/admin/analytics', ...admin, analyticsRouter);
}
