# AGENTS.md

General development commands and architecture are documented in `README.md` and `CLAUDE.md` (dev/build/lint/typecheck scripts, Firebase/Capacitor/AI details). Read those first.

## Cursor Cloud specific instructions

### Services & how to run them (local dev)

OpenLawn is a client-heavy Next.js 15 web app backed by Firebase (Firestore/Auth/Storage). There is no custom backend server. Two services are needed for full local development:

- Next.js dev app: `npm run dev` → http://localhost:9002 (Turbopack).
- Firebase emulators (Auth 9099, Firestore 8080, Storage 9199, Emulator UI 4000): start with an explicit demo project so the CLI does not require a real project or login:
  `npm run firebase:emulators -- --project demo-openlawn`

Run each in its own long-lived process (e.g. a tmux session), not as a one-shot command.

Optional (not required to run the app):
- Genkit AI dev server: `npm run genkit:dev` (Dev UI on http://localhost:3400). Only for developing AI flows in isolation; in-app AI runs via Next.js Server Actions and needs `GOOGLE_AI_API_KEY`.

### Non-obvious gotchas

- Emulator auto-connect: in `src/lib/firebase.ts`, when `NODE_ENV=development` and the host is `localhost`/`127.0.0.1` (or `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`), the client auto-connects to the emulators at `127.0.0.1:9099/8080/9199`. So for localhost dev the emulators effectively MUST be running, or all auth/data calls fail.
- `.env.local` is gitignored and required for Firebase to initialize (`isFirebaseConfigured()` only needs a non-empty `NEXT_PUBLIC_FIREBASE_API_KEY` + `NEXT_PUBLIC_FIREBASE_PROJECT_ID`). The update script recreates a working emulator-mode `.env.local` if it is missing. Using a `demo-` project id keeps the emulators fully offline.
- `firebase-tools` is a project devDependency, so `npm run firebase:*` works after `npm install` (no global install needed). Always pass `--project demo-openlawn` to `emulators:start` — a bare `firebase emulators:start` errors because no default project / `.firebaserc` is configured.
- Google Maps and Google AI keys are optional and left blank by default. Without a valid `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` the map shows a "For development purposes only" watermark / "can't load Google Maps" dialog — this is expected and does not block the rest of the app (customers, crews, routes list, auth all work).
- Roles: signing up as Manager or Admin creates a company and logs in immediately; signing up as Employee lands on a "pending approval" screen (needs a manager to approve), so use Manager/Admin for quick end-to-end testing.
- Build note: `next.config.ts` sets `ignoreBuildErrors: true`, so `npm run build` can pass even with TS errors — use `npm run typecheck` to actually validate types.

### Verified end-to-end

Sign up (Manager, e.g. company "GreenBlade Lawn Care") → manager dashboard → "Add New Customer" persists a customer to the Firestore emulator and it appears in the Customers list. Lint (`npm run lint`) and typecheck (`npm run typecheck`) both pass clean.
