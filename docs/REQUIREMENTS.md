# Requirements

Source: CENG 475 Projects Fall (Project 4) and the project evaluation form. Status legend: **Main** = works on `main` today, **Branch** = assigned to the named developer and only a labelled starter exists on `main`, **Done by** = after the branch is merged.

## Functional requirements

| ID | Requirement | Status on main | Owner |
| --- | --- | --- | --- |
| FR-01 | Landing page that explains the product and leads to sign in and register | Main | PM |
| FR-02 | Sign in with e-mail and password | Main | PM (baseline) |
| FR-03 | Register a customer account with validation and duplicate e-mail handling | Branch (form and API are placeholders) | Melike |
| FR-04 | Unauthorized (403) and not found (404) pages | Main | PM |
| FR-05 | Customer dashboard with upcoming reservations and totals | Main (read-only), live session shortcut on branch | Eda |
| FR-06 | Station directory with search and filters | Main (list only), filters on branch | Berfin |
| FR-07 | Station details with chargers, connectors, power, price, status | Main (details); per-charger shortcut on branch | Berfin |
| FR-08 | Slot availability grid per charger and day | Main (free and booked), blocked/past/range selection on branch | Berfin |
| FR-09 | Create a reservation | Branch | Berfin |
| FR-10 | No overlapping reservations on one charger | Branch (database index and `overlaps()` helper ready) | Berfin |
| FR-11 | Reservations only in the future | Branch | Berfin |
| FR-12 | On conflict offer at least 3 alternative slots | Branch | Berfin |
| FR-13 | My reservations with upcoming and past, cancel | Main (list), cancel on branch | Berfin |
| FR-14 | Charging session tracking, clearly simulated | Main (stored values), live engine on branch | Eda |
| FR-15 | Notification centre with persisted in-app notifications, read and unread | Main (list), mark read and delete on branch | Melike |
| FR-16 | Profile and vehicle details, change password | Main (view), editing on branch | Melike |
| FR-17 | Admin dashboard | Main (numbers and chart), live lists on branch | Eda |
| FR-18 | Manage stations (create, edit, delete) | Main (list), CRUD on branch | Melike |
| FR-19 | Manage chargers and time slots (including blocking windows) | Main (list), CRUD and blocks on branch | Eda |
| FR-20 | Manage prices | Main (list), editing on branch | Melike |
| FR-21 | Manage all reservations | Main (list and filter), status change on branch | Eda |
| FR-22 | Usage statistics | Main (totals and chart), detailed reports on branch | Eda |

## Non-functional requirements

| ID | Requirement | How it is met |
| --- | --- | --- |
| NFR-01 | Runs on macOS and Windows with only `npm install` and `npm run dev` | No native modules (sql.js is WebAssembly), scripts spawn processes without a shell, tested commands in the setup guides |
| NFR-02 | One Node version | `engines` `>=22.12 <23`, `.nvmrc`, `engine-strict` |
| NFR-03 | Safe persistent storage | Serialised writes, atomic rename, lock file, tests in `persistence.test.js` |
| NFR-04 | Security | bcrypt, JWT, parameterised SQL, server-side validation, role middleware, no secrets in git |
| NFR-05 | Accessibility and usability | Labels, focus, keyboard, responsive layout, empty/loading/error states |
| NFR-06 | Honesty | `StarterNotice`, 501 responses, "Simulation" label, no fake e-mail or push claims |
| NFR-07 | Maintainability | Feature folders, route registry, ownership file and check, comments with owner and TODO list |

## Mapping to the evaluation form (100 points)

| # | Criterion | Points | Where it is shown | Status on main |
| --- | --- | --- | --- | --- |
| 1 | Content and scope: HTML, CSS, React, vanilla JavaScript | 25 | React SPA with Router and Context, plain CSS, vanilla JS utilities (`shared/`, `src/lib/`), 19 pages | Foundation and 19 pages; features complete after merges |
| 2 | Correctly working, solves the problem | 15 | Reservation flow end to end, conflict rule, simulated charging | Branches (read paths work on main) |
| 3 | Sign up, sign in, security | 5 | bcrypt, JWT, 8 hour expiry, validation, sign in works; register on branch | Partly main |
| 4 | Warning mechanisms (pop-up, alert) | 5 | `Toast`, `Modal`, `ConfirmDialog`, inline field errors, 409 conflict warning | Components on main; used in features by developers |
| 5 | Database usage and integrity | 10 | 7 tables, constraints, foreign keys, CRUD on stations, chargers, reservations, notifications, users | Schema and reads on main; CRUD on branches |
| 6 | User roles and authorization | 10 | `customer` and `admin`; route guards in the browser, `requireRole` on `/api/admin`, owner checks | Main |
| 7 | Components, props, state | 10 | 20+ components in separate files with documented props, state in pages, Context | Main |
| 8 | Documentation and code quality | 10 | README, 14 documents in `docs/`, comments with owner and TODO, ownership policy, tests | Main |
| 9 | User friendly | 10 | Clear navigation, empty/loading/error states, responsive, consistent design | Main |

