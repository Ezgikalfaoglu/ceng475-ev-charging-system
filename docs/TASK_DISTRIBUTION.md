# Task distribution

Three developers each own a vertical slice (database queries, API, pages, tests, documentation) so nobody waits for anybody. The PM owns the foundation and review.

## Owners at a glance

| Developer | Area | Branch | Guide |
| --- | --- | --- | --- |
| Melike Şahin | Accounts, profile, notifications, station and price administration | `dev/melike-sahin` | [MELIKE.md](developers/MELIKE.md) |
| Berfin Özçelik | Station discovery, availability, reservations | `dev/berfin-ozcelik` | [BERFIN.md](developers/BERFIN.md) |
| Türkan Eda Uluçay | Charging simulation, dashboards, charger and reservation administration, statistics | `dev/turkan-eda-ulucay` | [EDA.md](developers/EDA.md) |
| Ezgi (PM and QA) | Foundation, shared components, schema, docs, reviews, merging, demo | `main` | this repository |

## Effort table (feature level)

Points are planning units (about one point is one focused hour including tests). Each developer carries 40 points, so the split is one third each. Everyone writes the tests for their own features; those are included.

### Melike Şahin: accounts, notifications, catalogue administration (40)

| Feature | Pages and files | Points |
| --- | --- | --- |
| Register: API with validation, hashing, duplicate e-mail, form with inline errors | `RegisterPage`, `auth.js` | 5 |
| Profile editing, password change, delete account | `ProfilePage`, `users.js` | 6 |
| Notification centre: mark read, mark all, delete, bell counter sync | `NotificationCenterPage`, `notifications.js` | 6 |
| Manage stations: create, edit, delete with guard, modal forms | `ManageStationsPage`, `adminStations.js` | 9 |
| Manage prices: per charger and per station | `ManagePricingPage`, `pricing.js` | 6 |
| Tests (auth, users, notifications, stations) and documentation | `server/tests/*` | 8 |

### Berfin Özçelik: discovery and reservations (40)

| Feature | Pages and files | Points |
| --- | --- | --- |
| Station directory search and filters (API query parameters and UI, URL state) | `StationDirectoryPage`, `stations.js` | 7 |
| Station details polish: per-charger availability shortcut, hours, map link | `StationDetailsPage` | 3 |
| Availability grid: blocked and past states, day navigation, range selection | `SlotAvailabilityPage`, `availability.js` | 9 |
| Create reservation: validation, future only, overlap check inside one transaction, notification | `CreateReservationPage`, `reservations.js` | 9 |
| Conflict handling: at least 3 alternative slots and the warning dialog | `/availability/suggestions`, modal | 7 |
| My reservations: cancel with confirmation, filters, notification | `MyReservationsPage` | 5 |

### Türkan Eda Uluçay: charging and operations (40)

| Feature | Pages and files | Points |
| --- | --- | --- |
| Simulated charging engine: start, stop, progress from elapsed time, cost | `server/services/charging/`, `chargingSessions.js` | 9 |
| Charging page: live updates, start/stop UI, summary, history | `ChargingSessionPage` | 5 |
| Completion: auto complete, notification | `services/charging` | 3 |
| Customer dashboard: live session shortcut, notifications, monthly totals | `CustomerDashboardPage` | 3 |
| Admin chargers: create, edit, delete guard, status | `ManageChargersPage`, `adminChargers.js` | 6 |
| Time slot blocks: block and unblock windows, conflict listing | `ManageChargersPage`, blocks API | 5 |
| Admin reservations: cancel and complete, notify customer | `ManageReservationsPage`, `adminReservations.js` | 4 |
| Usage statistics: per station, per hour, per day, date range, CSV | `UsageStatisticsPage`, `analytics.js` | 5 |

### Ezgi (PM and QA): foundation and delivery (already done on main, plus ongoing)

Foundation (repository, database layer, auth, 19 pages, shared components, design system, ownership tooling, CI, docs): done. Ongoing: review every pull request against the definition of done, merge in the order below, keep the traceability checklist, run the manual tests on macOS and Windows, prepare the demo.

## Dependencies and merge order

The three slices are independent by design (each can run alone on top of `main`). Recommended merge order:

1. **Melike** (notifications and prices touch no one else; `lib/notifications.js` is already on main).
2. **Berfin** (creates reservations that Eda's sessions need).
3. **Eda** (sessions start from reservations; test data from the seed works even before step 2).

After each merge run `npm ci && npm test && npm run build` on `main` and update the checklist in REQUIREMENTS.md.

## File ownership and merge conflict policy

* `ownership.json` lists, for every file, who may change it. `npm run check:ownership` compares your branch with `main` and fails if you touched someone else's file. CI runs the same check on every pull request.
* Shared files (`package.json`, lock file, `server/db/schema.sql`, `server/routes/index.js`, `src/routes/registry.jsx`, `src/styles/*`, shared components not listed in your section, `shared/*`, root docs) belong to the PM. You never edit them. If you need a change (new dependency, new table column, new shared component), open an issue or a message to the PM with the exact change; the PM applies it on `main` in a small commit and you merge `main` into your branch.
* Add new files only inside your own folders (see your guide): your feature folder, your `server/services/<area>/` folders, your tests. Feature specific CSS goes in a `*.css` file in your feature folder and is imported by your page.
* Routes: you do not touch the registry. Add pages by exporting them from your feature's `routes.jsx`.
* Because nobody edits the same file, Git has nothing to conflict on. Two exceptions are handled explicitly: `DEVELOPER_README.md` (see below) and `docs/API_CONTRACTS.md` (PM edits it from your request).
* **Daily routine:** `git switch dev/<you>`, `git fetch origin`, `git merge origin/main`, work, `npm test`, `npm run check:ownership`, commit small, push.
* **Before your final pull request:** `git rm DEVELOPER_README.md` and commit, so the three personal guides (`docs/developers/*.md` stay) do not collide when merged.
* Never force-push, never rewrite pushed history, never commit to `main` directly.
