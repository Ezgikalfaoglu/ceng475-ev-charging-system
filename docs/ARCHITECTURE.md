# Architecture

## Overview

```
Browser (React SPA)  --HTTP/JSON-->  Express API  --SQL-->  sql.js (in memory)  --atomic write-->  data/voltflow.db
```

In development Vite serves the SPA on port 5173 and proxies `/api` to Express on 3001. In production (`npm run build && npm start`) Express serves the built SPA from `dist/` and the API from the same port, so there is no CORS to configure.

## Front end

* **Routing.** Each feature owns a `routes.jsx` that exports an array of route objects (`path`, `element`, `access`, `layout`, `title`, optional `nav`). `src/routes/registry.jsx` imports them all, so a developer never edits a shared router file and merges stay conflict free. `RouteShell` enforces `access`: `guest` (login/register only), `user`, `customer`, `admin`. The sidebar is generated from the same registry.
* **State.** `AuthContext` (user, token, login, logout), `ToastProvider` (messages). Server data is loaded with the small `useAsync` hook. Props flow down; there is no global store.
* **API access.** All requests go through `src/lib/api.js`: adds the bearer token, parses the standard error format into `ApiError`, and on `401` fires `voltflow:unauthorized` so `AuthContext` signs the user out.
* **Design system.** `src/styles/tokens.css` holds colours (navy and teal), spacing, type and radii as CSS variables. Components use tokens only, never raw colours.
* **Accessibility.** Labelled inputs, visible focus, `aria-live` for toasts and status text, focus-trapped `Modal` with Escape to close, keyboard operable slot grid.

## Back end

* `server/app.js` builds the Express app (`createApp`), used by `index.js` and by the tests (which start it on a random port with a temporary database).
* `server/routes/index.js` is the single place that mounts routers and applies `requireAuth` and `requireRole('admin')`. A new admin route cannot forget the role check because it is applied to the whole prefix.
* SQL lives in `server/queries/`; all values are passed as parameters (`?`). String concatenation of user input into SQL is not allowed.
* Errors use one JSON shape (see [API_CONTRACTS.md](API_CONTRACTS.md)). Handlers `throw` an `ApiError` and the error middleware formats it.

## Database layer

`sql.js` runs SQLite in memory. `server/db/database.js` makes it safe to persist:

1. **Serialised writes.** `db.write(fn)` queues transactions; two requests can never interleave inside a transaction. This is also what makes "no overlapping reservations" reliable: the overlap check and the insert happen inside one `db.write`.
2. **Atomic save.** After a committed write the database is exported to `voltflow.db.tmp` and renamed over `voltflow.db`. A crash leaves either the old or the new file, never half a file.
3. **Lock file.** `voltflow.db.lock` holds the PID of the running server. A second server on the same file refuses to start, so two processes cannot overwrite each other.
4. Foreign keys are switched on again after every `export()` (sql.js resets the pragma).
5. `SCHEMA_VERSION` in `server/db/init.js` detects an outdated file and tells you to run `npm run db:reset`.

## Time model

Reservation times are **station-local naive strings** `YYYY-MM-DDTHH:mm` (see `shared/time.js`), compared as text. Audit timestamps (`created_at`) are UTC with a trailing `Z`. Assumption: server and browser run in the same time zone (true for the demo on one laptop). A real multi-time-zone product would store UTC plus the station's zone; that is out of scope.

## Business rules and where they live

| Rule | Place |
| --- | --- |
| Reservation must start in the future, 30 to 240 minutes, on a 30 minute grid | `server/routes/reservations.js` (Berfin) |
| No overlapping confirmed reservations on one charger | same file, inside `db.write` |
| On conflict return at least 3 alternative slots (`409 SLOT_UNAVAILABLE`) | `server/routes/availability.js` `/suggestions` (Berfin) |
| Blocked windows and closed hours cannot be reserved | `availability_blocks` and station hours (Berfin, Eda) |
| Charging is simulated: progress derives from elapsed time times `SIM_SPEED` | `server/services/charging/` (Eda) |
| Notifications are database rows, created inside the same transaction as the event | `server/lib/notifications.js` |
| Only an admin may call `/api/admin/*`; a customer may only read own reservations and sessions | `routes/index.js`, route handlers |

## Security summary

Passwords hashed with bcrypt (cost 10), never returned by the API. Login gives the same message for unknown e-mail and wrong password. JWT signed with a random secret generated at first start, expires after 8 hours. Security headers on every response. Parameterised SQL. Server-side validation of every input (the browser checks are only for convenience). No secrets in git.
