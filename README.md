# FORGE Monk Mode

Open-source personal discipline protocol. Bodyweight progression, habit tracking, distraction blocking.

No account. No backend. Your data stays on your device.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCaezarr%2Fforge-monk-mode)

## What it does

- **Skill Assessment** — enter your current max (pushups, pull-ups, dips, running, deep work...) and get a progression plan toward your goal
- **Daily Quests** — main quests from your skills, side quests for habits, clean quests for integrity
- **XP & Leveling** — earn XP with a clean multiplier (stay clean = more XP)
- **Monk Score** — weighted score: 50% main quests + 15% side quests + 35% clean score
- **Consistency Heatmap** — GitHub-style tracking for streaks and patterns
- **Access Lock** — complete main quests before unlocking distractions
- **Weekly Review** — stats, what worked, what broke, adjustments

## Deploy

### Vercel (recommended)

1. Fork this repo
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your fork — done

### Local

```bash
git clone https://github.com/Caezarr/forge-monk-mode.git
cd forge-monk-mode
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Stack

- Next.js 15 + App Router
- TypeScript + Tailwind CSS
- localStorage (zero backend)
- PWA-ready (installable on mobile)

## License

MIT
