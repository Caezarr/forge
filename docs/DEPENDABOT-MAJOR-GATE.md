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
| `typescript` 6.0.3 → 7.0.2 | **blocked** (draft) | `npx tsc --noEmit` and `next build` (Next 16.4.0) succeed. `npm run lint` fails because `eslint-config-next@16.4.0` loads `typescript-eslint@8.70.0`, which throws on TypeScript major ≥ 7 (`peer typescript: ">=4.8.4 <6.1.0"`). Latest stable `typescript-eslint@8.71.2` and canary `8.71.3-alpha.7` still declare that peer range. Unblock when typescript-eslint ships TypeScript ≥ 7.1 support ([typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940)) and `eslint-config-next` consumes that release. Do not use the TS 6 + TS 7 npm-alias workaround. GitHub Actions v7 (#55, #56) is already on `main`. |

## Related

- Issue #26 — planning thread for majors
- `SECURITY.md` — no secrets in upgrade branches
