# FORGE

Local-first daily discipline protocol.

FORGE turns skills, clean living, and deep work into a daily operating instrument. No account is required. Your protocol is stored on your device by default.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCaezarr%2Fforge)

## What it does

- **Daily protocol** — main quests, side quests, clean quests, XP, streaks, and a weighted score.
- **Skill progression** — enter your current level and target for bodyweight, running, deep work, reading, and custom skills.
- **Clean living** — track distractions and integrity habits without pretending the browser can block native apps.
- **Focus setup** — practical Apple Screen Time, Focus Mode, and Shortcuts recipe for real app blocking outside the PWA.
- **Proof loop** — heatmaps, weekly review, progress stats, and local history.
- **Local-first** — works without auth, database, or backend. Optional sync scaffolding can be enabled later.

## Deploy to Vercel

The default deployment needs no environment variables.

1. Click **Deploy with Vercel** above, or import `github.com/Caezarr/forge`.
2. Keep the default install command: `npm install`.
3. Keep the default build command: `npm run build`.
4. Deploy.

FORGE is a static-first PWA. The optional API routes for auth/sync stay disabled unless you provide backend credentials.

### Optional sync backend

Only add these if you want hosted account sync:

```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
```

Without those variables, the app still builds and runs local-first.

## Local development

```bash
git clone https://github.com/Caezarr/forge.git
cd forge
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

`npm run dev` uses webpack because the current Next 16 Turbopack dev server can corrupt the React Client Manifest on this app. If you want to test Turbopack explicitly:

```bash
npm run dev:turbo
```

## Scripts

```bash
npm run dev       # stable local dev server
npm run dev:turbo # experimental Turbopack dev server
npm run build     # production build
npm run start     # production server
npm run lint      # eslint
```

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- localStorage-first persistence
- PWA manifest + service worker

## License

MIT
