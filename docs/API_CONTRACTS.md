# API contracts

Base URL: `/api`. JSON in, JSON out. Authenticated calls send `Authorization: Bearer <token>`.
Status column: **works** = implemented on `main`; **501** = answers `501 NOT_IMPLEMENTED`, the contract below is what the owner must implement. The contract is stable: the front end already calls these shapes, so do not rename fields without a PM approved change.

## Conventions

* Times: `YYYY-MM-DDTHH:mm` station-local (reservations, slots, sessions), or UTC ISO with `Z` (`createdAt`).
* Field names are camelCase in JSON, snake_case in SQL (`server/lib/rows.js` converts).
* IDs are integers. Money is a number in EUR with 2 decimals.

### Error format (all failures)

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Please fix the highlighted fields.", "details": { "email": "Enter a valid e-mail address." } } }
```

| HTTP | `code` | Meaning |
| --- | --- | --- |
| 400 | `VALIDATION_ERROR` | Invalid input; `details` maps field name to message |
| 401 | `UNAUTHENTICATED`, `TOKEN_INVALID`, `INVALID_CREDENTIALS` | Missing, expired or wrong token / credentials |
| 403 | `FORBIDDEN` | Signed in but not allowed (wrong role or someone else's data) |
| 404 | `NOT_FOUND` | Unknown id or route |
| 409 | `CONFLICT`, `SLOT_UNAVAILABLE`, `EMAIL_TAKEN`, `HAS_RESERVATIONS` | State conflict |
| 501 | `NOT_IMPLEMENTED` | Feature still on a developer branch |

Access: **Public** needs no token, **User** any signed-in account, **Customer**, **Admin** role specific. Admin routes are protected for the whole `/api/admin` prefix.

## Auth (owner Melike)

| Method and path | Access | Status | Request | Response |
| --- | --- | --- | --- | --- |
| `POST /auth/login` | Public | works | `{email, password}` | `200 {token, user}`; `401 INVALID_CREDENTIALS` |
| `GET /auth/me` | User | works | | `{user}` |
| `POST /auth/register` | Public | 501 | `{name, email, password, phone?, vehicleModel?, vehicleConnector?, batteryKwh?}` | `201 {token, user}`; `409 EMAIL_TAKEN`; `400` password < 8 chars, no letter or digit, invalid e-mail. Role is always `customer`; the client can never choose it. |

`user`: `{id, name, email, role, phone, vehicleModel, vehicleConnector, batteryKwh, createdAt}` (never the hash).

## Profile (Melike)

| Method and path | Access | Status | Notes |
| --- | --- | --- | --- |
| `GET /users/profile` | User | works | `{user}` |
| `PUT /users/profile` | User | 501 | Body: any of `name, phone, vehicleModel, vehicleConnector, batteryKwh`. E-mail and role cannot be changed here. Returns `{user}`. |
| `PUT /users/password` | User | 501 | `{currentPassword, newPassword}`; `400` when current is wrong |
| `DELETE /users/profile` | Customer | 501 | `{password}`; removes the account and its data. Admins cannot delete themselves. |

## Notifications (Melike)

| Method and path | Status | Notes |
| --- | --- | --- |
| `GET /notifications?unread=1` | works | `{notifications: [{id, type, title, message, isRead, reservationId, createdAt}]}` newest first |
| `GET /notifications/unread-count` | works | `{count}` |
| `PATCH /notifications/:id/read` | 501 | `{notification}`; only own notifications (`404` otherwise) |
| `PATCH /notifications/read-all` | 501 | `{updated: n}` |
| `DELETE /notifications/:id` | 501 | `204` |

After a change the page calls `notifyNotificationsChanged()` so the bell updates.

## Stations (public read, Berfin)

| Method and path | Status | Notes |
| --- | --- | --- |
| `GET /stations` | works (filters 501) | `{stations: [{id, name, address, city, latitude, longitude, description, amenities: [..], openingTime, closingTime, status, chargerCount, operationalCount, maxPowerKw, minPrice, connectorTypes: [..]}]}`. To add: `q`, `city`, `connector`, `minPower`, `available=1` query parameters. |
| `GET /stations/:id` | works | `{station: {..., chargers: [{id, label, connectorType, powerKw, status, pricePerKwh}]}}`; inactive stations are `404` |

## Availability (Berfin)

| Method and path | Status | Notes |
| --- | --- | --- |
| `GET /availability?stationId=1&date=2026-10-27` | works (booked only) | `{stationId, date, slotMinutes: 30, openingTime, closingTime, chargers: [{id, label, connectorType, powerKw, status, pricePerKwh, slots: [{start, end, state}]}]}`; `state` is `free`, `booked`, `blocked`, `past`, `unavailable`. Berfin adds `blocked` and `past`. |
| `GET /availability/suggestions?chargerId=&start=&end=` | 501 | `{suggestions: [{chargerId, chargerLabel, start, end}]}`, **at least 3** free windows of the same length, nearest to the requested time first, same station, may use other chargers with a compatible connector |

## Reservations (Berfin)

`reservation`: `{id, userId, userName, chargerId, chargerLabel, connectorType, powerKw, pricePerKwh, stationId, stationName, stationCity, startTime, endTime, status, createdAt, cancelledAt, sessionId, sessionStatus}`

| Method and path | Access | Status | Notes |
| --- | --- | --- | --- |
| `GET /reservations` | User | works | Own reservations; `?status=` filter to add |
| `GET /reservations/:id` | User | works | `403` for someone else's (admins may read any) |
| `POST /reservations` | Customer | 501 | `{chargerId, startTime, endTime}` returns `201 {reservation}` and creates a `reservation_confirmed` notification and a `scheduled` session. Rules, checked in this order: valid format `400`; start in the future `400`; length 30 to 240 minutes on the 30 minute grid `400`; station active, charger operational, inside opening hours `400`/`409`; no block `409`; no overlap with a confirmed reservation `409 SLOT_UNAVAILABLE` with `details.alternatives` (>= 3 items, same shape as suggestions). The overlap check and insert run inside one `db.write`. |
| `PATCH /reservations/:id/cancel` | Customer | 501 | Own, `confirmed` and not started only; returns `{reservation}` and a `reservation_cancelled` notification; `409` otherwise |

## Charging sessions (Eda)

`session`: `{id, reservationId, status, startSoc, targetSoc, startedAt, endedAt, energyKwh, pricePerKwh, cost, progressPct, isSimulated, chargerId, chargerLabel, connectorType, powerKw, stationId, stationName, batteryKwh, reservationStart, reservationEnd}`

| Method and path | Access | Status | Notes |
| --- | --- | --- | --- |
| `GET /sessions` | User | works | Own sessions, newest first |
| `GET /sessions/active` | User | works | `{session}` or `{session: null}` |
| `GET /sessions/:id` | User | works | Owner or admin |
| `POST /sessions/:id/start` | Customer | 501 | Only inside the reservation window, once; status becomes `charging`; snapshots the price |
| `POST /sessions/:id/stop` | Customer | 501 | Ends early, stores energy and cost, status `completed`, creates `session_completed` notification |
| `GET /sessions/:id/progress` | User | 501 | `{status, progressPct, energyKwh, cost, durationMinutes, estimatedCompletion}` computed from elapsed real time times `SIM_SPEED`, taper above 80 percent; completes the session when it reaches the target |

## Admin: stations and prices (Melike)

| Method and path | Status | Notes |
| --- | --- | --- |
| `GET /admin/stations` | works | all stations including inactive |
| `POST /admin/stations` | 501 | `{name, address, city, latitude?, longitude?, description?, amenities: [], openingTime, closingTime, status}` `201 {station}`; name unique `409` |
| `PUT /admin/stations/:id` | 501 | same body, `{station}` |
| `DELETE /admin/stations/:id` | 501 | `409 HAS_RESERVATIONS` while any reservation references its chargers |
| `GET /admin/pricing` | works | `{chargers: [{id, stationId, stationName, stationCity, label, connectorType, powerKw, status, pricePerKwh}]}` |
| `PUT /admin/pricing/:chargerId` | 501 | `{pricePerKwh}` number > 0 and <= 5, max 2 decimals; existing reservations keep the price they were shown (the session snapshots at start) |
| `PUT /admin/pricing/station/:stationId` | 501 | `{pricePerKwh}` applies to every charger of the station |

## Admin: chargers, reservations, statistics (Eda)

| Method and path | Status | Notes |
| --- | --- | --- |
| `GET /admin/chargers?stationId=` | works | `{chargers: [...]}` |
| `POST /admin/chargers` | 501 | `{stationId, label, connectorType, powerKw, pricePerKwh, status}` `201`; (`stationId`,`label`) unique `409` |
| `PUT /admin/chargers/:id` | 501 | same fields |
| `DELETE /admin/chargers/:id` | 501 | `409 HAS_RESERVATIONS` when history exists; suggest setting status `offline` instead |
| `GET /admin/chargers/:id/blocks` | works | `{blocks: [{id, chargerId, startTime, endTime, reason}]}` |
| `POST /admin/chargers/:id/blocks` | 501 | `{startTime, endTime, reason}`; `409` when confirmed reservations are inside (list them in `details`) |
| `DELETE /admin/chargers/blocks/:blockId` | 501 | `204` |
| `GET /admin/reservations?status=` | works | all reservations |
| `PATCH /admin/reservations/:id/status` | 501 | `{status: 'cancelled' \| 'completed'}`; notifies the customer |
| `GET /admin/analytics/summary` | works | `{summary: {customers, stations, chargers, operationalChargers, reservationsToday, upcomingReservations, activeSessions, energyKwh, revenue}, reservationsPerDay: [{day, count}]}` |
| `GET /admin/analytics/usage?from=&to=` | 501 | `{perStation: [{stationId, name, reservations, energyKwh, revenue, utilisationPct}], perHour: [{hour, count}], perDay: [{day, reservations, energyKwh, revenue}]}` |
