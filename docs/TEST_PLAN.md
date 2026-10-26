# Test plan

## Automated tests

```bash
npm test          # all suites, about 10 seconds
```

Node's built-in runner (`node --test`). API tests start the real Express app on a random port with a temporary database file, so nothing touches `data/voltflow.db`. There are no test dependencies to install.

Test files are grouped by owner. A `test.todo(...)` line is a placeholder that shows as "todo" in the output: it is the exact list of behaviours that the owner must turn into a real test while building the feature. The count of todos must go to zero before the final submission.

### Coverage of the required scenarios

| Scenario | File | State on main |
| --- | --- | --- |
| Customer registration | `auth.test.js` | todo (Melike) |
| Login success and failure | `auth.test.js` | real |
| Unauthorized route access | `authorization.test.js` | real |
| Station listing | `stations.test.js` | real (filters todo, Berfin) |
| Station CRUD | `adminStations.test.js` | list real, create/update/delete todo (Melike) |
| Slot availability | `availability.test.js` | real for free and booked (blocked/past todo, Berfin) |
| Successful reservation | `reservations.test.js` | todo (Berfin) |
| Reservation conflict prevention | `reservations.test.js` | todo (Berfin); `shared/time.test.js` tests `overlaps()` |
| Alternative slot suggestion | `availability.test.js`, `reservations.test.js` | todo (Berfin) |
| Reservation cancellation | `reservations.test.js` | todo (Berfin) |
| Charging progress | `chargingSessions.test.js` | todo (Eda) |
| Charging session completion | `chargingSessions.test.js` | todo (Eda) |
| Admin-only operations | `authorization.test.js` | real (every `/api/admin` route refuses customers and guests) |
| Notification updates | `notifications.test.js` | list and unread count real, mark read todo (Melike) |
| Data persistence after restart | `persistence.test.js` | real (write, restart, read; no re-seeding; `database.test.js` adds rollback, serialised parallel writes, second opener refused) |

Other suites: `database.test.js` (constraints, foreign keys, serialised transactions), `shared/time.test.js`, `src/lib/format.test.js`, `src/lib/validators.test.js`, `scripts/ownership.test.mjs`.

The exact counts are printed at the end of `npm test` (pass, fail, todo) and are recorded in the PM's verification notes.

## Manual tests (Chrome and Microsoft Edge)

Run each block once in Chrome and once in Edge, with a fresh database (`npm run db:reset`, then `npm run dev`, open http://localhost:5173).

### M1 Sign in and roles

1. Open `/login`. Sign in as `ayse@voltflow.demo` / `Customer123!`. Expect the customer dashboard.
2. Type `/admin/dashboard` in the address bar. Expect the "403 You do not have access" page with a way back.
3. Sign out. Sign in as `admin@voltflow.demo` / `Admin123!`. Expect the administration overview, admin menu.
4. Type `/app/dashboard`. Expect 403 for the admin (customer area).
5. Sign in with a wrong password. Expect an inline message "E-mail or password is incorrect", no page reload.
6. Visit `/does-not-exist`. Expect the 404 page.

### M2 Station browsing and availability

1. As customer open **Find stations**. Expect 8 station cards. Open one.
2. Click **Check availability**. Pick today. Expect a grid per charger with free (green outline), booked (grey hatched) slots.
3. Click a free slot, then **Reserve this slot**. Expect the summary page with station, charger, time, price.

### M3 Reservation flow (after Berfin merges)

Create a reservation, then try the same slot again: expect the warning and at least three alternatives, choose one, check **My reservations**, cancel one with the confirmation dialog, check that a notification appeared.

### M4 Charging (after Eda merges)

Open **Charging**. Start the session. Expect live progress with the "Simulation" label. Stop it or let it finish. Expect a completion notification.

### M5 Admin (after Melike and Eda merge)

Create, edit, delete a station (and see the refusal for one with history). Change a price. Block a time window and check it appears as blocked in the customer grid. Review statistics.

### M6 Persistence

Create or edit something, stop the server (Ctrl+C), start it again, reload: the change is still there.

### M7 Layout and accessibility

Resize to phone width (DevTools device toolbar): menu collapses, tables scroll, no horizontal page scroll. Tab through a form: focus is always visible. Press Escape in a dialog: it closes and focus returns.

## Verification record (PM)

Fill in after each merge: date, commit, `npm ci`, `npm test` (pass/fail/todo), `npm run build`, manual blocks M1 to M7 in Chrome and Edge, macOS and Windows.
