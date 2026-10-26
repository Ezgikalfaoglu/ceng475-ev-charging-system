# Developer guide: Berfin Özçelik

> Station discovery, slot availability and reservations. Read this file top to bottom once, then use section 10 as your daily checklist. If anything here disagrees with `docs/API_CONTRACTS.md` or the code, ask the PM before you decide.

## 1. Developer

**Berfin Özçelik**, full stack developer. Team: PM and QA Ezgi, Melike Şahin, Berfin Özçelik, Türkan Eda Uluçay.

You own the **customer booking journey**: find a station, see which slots are free, reserve one without double-booking, and manage your reservations. This is the heart of the project and of the grading ("correctly working"): the overlap rule, the future-only rule and the three alternative slots on conflict must be exact and tested.

## 2. Assigned branch

`dev/berfin-ozcelik` (already created from `main`). Only you push to it. All your work reaches `main` through pull requests.

## 3. Assigned features

Effort: **40 points** (about one point is one focused hour including tests; the three developers have the same total).

| ID | Feature | Points |
| --- | --- | --- |
| B1 | Station directory search and filters | 7 |
| B2 | Station details polish | 3 |
| B3 | Slot availability grid | 9 |
| B4 | Create reservation | 9 |
| B5 | Conflict warning and alternative slots | 7 |
| B6 | My reservations and cancellation | 5 |

### B1 Station directory search and filters (7 points, assigned to Berfin)

* **Frontend:** `StationDirectoryPage.jsx`: a filter bar with a search box (name or address), city select, connector select, minimum power select and an "available now" checkbox; sort (name, price, power); result count; a "No stations match" empty state with a **Reset filters** button. Keep the filter values in the URL (`useSearchParams`) so the page can be reloaded or shared. Debounce typing by about 300 ms.
* **Backend:** `GET /api/stations?q=&city=&connector=&minPower=&available=1` in `stations.js`; put the SQL in `server/queries/stations.js`. `q` matches name or address, case and accent insensitive (normalise in JavaScript, because SQLite `LIKE` does not fold `ı` and `İ`). Validate `minPower` is a number and `connector` is one of the three allowed values (else 400).
* **Database operations:** `SELECT` with parameters and `HAVING`/`EXISTS` on chargers; no writes.
* **Tests:** `stations.test.js`: text search, connector and minimum power, city, available only.

### B2 Station details polish (3 points, assigned to Berfin)

* **Frontend:** `StationDetailsPage.jsx`: a "Check availability" button per charger row that opens `paths.availability(station.id)` with that charger highlighted, opening hours shown as "Open 06:00 to 22:00", a "View on map" link built from latitude and longitude (`https://www.openstreetmap.org/?mlat=..&mlon=..`), clear message for an unknown or inactive station.
* **Backend:** none (the endpoint exists).
* **Database operations:** none.
* **Tests:** Covered by `stations.test.js` (details and 404).

### B3 Slot availability grid (9 points, assigned to Berfin)

* **Frontend:** `SlotAvailabilityPage.jsx` and `AvailabilityCalendar.jsx`: previous day, next day and "Today" buttons; range selection (click the start slot, click the end slot; highlight the range; show "10:00 to 11:30, 1 h 30 min, estimated price per kWh"); slots in the past or blocked are not clickable; arrow keys move between slots; legend already exists. Pass the chosen charger, start and end to `paths.newReservation(...)` (the create page already reads `station`, `charger`, `start`, `end`).
* **Backend:** `GET /api/availability` in `availability.js` and `buildDayGrid` in `server/queries/availability.js`: add state `past` for slots that start before now, `blocked` for slots inside an `availability_blocks` row, `unavailable` for slots outside opening hours or when the charger is not `operational`. The page must never offer a slot the server would refuse.
* **Database operations:** `SELECT` from `reservations` (status `confirmed`), `availability_blocks`, `chargers`, `stations`; no writes.
* **Tests:** `availability.test.js`: past slots, blocked slots (insert a block with `t.db`), unavailable chargers, closed hours.

### B4 Create reservation (9 points, assigned to Berfin)

