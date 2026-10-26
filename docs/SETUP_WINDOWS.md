# Setup on Windows (PowerShell)

Tested layout: Windows 10 or 11, PowerShell, Chrome or Edge. Every command below is PowerShell.

## 1. Install Node.js 22 and Git

This project needs **Node.js 22 LTS** (22.12 or newer, but not 23 or newer: `npm` stops with a clear message otherwise). The "LTS" button on nodejs.org may offer a newer major version, so pick **v22** explicitly.

Option A, installers: Git from https://git-scm.com/download/win and Node 22 from https://nodejs.org/en/download/archive (choose v22, Windows Installer .msi).

Option B, version manager:

```powershell
winget install Git.Git
winget install CoreyButler.NVMforWindows
# open a NEW PowerShell window, then:
nvm install 22
nvm use 22
node -v          # v22.x.x
```

## 2. Get the code

```powershell
git clone <repository-url> ceng475-ev-charging-system
cd ceng475-ev-charging-system
git switch dev/<your-branch>        # developers only; the PM stays on main
```

## 3. Install and run

```powershell
npm ci               # or: npm install
npm run dev          # API :3001 + web app :5173
```

Open http://localhost:5173 in Chrome or Edge. Sign in with a demo account from the README.

Production-style run (one port):

```powershell
npm run build
npm start            # http://localhost:3001
```

To use another port in PowerShell: `$env:PORT = 3002; npm run dev`.

## 4. Everyday commands

```powershell
npm test
npm run db:reset             # stop the server first
npm run check:ownership
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm : File ...npm.ps1 cannot be loaded because running scripts is disabled` | Use `npm.cmd` instead of `npm` (for example `npm.cmd run dev`), or open "Command Prompt" and use `npm`. If you prefer `npm` in PowerShell, allow scripts for **this window only**: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned`. This lasts until you close the window and changes nothing system wide. Do not turn off protections for the whole machine. |
| `Unsupported engine` from npm | `nvm use 22` (you are not on Node 22) |
| `EADDRINUSE` port 3001 or 5173 | `netstat -ano \| findstr :3001`, then stop that process (`Stop-Process -Id <PID>`) or use another port as shown above |
| "The database is already in use by another VoltFlow server" | Another copy of the app is running. Stop it (Ctrl+C in its window). A lock file left behind by a crash is detected and replaced automatically |
| Line ending warnings from Git | Expected: `.gitattributes` normalises to LF, nothing to do |
| "schema version" message or stale demo data | `npm run db:reset` |
| Antivirus slows `npm ci` | Wait; do not disable the antivirus, run it once and it is cached |
