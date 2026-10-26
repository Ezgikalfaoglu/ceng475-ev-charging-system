# Developer guide: Türkan Eda Uluçay

> Charging simulation, dashboards, charger and reservation administration, usage statistics. Read this file top to bottom once, then use section 10 as your daily checklist. If anything here disagrees with `docs/API_CONTRACTS.md` or the code, ask the PM before you decide.

## 1. Developer

**Türkan Eda Uluçay**, full stack developer. Team: PM and QA Ezgi, Melike Şahin, Berfin Özçelik, Türkan Eda Uluçay.

You own **what happens after a reservation** (the simulated charging session and its notifications), the **customer and administrator dashboards**, and the **operations screens** an administrator needs: chargers, blocked time windows, all reservations and usage statistics. Everything about charging is a **simulation**: there is no car and no hardware, and the UI must say so.

## 2. Assigned branch

`dev/turkan-eda-ulucay` (already created from `main`). Only you push to it. All your work reaches `main` through pull requests.

## 3. Assigned features

Effort: **40 points** (about one point is one focused hour including tests; the three developers have the same total).

| ID | Feature | Points |
| --- | --- | --- |
| E1 | Simulated charging engine | 9 |
| E2 | Charging page | 5 |
| E3 | Automatic completion and notification | 3 |
| E4 | Customer dashboard | 3 |
| E5 | Manage chargers | 6 |
| E6 | Time slot blocks | 5 |
| E7 | Manage reservations (admin) | 4 |
| E8 | Usage statistics | 5 |

### E1 Simulated charging engine (9 points, assigned to Eda)

* **Frontend:** none (E2 uses it).
* **Backend:** `POST /api/sessions/:id/start`, `POST /api/sessions/:id/stop`, `GET /api/sessions/:id/progress` in `chargingSessions.js`; logic in `server/services/charging/simulate.js` (new, pure functions, unit tested) and `server/services/charging/sessions.js`. Start: only the owner, only status `scheduled`, only between the reservation start and end (409 otherwise), sets `started_at` (local ISO), `status = 'charging'` and snapshots the charger's `price_per_kwh`. Progress is **computed, never stored per tick**: `simMinutes = realSecondsSinceStart * config.simSpeed / 60`; power is `min(charger.powerKw, vehicle limit)` (use 0.9 efficiency), taper to 50 percent power above 80 percent battery; `energyKwh = integral of power over simMinutes / 60`, capped at `(targetSoc - startSoc)/100 * batteryKwh`; `progressPct` is energy divided by that cap; `cost = energyKwh * pricePerKwh` rounded to 2 decimals. Write the current numbers to `charging_sessions` whenever progress is requested (so a restart keeps them). Stop: ends early, stores the partial numbers, status `completed`.
* **Database operations:** `UPDATE charging_sessions SET status, started_at, ended_at, energy_kwh, cost, progress_pct, price_per_kwh, updated_at WHERE id = ?`, `SELECT` the session with its reservation, charger and user (query already in `server/queries/sessions.js`).
* **Tests:** `chargingSessions.test.js`: start only inside the window, progress grows with elapsed time and never exceeds 100 (set `SIM_SPEED` high or pass a clock into the service so the test does not wait), stop stores partial energy and cost, price snapshot, other user gets 403, the simulation is labelled `isSimulated: true`. Add `server/services/charging/simulate.test.js` for the pure maths.

### E2 Charging page (5 points, assigned to Eda)

* **Frontend:** `ChargingSessionPage.jsx`: **Start charging** and **Stop charging** buttons (with `ConfirmDialog` for stop); while status is `charging` poll `GET /sessions/:id/progress` every 2 seconds with `setInterval` in a `useEffect` and clean it up on unmount; feed `ChargingProgress`; show the estimated finish time; on completion show a summary card (energy, cost, duration) and a success `Toast`; keep the history table. The page picks the session from the URL (`/app/charging/:id`) or the active one. Always keep the "Simulation" label and note visible.
* **Backend:** see E1.
* **Database operations:** see E1.
* **Tests:** API tests in E1. Manual test M4 in `docs/TEST_PLAN.md`.

### E3 Automatic completion and notification (3 points, assigned to Eda)

