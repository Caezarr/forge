# FORGE

Local-first Life OS with a personal coach for morning execution, clean living, and personal progression.

FORGE turns the first 45 minutes of the day, daily quests, training targets, clean habits, and deep work into one operating instrument. It starts as a private PWA that runs on your phone with no account required. The immediate goal is simple: deploy fast, install on mobile, and make the daily loop feel reliable enough to use every morning.

The long-term vision is a real Life OS: a system that follows what you do, understands your rituals, adapts the plan when the day changes, and coaches you toward the next right action without shame or fake motivation.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCaezarr%2Fforge)

## What It Does

- **Morning Ritual OS** — adaptive 45 minute launch protocol with readiness check, sequential timer, ritual blocks, and recovery/minimum variants.
- **Daily protocol** — main quests, side quests, clean quests, XP, streaks, and a weighted score.
- **Skill progression** — enter your current level and target for bodyweight, running, deep work, reading, and custom skills.
- **Clean living** — track distractions and integrity habits without pretending the browser can block native apps.
- **Focus setup** — practical Apple Screen Time, Focus Mode, and Shortcuts recipe for real app blocking outside the PWA.
- **Proof loop** — heatmaps, weekly review, progress stats, and local history.
- **Coach-ready intelligence layer** — a local coach contract is in place so an API coach can later generate rituals, reviews, adjustments, and live nudges without breaking offline use.
- **Local-first** — works without auth, database, or backend. Optional sync scaffolding can be enabled later.

## Life OS Vision

FORGE is meant to become more than a habit tracker. The goal is a personal operating system that can:

- **Observe your real loop** — morning readiness, quests, clean score, focus sessions, training progress, missed tasks, streaks, and weekly patterns.
- **Coach in context** — suggest the next action based on the current day instead of generic advice.
- **Adapt the plan live** — switch from push mode to recovery mode, compress a ritual when time is short, or move unfinished work into a realistic fallback.
- **Create accountability** — show what was promised, what was done, what slipped, and what needs to change tomorrow.
- **Bridge self-improvement domains** — discipline, sport, work, recovery, learning, sleep hygiene, and personal development in one daily protocol.
- **Stay private by default** — local-first data remains the baseline; cloud sync and AI coaching should be optional layers, not requirements.

The coach should feel like a calm operator: direct, specific, and useful in the moment. Not a chatbot bolted onto a todo list.

## Product Direction

FORGE is designed to grow into a personal Life OS:

- **Morning command center** — wake up, run the ritual, see the day's tasks, then start the first deep-work action.
- **Multi-device sync** — complete or update a task on one device and see it on the PWA and phone.
- **Live coach layer** — daily planning, weekly review, training adjustment, recovery nudges, and personal-development feedback based on actual logged behavior.
- **Alarm and routine hooks** — wake-up flow, reminders, focus mode, and automation integrations without making the app cloud-dependent by default.
- **Later room display** — once the PWA is solid, a Raspberry Pi or ESP32 screen can become a glanceable wall display for today's protocol.

## Quick Deploy

Deploy FORGE to Vercel in one click—no environment variables required.

1. Click **Deploy with Vercel** above, or import `github.com/Caezarr/forge`
2. Deploy with default settings
3. Open the deployment URL on your phone
4. Add to home screen via browser share menu
5. Complete onboarding and run your first morning ritual

FORGE runs local-first by default. All data stays in your browser until you choose to enable sync.

### Optional: Enable sync

To enable cross-device sync, add these environment variables in Vercel:

```bash
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
FORGE_SYNC_TOKEN=your_secret_token
FORGE_STATE_ID=your_username
```

After redeploying, enter your `FORGE_SYNC_TOKEN` in **Settings → Cloud Backup** on each device. For automatic sync without manual token entry, also add `NEXT_PUBLIC_FORGE_SYNC_TOKEN` (note: public variables are visible in the browser bundle).

## Local Development

```bash
git clone https://github.com/Caezarr/forge.git
cd forge
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000). The app works fully offline—no database setup required.

**Note:** `npm run dev` uses webpack. For Turbopack testing, run `npm run dev:turbo`.

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
