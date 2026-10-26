// Constants shared by the React app and the Express server.
// OWNER: PM. Changes need a PM-reviewed pull request (see docs/PROJECT_MANAGEMENT.md).

export const ROLES = Object.freeze({ CUSTOMER: 'customer', ADMIN: 'admin' });

export const CONNECTOR_TYPES = ['CCS2', 'CHAdeMO', 'Type2'];
export const CHARGER_STATUSES = ['operational', 'maintenance', 'offline'];
export const STATION_STATUSES = ['active', 'inactive'];
export const RESERVATION_STATUSES = ['confirmed', 'cancelled', 'completed'];
export const SESSION_STATUSES = ['scheduled', 'charging', 'completed', 'cancelled'];
export const NOTIFICATION_TYPES = [
  'reservation_confirmed',
  'reservation_cancelled',
  'reservation_reminder',
  'session_completed',
  'slot_available',
  'system',
];

// Business rules
export const SLOT_MINUTES = 30; // length of one bookable slot
export const MIN_RESERVATION_MINUTES = 30;
export const MAX_RESERVATION_MINUTES = 240;
export const PASSWORD_MIN_LENGTH = 8;
export const CURRENCY = 'EUR';