* **Frontend:** Show the completion `Toast` and refresh the unread counter with `notifyNotificationsChanged()` from `src/hooks/useUnreadCount.js`.
* **Backend:** When progress reaches 100 percent (target reached) set status `completed`, `ended_at`, final energy and cost and create a `session_completed` notification **in the same `db.write`** (`createNotification(tx, ...)`, message like "Charging finished: 18.4 kWh, 6.43 EUR (simulation)"). Do it only once (check the status first). Also complete sessions whose reservation window ended while nobody polled: do this lazily when a session is read, and once at server start.
* **Database operations:** `UPDATE charging_sessions`, `UPDATE reservations SET status = 'completed'`, `INSERT INTO notifications`.
* **Tests:** `chargingSessions.test.js`: reaching the target completes the session, creates exactly one notification and marks the reservation completed.

### E4 Customer dashboard (3 points, assigned to Eda)

* **Frontend:** `CustomerDashboardPage.jsx`: add an "Active session" card with live progress (reuse `ChargingProgress` or a compact version) and a link to the charging page, a "Latest notifications" list (3 items from `GET /notifications`), quick actions, and a this-month summary (energy and spend from `GET /sessions`). Keep the existing stat cards.
* **Backend:** none (reads existing endpoints). Optional `GET /api/sessions/summary` if you prefer server side sums; ask the PM to add the contract first.
* **Database operations:** `SELECT` only.
* **Tests:** Covered by session API tests; manual check.

### E5 Manage chargers (6 points, assigned to Eda)

* **Frontend:** `ManageChargersPage.jsx`: enable Add, Edit and a status switch (operational, maintenance, offline) in a `Modal` form (station select, label, connector, power kW, price per kWh, status); Delete with `ConfirmDialog`; when the API answers `409 HAS_RESERVATIONS` explain and offer "Set offline instead". Filter by station.
* **Backend:** `POST /api/admin/chargers`, `PUT /api/admin/chargers/:id`, `DELETE /api/admin/chargers/:id` in `adminChargers.js`; SQL in `server/services/charging/chargers.js` (new). Validate station exists, label 1 to 10 chars and unique per station, connector in the allowed list, power 1 to 400, price 0 to 5. Delete only if the charger has no reservations at all.
* **Database operations:** `INSERT INTO chargers`, `UPDATE chargers ... WHERE id = ?`, `DELETE FROM chargers WHERE id = ?` after `SELECT COUNT(*) FROM reservations WHERE charger_id = ?`.
* **Tests:** `adminOps.test.js`: create with validation, status change shows in the availability grid as `unavailable`, delete with history gives 409.

### E6 Time slot blocks (5 points, assigned to Eda)