* **Frontend:** `CreateReservationPage.jsx`: turn the read-only summary into a form (station, charger, date, start time, end time; prefilled from the URL). Checks on the client: required fields, start in the future, end after start, 30 to 240 minutes, on the 30 minute grid. Show the estimated duration and the price per kWh. Submit with `api.post("/reservations", ...)`, `Button loading`, success `Toast`, then go to `paths.reservations`. Remove `StarterNotice` and the `disabled`.
* **Backend:** `POST /api/reservations` in `reservations.js`; put the rules in `server/services/reservations/createReservation.js` (new). Order of checks: valid body (400) > times are valid local ISO strings > start is in the future (use `nowLocalIso()`) > duration and grid > charger exists, is `operational`, station is `active`, inside opening hours > not inside a block (409) > no overlap (409 `SLOT_UNAVAILABLE`). Role must be customer (admins get 403). **Do the overlap check and the INSERT inside the same `db.write` call**; that is what makes two simultaneous requests safe. Create the `scheduled` charging session row and a `reservation_confirmed` notification in the same transaction (`createNotification(tx, ...)`). The user id always comes from `req.user.id`.
* **Database operations:** `SELECT 1 FROM reservations WHERE charger_id = ? AND status = 'confirmed' AND start_time < ? AND end_time > ?` (new end, new start), `INSERT INTO reservations`, `INSERT INTO charging_sessions (reservation_id, ...)` with `status = 'scheduled'` and the battery state from the user, `INSERT INTO notifications`.
* **Tests:** `reservations.test.js`: success plus notification, past start, bad duration, overlap 409, back-to-back allowed, two simultaneous requests (`Promise.all`): exactly one succeeds, offline or blocked charger refused.

### B5 Conflict warning and alternative slots (7 points, assigned to Berfin)

* **Frontend:** In `CreateReservationPage.jsx` catch `ApiError` with `code === "SLOT_UNAVAILABLE"`: open a `Modal` titled "That time is taken" listing `err.details.alternatives` (at least three) as buttons; picking one fills the form (and keeps the dialog flow short). Also use the same data on the availability page ("Nearest free times" under the grid) if you have time.
* **Backend:** `GET /api/availability/suggestions?chargerId=&start=&end=` in `availability.js` and the same function inside `POST /reservations` for the 409. Algorithm: walk outward from the requested start in 30 minute steps (before and after) on the same charger, then on other operational chargers of the station with a compatible connector, collecting windows of the same length that are free, in the future, inside opening hours and not blocked; return the **nearest three or more** (default 5), sorted by distance from the requested start. Put it in `server/services/reservations/suggestAlternatives.js`.
* **Database operations:** `SELECT` only (same queries as B3 and B4).
* **Tests:** `availability.test.js` and `reservations.test.js`: at least 3 suggestions, none overlaps anything, other chargers used when the charger is busy all day, 409 body contains `details.alternatives`.

### B6 My reservations and cancellation (5 points, assigned to Berfin)

* **Frontend:** `MyReservationsPage.jsx`: pass `onCancel` to `ReservationCard` for upcoming confirmed reservations; open `ConfirmDialog` ("Cancel this reservation?"), call the API, `Toast`, reload. Add a status filter and a "Track charging" link when a session exists (the card supports `trackTo`).
* **Backend:** `PATCH /api/reservations/:id/cancel` in `reservations.js`: only the owner (403 otherwise; 404 for unknown), only status `confirmed` and start in the future (409 otherwise), set `status = 'cancelled'` and `cancelled_at`, set the session to `cancelled`, create a `reservation_cancelled` notification. Also add `?status=` filter to `GET /api/reservations`.
* **Database operations:** `UPDATE reservations SET status = 'cancelled', cancelled_at = ? WHERE id = ? AND user_id = ?`, `UPDATE charging_sessions SET status = 'cancelled' WHERE reservation_id = ?`, `INSERT INTO notifications`.
* **Tests:** `reservations.test.js`: cancel own, free slot afterwards, someone else 403, cancelling twice 409, past reservation 409.

## 4. Files and folders you own

You may create, edit and delete files in these places. Adding **new** files inside them is fine and expected.

