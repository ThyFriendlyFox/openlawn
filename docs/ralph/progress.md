# Ralph UI testing progress

Append-only log. Newest entries at the bottom.

## Setup

- [x] Scaffolded `prd.json`, `PROMPT.md`, this file
- [x] Dev server verified on `:9002` (emulators + Next)
- [x] Test accounts seeded via `scripts/seed-ralph-emulators.js`
- [x] HITL dry-run: `auth-signin` (continuing loop)

Accounts (emulator only): `manager@ralph.test` / `employee@ralph.test` / `pending@ralph.test` — password `password123`

## Iterations

### 2026-08-12 — starting auth-signin
- Emulators: auth:9099 firestore:8080 storage:9199
- App: http://localhost:9002
- Beginning computerUse for `auth-signin`

### auth-signin — PASS
- Form visible; invalid login shows inline error; manager login reaches shell with map + Customers (1) Acme Yard
- Artifacts: `/opt/cursor/artifacts/ralph/auth-signin-*.png`, recording `auth-signin-ralph-loop.mp4`
- `<promise>TASK-auth-signin:DONE</promise>`

### auth-signup-pending — starting
- Next: sign out, sign up as employee against company `Ralph Test Lawn Co`, expect PendingApprovalScreen

### auth-signup-pending — PASS
- Employee signup `newhire@ralph.test` → Account Pending Approval screen
- Artifacts: `auth-signup-pending-form.png`, `auth-signup-pending-pass.png`
- `<promise>TASK-auth-signup-pending:DONE</promise>`

### manager-shell — starting
- Sign in as manager; verify header, map, Customers/Employees/Crews reachability

### manager-shell — PASS
- Header (Manager/Export/Pending/RM), map tiles, Customers/Employees/Crews via bottom bars
- Artifacts: `manager-shell-*.png`
- `<promise>TASK-manager-shell:DONE</promise>`

### customer-crud-sheets — starting

### customer-crud-sheets — PASS
- Added Beta Lawn via sheet; list → Customers (2); edit sheet opens/closes
- Artifacts: `customer-crud-sheet-open.png`, `customer-crud-pass.png`
- `<promise>TASK-customer-crud-sheets:DONE</promise>`

### employee-crud-sheets — starting
- FAIL attempt 1 expected: AddEmployeeSheet never opened (no setIsAddEmployeeSheetOpen(true))
- Fix: added Add New Employee control + accountStatus active on create
- Retesting after fix

### employee-crud-sheets — PASS (after fix)
- Added Crew Lead Sam; list count 4→5; edit opens/closes
- Artifacts: `employee-crud-sheet-open.png`, `employee-crud-pass.png`
- `<promise>TASK-employee-crud-sheets:DONE</promise>`

### crew-sheet — starting
