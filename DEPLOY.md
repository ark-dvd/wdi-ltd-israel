# Deployment Guide — WDI Ltd Israel

## Prerequisites

- Netlify account with the `wdi-ltd-israel` site configured
- All environment variables set in Netlify UI (see list below)
- GitHub repository connected to Netlify for auto-deploy

---

## Environment Variables (Netlify UI)

Set these in **Netlify > Site settings > Environment variables**:

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXTAUTH_URL` | Yes | `https://wdi-israel.co.il` |
| `NEXTAUTH_SECRET` | Yes | Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Yes | Google Cloud Console > OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Yes | Google Cloud Console > OAuth 2.0 |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | `hrkxr0r8` |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | `production` |
| `SANITY_API_TOKEN` | Yes | Sanity > API > Tokens (Editor role) |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://wdi-israel.co.il` |
| `UPSTASH_REDIS_REST_URL` | Recommended | Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | Recommended | Upstash console |
| `TURNSTILE_SECRET_KEY` | Optional | Cloudflare dashboard |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional | Cloudflare dashboard |
| `ADMIN_ALLOWED_EMAILS` | Optional | Comma-separated emails |

---

## Production Deployment

Production deploys automatically when code is merged to `main`:

1. Push/merge to `main` branch
2. Netlify detects the push and runs `npm run build`
3. Build output (`.next/`) is deployed to the CDN
4. Site is live at `wdi-israel.co.il`

### Manual Deploy

If automatic deploy is disabled or you need to trigger manually:

```bash
# Option 1: Netlify CLI
npx netlify deploy --prod

# Option 2: Trigger via Netlify UI
# Go to Netlify dashboard > Deploys > Trigger deploy
```

---

## Deploy Preview (PRs)

Every pull request gets a deploy preview:

1. Create a PR against `main`
2. CI checks run (lint, type-check, build)
3. Netlify creates a preview deploy at `deploy-preview-{n}--wdi-israel.netlify.app`
4. Review the preview, then merge

---

## Pre-Deploy Checklist

Before merging to production:

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds locally
- [ ] No `.env` files in the commit
- [ ] Environment variables are set in Netlify
- [ ] Test admin login at `/admin` works
- [ ] Verify public pages render correctly

---

## Rollback

If a deploy breaks production:

1. Go to **Netlify > Deploys**
2. Find the last working deploy
3. Click **Publish deploy** on that entry
4. Site reverts immediately (CDN-level, no rebuild needed)

---

## DNS Configuration

The domain `wdi-israel.co.il` should point to Netlify:

- **CNAME:** `wdi-israel.co.il` → `wdi-ltd-israel.netlify.app`
- **SSL:** Managed by Netlify (Let's Encrypt, auto-renewed)
- **HSTS:** Enabled via security headers (max-age=31536000)

---

## Build Configuration

Defined in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## Monitoring

- **Build logs:** Netlify dashboard > Deploys
- **Runtime errors:** Sentry (if `SENTRY_DSN` configured)
- **Rate limiting:** Upstash Redis dashboard
- **CMS:** Sanity Studio at sanity.io/manage