Plagiarism: the form warns that copying from friends or the Internet is evaluated. All team members must understand and be able to explain their branch. Disclose AI assistance according to the instructor's rules.

> Scope note for the PM. The form says "HTML, CSS, ReactJS and vanilla JavaScript". This project adds a small Node and Express server with SQLite because the brief asks for a database, authentication and role authorization. Please confirm with the instructor or assistant that a Node back end is acceptable. If it is not, the fallback is to keep the same React front end and replace `src/lib/api.js` by a `localStorage` backed module with the same function names.

## Requirements traceability checklist

Tick when verified on the final merged `main` (PM). Evidence is the test or manual step that proves it.

| Req | Evidence | Verified on |
| --- | --- | --- |
| FR-01 to FR-04 | `DEMO_SCRIPT` steps 1 to 3, `authorization.test.js` | baseline: yes |
| FR-05, FR-17, FR-22 | `DEMO_SCRIPT` steps 2, 14 | baseline: numbers yes |
| FR-06 to FR-08 | `stations.test.js`, `availability.test.js`, steps 4, 5 | baseline: lists and grid yes |
| FR-09 to FR-13 | `reservations.test.js` (todo tests become real), steps 6 to 8 | after Berfin merge |
| FR-14 | `chargingSessions.test.js`, step 9 | after Eda merge |
| FR-15, FR-16, FR-03 | `notifications.test.js`, `users.test.js`, `auth.test.js` | after Melike merge |
| FR-18, FR-20 | `adminStations.test.js`, step 12 | after Melike merge |
| FR-19, FR-21 | `adminOps.test.js`, steps 12, 13 | after Eda merge |
| NFR-01 | Setup guides on a clean macOS and a clean Windows machine | PM manual |
| NFR-03 | `persistence.test.js` | baseline: yes |

## Grading criteria traced to files, pages and demo steps

Demo step numbers refer to [DEMO_SCRIPT.md](DEMO_SCRIPT.md).

| Criterion | Key files | Pages | Demo steps |
| --- | --- | --- | --- |
| 1 Content and scope | `src/` (React), `src/styles/` (CSS), `shared/time.js`, `src/lib/*.js` (vanilla JS), `src/routes/registry.jsx` | all 19 | 1 to 16 |
| 2 Working solution | `server/routes/reservations.js`, `server/routes/availability.js`, `server/routes/chargingSessions.js`, `src/features/reservations/` | slots, create reservation, charging | 5 to 9 |
| 3 Sign up, sign in, security | `server/lib/auth.js`, `server/routes/auth.js`, `src/features/auth/`, `src/context/AuthContext.jsx` | login, register | 2, 3 |
| 4 Warning mechanisms | `src/components/Toast.jsx`, `Modal.jsx`, `ConfirmDialog.jsx`, `Input.jsx` (inline errors) | create reservation, manage pages | 3, 7, 12 |
| 5 Database and integrity | `server/db/schema.sql`, `server/db/database.js`, `server/queries/`, `server/tests/database.test.js`, `persistence.test.js` | manage stations, chargers, prices | 6, 12, 15 |
| 6 Roles and authorization | `server/routes/index.js`, `server/lib/auth.js`, `src/routes/RouteShell.jsx`, `src/pages/UnauthorizedPage.jsx` | unauthorized, all admin pages | 2, 11 |
| 7 Components, props, state | `src/components/*.jsx` (22 files), `src/context/`, `src/hooks/` | all | all |
| 8 Documentation and quality | `README.md`, `docs/`, file header comments, `ownership.json`, `server/tests/` | n/a | n/a |
| 9 User friendly | `src/layouts/`, `src/styles/`, empty/loading/error components | all | all |
