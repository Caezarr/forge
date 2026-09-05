# Security Policy

## Supported versions

Security fixes land on the latest `main` of Forge.

## What this product handles

Forge is a local-first daily discipline app. It may store habit data and local SQLite state on the user's machine.

Hard rules:

- Never commit `.env`, local SQLite databases, or personal habit exports.
- Prefer local-first storage; do not send raw habit data to third parties without explicit user action.
- Keep Vercel / deploy secrets out of the repo and out of public issues.

## Reporting a vulnerability

Email **gabriel.rance@ensam.eu** with:

- affected commit / deployment
- reproduction steps
- impact (data exposure, auth issues, etc.)

Please **do not** open a public GitHub issue for credential or personal-data bugs.

We aim to acknowledge reports within 5 business days.
