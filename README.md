# WDI Ltd Israel — Website & Admin Panel

**Status:** Production-ready
**Live site:** [wdi-israel.co.il](https://wdi-israel.co.il)
**Repository:** [github.com/ark-dvd/wdi-ltd-israel](https://github.com/ark-dvd/wdi-ltd-israel)

---

## Overview

Corporate website and admin panel for WDI Ltd Israel — a boutique engineering project management firm. Built with Next.js 14, Sanity CMS, and deployed on Netlify.

### Architecture

- **Frontend:** Next.js 14 App Router, React 18, Tailwind CSS, TypeScript strict mode
- **CMS:** Sanity headless CMS (19 document schemas, project `hrkxr0r8`)
- **Auth:** NextAuth with Google OAuth, domain + email allowlist
- **API:** 44 admin route handlers with Zod validation, rate limiting, concurrency control
- **Hosting:** Netlify with ISR (1-hour revalidation)
- **Bot prevention:** Cloudflare Turnstile (falls back to honeypot)
- **Rate limiting:** Upstash Redis

### Repository Structure

```
src/
  app/(public)/        # 18 public pages (ISR from Sanity CMS)
  app/admin/           # Admin panel (NextAuth-protected)
  app/api/             # 44+ API route handlers
  components/          # React components (admin + public)
  lib/                 # Sanity client/schemas, auth, validation, rate limiting
  middleware.ts        # Auth + rate-limit edge middleware
docs/                  # Canonical specification documents (DOC-000 through DOC-070)
images/                # Source images (team, clients, press, projects, branding)
scripts/               # Migration and utility scripts
.github/workflows/     # CI/CD pipeline
```

---

## Local Development

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
cp .env.example .env.local   # Fill in required values
npm run dev                   # http://localhost:3000
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

### Required

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (`hrkxr0r8`) | [sanity.io/manage](https://sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name (`production`) | Sanity dashboard |
| `SANITY_API_TOKEN` | Sanity write token | Sanity > API > Tokens |
| `NEXTAUTH_URL` | App URL | Your deployment URL |
| `NEXTAUTH_SECRET` | Session encryption key | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console |

### Optional (graceful degradation if missing)

| Variable | Description |
|----------|-------------|
| `ADMIN_ALLOWED_EMAILS` | Comma-separated admin email allowlist |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting backend |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Bot prevention |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error monitoring |

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for full deployment procedures.

| Component | Status | URL |
|-----------|--------|-----|
| Public site | Production | wdi-israel.co.il |
| Admin panel | Production | wdi-israel.co.il/admin |
| Sanity CMS | Active | Project ID: hrkxr0r8 |

---

## Security

- **3-layer auth:** Edge middleware + NextAuth JWT + API guard (`withAuth`)
- **CSP:** Restrictive Content-Security-Policy with no `unsafe-eval`
- **Headers:** HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff
- **Validation:** Zod schemas on every API endpoint
- **Rate limiting:** Per-user (admin 60/min), per-IP (public 5/min)
- **Bot prevention:** Cloudflare Turnstile on public forms

---

## Canonical Documents

All specifications in `docs/`:

| Document | Title |
|----------|-------|
| DOC-000 | System Charter & Product Promise |
| DOC-010 | Architecture & Responsibility Boundaries |
| DOC-020 | Canonical Data Model |
| DOC-030 | Back Office & Operational Model |
| DOC-040 | API Contract & Mutation Semantics |
| DOC-050 | Back Office UX Interaction Contract |
| DOC-060 | Implementation Plan & Execution Roadmap |
| DOC-070 | Product Specification |

---

## Brand

- **Primary (blue):** `#1a365d`
- **Secondary (gold):** `#c9a227`
- **Fonts:** Assistant (public), Heebo (admin)
