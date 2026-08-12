# Ralph loop — OpenLawn real screen UI testing

You are inside a Ralph loop. State lives in the filesystem and git, not in chat memory.

## Every iteration

1. Read `docs/ralph/prd.json`.
2. Pick the highest-priority task with `passes: false` and `blocked: false`.
3. Ensure the app is up (`npm run dev` on port 9002). Prefer Firebase emulators when configured.
4. Drive the **real UI** with `computerUse` at the viewports in `prd.json` meta:
   - Start `RecordScreen` when the flow is interactive.
   - Execute that task's acceptance steps only.
   - Save screenshots/recordings under `/opt/cursor/artifacts/ralph/` named `{task-id}-pass|fail-*`.
5. **FAIL path**
   - Append what failed to `docs/ralph/progress.md`.
   - Fix with the smallest code change.
   - Run `npm run typecheck` and `npm run lint`.
   - Retest the **same** scenario on screen.
   - If the same failure repeats twice: set `blocked: true`, fill `block_reason`, commit, continue to the next task.
6. **PASS path**
   - Only after a fresh screenshot proves acceptance: set `passes: true`.
   - Append a short note to `docs/ralph/progress.md`.
   - Commit and push.
   - Emit `<promise>TASK-{id}:DONE</promise>`.
7. If any task remains with `passes: false` and `blocked: false`, continue.
   Otherwise emit `<promise>COMPLETE</promise>` and stop.

## Hard rules

- One scenario per iteration.
- Never mark `passes: true` without a fresh screenshot proving it.
- Prefer fixing product bugs over weakening acceptance criteria.
- Do not invent privacy/reassurance UI copy.
- Do not mutate production data outside the test company; prefer emulators/seed accounts.
- Skip flaky Maps/GPS pixel assertions unless markers/tiles are the acceptance criterion.
- Treat missing credentials/API keys as `blocked`, not infinite retry.
- Max iterations: `2 ×` number of tasks in `prd.json`. Stop if hit.

## Completion signals

- Per task: `<promise>TASK-{id}:DONE</promise>`
- All done (or remaining are blocked): `<promise>COMPLETE</promise>`