* `src/features/stations/StationDirectoryPage.jsx`
* `src/features/stations/StationDetailsPage.jsx`
* `src/features/availability/SlotAvailabilityPage.jsx`
* `src/components/AvailabilityCalendar.jsx`
* `src/components/StationCard.jsx`
* `src/components/ReservationCard.jsx`
* `src/features/reservations/CreateReservationPage.jsx`
* `src/features/reservations/MyReservationsPage.jsx`
* `server/routes/stations.js`
* `server/routes/availability.js`
* `server/routes/reservations.js`
* `server/queries/stations.js`
* `server/queries/availability.js`
* `server/queries/reservations.js`
* `server/services/reservations/`
* `server/tests/stations.test.js, availability.test.js, reservations.test.js`

`ownership.json` is the source of truth; `npm run check:ownership` enforces it.

## 5. What to implement in every file

| File | What to do |
| --- | --- |
| `src/features/stations/StationDirectoryPage.jsx` | Filters, URL state, reset (B1) |
| `src/features/stations/StationDetailsPage.jsx` | Availability shortcut, hours, map link (B2) |
| `src/features/availability/SlotAvailabilityPage.jsx` | Day navigation, range selection, summary (B3, B5) |
| `src/components/AvailabilityCalendar.jsx` | Range selection, keyboard navigation, `past` and `blocked` look (B3). Keep the props backward compatible: `chargers`, `selected`, `onSelect` |
| `src/components/StationCard.jsx` | Show connector chips and "n of m ready" (B1) |
| `src/components/ReservationCard.jsx` | Only if needed for B6; keep existing props working |
| `src/features/reservations/CreateReservationPage.jsx` | Form, validation, submit, conflict dialog (B4, B5) |
| `src/features/reservations/MyReservationsPage.jsx` | Cancel, filter (B6) |
| `server/routes/stations.js` | Query parameters (B1) |
| `server/routes/availability.js` | Grid states, `/suggestions` (B3, B5) |
| `server/routes/reservations.js` | `POST`, `PATCH /:id/cancel`, status filter (B4, B6) |
| `server/queries/stations.js` | Filter SQL (B1) |
| `server/queries/availability.js` | Grid states (B3) |
| `server/queries/reservations.js` | Insert, cancel, overlap query (B4, B6) |
| `server/services/reservations/` | New: `createReservation.js`, `suggestAlternatives.js`, `rules.js` (validation helpers) |
| `server/tests/stations.test.js, availability.test.js, reservations.test.js` | Turn `test.todo` into real tests |
| `docs/developers/BERFIN.md` | This guide (the PM copies it from `DEVELOPER_README.md`) |

## 6. React components you build or change

| Component | Props | State |
| --- | --- | --- |
| `StationDirectoryPage` | none | `filters` (from the URL), `useAsync` result |
| `StationFilters` (new, in `features/stations/`) | `values`, `cities`, `onChange(values)`, `onReset` | local text input value (debounced) |
| `StationCard` (shared, yours) | `station` | none |
| `SlotAvailabilityPage` | none | `selected` ({chargerId, start, end}), URL params `station` and `date` |
| `AvailabilityCalendar` (shared, yours) | `chargers`, `selected`, `onSelect(slot, charger)`, `onRangeChange` (new, optional) | `anchorSlot` while choosing a range, focused slot |
| `DayNavigator` (new, in `features/availability/`) | `date`, `onChange(date)` | none |
| `CreateReservationPage` | none | `values`, `errors`, `submitting`, `conflict` (alternatives or null) |
| `AlternativesDialog` (new, in `features/reservations/`) | `open`, `alternatives`, `onPick(alternative)`, `onClose` | none |
| `MyReservationsPage` | none | `tab`, `toCancel`, `cancelling` |
| `ReservationCard` (shared) | `reservation`, `onCancel`, `showCustomer`, `trackTo` | none |
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
| GET | `/api/stations?q&city&connector&minPower&available` | public | B1 |
| GET | `/api/availability?stationId&date` | user | B3 |
| GET | `/api/availability/suggestions?chargerId&start&end` | user | B5 |
| POST | `/api/reservations` | customer | B4, B5 |
| GET | `/api/reservations?status=` | user | B6 |
| PATCH | `/api/reservations/:id/cancel` | customer | B6 |

