# Ralph UI testing progress

Append-only log. Newest entries at the bottom.

## Setup

- [x] Scaffolded `prd.json`, `PROMPT.md`, this file
- [x] Dev server verified on `:9002` (emulators + Next)
- [x] Test accounts seeded via `scripts/seed-ralph-emulators.js`
- [ ] HITL dry-run: `auth-signin` + `manager-shell`

Accounts (emulator only): `manager@ralph.test` / `employee@ralph.test` / `pending@ralph.test` — password `password123`

## Iterations

### 2026-08-12 — starting auth-signin
- Emulators: auth:9099 firestore:8080 storage:9199
- App: http://localhost:9002
- Beginning computerUse for `auth-signin`
