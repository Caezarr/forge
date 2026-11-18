# FORGE

[![CI](https://github.com/Caezarr/forge/actions/workflows/ci.yml/badge.svg)](https://github.com/Caezarr/forge/actions/workflows/ci.yml)
[![TypeScript: strict](https://img.shields.io/badge/TypeScript-strict-3178C6.svg)](tsconfig.json)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000.svg)](package.json)
[![local-first](https://img.shields.io/badge/data-local--first-2ea44f.svg)](docs/ARCHITECTURE.md)

A local-first PWA that turns your morning and your day into one executable protocol, with all the rules running in your browser.

## The problem

Habit apps count checkmarks and streaks. They do not tell you what to do this morning, adapt when you slept badly, or raise a training target when you are ready for it. They also tend to need an account and a server before they are useful, which means your daily behaviour data lives on someone else's machine. I wanted a tool that drives the first hour of the day and then the rest of it, and keeps the data on my device.

## How FORGE addresses it

- **A protocol, not a tracker.** A readiness check picks a morning mode (`push`, `normal`, `grounded`, `minimum`, `recovery`) and a sequence of timed ritual blocks. The day is generated as main, side and clean quests, scored and turned into XP and a streak.
- **Progression from history.** Skill targets (bodyweight, running, deep work, reading, custom) move toward your goal over about 12 weeks, scaled by your last-7-day completion, with a deload every fourth week and a volume drop on plateaus.
- **Local-first by construction.** The profile lives in `localStorage`. No account, database or network is needed. Cloud backup is opt-in and the server is never the source of truth.
- **Pure, tested domain layer.** Quest generation, scoring, streaks and progression are deterministic TypeScript functions of the profile and the clock. ESLint rejects any import of storage, platform, server, React or Next from `src/lib/domain`.

Details, with a diagram: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Try it

Needs Node.js 20.9+ (tested with 22; CI uses the current LTS).

```bash
git clone https://github.com/Caezarr/forge.git
cd forge
npm ci
npm run dev
```

Expected output:

```
▲ Next.js 16.4.6 (webpack)
- Local:         http://localhost:3000
✓ Ready in ...
```

Open <http://localhost:3000>, complete onboarding, then run the morning ritual. No environment variables or database are needed; everything is stored in your browser.

To check the rules without the UI:

```bash
npm test
```

```
 ✓ tests/domain/scoring.test.ts (2 tests)
 ✓ tests/domain/progression.test.ts (6 tests)
 ✓ tests/domain/profile.test.ts (8 tests)

 Test Files  3 passed (3)
      Tests  16 passed (16)
```

## How it works

| Layer | Path | Role |
|---|---|---|
| Domain | `src/lib/domain` | Pure rules: types, quests, scoring, progression, morning ritual, coach contract, stats |
| Storage | `src/lib/storage` | `localStorage` profile store with schema migration on read; optional sync client |
| Platform | `src/lib/platform` | Haptics, notifications, service worker |
| Server | `src/lib/server`, `src/app/api` | Optional: Auth.js, Drizzle + libSQL (Turso), `/api/state` backup |
| UI | `src/app`, `src/components` | React 19 views; `page.tsx` owns the `UserProfile` state |

Every change is written to `localStorage` immediately, then pushed to `/api/state` after a 1.2 s debounce if a sync token is set. Day score is 50% main, 15% side, 35% clean quests; a day counts toward the streak at a score of 50 or more. To enable backup, see [docs/OPERATOR.md](docs/OPERATOR.md) and `.env.example`.

## Limits and status

Version 0.1.0, built for personal use.

- Dates are UTC, so "today" rolls over at UTC midnight, not local midnight.
- `/api/state` stores one profile per deployment behind a shared bearer token. Conflict resolution is whole-document last-writer-wins. It is not multi-tenant.
- `/api/sync` (per-user relational sync behind Google sign-in) exists but the UI does not call it yet.
- The coach is only a local contract; no AI coach is wired in.
- A browser cannot block native apps. The Focus view gives an Apple Screen Time / Focus / Shortcuts recipe instead.

## Development

```bash
npm test           # Vitest, domain logic (no browser, no network)
npm run lint       # ESLint, including the domain import boundary
npm run typecheck  # tsc --noEmit, strict
npm run build      # production build
```

CI runs lint, typecheck, tests and build on every pull request. See [docs/PROTOCOL.md](docs/PROTOCOL.md) for the protocol itself and [CONTRIBUTING.md](CONTRIBUTING.md) to contribute.

## License

MIT. See [LICENSE](LICENSE).
