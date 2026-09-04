# Contributing

Forge is a local-first daily discipline app. Keep PRs small and intentional.

## Setup

```bash
npm install
npm run lint
npm run build
```

## Guidelines

- Prefer several logical commits over one mega-diff.
- Do not commit secrets, `.env`, or local SQLite databases.
- Match existing TypeScript / Next.js patterns under `src/`.
- Update README only when user-facing behavior changes.

## Pull requests

Describe the habit / UX problem you are fixing and how to verify it locally.
