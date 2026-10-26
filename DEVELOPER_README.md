# Developer guide: Melike Şahin

> Accounts, profile, notifications, station and price administration. Read this file top to bottom once, then use section 10 as your daily checklist. If anything here disagrees with `docs/API_CONTRACTS.md` or the code, ask the PM before you decide.

## 1. Developer

**Melike Şahin**, full stack developer. Team: PM and QA Ezgi, Melike Şahin, Berfin Özçelik, Türkan Eda Uluçay.

You own everything about **who the user is** (register, profile, password) and the two **catalogue administration** screens (stations and prices), plus the **notification centre**. Your work is the foundation other features rely on: Berfin and Eda create notifications with the helper you document, and administrators use your station and price screens to prepare the data customers book.

## 2. Assigned branch

`dev/melike-sahin` (already created from `main`). Only you push to it. All your work reaches `main` through pull requests.

## 3. Assigned features

Effort: **40 points** (about one point is one focused hour including tests; the three developers have the same total).

| ID | Feature | Points |
| --- | --- | --- |
| M1 | Register | 5 |
| M2 | Profile, password and account deletion | 6 |
| M3 | Notification centre | 6 |
| M4 | Manage stations | 9 |
| M5 | Manage prices | 6 |
| M6 | Tests and documentation for your area | 8 |

### M1 Register (5 points, assigned to Melike)

* **Frontend:** `RegisterPage.jsx`: enable the form (name, e-mail, password, confirm password, optional vehicle model, connector and battery size), live validation with `validators.js`, `Input` error messages, submit button with `loading`, call `register()` from `useAuth()` which signs the user in, redirect with `homePathFor(user)`, toast on success. Show server `details` next to the fields (for example "This e-mail is already registered").
* **Backend:** `POST /api/auth/register` in `auth.js`: validate name (2 to 80 chars), e-mail format, password (min 8 chars, at least one letter and one digit), optional vehicle fields (connector must be CCS2, CHAdeMO or Type2, battery 10 to 200 kWh). Hash with `bcrypt.hash(password, config.bcryptRounds)`. Role is always `customer` and the request body is never allowed to set it. Return `201 {token, user}` like login does. Optional extra: throttle repeated failed logins (429).
* **Database operations:** `SELECT` by e-mail (case insensitive, the column is `COLLATE NOCASE`), `INSERT INTO users`, optionally `INSERT INTO notifications` (welcome message, type `system`). Duplicate e-mail answers `409 EMAIL_TAKEN`.
* **Tests:** In `auth.test.js` turn these into real tests: register creates a customer and returns a token; duplicate e-mail (also with different letter case) gives 409; weak password and invalid e-mail give 400 with field messages; role cannot be chosen; stored password is a bcrypt hash; (optional) login throttling.

### M2 Profile, password and account deletion (6 points, assigned to Melike)