## 9. Database CRUD operations

Schema: `docs/DATABASE.md`. You do **not** change the schema; ask the PM.

| Table | Create | Update | Delete | Read |
| --- | --- | --- | --- | --- |
| reservations | B4 | B6 (cancel) | no (history is kept) | B3, B4, B6 |
| charging_sessions | B4 (scheduled row) | B6 (cancelled) | no | read |
| notifications | B4, B6 (via `createNotification`) | no | no | read |
| stations, chargers | no (Melike, Eda) | no | no | B1, B2, B3 |
| availability_blocks | no (Eda) | no | no | B3 (read to mark slots blocked) |

All writes go through `db.write((tx) => ...)`, all values through `?` parameters.

## 10. Step by step development checklist

1. [ ] Run the app as the customer; click Find stations, Check availability, New reservation, My reservations and read the `StarterNotice` boxes.
2. [ ] Read `docs/API_CONTRACTS.md` (stations, availability, reservations) and `docs/DATABASE.md` (overlap rule). Read `shared/time.js` and its tests.
3. [ ] **B3 first, server side:** add `past`, `blocked`, `unavailable` to `buildDayGrid` with tests. Commit.
4. [ ] **B4 server side:** write the tests first (success, past, duration, overlap, back to back, simultaneous), then `createReservation.js`. Commit.
5. [ ] **B5 server side:** `suggestAlternatives.js` and the 409 body; tests. Commit.
6. [ ] **B4 and B5 front end:** the form, the conflict dialog. Check by reserving the same slot twice in two browser tabs.
7. [ ] **B3 front end:** day navigation, range selection, keyboard. Commit.
8. [ ] **B6:** cancel API, page, tests. Commit.
9. [ ] **B1 and B2:** filters API, page, URL state, tests; details polish.
10. [ ] Turn every remaining `test.todo` of your files into a real test.
11. [ ] Delete the `StarterNotice` of each finished page; `npm test`, `npm run build`, `npm run check:ownership`.
12. [ ] Open the pull request(s) (see section 15), including screenshots of the conflict dialog.

## 11. Acceptance criteria

