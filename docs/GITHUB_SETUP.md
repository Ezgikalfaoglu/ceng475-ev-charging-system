# GitHub setup

The repository was prepared **locally** with `main` and the three developer branches. No remote repository has been created by the tooling, so nothing is on GitHub yet. This page is how the PM (Ezgi) publishes it.

## 1. Create the empty repository

Name: `ceng475-ev-charging-system`. Description: `React-based EV Charging Station Reservation and Management System | CENG 475`. Private or public as your instructor requires. **Do not** add a README, .gitignore or licence on GitHub (the repository already has them, and a non-empty remote would force a merge).

In the browser: https://github.com/new, or with the GitHub CLI (after `gh auth login`):

```bash
gh repo create ceng475-ev-charging-system --private \
  --description "React-based EV Charging Station Reservation and Management System | CENG 475"
```

## 2. Push main and the branches

From the project folder (works the same in macOS Terminal and PowerShell):

```bash
git remote add origin https://github.com/<your-user-or-org>/ceng475-ev-charging-system.git
git push -u origin main
git push -u origin dev/melike-sahin dev/berfin-ozcelik dev/turkan-eda-ulucay
```

Normal pushes only. Never use `--force`.

## 3. Invite the team

Settings, Collaborators: give Melike, Berfin and Eda **Write** access (not Admin).

## 4. Protect `main`

Settings, Branches, Add branch protection rule for `main`:

* Require a pull request before merging, 1 approval (the PM).
* Require status checks to pass: `CI`.
* Block force pushes and deletions.

Optionally copy `.github/CODEOWNERS.example` to `.github/CODEOWNERS`, replace the placeholders with the real GitHub user names and require code owner review.

## 5. Check CI

The workflow `.github/workflows/ci.yml` runs on every push and pull request: `npm ci`, `npm test`, `npm run build`, and on pull requests `npm run check:ownership`. Open the Actions tab after the first push and confirm it is green.

## 6. Each developer

```bash
git clone https://github.com/<owner>/ceng475-ev-charging-system.git
cd ceng475-ev-charging-system
git switch dev/<your-branch>
```

Then follow the guide in `docs/developers/`.
