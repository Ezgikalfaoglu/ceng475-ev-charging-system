# Project management

## Roles

PM and QA: Ezgi. Developers: Melike, Berfin, Eda. The PM does not implement the three slices; she reviews, merges, tests and demonstrates.

## Branches

| Branch | Purpose | Who pushes |
| --- | --- | --- |
| `main` | Always builds, always starts, always demonstrable | PM only, through pull requests |
| `dev/melike-sahin`, `dev/berfin-ozcelik`, `dev/turkan-eda-ulucay` | Personal long-lived feature branches | the named developer |
| `chore/*`, `docs/*`, `pm/*` | Small PM changes | PM |

Recommended GitHub settings (see [GITHUB_SETUP.md](GITHUB_SETUP.md)): protect `main`, require a pull request, require the `CI` check, require one approval, block force pushes.

## Pull request flow

1. Merge `origin/main` into your branch, resolve nothing (there should be no conflicts).
2. `npm test`, `npm run build`, `npm run check:ownership` all green locally.
3. Open a pull request into `main` with the template: what you built, how you tested, screenshots, which `test.todo` became real tests, which `StarterNotice` you removed.
4. PM reviews with the definition of done below. Squash or merge commit, PM decides.
5. After merge, everyone merges `main` into their branch.

Small and frequent pull requests are welcome, not only one at the end: for example one per feature row of the effort table.

## Definition of done (per feature)

* Works in Chrome and Edge, keyboard usable, no console errors.
* Server validates every input and checks the role; errors use the standard format.
* Loading, empty, error and success states exist; destructive actions ask for confirmation.
* Tests: the matching `test.todo` entries are real tests that pass; new rules have tests.
* `StarterNotice` and the `501` placeholder are removed for that feature; comments list no stale TODO.
* Documentation: contract changes agreed with the PM, your guide updated.
* `npm test`, `npm run build`, `npm run check:ownership` pass.

## Milestones (suggested, adjust to the course calendar)

| Week | Goal |
| --- | --- |
| 1 | Everyone runs the baseline, reads their guide, first pull request (one feature row) |
| 2 | Core features merged: register, create reservation, start/stop charging, station CRUD |
| 3 | Remaining features, conflict alternatives, statistics; PM manual tests on macOS and Windows |
| 4 | Polish, demo rehearsal, final documentation and submission |

## Risks and decisions

| Risk | Mitigation |
| --- | --- |
| Instructor expects no server | Confirm early; fallback in REQUIREMENTS.md scope note |
| Plagiarism or "I cannot explain my code" | Every developer explains their branch in the demo; commit history stays personal; follow the instructor's AI-disclosure rule |
| Merge conflicts | Ownership file, check script, feature folders, route registry |
| Demo data looks stale | `npm run db:reset` before every demo |
| Time zone mismatch between server and browser | Documented assumption, both run on the demo laptop |
| A developer falls behind | Slices are independent; PM can reassign a row of the effort table, update `ownership.json` in a PM pull request |
| Lost database | The file is disposable demo data; `npm run db:reset` recreates it |

## Communication

Use the pull request for questions about code, the PM for contract or schema changes. Write decisions in the pull request so they are searchable.
