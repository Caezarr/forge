# FORGE

Local-first Life OS for morning execution, clean living, and personal progression.

FORGE turns the first 45 minutes of the day, daily quests, training targets, clean habits, and deep work into one operating instrument. It starts as a private PWA that runs on your phone with no account required. The immediate goal is simple: deploy fast, install on mobile, and make the daily loop feel reliable enough to use every morning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCaezarr%2Fforge)

## What It Does

- **Morning Ritual OS** — adaptive 45 minute launch protocol with readiness check, sequential timer, ritual blocks, and recovery/minimum variants.
- **Daily protocol** — main quests, side quests, clean quests, XP, streaks, and a weighted score.
- **Skill progression** — enter your current level and target for bodyweight, running, deep work, reading, and custom skills.
- **Clean living** — track distractions and integrity habits without pretending the browser can block native apps.
- **Focus setup** — practical Apple Screen Time, Focus Mode, and Shortcuts recipe for real app blocking outside the PWA.
- **Proof loop** — heatmaps, weekly review, progress stats, and local history.
- **Claude-ready coach layer** — a local coach contract is in place so an API coach can later generate rituals, reviews, and adjustments without breaking offline use.
- **Local-first** — works without auth, database, or backend. Optional sync scaffolding can be enabled later.

## Product Direction

FORGE is designed to grow into a personal Life OS:

- **Morning command center** — wake up, run the ritual, see the day's tasks, then start the first deep-work action.
- **Multi-device sync** — complete or update a task on one device and see it on the PWA and phone.
- **Coach layer** — daily planning, weekly review, training adjustment, recovery nudges, and personal-development feedback.
- **Alarm and routine hooks** — wake-up flow, reminders, focus mode, and automation integrations without making the app cloud-dependent by default.
- **Later room display** — once the PWA is solid, a Raspberry Pi or ESP32 screen can become a glanceable wall display for today's protocol.

## Easy Deploy on Vercel

The default deployment needs no environment variables.

1. Click **Deploy with Vercel** above, or import `github.com/Caezarr/forge`.
2. Keep the default install command: `npm install`.
3. Keep the default build command: `npm run build`.
4. Deploy.

FORGE is a static-first PWA. The optional API routes for auth/sync stay disabled unless you provide backend credentials.

After deployment:

1. Open the Vercel URL on your phone.
2. Use the browser share menu to add FORGE to your home screen.
3. Complete onboarding.
4. Run one morning ritual and one daily protocol to confirm local storage works.
5. Keep sync disabled until you have Turso and auth credentials ready.

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

When sync is enabled, the intended flow is:

1. The PWA writes changes locally first.
2. Completed tasks and profile updates are marked dirty.
3. The app pushes changes to `/api/sync`.
4. Other clients pull the latest state and update their local view.

This is the path that will later support reliable multi-device updates.

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

## Later: Wall Display

The wall display is intentionally not the first milestone. FORGE should be excellent on Vercel and mobile PWA before custom hardware work starts.

When the core app is ready, the likely path is a `/display` route first, then Raspberry Pi kiosk mode, and only then a smaller ESP32 companion screen if the experience benefits from dedicated hardware.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- localStorage-first persistence
- PWA manifest + service worker

## License

MIT
