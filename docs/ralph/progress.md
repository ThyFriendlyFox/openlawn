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

### crew-sheet — PASS
- Created Crew Black Widow-850 with Ralph Employee + push-mow; Crews (1)
- Artifacts: `crew-sheet-open.png`, `crew-sheet-pass.png`
- `<promise>TASK-crew-sheet:DONE</promise>`

### route-display — starting

### route-display — PASS
- Map + markers; crew card opens edit/detail; no crash
- Artifacts: `route-display-*.png`
- `<promise>TASK-route-display:DONE</promise>`

### employee-view — starting

### employee-view — PASS
- Employee badge + My Assigned Customers (0); no manager tabs chrome
- Artifact: `employee-view-pass.png`
- `<promise>TASK-employee-view:DONE</promise>`

### profile-schedule-company — starting

### profile-schedule-company — FAIL then PASS
- Attempt 1: Company Settings menu item no-op (sheet not mounted on employee branch)
- Fix: mount CompanySettingsSheet in employee view
- Retest: Profile, Schedule, Company Settings all open/close
- Artifacts: `profile-sheet-open.png`, `schedule-sheet-open.png`, `company-sheet-open.png`, `profile-schedule-company-pass.png`
- `<promise>TASK-profile-schedule-company:DONE</promise>`

### pending-users — starting

### pending-users — PASS
- Opened Pending sheet; approved New Hire; badge 2→1
- Artifacts: `pending-users-open.png`, `pending-users-pass.png`
- `<promise>TASK-pending-users:DONE</promise>`

### service-photos — starting

### service-photos — PASS
- Edit customer → Services & Photos; before/after capture/upload + empty state
- Artifacts: `service-photos-open.png`, `service-photos-pass.png`
- `<promise>TASK-service-photos:DONE</promise>`

### mobile-layout — starting

### mobile-layout — PASS
- iPhone SE viewport; map + customers; Add New Customer reachable; bottom nav present
- Artifacts: `mobile-layout-pass.png`, `mobile-layout-views.png`
- `<promise>TASK-mobile-layout:DONE</promise>`

### sign-out — PASS
- Avatar Sign out → AuthForm; refresh stays logged out
- Artifacts: `sign-out-pass.png`, `sign-out-refresh.png`
- `<promise>TASK-sign-out:DONE</promise>`

## Loop complete
All 13 scenarios `passes: true`, none blocked.
`<promise>COMPLETE</promise>`
