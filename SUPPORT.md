# Support

FORGE is a local-first Life OS designed for self-hosting and Vercel deployments. This document covers common questions for operators and maintainers.

## Frequently Asked Questions

### Deployment and Environment

**Q: What environment variables do I need?**

FORGE runs local-first by default—no environment variables are required. All data stays in the browser until you enable sync.

To enable cross-device sync, add:

```bash
TURSO_DATABASE_URL=your_database_url
TURSO_AUTH_TOKEN=your_auth_token
FORGE_SYNC_TOKEN=your_secret_token
FORGE_STATE_ID=your_username
```

Optional: Add `NEXT_PUBLIC_FORGE_SYNC_TOKEN` to avoid manual token entry on each device (note: public variables are visible in the browser bundle).

**Q: How do I deploy FORGE?**

- **Vercel (recommended):** Click the Deploy button in the README, or import `github.com/Caezarr/forge` directly. No environment variables required for basic local-first use.
- **Self-host:** Clone the repo, run `npm install && npm run build && npm start`. The app works fully offline.

**Q: Can I run FORGE without a database?**

Yes. FORGE is local-first and stores all data in your browser's localStorage by default. Database sync is optional.

**Q: Does FORGE require authentication?**

No. FORGE runs as a private PWA with no account required. Sync is opt-in.

### Troubleshooting

**Q: Sync isn't working across devices**

1. Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in your Vercel environment variables
2. Confirm you've entered the correct `FORGE_SYNC_TOKEN` in Settings → Cloud Backup on each device
3. Check your deployment logs for database connection errors

**Q: The app isn't loading after deployment**

1. Check Vercel deployment logs for build errors
2. Verify Node.js version compatibility (see `package.json` engines field)
3. Clear your browser cache and try accessing the deployment URL in a private/incognito window

**Q: PWA installation issues on mobile**

1. Access the deployment URL via Safari (iOS) or Chrome (Android)
2. Use the browser's share menu → "Add to Home Screen"
3. For iOS, PWA features require Safari; Chrome on iOS uses Safari's engine but may not support full PWA features

### Getting Help

**Q: Where do I ask questions?**

- **General questions:** Open a [GitHub Discussion](https://github.com/Caezarr/forge/discussions)
- **Bug reports:** Open a [GitHub Issue](https://github.com/Caezarr/forge/issues)
- **Deployment support:** Email gabriel@meetwonka.com

**Q: I found a security vulnerability**

Do not open a public issue. Please see [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

## Resources

- [README](README.md) — Quick start and deployment guide
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — Community guidelines
- [SECURITY.md](SECURITY.md) — Security policy and vulnerability reporting
