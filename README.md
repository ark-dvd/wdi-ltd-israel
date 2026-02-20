# WDI Ltd Israel — Website & Back Office

**Status:** Recovery Phase (REMEDIATION-001)
**Live site:** [wdi.co.il](https://wdi.co.il) (static HTML via Netlify — DO NOT MODIFY)
**Repository:** [github.com/ark-dvd/wdi-ltd-israel](https://github.com/ark-dvd/wdi-ltd-israel)

---

## What This Repo Contains

This repository has **three layers** from different periods of development:

### 1. Legacy Static HTML Site (LIVE)
The site currently serving at wdi.co.il. Pure HTML/CSS/JS deployed on Netlify.

```
*.html (root)          # 28 static pages (index, about, services, projects, etc.)
css/                   # Stylesheets
js/main.js             # Client-side JavaScript
images/                # All image assets (clients, team, projects, press)
videos/hero-video.mp4  # Hero section video
data/                  # JSON content files (team, projects, services, clients, etc.)
```

### 2. Legacy Backoffice (NOT DEPLOYED — SECURITY RISK)
An old admin panel that uses the GitHub API as its database. **Has zero authentication.**

```
wdi-backoffice/        # Next.js (JavaScript) app — DO NOT DEPLOY
```

### 3. New Next.js 14 Application (IN DEVELOPMENT)
The replacement application built per canonical specifications (DOC-000 through DOC-070).

```
src/
  app/(public)/        # 18 public pages (SSR from Sanity CMS)
  app/admin/           # Admin panel (NextAuth-protected)
  app/api/             # 40+ API route handlers (Zod-validated)
  components/          # React components (admin + public)
  hooks/               # Custom React hooks
  lib/                 # Sanity client/schemas, auth, validation, rate limiting
  middleware.ts        # Auth + rate-limit middleware
```

### Supporting Files

```
docs/                  # Canonical specification documents (DOC-000 through DOC-070)
migration/             # Data archaeology archive, design tokens, reconciliation maps
```

---

## Local Development (Next.js App)

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in required values (see Environment Variables below)

# Start development server
npm run dev
```

The app runs at `http://localhost:3000`.

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

### Required for Core Functionality

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | [sanity.io](https://sanity.io) dashboard |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (default: `production`) | Sanity dashboard |
| `SANITY_API_TOKEN` | Sanity write token | Sanity > Settings > API > Tokens |
| `NEXTAUTH_URL` | App URL (dev: `http://localhost:3000`) | Your deployment URL |
| `NEXTAUTH_SECRET` | Session encryption key | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console > OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console > OAuth 2.0 |
| `ADMIN_ALLOWED_EMAILS` | Comma-separated admin emails | Your admin email list |

### Optional (Gracefully Degraded if Missing)

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Sentry error monitoring DSN |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (bot prevention) |

---

## Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Static HTML site | **LIVE** | wdi.co.il |
| Next.js app | **Not deployed** | Pending staging setup |
| Legacy backoffice | **Not deployed** (must stay that way) | N/A |
| Sanity CMS | **Configured** | Project ID: see `.env.local` |

---

## Architecture

The Next.js app follows the canonical architecture defined in DOC-010:

- **Frontend:** Next.js 14 App Router, React 18, Tailwind CSS, TypeScript strict mode
- **CMS:** Sanity (headless) with 15 document schemas
- **Auth:** NextAuth with Google OAuth, email allowlist
- **API:** 40+ route handlers with Zod validation, rate limiting, concurrency control
- **Monitoring:** Sentry (optional), Upstash Redis rate limiting (optional)
- **Forms:** Cloudflare Turnstile bot prevention (optional, falls back to honeypot)

---

## Canonical Documents

All governing specifications live in `docs/`:

| Document | Title | Version |
|----------|-------|---------|
| DOC-000 | System Charter & Product Promise | 1.0 |
| DOC-010 | Architecture & Responsibility Boundaries | 1.0 |
| DOC-020 | Canonical Data Model | 1.1 |
| DOC-030 | Back Office & Operational Model | 1.1 |
| DOC-040 | API Contract & Mutation Semantics | 1.1 |
| DOC-050 | Back Office UX Interaction Contract | 1.0 |
| DOC-060 | Implementation Plan & Execution Roadmap | 1.0 |
| DOC-070 | Product Specification (EN + HE) | 1.0 |
| AUDIT-001 | Canonical Compliance Report | N/A |
| AMENDMENT-001 | CRM Deferred, Intake/Triage Introduced | 1.3 |
| REMEDIATION-001 | Project Recovery Plan | 1.5 |
| FORENSIC-001 | Repository Forensic Freeze | 1.0 |

---

## Brand

- **Primary (blue):** `#1a365d`
- **Secondary (gold):** `#c9a227`
- **Accent:** `#e8b923`
- **Fonts:** Assistant (public site), Heebo (admin)
