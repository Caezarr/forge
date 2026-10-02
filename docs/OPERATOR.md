# FORGE Operator Checklist

This document provides the essential checklist for deploying and operating FORGE in production.

## Required Environment Variables

FORGE runs local-first by default with no environment variables required. To enable cross-device sync via Turso database, configure these variables in Vercel:

```bash
# Turso database connection (required for sync)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# Sync authentication (required for sync)
FORGE_SYNC_TOKEN=your-secret-sync-token-min-32-chars
FORGE_STATE_ID=your-username

# Optional: automatic sync without manual token entry
# WARNING: this token is visible in the browser bundle
NEXT_PUBLIC_FORGE_SYNC_TOKEN=your-secret-sync-token-min-32-chars
```

**Important:** Use strong, randomly-generated values for `FORGE_SYNC_TOKEN`. Never commit real credentials to version control.

## Local Development

### Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app works fully offline—no database required.

### Available Scripts

```bash
npm run dev       # stable webpack dev server (recommended)
npm run dev:turbo # experimental Turbopack dev server
npm run build     # production build
npm run start     # run production build locally
npm run lint      # run ESLint
```

### Local Development with Sync

To test sync functionality locally, copy `.env.example` to `.env.local` and replace placeholder values with your Turso credentials:

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token
FORGE_SYNC_TOKEN=test-token-local
FORGE_STATE_ID=your-test-username
```

Run database migrations before first use (see below).

## Database Migrations

FORGE uses Drizzle ORM with Turso (libsql). When sync is enabled, ensure migrations are applied before deploying code changes that modify the schema.

### Drizzle Commands

```bash
npm run db:generate  # generate migration files from schema changes
npm run db:migrate   # apply pending migrations to database
npm run db:push      # push schema directly (dev only, bypasses migrations)
npm run db:studio    # open Drizzle Studio UI
```

### Migration Workflow

1. Make schema changes in `src/lib/db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Review generated SQL in `drizzle/` directory
4. Apply migration: `npm run db:migrate`
5. Commit both schema and migration files

**Note:** On first deployment with sync enabled, migrations run automatically via the API route table creation. For schema changes, always generate and review migrations manually.

## Vercel Deployment

### Deploy

1. Import project from GitHub at [vercel.com/new](https://vercel.com/new)
2. Deploy with default settings (no environment variables required for local-first mode)
3. Add environment variables in Vercel dashboard if enabling sync
4. Redeploy after adding environment variables

### Post-Deploy Smoke Test

After deployment, verify these critical paths:

#### 1. Health Check
```bash
curl https://your-deployment.vercel.app/
```
Should return 200 OK with the home page HTML.

#### 2. PWA Installation
- Open deployment URL on mobile device
- Tap browser share menu
- Select "Add to Home Screen"
- Open installed PWA icon
- Verify app loads and onboarding appears

#### 3. Sync Functionality (if enabled)
- Complete onboarding in PWA
- Navigate to Settings → Cloud Backup
- Enter your `FORGE_SYNC_TOKEN`
- Tap "Backup Now"
- Verify success message appears
- Open PWA on second device
- Enter same sync token in Settings
- Tap "Restore from Cloud"
- Verify data syncs correctly

#### 4. Local-First Operation
- Enable airplane mode on device
- Open PWA
- Complete a quest or ritual block
- Verify data persists locally
- Re-enable network
- Verify sync resumes (if configured)

### Common Issues

**Sync returns 503:** `FORGE_SYNC_TOKEN` not set in Vercel environment variables.

**Sync returns 401:** Token mismatch between device and server `FORGE_SYNC_TOKEN`.

**Database errors:** Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are correct and database is accessible.

**PWA doesn't install:** Check that deployment is served over HTTPS and manifest is accessible at `/manifest.json`.

## Production Checklist

Before marking a deployment as production-ready:

- [ ] Verify deployment URL loads successfully
- [ ] Test PWA installation on iOS and Android
- [ ] Complete onboarding flow end-to-end
- [ ] Test morning ritual timer sequence
- [ ] Complete daily quest and verify XP calculation
- [ ] Verify data persists after closing and reopening PWA
- [ ] Test sync backup and restore (if enabled)
- [ ] Verify offline functionality in airplane mode
- [ ] Check service worker registration in browser DevTools
- [ ] Test on minimum supported browsers (iOS Safari 15+, Chrome 90+)

## Support

For deployment troubleshooting and support resources, see [SUPPORT.md](../SUPPORT.md) in the repository root.
