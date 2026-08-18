# Routing + scheduling Ralph progress

## Diagnosis
Route generation required preferred days + crew weekday hours + service-type match.
Seeded data and the add-customer default left preferred days empty, so no routes were built.
Schedule UI showed personal hours only; auto-schedule view was never mounted.

## Iterations

### route-data-ready — PASS
- Seeded Lion-100 with weekday hours + 3 Austin yards (push-mow)
- `verify-ralph-routes.js`: Tuesday, 3 stops (Acme, Beta, Cedar)
- `<promise>TASK-route-data-ready:DONE</promise>`
