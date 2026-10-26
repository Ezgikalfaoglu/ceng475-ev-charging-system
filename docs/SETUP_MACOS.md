# Setup on macOS

Tested layout: macOS 13 or newer, Terminal (zsh), Chrome or Edge.

## 1. Install Node.js 22 and Git

This project needs **Node.js 22 LTS** (22.12 or newer, but not 23 or newer: `npm` stops with a clear message otherwise). With Homebrew:

```bash
brew install git nvm
mkdir -p ~/.nvm
# add the two lines that "brew info nvm" prints to ~/.zshrc, then open a new Terminal
```

Then, in the project folder:

```bash
nvm install      # reads .nvmrc and installs Node 22
nvm use          # switches to it
node -v          # v22.x.x
```

Without Homebrew you can install the Node 22 package from https://nodejs.org/en/download/archive (pick v22).

## 2. Get the code

```bash
git clone <repository-url> ceng475-ev-charging-system
cd ceng475-ev-charging-system
git switch dev/<your-branch>        # developers only; the PM stays on main
```

## 3. Install and run

```bash
npm ci               # exact versions from package-lock.json (npm install also works)
npm run dev          # API :3001 + web app :5173
```

Open http://localhost:5173 in Chrome or Edge. Sign in with a demo account from the README. The database `data/voltflow.db` is created on first start.

Production-style run (one port):

```bash
npm run build
npm start            # http://localhost:3001
```

## 4. Everyday commands

```bash
npm test                     # all tests
npm run db:reset             # fresh demo data (stop the server first)
npm run check:ownership      # before opening a pull request
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `Unsupported engine` from npm | `nvm use` (you are not on Node 22) |
| `EADDRINUSE` port 3001 or 5173 | Another copy is running. Find it with `lsof -i :3001`, stop it with Ctrl+C in its Terminal, or run `PORT=3002 npm run dev` |
| "The database is already in use by another VoltFlow server" | Another copy of the app is running. Stop it (Ctrl+C in its window). A lock file left behind by a crash is detected and replaced automatically |
| "schema version" message | `npm run db:reset` |
| Old or empty demo data | `npm run db:reset` |
| Blank page after `npm start` | Run `npm run build` first |
