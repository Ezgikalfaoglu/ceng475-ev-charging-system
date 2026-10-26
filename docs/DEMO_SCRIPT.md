# Demo script (about 10 minutes, Chrome or Edge)

Preparation: `npm ci`, `npm run db:reset`, `npm run dev`, open http://localhost:5173 in a clean window. Rehearse with the **final merged** `main`: steps marked (B) need a feature branch to be merged; on the baseline they show a labelled starter screen instead.

| # | You do | You say / the audience sees | Rubric |
| --- | --- | --- | --- |
| 1 | `npm run dev`, open the landing page | One command, no database server: sql.js file database; landing page explains VoltFlow | 1, 9 |
| 2 | Sign in as `ayse@voltflow.demo` / `Customer123!` | Role based landing page (customer dashboard); JWT and bcrypt behind it | 3, 6 |
| 3 | Try a wrong password, then show Register (B) | Inline errors and server validation | 3, 4 |
| 4 | **Find stations**, open "VoltFlow Kızılay Hub" (search and filters (B)) | Station facts, chargers, connectors, price, status | 1, 9 |
| 5 | **Check availability**, choose a day, click a free slot | Free / booked slots from the database, grid is keyboard usable | 2, 7 |
| 6 | **Reserve this slot**, confirm (B) | Reservation stored, success toast, confirmation notification | 2, 5 |
| 7 | Reserve the same slot again (B) | Warning dialog: slot unavailable | 4 |
| 8 | Pick one of the 3 or more alternative times (B) | Alternative suggestions, then a second reservation | 2 |
| 9 | **Charging**, start and watch progress (B) | Simulated session, labelled "Simulation", cost and energy update | 2 |
| 10 | **Notifications**, mark one as read (B) | Persisted in-app notifications, bell counter changes (no e-mail or push is sent) | 5 |
| 11 | Sign out, sign in as `admin@voltflow.demo` / `Admin123!`; open `/app/dashboard` | Admin menu; customer pages refuse admins with a 403 page, and the API refuses customers | 6 |
| 12 | **Stations**: add, edit, delete (B); **Chargers**: add, block a time window (B); **Prices**: change one (B) | CRUD with validation, confirmation dialogs and toasts | 4, 5 |
| 13 | **Reservations**: filter, cancel one (B) | Admin sees all customers' reservations | 5, 6 |
| 14 | **Usage statistics** | Totals and chart computed from the database | 2, 9 |
| 15 | Stop the server (Ctrl+C), `npm run dev` again, reload the admin stations page | The station you created is still there: real persistence in `data/voltflow.db` | 5 |
| 16 | Show `docs/` and one component with its header comment | Components, props, state, documentation | 7, 8 |

Fallback if something fails live: `npm run db:reset` and restart; the read-only baseline always works.
