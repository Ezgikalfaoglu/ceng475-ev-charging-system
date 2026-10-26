# Database

SQLite (sql.js). Schema: `server/db/schema.sql`. Seed: `server/db/seed.js`. Change the schema only through a PM reviewed pull request, bump `SCHEMA_VERSION` in `server/db/init.js`, update this file, then run `npm run db:reset`.

```
users 1---* reservations *---1 chargers *---1 stations
users 1---* notifications          reservations 1---0..1 charging_sessions
chargers 1---* availability_blocks
```

| Table | Purpose | Key columns and rules |
| --- | --- | --- |
| `users` | Accounts | `email` unique (case insensitive), `password_hash` (bcrypt), `role` in `customer`/`admin`, vehicle fields, `battery_kwh` > 0 |
| `stations` | Charging locations | `name` unique, coordinates range checked, `opening_time`/`closing_time` `HH:mm`, `status` `active`/`inactive`, comma separated `amenities` |
| `chargers` | Points at a station | unique (`station_id`, `label`), `connector_type` in CCS2/CHAdeMO/Type2, `power_kw` > 0, `status` operational/maintenance/offline, `price_per_kwh` >= 0 |
| `reservations` | Booked slots | `end_time > start_time` (CHECK), status confirmed/cancelled/completed, index on (`charger_id`, `start_time`, `end_time`) for the overlap query |
| `charging_sessions` | One simulated session per reservation | `reservation_id` unique, `progress_pct` 0..100, `price_per_kwh` snapshot, `is_simulated` always 1 |
| `notifications` | In-app messages | type is one of six values, `is_read`, optional `reservation_id` |
| `availability_blocks` | Admin blocked windows (maintenance) | `end_time > start_time`, cascade with charger |

## Referential integrity

* Deleting a station deletes its chargers (CASCADE) but is **blocked** while reservations exist, because `reservations.charger_id` is `ON DELETE RESTRICT`. The admin UI must explain this instead of failing silently (Melike).
* Deleting a user deletes their reservations, sessions and notifications.
* Notification `reservation_id` becomes NULL if the reservation disappears.

## Overlap rule

Two reservations `A` and `B` on the same charger overlap when `A.start < B.end AND B.start < A.end` and both are `confirmed`. Touching ends (A ends 10:00, B starts 10:00) do **not** overlap. `shared/time.js` exports `overlaps()` with the same definition; it is unit tested.

## Seed data

8 active stations (Ankara, Istanbul, Izmir), 24 chargers, 5 users (1 admin, 4 customers), about 165 reservations (mostly completed history over the past weeks, 7 upcoming, 2 cancelled), charging sessions for the completed reservations plus one running (simulated) session, a few notifications and one blocked maintenance window. Dates are relative to the moment the database is created, so run `npm run db:reset` before a demo if the file is old.
