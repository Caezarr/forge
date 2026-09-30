# FORGE Protocol

This document outlines the core discipline protocol that FORGE implements.

## Overview

FORGE is a local-first daily operating system for execution and clean living. The protocol runs entirely in the browser with no account required. Data stays local unless sync is explicitly enabled.

## Morning Ritual OS

The 45-minute launch protocol runs on a sequential timer with:

- **Readiness check** — sets today's mode (push, normal, recovery, minimum)
- **Ritual blocks** — sequential segments (wake-up, movement, cold exposure, focus prep)
- **Adaptive variants** — protocol compresses or switches based on readiness score

The ritual completes before the day's main tasks begin.

## Daily Protocol

- **Main quests** — primary objectives for the day (weighted highest)
- **Side quests** — secondary tasks (moderate weight)
- **Clean quests** — integrity habits and distraction tracking (binary pass/fail)
- **XP and streaks** — accumulated based on quest completion
- **Weighted daily score** — reflects protocol adherence without fake metrics

## Skill Progression

Track current level and target for:

- Bodyweight exercises
- Running
- Deep work sessions
- Reading
- Custom skills

Progress is logged manually. No auto-tracking or gamification beyond what you enter.

## Focus Setup

FORGE provides a practical recipe for real app blocking:

- Apple Screen Time configuration
- Focus Mode setup
- Shortcuts integration
- Browser-based distraction tracking (FORGE cannot block native apps)

## Coach Intelligence Layer

A local coach contract is in place for future AI integration:

- Coach can generate ritual adjustments, weekly reviews, and live nudges
- All coach interactions remain optional
- Offline-first operation is preserved
- Coach layer is not yet active

## Data Model

All data lives in browser localStorage by default:

- Ritual state and history
- Quest logs and completion records
- Skill progression entries
- Clean score tracking
- Weekly review data

### Optional Sync

When enabled, FORGE syncs to a Turso database via API routes. Sync requires:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `FORGE_SYNC_TOKEN` (shared secret)
- `FORGE_STATE_ID` (username)

Sync is pull-on-launch and push-on-change. Conflicts are last-write-wins.

## Wall Display (Future)

Planned `/display` route for Raspberry Pi kiosk mode or ESP32 companion screen. Not yet implemented.

## Principles

- **Local-first** — works without network, auth, or backend
- **Manual entry** — no passive tracking or surveillance
- **No fake motivation** — metrics reflect actual logged behavior
- **Coach-ready** — designed for future AI layer without breaking offline use
- **Privacy by default** — sync is optional, not required
