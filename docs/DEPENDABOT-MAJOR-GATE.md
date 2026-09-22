# Dependabot major upgrade gate (Forge)

Companion to issue #26. Open PRs that bump React, ESLint, Next, libsql, etc. stay **gated** until this checklist passes.

## Never blind-merge

Majors can break App Router, ESLint flat config, or SQLite client APIs. Treat each Dependabot major as its own ship.

## Per-PR checklist

1. Create/checkout the Dependabot branch locally or via Codespaces.
2. Clean install (`pnpm` / `npm` as used by the repo lockfile).
3. Run lint + build + any existing unit tests.
4. Smoke the critical paths: daily check-in flow, local data read/write.
5. Skim the upstream changelog for breaking renames.
6. Merge **without squash** only when CI is green and smoke looks good — or close with a pin + note here.

## Currently watching

Track the live Dependabot PRs on the repo (React types, ESLint 10, Next patch/minor vs major, `@libsql/client`). Update this table when a major is accepted or declined:

| Package | Decision | Notes |
|---|---|---|
| _(fill as you triage)_ | | |

## Related

- Issue #26 — planning thread for majors
- `SECURITY.md` — no secrets in upgrade branches