* **Frontend:** `ProfilePage.jsx`: switch "Edit profile" to a real form (name, phone, vehicle model, connector, battery), a separate "Change password" card (current, new, confirm), a "Delete my account" danger zone using `ConfirmDialog` plus password confirmation. After saving call `setUser(data.user)` so the header updates. Admins do not see the delete option.
* **Backend:** `PUT /api/users/profile`, `PUT /api/users/password`, `DELETE /api/users/profile` in `users.js`. E-mail and role cannot be changed there. New password follows the register rules and must differ from the old one. Deleting a customer needs the correct password; an admin cannot delete the account (403).
* **Database operations:** `UPDATE users SET ... WHERE id = ?` (only the signed-in user's id from `req.user.id`, never from the body), `UPDATE users SET password_hash`, `DELETE FROM users WHERE id = ?` (reservations, sessions and notifications cascade).
* **Tests:** `users.test.js`: profile update and validation; role and e-mail unchanged; password change needs the current password; account deletion removes the user and their data.

### M3 Notification centre (6 points, assigned to Melike)

* **Frontend:** `NotificationCenterPage.jsx`: "Mark as read" per item, "Mark all as read", delete with a small confirm, All and Unread tabs already exist. After every change call `notifyNotificationsChanged()` from `src/hooks/useUnreadCount.js` so the bell in the navbar updates immediately. Show a relative time and link a notification to its reservation when `reservationId` is set (use `paths.reservations`).
* **Backend:** `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/read-all`, `DELETE /api/notifications/:id` in `notifications.js`. A user can only touch their own rows (answer 404, not 403, for someone else's id so ids cannot be probed). Stretch: a reminder job that creates one `reservation_reminder` per upcoming reservation (no duplicates) when it starts within 24 hours; run it on server start and then every 10 minutes from `server/services/accounts/`.
* **Database operations:** `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, `UPDATE ... WHERE user_id = ? AND is_read = 0`, `DELETE FROM notifications WHERE id = ? AND user_id = ?`. Notifications are in-app only. Do not write text that suggests an e-mail or push message was sent.
* **Tests:** `notifications.test.js`: mark one, mark all, other user's notification gives 404, delete, (stretch) reminder without duplicates.

### M4 Manage stations (9 points, assigned to Melike)

* **Frontend:** `ManageStationsPage.jsx`: enable "Add station", Edit, Delete. Use `Modal` with a form (name, address, city, latitude, longitude, description, amenities as comma separated text or checkboxes, opening and closing time, status). Client side checks with `validators.js`, server messages under the fields. Delete uses `ConfirmDialog`; when the API answers `409 HAS_RESERVATIONS` show a toast that explains and offers "Set inactive instead". Reload the table and show a success `Toast` after each action.
* **Backend:** `POST /api/admin/stations`, `PUT /api/admin/stations/:id`, `DELETE /api/admin/stations/:id` in `adminStations.js` (admin role is already enforced by the registry). Validate: name 2 to 80 chars and unique, address and city required, latitude -90..90, longitude -180..180, opening time before closing time (`HH:mm`), status `active` or `inactive`. Put the SQL in `server/services/catalog/stations.js` (new file, yours) and keep the route thin.
* **Database operations:** `INSERT INTO stations`, `UPDATE stations ... WHERE id = ?`, `DELETE FROM stations WHERE id = ?` (chargers cascade; blocked by the RESTRICT foreign key when reservations exist, check first with `SELECT COUNT(*) FROM reservations r JOIN chargers c ON c.id = r.charger_id WHERE c.station_id = ?`). Duplicate name gives `409 CONFLICT`.
* **Tests:** `adminStations.test.js`: create (and it appears in `/api/stations`), validation 400 with details, duplicate name 409, update including inactive, delete without history, delete with history gives 409.

### M5 Manage prices (6 points, assigned to Melike)

* **Frontend:** `ManagePricingPage.jsx`: enable "Change price" in a `Modal` (price per kWh, number input with step 0.01), plus a "Set price for whole station" action (station select and price) with a confirmation that lists how many chargers change. Table updates after saving.
* **Backend:** `PUT /api/admin/pricing/:chargerId` and `PUT /api/admin/pricing/station/:stationId` in `pricing.js`. Price is a number greater than 0 and at most 5 with at most 2 decimals. The station update is one transaction. Sessions that already started keep their stored `price_per_kwh` snapshot (Eda writes that snapshot; do not touch `charging_sessions`).
* **Database operations:** `UPDATE chargers SET price_per_kwh = ? WHERE id = ?`, `UPDATE chargers SET price_per_kwh = ? WHERE station_id = ?`.
* **Tests:** `adminStations.test.js` (pricing block): price change, negative and non-numeric rejected, station wide update, past session cost unchanged.

### M6 Tests and documentation for your area (8 points, assigned to Melike)

* **Frontend:** Keep the file header comments of your files up to date. Delete every `StarterNotice` you replace.
* **Backend:** Keep `docs/developers/MELIKE.md` accurate if you change plans; tell the PM about contract changes before coding them.
* **Database operations:** none
* **Tests:** All `test.todo` lines in `auth.test.js`, `users.test.js`, `notifications.test.js`, `adminStations.test.js` become real tests. Add a negative test for every validation rule.

## 4. Files and folders you own

You may create, edit and delete files in these places. Adding **new** files inside them is fine and expected.

* `src/features/auth/RegisterPage.jsx`
* `src/features/auth/LoginPage.jsx`
* `src/features/auth/routes.jsx`
* `src/features/profile/ProfilePage.jsx`
* `src/features/notifications/NotificationCenterPage.jsx`
* `src/features/admin/stations/ManageStationsPage.jsx`
* `src/features/admin/pricing/ManagePricingPage.jsx`
* `server/routes/auth.js`
* `server/routes/users.js`
* `server/routes/notifications.js`
* `server/routes/adminStations.js`
* `server/routes/pricing.js`
* `server/queries/users.js`
* `server/queries/notifications.js`
* `server/services/accounts/, server/services/catalog/`
* `server/tests/auth.test.js, users.test.js, notifications.test.js, adminStations.test.js`

`ownership.json` is the source of truth; `npm run check:ownership` enforces it.

## 5. What to implement in every file

| File | What to do |
| --- | --- |
| `src/features/auth/RegisterPage.jsx` | Enable the form, validation, submit, error mapping (M1) |
| `src/features/auth/LoginPage.jsx` | Keep working. Optional: "remember me" is NOT needed. Show a friendly message after too many failures if you add throttling |
| `src/features/auth/routes.jsx` | Already registers `/login` and `/register`; normally unchanged |
| `src/features/profile/ProfilePage.jsx` | Editing, password and delete cards (M2) |
| `src/features/notifications/NotificationCenterPage.jsx` | Read, read all, delete, links (M3) |
| `src/features/admin/stations/ManageStationsPage.jsx` | CRUD modals and confirmations (M4); split big parts into `StationForm.jsx` in the same folder |
| `src/features/admin/pricing/ManagePricingPage.jsx` | Price modal and station wide price (M5) |
| `server/routes/auth.js` | `POST /register`, optional throttling (M1) |
| `server/routes/users.js` | Profile, password, delete (M2) |
| `server/routes/notifications.js` | Mark read, read all, delete (M3) |
| `server/routes/adminStations.js` | Create, update, delete (M4) |
| `server/routes/pricing.js` | Price updates (M5) |
| `server/queries/users.js` | Add `createUser`, `updateUser`, `changePassword`, `deleteUser` (or put them in `server/services/accounts/`) |
| `server/queries/notifications.js` | Add `markRead`, `markAllRead`, `deleteNotification` |
| `server/services/accounts/, server/services/catalog/` | New files for business logic and the optional reminder job |
| `server/tests/auth.test.js, users.test.js, notifications.test.js, adminStations.test.js` | Turn `test.todo` into real tests |
| `docs/developers/MELIKE.md` | This guide (the PM copies it from `DEVELOPER_README.md`) |

## 6. React components you build or change

| Component | Props | State |
| --- | --- | --- |
| `RegisterPage` | none (route component) | `values`, `errors`, `submitting`, `serverError`; `useAuth().register` |
| `ProfileForm` (new, in `features/profile/`) | `user`, `onSaved(user)` | `values`, `errors`, `saving` |
| `PasswordForm` (new) | `onDone` | `values`, `errors`, `saving` |
| `NotificationItem` (new, in `features/notifications/`) | `notification`, `onRead(id)`, `onDelete(id)` | none (stateless) |
| `StationForm` (new, in `features/admin/stations/`) | `initial`, `onSubmit(values)`, `onCancel`, `serverErrors` | `values`, `errors`, `saving` |
| `PriceForm` (new, in `features/admin/pricing/`) | `charger` or `station`, `onSubmit`, `onCancel` | `price`, `error` |
| Shared, from the PM (use, do not edit) | `Input`, `Select`, `Button`, `Modal`, `ConfirmDialog`, `Toast`, `DataTable`, `Badge`, `EmptyState`, `ErrorState`, `LoadingState`, `PageHeader` | n/a |

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
| POST | `/api/auth/register` | public | M1 |
| PUT | `/api/users/profile` | user | M2 |
| PUT | `/api/users/password` | user | M2 |
| DELETE | `/api/users/profile` | customer | M2 |
| PATCH | `/api/notifications/:id/read` | user | M3 |
| PATCH | `/api/notifications/read-all` | user | M3 |
| DELETE | `/api/notifications/:id` | user | M3 |
| POST | `/api/admin/stations` | admin | M4 |
| PUT | `/api/admin/stations/:id` | admin | M4 |
| DELETE | `/api/admin/stations/:id` | admin | M4 |
| PUT | `/api/admin/pricing/:chargerId` | admin | M5 |
| PUT | `/api/admin/pricing/station/:stationId` | admin | M5 |

## 9. Database CRUD operations

Schema: `docs/DATABASE.md`. You do **not** change the schema; ask the PM.

| Table | Create | Update | Delete | Read |
| --- | --- | --- | --- | --- |
| users | register | profile and password changes, `GET /me` | delete account | login lookup |
| stations | M4 | M4 | M4 | list (exists) |
| chargers (price column only) | no | M5 | no | pricing list (exists) |
| notifications | welcome message (optional) | mark read | delete | list, count (exist) |

All writes go through `db.write((tx) => ...)`, all values through `?` parameters.

## 10. Step by step development checklist

1. [ ] Run the app, sign in as the customer and the admin, click through your pages and read the `StarterNotice` boxes: they are your to-do list.
2. [ ] Read `docs/API_CONTRACTS.md` (auth, users, notifications, admin stations, pricing) and `docs/DATABASE.md`.
3. [ ] Read one finished example end to end: login (`LoginPage.jsx`, `auth.js` login handler, `auth.test.js`).
4. [ ] **M1 Register:** write the failing tests first, then the API, then the form. Check in the browser and with a wrong input. Commit.
5. [ ] **M3 Notifications** (small and independent, good second step): API, then page changes, then the bell sync. Commit.
6. [ ] **M2 Profile:** API, forms, tests. Commit.
7. [ ] **M4 Stations:** service file with SQL, routes, modal form, delete guard, tests. Commit after each of create, update, delete.
8. [ ] **M5 Prices:** routes, modal, tests. Commit.
9. [ ] Turn every remaining `test.todo` of your files into a real test or remove it with a reason in the pull request.
10. [ ] Delete the `StarterNotice` of each finished page; run `npm test`, `npm run build`, `npm run check:ownership`.
11. [ ] Open the pull request(s) (see section 15), including screenshots.

## 11. Acceptance criteria

* **M1 Register:** A new person registers, lands on the customer dashboard and can sign in again later. Every invalid input shows a clear message beside the field. The database never contains a plain text password. `/api/auth/register` with `"role":"admin"` still creates a customer.
* **M2 Profile, password and account deletion:** Changes persist after reload and after a server restart. A wrong current password is rejected with a field message. A deleted account can no longer sign in.
* **M3 Notification centre:** The red bell counter and the list always agree, also after reload and after a server restart. Another account never sees or changes these rows.
* **M4 Manage stations:** An admin can create, edit and delete stations; customers see changes in the directory immediately; a station with reservation history cannot be deleted and the UI explains why; everything survives a server restart.
* **M5 Manage prices:** The new price shows on the station details page and in the reservation summary right away; invalid prices are refused with a clear message.
* **M6 Tests and documentation for your area:** `npm test` shows 0 todo and 0 fail for your four files.

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
git switch dev/melike-sahin
npm ci
npm run dev        # API http://localhost:3001, web app http://localhost:5173
```

Sign in with the demo accounts from the README (customer `ayse@voltflow.demo` / `Customer123!`, admin `admin@voltflow.demo` / `Admin123!`). If the demo data looks old or you changed the schema after a pull, stop the server and run `npm run db:reset`. Windows PowerShell: the same commands, see `docs/SETUP_WINDOWS.md` if `npm` is blocked.

## 14. How to commit and push

Work only on `dev/melike-sahin`. Never commit to `main`, never force-push.

```bash
git switch dev/melike-sahin
git fetch origin
git merge origin/main          # do this every day; there should be no conflicts
# ... work ...
npm test
npm run check:ownership
git add <files you changed>    # not "git add ." blindly: look at "git status" first
git commit -m "Reservations: reject overlapping slots with 409"
git push -u origin dev/melike-sahin    # first push; later just "git push"
```

Commit message: one short line in the imperative, starting with the feature name. Commit small and often (one rule or one screen per commit). Do not commit `data/*.db`, `node_modules/`, `dist/` or `.env` files (they are git-ignored; if `git status` shows them, stop and ask the PM).

## 15. How to open a pull request

1. Make sure `main` is merged into your branch, then run `npm test`, `npm run build`, `npm run check:ownership`: all must pass.
2. Remove this personal guide from the final pull request so the three guides cannot collide: `git rm DEVELOPER_README.md`, commit. (Your guide stays in `docs/developers/` on `main`.)
3. `git push`, then on GitHub choose **Compare and pull request**, base `main`, compare `dev/melike-sahin`.
4. Fill in the template: what you built (feature rows), how you tested, screenshots, which `test.todo` became real tests, which `StarterNotice` you removed.
5. Ask the PM (Ezgi) to review. Answer comments with new commits on the same branch. The PM merges.
6. After the merge: `git fetch origin && git merge origin/main`.

You can open several smaller pull requests (one per feature row) instead of one big one. That is encouraged. Only the last one needs step 2.

## 16. Files you must not edit

`npm run check:ownership` fails if your branch changes any of these:

* **Other developers' feature folders and routes** (see `ownership.json`).
* **PM owned shared files:** `package.json`, `package-lock.json`, `vite.config.js`, `index.html`, `.github/*`, `ownership.json`, `scripts/*`, `shared/*`, `server/index.js`, `server/app.js`, `server/config.js`, `server/db/*` (schema, seed, init, database layer), `server/lib/*`, `server/routes/index.js`, `src/App.jsx`, `src/main.jsx`, `src/routes/*`, `src/layouts/*`, `src/context/*`, `src/hooks/*`, `src/lib/*`, `src/styles/*`, `src/pages/*`, and every shared component that is not listed in your section.
* **Root documents and `docs/*`** except your own guide. API changes go through the PM (`docs/API_CONTRACTS.md`).

Your own area (see the table in section 4) is the only code you edit. `server/queries/stations.js` belongs to Berfin: write your station SQL in `server/services/catalog/` instead of editing it.

**Need a change in a PM file?** (new dependency, new column, new shared component, new route path, a new `paths` helper.) Message the PM with the exact change and why. The PM commits it to `main` in a small commit; you then `git merge origin/main`. Do not work around it by copying the file.

## 17. Dependencies on other developers

* **You depend on nobody.** Everything you need (users, notifications helper, demo data, shared components) is on `main`.
* **Berfin and Eda depend on you only through `createNotification(tx, ...)`** in `server/lib/notifications.js`, which already exists and is owned by the PM. You do not need to change it. If you want a new notification type, ask the PM (it needs a schema change).
* **Berfin's station directory** reads the stations you edit; test that your changes appear there.
* **Eda's statistics** read the prices you edit.

## 18. Definition of Done

A feature row is done when **all** of this is true:

* It works in Chrome and Edge with no console errors and no broken buttons.
* The server validates every input (type, length, range) and checks authentication and ownership/role; errors use the standard format from `docs/API_CONTRACTS.md`; SQL uses `?` parameters only.
* The screen has loading, empty, error and success states; destructive actions use `ConfirmDialog`; results are shown with `Toast`; form errors appear next to the field.
* It is keyboard usable: labels on inputs, visible focus, buttons are real `<button>`s.
* The matching `test.todo` lines are real, passing tests, and every rule you added has a test.
* The `StarterNotice` for that feature is deleted, disabled buttons are enabled, and no stale `TODO` comment is left.
* `npm test`, `npm run build` and `npm run check:ownership` pass.
* Registration, profile and administration pages show helpful messages for every invalid input and for every server error (including 409).
* You can explain every line you submit. The professor grades understanding, and plagiarism is penalised.
