# Ralph loop — routing + scheduling

You are fixing OpenLawn daily routing and scheduling until `docs/ralph/routing-prd.json` tasks pass.

## Why it was broken
- Customers with empty `preferredDays` were never routed
- Crews without weekday `schedule.start/end` were skipped
- Seed data had no crew assignment, no services, no preferred days
- Schedule sheet showed hours only; `ScheduleView` was never mounted

## Every iteration
1. Read `docs/ralph/routing-prd.json`
2. Pick highest-priority `passes: false` / `blocked: false`
3. Ensure emulators + `npm run dev` on :9002
4. `node scripts/seed-ralph-emulators.js && node scripts/verify-ralph-routes.js`
5. Drive the UI with computerUse; save screenshots under `/opt/cursor/artifacts/ralph-routing/`
6. Fix the smallest product bug if FAIL
7. Mark `passes: true` only with screenshot proof
8. Commit + push

Done when all tasks pass: `<promise>COMPLETE</promise>`