* **B1 Station directory search and filters:** Every filter combination returns the right stations, the URL reflects the filters, reset restores the full list.
* **B2 Station details polish:** A customer can go from a charger row straight to its free slots.
* **B3 Slot availability grid:** The grid for any day matches the database exactly; range selection works with mouse and keyboard; day navigation never leaves the page.
* **B4 Create reservation:** A reservation can never overlap another confirmed one on the same charger, can never start in the past, and creating it also creates the notification and session. The demo "reserve the same slot twice" always produces the warning.
* **B5 Conflict warning and alternative slots:** Whenever a slot is refused, the customer sees three or more valid, bookable alternatives and can book one in a single click.
* **B6 My reservations and cancellation:** A cancelled slot is free again immediately on the availability grid; the customer gets a notification; others cannot cancel it.

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
git switch dev/berfin-ozcelik
npm ci
npm run dev        # API http://localhost:3001, web app http://localhost:5173
```

Sign in with the demo accounts from the README (customer `ayse@voltflow.demo` / `Customer123!`, admin `admin@voltflow.demo` / `Admin123!`). If the demo data looks old or you changed the schema after a pull, stop the server and run `npm run db:reset`. Windows PowerShell: the same commands, see `docs/SETUP_WINDOWS.md` if `npm` is blocked.

## 14. How to commit and push

Work only on `dev/berfin-ozcelik`. Never commit to `main`, never force-push.

```bash
git switch dev/berfin-ozcelik
git fetch origin
git merge origin/main          # do this every day; there should be no conflicts
# ... work ...
npm test
npm run check:ownership
git add <files you changed>    # not "git add ." blindly: look at "git status" first
git commit -m "Reservations: reject overlapping slots with 409"
git push -u origin dev/berfin-ozcelik    # first push; later just "git push"
```

Commit message: one short line in the imperative, starting with the feature name. Commit small and often (one rule or one screen per commit). Do not commit `data/*.db`, `node_modules/`, `dist/` or `.env` files (they are git-ignored; if `git status` shows them, stop and ask the PM).

## 15. How to open a pull request

1. Make sure `main` is merged into your branch, then run `npm test`, `npm run build`, `npm run check:ownership`: all must pass.
2. Remove this personal guide from the final pull request so the three guides cannot collide: `git rm DEVELOPER_README.md`, commit. (Your guide stays in `docs/developers/` on `main`.)
3. `git push`, then on GitHub choose **Compare and pull request**, base `main`, compare `dev/berfin-ozcelik`.
4. Fill in the template: what you built (feature rows), how you tested, screenshots, which `test.todo` became real tests, which `StarterNotice` you removed.
5. Ask the PM (Ezgi) to review. Answer comments with new commits on the same branch. The PM merges.
6. After the merge: `git fetch origin && git merge origin/main`.

You can open several smaller pull requests (one per feature row) instead of one big one. That is encouraged. Only the last one needs step 2.

## 16. Files you must not edit

`npm run check:ownership` fails if your branch changes any of these:

* **Other developers' feature folders and routes** (see `ownership.json`).
* **PM owned shared files:** `package.json`, `package-lock.json`, `vite.config.js`, `index.html`, `.github/*`, `ownership.json`, `scripts/*`, `shared/*`, `server/index.js`, `server/app.js`, `server/config.js`, `server/db/*` (schema, seed, init, database layer), `server/lib/*`, `server/routes/index.js`, `src/App.jsx`, `src/main.jsx`, `src/routes/*`, `src/layouts/*`, `src/context/*`, `src/hooks/*`, `src/lib/*`, `src/styles/*`, `src/pages/*`, and every shared component that is not listed in your section.
* **Root documents and `docs/*`** except your own guide. API changes go through the PM (`docs/API_CONTRACTS.md`).

You own `src/components/AvailabilityCalendar.jsx`, `StationCard.jsx` and `ReservationCard.jsx`: keep their existing props working because other pages (Eda's dashboard) use `ReservationCard`.

**Need a change in a PM file?** (new dependency, new column, new shared component, new route path, a new `paths` helper.) Message the PM with the exact change and why. The PM commits it to `main` in a small commit; you then `git merge origin/main`. Do not work around it by copying the file.

## 17. Dependencies on other developers

* **You depend on nobody** to start. The seed data already has reservations, sessions and one blocked window to test with.
* **Eda depends on you**: her charging sessions start from the `scheduled` session row your `POST /reservations` creates. Until your branch is merged, she can test with the seeded sessions. Agree the exact columns with her (they are in the schema; `start_soc` and `target_soc` use the defaults 20 and 80).
* **Eda's time-slot blocks** change the `blocked` state you render. Ask her for the final block semantics only if the schema is not enough (it should be).
* **Melike's notification centre** displays the notifications you create. Use `createNotification` exactly as documented in `server/lib/notifications.js`.
* **Melike's station and price edits** are visible in your directory and summaries.

## 18. Definition of Done

A feature row is done when **all** of this is true:

* It works in Chrome and Edge with no console errors and no broken buttons.
* The server validates every input (type, length, range) and checks authentication and ownership/role; errors use the standard format from `docs/API_CONTRACTS.md`; SQL uses `?` parameters only.
* The screen has loading, empty, error and success states; destructive actions use `ConfirmDialog`; results are shown with `Toast`; form errors appear next to the field.
* It is keyboard usable: labels on inputs, visible focus, buttons are real `<button>`s.
* The matching `test.todo` lines are real, passing tests, and every rule you added has a test.
* The `StarterNotice` for that feature is deleted, disabled buttons are enabled, and no stale `TODO` comment is left.
* `npm test`, `npm run build` and `npm run check:ownership` pass.
* The overlap, future-only and three-alternatives rules are covered by tests, including the simultaneous request test.
* You can explain every line you submit. The professor grades understanding, and plagiarism is penalised.