* **Frontend:** In `ManageChargersPage.jsx` (or a new `BlockTimeDialog.jsx` in the same folder): "Block time" opens a `Modal` with date, start, end and reason; list the charger's existing blocks with a remove button. When the API refuses because confirmed reservations are inside the window, show them in the dialog.
* **Backend:** `POST /api/admin/chargers/:id/blocks` and `DELETE /api/admin/chargers/blocks/:blockId` in `adminChargers.js` (list already works). Validate times, end after start, no overlap with confirmed reservations (409 with the list in `details`). Blocks never delete reservations.
* **Database operations:** `INSERT INTO availability_blocks`, `DELETE FROM availability_blocks WHERE id = ?`, `SELECT` conflicting reservations.
* **Tests:** `adminOps.test.js`: block creation, refusal when a reservation is inside, removal, and (with Berfin's branch) the slot shows as `blocked`.

### E7 Manage reservations (admin) (4 points, assigned to Eda)

* **Frontend:** `ManageReservationsPage.jsx`: enable the action column (Cancel for upcoming confirmed, Mark completed for finished) with `ConfirmDialog`; add date range filter and search by customer name (the `DataTable` search already exists).
* **Backend:** `PATCH /api/admin/reservations/:id/status` in `adminReservations.js`: allowed transitions `confirmed` to `cancelled` or `completed` only; notify the customer with `createNotification` (type `reservation_cancelled`); also cancel the session row.
* **Database operations:** `UPDATE reservations`, `UPDATE charging_sessions`, `INSERT INTO notifications`.
* **Tests:** `adminOps.test.js`: admin cancels and the customer is notified; customers get 403; invalid transitions 409.

### E8 Usage statistics (5 points, assigned to Eda)

* **Frontend:** `UsageStatisticsPage.jsx`: date range selector (from and to, default 30 days), table per station (reservations, energy, revenue, utilisation percent), "busiest hours" bar chart and revenue per day chart using `BarChart` (extend `BarChart` or add a new chart in `features/admin/analytics/` if you need lines), CSV export button built in the browser (vanilla JS `Blob`).
* **Backend:** `GET /api/admin/analytics/usage?from=&to=` in `analytics.js` (query helpers in `server/queries/analytics.js`): `perStation`, `perHour`, `perDay` as in `docs/API_CONTRACTS.md`. Utilisation = booked minutes divided by open minutes of all chargers in the range. Validate the dates (400) and limit the range to 366 days.
* **Database operations:** `SELECT ... GROUP BY` over reservations, sessions, chargers, stations.
* **Tests:** `adminOps.test.js`: totals equal the sums of the completed sessions, range filter, validation.

## 4. Files and folders you own

You may create, edit and delete files in these places. Adding **new** files inside them is fine and expected.

* `src/features/charging/ChargingSessionPage.jsx`
* `src/components/ChargingProgress.jsx`
* `src/features/dashboard/CustomerDashboardPage.jsx`
* `src/features/admin/dashboard/AdminDashboardPage.jsx`
* `src/features/admin/chargers/ManageChargersPage.jsx`
* `src/features/admin/reservations/ManageReservationsPage.jsx`
* `src/features/admin/analytics/UsageStatisticsPage.jsx`
* `src/components/BarChart.jsx`
* `server/routes/chargingSessions.js`
* `server/routes/adminChargers.js`
* `server/routes/adminReservations.js`
* `server/routes/analytics.js`
* `server/queries/sessions.js, server/queries/analytics.js`
* `server/services/charging/, server/services/analytics/`
* `server/tests/chargingSessions.test.js, adminOps.test.js`

`ownership.json` is the source of truth; `npm run check:ownership` enforces it.

## 5. What to implement in every file

| File | What to do |
| --- | --- |
| `src/features/charging/ChargingSessionPage.jsx` | Start, stop, live polling, summary (E2, E3) |
| `src/components/ChargingProgress.jsx` | Only small changes if needed; keep the props and the Simulation label |
| `src/features/dashboard/CustomerDashboardPage.jsx` | Active session, notifications, month summary (E4) |
| `src/features/admin/dashboard/AdminDashboardPage.jsx` | Charging-now list, chargers needing attention, refresh (uses E1 and E5 data) |
| `src/features/admin/chargers/ManageChargersPage.jsx` | Charger CRUD and block dialog (E5, E6); split forms into new files in the same folder |
| `src/features/admin/reservations/ManageReservationsPage.jsx` | Admin actions and filters (E7) |
| `src/features/admin/analytics/UsageStatisticsPage.jsx` | Reports, charts, CSV (E8) |
| `src/components/BarChart.jsx` | Extend carefully; keep `data`, `height`, `ariaLabel`, `formatValue`, `tickEvery` |
| `server/routes/chargingSessions.js` | Start, stop, progress (E1, E3) |
| `server/routes/adminChargers.js` | Charger CRUD and blocks (E5, E6) |
| `server/routes/adminReservations.js` | Status change (E7) |
| `server/routes/analytics.js` | `/usage` (E8) |
| `server/queries/sessions.js, server/queries/analytics.js` | SQL for the above |
| `server/services/charging/, server/services/analytics/` | New: `simulate.js`, `sessions.js`, `chargers.js`, `usage.js` and their unit tests |
| `server/tests/chargingSessions.test.js, adminOps.test.js` | Turn `test.todo` into real tests |
| `docs/developers/EDA.md` | This guide (the PM copies it from `DEVELOPER_README.md`) |

## 6. React components you build or change

| Component | Props | State |
| --- | --- | --- |
| `ChargingSessionPage` | none | `session`, `progress`, `busy`, interval id in a `useRef` |
| `ChargingProgress` (shared, yours) | `status`, `progressPct`, `energyKwh`, `cost`, `durationMinutes`, `estimatedCompletion`, `powerKw`, `stationName`, `chargerLabel` | none |
| `SessionSummary` (new, in `features/charging/`) | `session` | none |
| `CustomerDashboardPage` | none | results of three `useAsync` calls |
| `ManageChargersPage` | none | `editing`, `toDelete`, `blockFor`, `stationFilter` |
| `ChargerForm` (new, in `features/admin/chargers/`) | `initial`, `stations`, `onSubmit`, `onCancel`, `serverErrors` | `values`, `errors`, `saving` |
| `BlockTimeDialog` (new) | `charger`, `open`, `onClose`, `onChanged` | `values`, `errors`, `blocks` |
| `ManageReservationsPage` | none | `status`, `range`, `target` |
| `UsageStatisticsPage` | none | `range`, `report` |
| `StatCard`, `BarChart`, `DataTable` (shared) | documented in each file header | n/a |
| Shared, from the PM (use, do not edit) | `Input`, `Select`, `Button`, `Modal`, `ConfirmDialog`, `Toast`, `Badge`, `EmptyState`, `ErrorState`, `LoadingState`, `PageHeader` | n/a |

## 7. Props and state rules

* Every component is a function component in its own file. Put a short header comment on top (purpose, props, example), like the shared components do.
* Props flow **down**, events flow **up** (`onSubmit`, `onChange`, `onCancel`). Do not mutate props.
* Page components own the **state** (form values, loading flags, open dialogs). Keep state as low as possible and derive everything else from it (for example the filtered list from the full list and the filter).
* Server data comes from `useAsync(() => api.get(...), [deps])`; after a write call `reload()` instead of patching local copies.
* Shared data only through Context (`useAuth()`); do not add new contexts without asking the PM.
* Form values are controlled inputs: `value` and `onChange` from state, errors in a separate `errors` object keyed by field name.
* Never use `dangerouslySetInnerHTML`. Never read or write `localStorage` yourself (the API layer manages the token).
* Navigate with `paths` helpers from `src/lib/paths.js` and `<Link>`/`useNavigate`, not hard coded strings.

### Patterns to copy (all already used on `main`)

**API route** (see `server/routes/stations.js`): `router.get('/', (req, res) => { res.json({...}) })`. Use `req.db`, `req.user` (set by `requireAuth`). Throw `badRequest`, `forbidden`, `notFound`, `conflict` from `server/lib/errors.js`; never write error JSON by hand. Collect field problems in an `errors` object and call `assertValid(errors)`.

**Write to the database** (always inside `db.write`, it makes the change atomic and saves the file):

```js
const created = await req.db.write((tx) => {
  const { lastInsertRowid } = tx.run('INSERT INTO stations (name, address, city) VALUES (?, ?, ?)', [name, address, city]);
  createNotification(tx, { userId, type: 'system', title: '...', message: '...' }); // optional, same transaction
  return lastInsertRowid;
});
```

**Page** (see `src/features/stations/StationDirectoryPage.jsx`): `const { data, error, loading, reload } = useAsync(() => api.get('/stations'), [])`, then render `LoadingState`, `ErrorState`, `EmptyState` or the data. Write calls: `await api.post('/reservations', body)` inside try/catch, `toast.success(...)` or show `err.details` next to the fields (`err` is an `ApiError` with `status`, `code`, `message`, `details`).

**Tests** (see `server/tests/stations.test.js`): `let t; before(async () => { t = await startTestServer(); }); after(() => t.close());`, then `const token = await t.loginCustomer();` and `const { status, body } = await t.request('GET', '/api/reservations', { token });`. POST bodies go in `{ token, body: {...} }`. `t.db` reads and writes the test database directly, `t.restart()` simulates a server restart. Each test file starts its own server with a temporary database, so tests never touch `data/voltflow.db`.

## 8. Required API endpoints

Exact request and response shapes are in `docs/API_CONTRACTS.md`. Until you implement them they answer `501 NOT_IMPLEMENTED`.

| Method | Path | Access | Feature |
| --- | --- | --- | --- |
| POST | `/api/sessions/:id/start` | customer | E1 |
| POST | `/api/sessions/:id/stop` | customer | E1 |
| GET | `/api/sessions/:id/progress` | user (owner) | E1, E2, E3 |
| POST | `/api/admin/chargers` | admin | E5 |
| PUT | `/api/admin/chargers/:id` | admin | E5 |
| DELETE | `/api/admin/chargers/:id` | admin | E5 |
| POST | `/api/admin/chargers/:id/blocks` | admin | E6 |
| DELETE | `/api/admin/chargers/blocks/:blockId` | admin | E6 |
| PATCH | `/api/admin/reservations/:id/status` | admin | E7 |
| GET | `/api/admin/analytics/usage?from&to` | admin | E8 |

## 9. Database CRUD operations

Schema: `docs/DATABASE.md`. You do **not** change the schema; ask the PM.

| Table | Create | Update | Delete | Read |
| --- | --- | --- | --- | --- |
| charging_sessions | created by Berfin's reservation | E1, E3 | no | exists |
| chargers | E5 | E5 | E5 (guarded) | exists |
| availability_blocks | E6 | no | E6 | exists |
| reservations | no (Berfin) | E7 and E3 (status) | no | exists |
| notifications | E3, E7 (via `createNotification`) | no | no | dashboard (E4) |

All writes go through `db.write((tx) => ...)`, all values through `?` parameters.

## 10. Step by step development checklist

1. [ ] Run the app as customer and admin; open Charging, Dashboard, and every admin page; read the `StarterNotice` boxes.
2. [ ] Read `docs/API_CONTRACTS.md` (sessions, admin chargers, reservations, analytics), `docs/DATABASE.md` and `server/queries/sessions.js`. Read `config.simSpeed` in `server/config.js`.
3. [ ] **E1:** write `simulate.js` as pure functions first with unit tests (energy, taper, cap, cost). Then the three endpoints with tests. Commit after each.
4. [ ] **E3:** completion and notification in the same transaction; test exactly once.
5. [ ] **E2:** the page with polling; verify the interval is cleared (open the Network tab, leave the page, requests must stop).
6. [ ] **E5 and E6:** charger CRUD, then blocks; test with `t.db` inserts.
7. [ ] **E7:** admin status change and notification.
8. [ ] **E8:** report queries, then the page and the CSV export.
9. [ ] **E4:** dashboard additions last, because they reuse everything above.
10. [ ] Turn every remaining `test.todo` of your files into a real test.
11. [ ] Delete the `StarterNotice` of each finished page; `npm test`, `npm run build`, `npm run check:ownership`.
12. [ ] Open the pull request(s) (see section 15), including a screen recording of a session finishing.

## 11. Acceptance criteria

* **E1 Simulated charging engine:** Progress, energy and cost move plausibly and monotonically, the numbers survive a server restart, and every response carries `isSimulated: true`.
* **E2 Charging page:** A customer can start, watch and stop a session; leaving and returning to the page shows the correct state; no timers keep running after leaving the page.
* **E3 Automatic completion and notification:** Exactly one completion notification per session, also after a restart.
* **E4 Customer dashboard:** The dashboard numbers equal the sums of the user's completed sessions and update after finishing a session.
* **E5 Manage chargers:** An admin can add a charger and customers can see and (after Berfin) book it; a charger with history cannot be deleted.
* **E6 Time slot blocks:** A blocked window is visible to customers as unavailable and cannot be reserved.
* **E7 Manage reservations (admin):** The customer sees the cancellation in notifications and the slot becomes free.
* **E8 Usage statistics:** The numbers on the screen match what you get from a manual SQL check on the same database.

## 12. Testing

```bash
npm test                                   # everything (about 10 seconds)
node --test server/tests/<file>.test.js    # one file while you work
npm run build                              # catches broken imports
npm run check:ownership                    # catches edits to other people's files
```

* A line `test.todo('...')` is a test you still have to write. Replace it with `test('...', async () => { ... })` using the same sentence as the title.
* Write the test first when you can: it fails (red), you implement, it passes (green).
* Test the **unhappy paths** as much as the happy one: invalid input, wrong role, someone else's data, missing record.
* Manual tests in Chrome **and** Microsoft Edge: `docs/TEST_PLAN.md` blocks M1 to M7 (the ones that touch your features). Open DevTools, Console tab: no red errors.
* Before every pull request run one fresh `npm run db:reset` and walk through your screens once.

## 13. How to run the project

Requirements: Node.js 22 LTS (see `docs/SETUP_MACOS.md` or `docs/SETUP_WINDOWS.md`).

```bash
git clone <repository-url> ceng475-ev-charging-system   # first time only
cd ceng475-ev-charging-system
git switch dev/turkan-eda-ulucay
npm ci
npm run dev        # API http://localhost:3001, web app http://localhost:5173
```

Sign in with the demo accounts from the README (customer `ayse@voltflow.demo` / `Customer123!`, admin `admin@voltflow.demo` / `Admin123!`). If the demo data looks old or you changed the schema after a pull, stop the server and run `npm run db:reset`. Windows PowerShell: the same commands, see `docs/SETUP_WINDOWS.md` if `npm` is blocked.

Tip: `SIM_SPEED=600 npm run dev` (PowerShell: `$env:SIM_SPEED = 600; npm run dev`) makes a simulated session finish in about a minute while testing. The default is 60 simulated seconds per real second.

## 14. How to commit and push

Work only on `dev/turkan-eda-ulucay`. Never commit to `main`, never force-push.

```bash
git switch dev/turkan-eda-ulucay
git fetch origin
git merge origin/main          # do this every day; there should be no conflicts
# ... work ...
npm test
npm run check:ownership
git add <files you changed>    # not "git add ." blindly: look at "git status" first
git commit -m "Reservations: reject overlapping slots with 409"
git push -u origin dev/turkan-eda-ulucay    # first push; later just "git push"
```

Commit message: one short line in the imperative, starting with the feature name. Commit small and often (one rule or one screen per commit). Do not commit `data/*.db`, `node_modules/`, `dist/` or `.env` files (they are git-ignored; if `git status` shows them, stop and ask the PM).

## 15. How to open a pull request

1. Make sure `main` is merged into your branch, then run `npm test`, `npm run build`, `npm run check:ownership`: all must pass.
2. Remove this personal guide from the final pull request so the three guides cannot collide: `git rm DEVELOPER_README.md`, commit. (Your guide stays in `docs/developers/` on `main`.)
3. `git push`, then on GitHub choose **Compare and pull request**, base `main`, compare `dev/turkan-eda-ulucay`.
4. Fill in the template: what you built (feature rows), how you tested, screenshots, which `test.todo` became real tests, which `StarterNotice` you removed.
5. Ask the PM (Ezgi) to review. Answer comments with new commits on the same branch. The PM merges.
6. After the merge: `git fetch origin && git merge origin/main`.

You can open several smaller pull requests (one per feature row) instead of one big one. That is encouraged. Only the last one needs step 2.

## 16. Files you must not edit

`npm run check:ownership` fails if your branch changes any of these:

* **Other developers' feature folders and routes** (see `ownership.json`).
* **PM owned shared files:** `package.json`, `package-lock.json`, `vite.config.js`, `index.html`, `.github/*`, `ownership.json`, `scripts/*`, `shared/*`, `server/index.js`, `server/app.js`, `server/config.js`, `server/db/*` (schema, seed, init, database layer), `server/lib/*`, `server/routes/index.js`, `src/App.jsx`, `src/main.jsx`, `src/routes/*`, `src/layouts/*`, `src/context/*`, `src/hooks/*`, `src/lib/*`, `src/styles/*`, `src/pages/*`, and every shared component that is not listed in your section.
* **Root documents and `docs/*`** except your own guide. API changes go through the PM (`docs/API_CONTRACTS.md`).

You own `ChargingProgress.jsx` and `BarChart.jsx` (shared components): keep their props backward compatible. `src/components/ReservationCard.jsx` belongs to Berfin: you may use it on the dashboard but not edit it.

**Need a change in a PM file?** (new dependency, new column, new shared component, new route path, a new `paths` helper.) Message the PM with the exact change and why. The PM commits it to `main` in a small commit; you then `git merge origin/main`. Do not work around it by copying the file.

## 17. Dependencies on other developers

* **You depend on Berfin** only for creating *new* reservations with a session row. The seed data already contains sessions (past and one running), so you can build everything now. After her merge, test the whole chain: reserve, start, finish.
* **Berfin depends on you** for the `blocked` slot state (your `availability_blocks` rows) and for the `scheduled` to `cancelled` session transition she performs on cancel.
* **Melike's price edits** are what your session snapshots at start. Her notification centre shows the notifications you create.
* **Everyone** reads your statistics; keep the contract in `docs/API_CONTRACTS.md` stable and ask the PM before changing field names.

## 18. Definition of Done

A feature row is done when **all** of this is true:

* It works in Chrome and Edge with no console errors and no broken buttons.
* The server validates every input (type, length, range) and checks authentication and ownership/role; errors use the standard format from `docs/API_CONTRACTS.md`; SQL uses `?` parameters only.
* The screen has loading, empty, error and success states; destructive actions use `ConfirmDialog`; results are shown with `Toast`; form errors appear next to the field.
* It is keyboard usable: labels on inputs, visible focus, buttons are real `<button>`s.
* The matching `test.todo` lines are real, passing tests, and every rule you added has a test.
* The `StarterNotice` for that feature is deleted, disabled buttons are enabled, and no stale `TODO` comment is left.
* `npm test`, `npm run build` and `npm run check:ownership` pass.
* Every simulation screen and response is labelled as a simulation; no text promises real hardware, real payment, e-mail or push messages.
* You can explain every line you submit. The professor grades understanding, and plagiarism is penalised.
