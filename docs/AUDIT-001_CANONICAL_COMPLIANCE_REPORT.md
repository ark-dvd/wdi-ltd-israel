# AUDIT-001 — WDI Canonical Compliance Report

**Auditor:** Claude Code (CTO/CPO Simulation)
**Date:** February 19, 2026
**Codebase:** wdi-ltd-israel @ `94f2a89923af4bd094af227c6f4c031acc4aed71`
**Canonical Docs:** DOC-000 v1.0, DOC-010 v1.0, DOC-020 v1.1, DOC-030 v1.1, DOC-040 v1.1, DOC-050 v1.0

---

## Executive Summary

**Compliance Level: Near-Zero.** The wdi-ltd-israel codebase bears almost no resemblance to the system described in the six canonical documents. The canonical specification describes a Next.js 14+ TypeScript application with Sanity CMS, NextAuth authentication, Zod validation, Upstash Redis rate limiting, Sentry monitoring, a full CRM with pipeline management, and a governed API surface. What actually exists is a static HTML website served alongside a JavaScript-only Next.js backoffice that uses the GitHub API as its database, has zero authentication, zero input validation on data endpoints, zero CRM functionality, and active XSS vulnerabilities.

**Security Posture: Critical Liability.** Every single API endpoint is publicly writable. Anyone on the internet can create, modify, or delete all content on wdi.co.il by calling the backoffice API directly. There is no authentication, no authorization, no session management, no rate limiting, no abuse prevention, and no input validation. The January 2026 audit finding of "zero authentication" remains completely unresolved. For a company that has operated for 12 years and stores business data, this is not a technical shortcoming — it is an operational and potentially legal liability under Israeli privacy regulations.

**Production Readiness Verdict: Not production-ready as a governed system.** The current deployment functions as a static marketing site with a cosmetic admin panel. It does not satisfy a single non-negotiable guarantee from DOC-000. The entire system must be rebuilt from the ground up per the canonical specification. The gap between specification and implementation is not a gap — it is a chasm. Every feature described in the canonical documents — Sanity CMS, authentication, CRM, lead tracking, activity logging, pipeline management, optimistic concurrency, governed API surface — is entirely absent from the codebase.

---

## 1. Codebase Structure & Foundation

### 1.1 Framework Assessment

| Requirement (DOC-000 §10.1) | Expected | Actual | Status |
|------------------------------|----------|--------|--------|
| Framework | Next.js 14+ (App Router) | Dual: Static HTML (root) + Next.js 14.2.3 (`wdi-backoffice/`) | 🟡 Partial |
| Language | TypeScript (Strict Mode) | JavaScript only (`jsconfig.json`, no `tsconfig.json`) | 🔴 Missing |
| CMS / Database | Sanity CMS | GitHub API + JSON files in repository | 🔴 Missing |
| Auth | NextAuth + Google OAuth | None | 🔴 Missing |
| Validation | Zod | None | 🔴 Missing |
| Styling | Tailwind CSS | Tailwind CSS 3.4.1 (backoffice) + custom CSS (public) | 🟡 Partial |
| Bot Prevention | Cloudflare Turnstile | None | 🔴 Missing |
| Hosting | Netlify | Netlify (confirmed via `netlify.toml`) | 🟢 Compliant |
| Rate Limiting | Upstash Redis | None | 🔴 Missing |
| Error Monitoring | Sentry | `console.error` only | 🔴 Missing |

**The public website is a static HTML site** — 14 root HTML pages + 8 service detail pages + 13 project detail pages. It is not a Next.js application. It is not server-rendered. Content is loaded client-side from JSON files via `js/main.js`. This fundamentally contradicts DOC-000 §10.1 (Next.js SSR), DOC-000 §6.5 (all content managed by CMS), and DOC-010 §3.1 (Public Website Domain reads from Content Domain).

**The backoffice is a Next.js 14 application** at `/wdi-backoffice/` but written entirely in JavaScript, not TypeScript. DOC-000 §8.7 requires "TypeScript strict mode enforced. Zero suppressions." There are zero suppressions because there is zero TypeScript — the requirement is not met through compliance but through absence of the required technology.

### 1.2 TypeScript Compliance

| Check | Result |
|-------|--------|
| `tsconfig.json` exists | No — `jsconfig.json` instead |
| TypeScript strict mode | N/A — not TypeScript |
| `@ts-ignore` count | 0 (no TypeScript files exist) |
| `@ts-expect-error` count | 0 |
| `@ts-nocheck` count | 0 |
| `as any` count | 0 |

**Verdict:** DOC-000 §8.7 requires TypeScript strict mode. The codebase is JavaScript. This is a foundational defect — not a suppressions issue.

### 1.3 Directory Structure vs. DOC-010 §2.2 Target Architecture

**Expected (DOC-010 §2.2):**
```
app/
├── (public)/          # SSR public pages
├── admin/             # Authenticated admin interface
├── api/
│   ├── admin/         # Protected API routes
│   ├── public/        # Public lead intake
│   └── auth/          # NextAuth routes
├── lib/
│   ├── sanity/        # Sanity client + schemas
│   ├── auth/          # Auth utilities
│   └── data-fetchers/ # Server-side data fetching
└── middleware.ts       # Edge auth middleware
```

**Actual:**
```
/ (root)
├── *.html (14 static HTML pages)
├── css/ js/ images/ data/ videos/ documents/
├── services/*.html (8 pages)
├── projects/*.html (13 pages)
└── wdi-backoffice/
    └── app/
        ├── page.js (dashboard)
        ├── hero/ team/ projects/ services/ clients/
        │   testimonials/ press/ jobs/ content-library/
        │   (each with page.js, new/page.js, [id]/page.js)
        ├── api/
        │   ├── upload/ upload-video/ hero/
        │   ├── team/ projects/ services/ clients/
        │   │   testimonials/ press/ jobs/ content-library/
        │   │   (each with route.js, [id]/route.js)
        └── lib/
            └── github.js
```

**Structural Defects:**
- No `/admin` route prefix — backoffice is its own app, not a route tree under `/admin`
- No `/api/admin/` namespace — all API routes are at `/api/{entity}`
- No `/api/public/` namespace — no public lead intake endpoint
- No `/api/auth/` — no authentication routes
- No `middleware.ts` — no edge authentication
- No `lib/sanity/` — no Sanity integration
- No `lib/auth/` — no auth utilities
- No `lib/data-fetchers.ts` — no server-side data fetching functions
- Two separate deployments (static site + Next.js backoffice) instead of one unified Next.js app

### 1.4 Sanity CMS Integration

**Status: Completely absent.**

- No `sanity.config.ts` or `sanity.config.js`
- No `@sanity/client` dependency in `package.json`
- No Sanity schema files anywhere in the repository
- No GROQ queries
- No Sanity project ID or dataset configuration

Data is stored as JSON files in the GitHub repository under `/data/`. CRUD operations go through `wdi-backoffice/lib/github.js`, which uses the GitHub REST API with a `GITHUB_TOKEN` to read/write files directly to the `ark-dvd/wdi-ltd-israel` repository on the `main` branch.

This is precisely the architecture described in DOC-010 §2.1 defect #2: "GitHub API as database."

### 1.5 Authentication

**Status: Completely absent.** Confirmed — zero change from January 2026 audit.

- No NextAuth configuration
- No `next-auth` in dependencies
- No `[...nextauth]` route
- No `getServerSession` calls anywhere
- No `middleware.ts`
- No Google OAuth configuration
- No email whitelist (`ADMIN_ALLOWED_EMAILS`) enforcement
- No triple-layer enforcement (edge → layout → API guard)
- No session management of any kind

### 1.6 Rate Limiting

**Status: Completely absent.**

- No Upstash Redis dependency
- No rate limiting middleware
- No `@upstash/ratelimit` or equivalent package

### 1.7 Error Monitoring

**Status: Completely absent.**

- No Sentry dependency
- No `@sentry/nextjs` package
- Error handling is `console.error` only (e.g., `wdi-backoffice/lib/github.js` lines 32, 50, 63)

### 1.8 Environment Variables

| Variable | Required By | Validated | Exists in Code |
|----------|------------|-----------|----------------|
| `GITHUB_TOKEN` | `lib/github.js` | No — used directly, no build-time validation | Yes |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | DOC-010 §2.2 | N/A | No |
| `NEXT_PUBLIC_SANITY_DATASET` | DOC-010 §2.2 | N/A | No |
| `SANITY_API_TOKEN` | DOC-010 §2.2 | N/A | No |
| `NEXTAUTH_SECRET` | DOC-010 §2.2 | N/A | No |
| `NEXTAUTH_URL` | DOC-010 §2.2 | N/A | No |
| `GOOGLE_CLIENT_ID` | DOC-010 §2.2 | N/A | No |
| `GOOGLE_CLIENT_SECRET` | DOC-010 §2.2 | N/A | No |
| `ADMIN_ALLOWED_EMAILS` | DOC-010 §2.2 | N/A | No |
| `UPSTASH_REDIS_REST_URL` | DOC-010 §2.2 | N/A | No |
| `UPSTASH_REDIS_REST_TOKEN` | DOC-010 §2.2 | N/A | No |
| `SENTRY_DSN` | DOC-010 §2.2 | N/A | No |
| `TURNSTILE_SECRET_KEY` | DOC-010 §2.2 | N/A | No |

No `.gitignore` file exists in the repository root. This means there is no explicit exclusion of `.env` files, `node_modules`, or build artifacts from version control.

---

## 2. Data Model Compliance

### 2.1 Entity Existence

The canonical data model (DOC-020) defines 15 entity types. The codebase uses JSON files, not Sanity schemas. Here is the complete mapping:

| # | Entity (DOC-020) | Type | Sanity Schema | JSON Data | Back Office UI | API Route | Status |
|---|------------------|------|---------------|-----------|----------------|-----------|--------|
| 1 | Lead | CRM | None | None | None | None | 🔴 Missing |
| 2 | Client (CRM) | CRM | None | None | None | None | 🔴 Missing |
| 3 | Engagement | CRM | None | None | None | None | 🔴 Missing |
| 4 | Activity | CRM | None | None | None | None | 🔴 Missing |
| 5 | CrmSettings | CRM Singleton | None | None | None | None | 🔴 Missing |
| 6 | Service | Content | None | `data/services/` (8 files) | Yes | `/api/services` | 🟡 Partial |
| 7 | Project | Content | None | `data/projects/` (14 files) | Yes | `/api/projects` | 🟡 Partial |
| 8 | TeamMember | Content | None | `data/team/` (18 files) | Yes | `/api/team` | 🟡 Partial |
| 9 | Client (Content) | Content | None | `data/clients-items/` (16 files) | Yes | `/api/clients` | 🟡 Partial |
| 10 | Testimonial | Content | None | `data/testimonials/` (5 files) | Yes | `/api/testimonials` | 🟡 Partial |
| 11 | PressItem | Content | None | `data/press/` (3+ files) | Yes | `/api/press` | 🟡 Partial |
| 12 | Job | Content | None | `data/jobs/` (2+ files) | Yes | `/api/jobs` | 🟡 Partial |
| 13 | ContentLibraryItem | Content | None | `data/content-library/` (6+ files) | Yes | `/api/content-library` | 🟡 Partial |
| 14 | HeroSettings | Content Singleton | None | `data/hero/` | Yes | `/api/hero` | 🟡 Partial |
| 15 | SiteSettings | Content Singleton | None | None | None | None | 🔴 Missing |

**Summary:** 5 of 15 entities completely missing (all CRM entities + SiteSettings). 10 of 15 exist as JSON data but without Sanity schemas, validation, or compliance with DOC-020 field definitions.

### 2.2 Field-Level Deviations (Content Entities)

#### TeamMember (DOC-020 §3.8)

| Field (Canonical) | Expected Name | Actual Name | Compliant |
|-------------------|--------------|-------------|-----------|
| Professional title | `role` | `position` (16 files), `role` (4 files) | 🔴 INV-024 violated |
| Category | `category` | `category` | 🟡 Values non-compliant |
| `isActive` | boolean | Not present in most files | 🔴 Missing |
| `order` | number | Not consistently present | 🟡 Inconsistent |
| `createdAt` | ISO timestamp | Not present | 🔴 Missing |
| `updatedAt` | ISO timestamp | Not present | 🔴 Missing |
| `degrees` | `[{title, degree, institution, year}]` | Unstructured or absent | 🔴 INV-026 violated |
| `slug` | Not in DOC-020 | N/A | — |

**Category values in actual data vs. canonical enum (DOC-020 §3.8, INV-017):**

| Actual Value | Canonical Value | Count | Compliant |
|-------------|----------------|-------|-----------|
| `founders` | `founders` | 2 | 🟢 |
| `management` | `management` | 1 | 🟢 |
| `department-heads` | `department-heads` | 1 | 🟢 |
| `project-managers` | `project-managers` | 1 | 🟢 |
| `admin` | *(not in canonical enum)* | 3 | 🔴 INV-017 |
| `heads` | *(not in canonical enum)* | 2 | 🔴 INV-017 |
| `team` | *(not in canonical enum)* | 8 | 🔴 INV-017 |

The backoffice team page (`wdi-backoffice/app/team/page.js` lines 7-12) defines categories as: `management`, `administration`, `department-heads`, `project-managers`. It does NOT include `founders`. Data files use yet another set of values (`admin`, `heads`, `team`, `founders`). Three competing category systems exist simultaneously — exactly the problem documented in DOC-010 §2.1 defect #7.

#### Project (DOC-020 §3.7)

| Field (Canonical) | Expected Name | Actual Name | Compliant |
|-------------------|--------------|-------------|-----------|
| Sector classification | `sector` | `category` | 🔴 Wrong field name |
| `slug` | URL-safe identifier | `id` (used as filename) | 🟡 Different approach |
| `isActive` | boolean | Not present | 🔴 Missing |
| `order` | number | Not present | 🔴 Missing |
| `createdAt` | ISO timestamp | Not present | 🔴 Missing |
| `updatedAt` | ISO timestamp | Not present | 🔴 Missing |
| `scope` | string array | `services` array | 🟡 Different name |
| `featuredImage` | image reference | `image` (path string) | 🟡 Different structure |

**Sector values in actual data vs. canonical enum (DOC-020 §3.7, INV-013):**

| Actual Value | Canonical Key | Compliant |
|-------------|--------------|-----------|
| `תשתיות` | `infrastructure` | 🟡 Hebrew value, not English key |
| `תעשייה ומסחר` | *(no match — combined value)* | 🔴 INV-013 |
| `ממשלתי` | *(no match — "public" expected)* | 🔴 INV-013 |
| `מסחרי` | `commercial` | 🟡 Hebrew value, not English key |
| `בטחוני` | `security` | 🟡 Hebrew value, not English key |

The backoffice project page (`wdi-backoffice/app/projects/page.js` lines 7-13) uses 5 Hebrew categories: בטחוני, מסחרי, תעשייה, תשתיות, מגורים. The canonical spec requires 6 English keys. Missing entirely: `public` (ציבורי). Data files use yet different values including "תעשייה ומסחר" (combined industrial+commercial) and "ממשלתי" (governmental, not in spec at all).

#### Testimonial (DOC-020 §3.10)

| Field (Canonical) | Expected | Actual | Compliant |
|-------------------|----------|--------|-----------|
| `clientName` | Required | `author` | 🔴 Wrong field name |
| `quote` | Required | `quote` | 🟢 |
| `projectRef` | Required (INV-037) | Not present | 🔴 INV-037 violated |
| `role` | Optional | `position` | 🔴 Wrong field name |
| `isActive` | Required | Not present | 🔴 Missing |
| `isFeatured` | Optional | Not present | 🔴 Missing |
| `id` | Required | Not present as field (filename used) | 🟡 |
| `createdAt` / `updatedAt` | Required | Not present | 🔴 Missing |

Sample testimonial (`data/testimonials/rachel-weiner.json`):
```json
{
  "quote": "...",
  "author": "רחל וינר",       // Should be "clientName"
  "position": "אדריכלות ונוף", // Should be "role"
  "company": "רחל וינר...",
  "logo": "/images/clients/...", // Not in canonical spec
  "letterUrl": "/documents/..."  // Not in canonical spec
}
```

**Every testimonial is project-unbound.** Per DOC-020 v1.1 and INV-037, every testimonial MUST have a `projectRef`. None do.

### 2.3 Singleton Enforcement

| Singleton | INV | Enforced | Mechanism |
|-----------|-----|----------|-----------|
| SiteSettings | INV-014, INV-025 | No — entity doesn't exist | 🔴 |
| HeroSettings | INV-036 | Partially — hardcoded ID `hero-settings` in `api/hero/route.js` | 🟡 |
| CrmSettings | INV-035 | No — entity doesn't exist | 🔴 |

### 2.4 Invariant Compliance Summary

| Invariant | Description | Enforced | Location |
|-----------|-------------|----------|----------|
| INV-001 | Unique immutable ID | 🔴 No | ID auto-generated in `github.js` but not immutable |
| INV-002 | createdAt at persistence | 🔴 No | No timestamps in data files |
| INV-003 | updatedAt on mutation | 🔴 No | No timestamps tracked |
| INV-004 | Lead required fields | 🔴 No | No Lead entity exists |
| INV-005 | Lead status enum | 🔴 No | No Lead entity exists |
| INV-006 | Lead conversion once | 🔴 No | No Lead entity exists |
| INV-007 | Conversion requires "won" | 🔴 No | No Lead entity exists |
| INV-008 | Client CRM email unique | 🔴 No | No Client CRM entity exists |
| INV-009 | Client CRM required fields | 🔴 No | No Client CRM entity exists |
| INV-010 | Client CRM status enum | 🔴 No | No Client CRM entity exists |
| INV-011 | Activity immutability | 🔴 No | No Activity entity exists |
| INV-012 | Activity entity reference | 🔴 No | No Activity entity exists |
| INV-013 | Project sector enum | 🔴 No | Uses "category" with non-canonical values |
| INV-014 | SiteSettings singleton | 🔴 No | Entity doesn't exist |
| INV-015/036 | HeroSettings singleton | 🟡 Partial | Hardcoded ID but no enforcement |
| INV-016 | Service slug unique | 🔴 No | No slug field; no uniqueness check |
| INV-017 | TeamMember category enum | 🔴 No | Non-canonical values in data |
| INV-018 | All enum validation | 🔴 No | No enum validation anywhere |
| INV-019 | No permanent CRM deletion | 🔴 No | No CRM entities exist |
| INV-020 | Activity on CRM mutation | 🔴 No | No Activity entity exists |
| INV-021 | Active Lead per email unique | 🔴 No | No Lead entity exists |
| INV-022 | Status transition matrices | 🔴 No | No status management exists |
| INV-023 | Optimistic concurrency | 🔴 No | No updatedAt checks |
| INV-024 | "role" not "position" | 🔴 No | 16 files use "position" |
| INV-025 | SiteSettings must exist at startup | 🔴 No | Entity doesn't exist |
| INV-026 | Degrees structure | 🔴 No | Unstructured data |
| INV-027 | Bulk operation Activity | 🔴 No | No bulk operations exist |
| INV-030 | Project slug unique | 🔴 No | No slug field |
| INV-033 | Engagement title required | 🔴 No | No Engagement entity exists |
| INV-034 | Engagement references Client | 🔴 No | No Engagement entity exists |
| INV-035 | CrmSettings singleton | 🔴 No | Entity doesn't exist |
| INV-037 | Testimonial.projectRef required | 🔴 No | No projectRef in any testimonial |

**Result: 0 of 37 invariants are fully enforced. 1 partially enforced (INV-036).**

---

## 3. API Surface Compliance

### 3.1 Route Mapping

**Routes that exist in DOC-040 but NOT in code (MISSING):**

| DOC-040 Route | Status |
|---------------|--------|
| `POST /api/public/leads` | 🔴 Missing |
| `GET /api/admin/leads` | 🔴 Missing |
| `GET /api/admin/leads/:id` | 🔴 Missing |
| `POST /api/admin/leads` | 🔴 Missing |
| `PATCH /api/admin/leads/:id` | 🔴 Missing |
| `POST /api/admin/leads/:id/transition` | 🔴 Missing |
| `POST /api/admin/leads/:id/archive` | 🔴 Missing |
| `POST /api/admin/leads/:id/restore` | 🔴 Missing |
| `POST /api/admin/leads/:id/convert` | 🔴 Missing |
| `POST /api/admin/leads/bulk` | 🔴 Missing |
| `GET /api/admin/clients-crm` | 🔴 Missing |
| `GET /api/admin/clients-crm/:id` | 🔴 Missing |
| `POST /api/admin/clients-crm` | 🔴 Missing |
| `PATCH /api/admin/clients-crm/:id` | 🔴 Missing |
| `POST /api/admin/clients-crm/:id/transition` | 🔴 Missing |
| `POST /api/admin/clients-crm/:id/archive` | 🔴 Missing |
| `POST /api/admin/clients-crm/:id/restore` | 🔴 Missing |
| `POST /api/admin/clients-crm/bulk` | 🔴 Missing |
| `GET /api/admin/activities` | 🔴 Missing |
| `GET /api/admin/activities/recent` | 🔴 Missing |
| `POST /api/admin/activities` | 🔴 Missing |
| `GET /api/admin/engagements` | 🔴 Missing |
| `GET /api/admin/engagements/:id` | 🔴 Missing |
| `POST /api/admin/engagements` | 🔴 Missing |
| `PUT /api/admin/engagements/:id` | 🔴 Missing |
| `DELETE /api/admin/engagements/:id` | 🔴 Missing |
| `POST /api/admin/engagements/:id/transition` | 🔴 Missing |
| `GET /api/admin/crm-settings` | 🔴 Missing |
| `PUT /api/admin/crm-settings` | 🔴 Missing |
| `GET /api/admin/crm-search` | 🔴 Missing |
| `GET /api/admin/site-settings` | 🔴 Missing |
| `PUT /api/admin/site-settings` | 🔴 Missing |
| `GET/PUT /api/admin/projects/:id/testimonials` (project-scoped) | 🔴 Missing |
| All `lib/data-fetchers.ts` functions (16 functions) | 🔴 Missing |

**Routes that exist in code but NOT in DOC-040 (UNDOCUMENTED):**

| Actual Route | Notes |
|-------------|-------|
| `GET/POST /api/testimonials` | Should be under `/api/admin/projects/[id]/testimonials` |
| `GET/PATCH/DELETE /api/testimonials/[id]` | Standalone — violates DOC-040 §2.9.5 |

**Routes that exist in BOTH (but non-compliant):**

All 19 existing API routes are under `/api/{entity}` instead of `/api/admin/{entity}`. None have:

| Requirement | Present |
|-------------|---------|
| Authentication enforcement | 🔴 No |
| Input validation (Zod) | 🔴 No |
| Optimistic concurrency (`updatedAt` check) | 🔴 No |
| Status transition enforcement | 🔴 No (N/A — no status fields) |
| Activity generation on CRM mutations | 🔴 No |
| Error envelope format (DOC-040 §4.1) | 🔴 No |
| Success envelope format (DOC-040 §8.1) | 🔴 No |
| Proper HTTP status codes | 🟡 Basic (200/500 only) |

### 3.2 Public Lead Intake (`POST /api/public/leads`)

**Status: Does not exist.** The contact form on the public site uses Netlify Forms (`contact.html`) — which is explicitly prohibited by DOC-010 §3.7 ("Using platform-native features as the primary mechanism for governed functionality... lead intake must go through the CRM, not Netlify Forms").

- No Turnstile abuse prevention
- No duplicate lead detection
- No CRM lead record creation
- No fail-closed behavior

### 3.3 Upload Security

The upload API (`/api/upload/route.js`) has been partially remediated since the January 2026 audit:

- **Folder parameter:** Now validated against an allowlist of 5 paths (line 14). DOC-010 §2.1 defect #4 is **partially resolved**.
- **File type validation:** Checks `image/*` mime type (line 20).
- **Size limit:** 5MB for images (line 25), 25MB for video.
- **Still no authentication:** Anyone can upload files to the repository.

---

## 4. Back Office Compliance

### 4.1 Route Structure

| Requirement | Expected | Actual | Status |
|-------------|----------|--------|--------|
| Location | `/admin` sub-routes | Separate app at `wdi-backoffice/` | 🔴 Non-compliant |
| Default landing | CRM Dashboard (`?tab=dashboard`) | Content stats page | 🔴 Non-compliant |
| URL structure | `?tab=` query params | Full page navigation (`/entity/[id]`) | 🔴 Non-compliant |

### 4.2 Sidebar Structure

**DOC-030 §3.1 requires two clearly separated sections:**

**Expected CMS Section (ניהול תוכן) — 9 tabs:**

| Tab | Expected | Present | Status |
|-----|----------|---------|--------|
| צוות | Yes | Yes | 🟢 |
| פרויקטים | Yes | Yes | 🟢 |
| שירותים | Yes | Yes | 🟢 |
| לקוחות (תוכן) | Yes | Yes (labeled "לקוחות") | 🟡 No "(תוכן)" distinction |
| כתבו עלינו | Yes | Yes | 🟢 |
| משרות | Yes | Yes | 🟢 |
| מאגר מידע | Yes | Yes | 🟢 |
| Hero | Yes | Yes | 🟢 |
| הגדרות אתר | Yes | **No** | 🔴 Missing |

**Expected CRM Section (ניהול לקוחות) — 6 tabs:**

| Tab | Expected | Present | Status |
|-----|----------|---------|--------|
| לוח בקרה | Yes | **No** | 🔴 Missing |
| לידים | Yes | **No** | 🔴 Missing |
| לקוחות CRM | Yes | **No** | 🔴 Missing |
| התקשרויות | Yes | **No** | 🔴 Missing |
| צינור מכירות | Yes | **No** | 🔴 Missing |
| הגדרות CRM | Yes | **No** | 🔴 Missing |

**Defects:**
- No CMS/CRM section headers — single flat navigation list
- No CRM section at all — zero CRM tabs exist
- SiteSettings tab missing
- Testimonials tab EXISTS as standalone (`המלצות`) — per DOC-030 v1.1 §11.5, this was REMOVED. Testimonials should only be managed within Project context. This is a defect.
- Uses emoji icons instead of Lucide/icon components
- "דשבורד" (Dashboard) exists but is a content stats page, not a CRM Dashboard

### 4.3 Missing Features (DOC-030)

| Feature | DOC-030 Section | Status |
|---------|----------------|--------|
| CRM Dashboard with stat cards | §3.3 | 🔴 Missing |
| Pipeline Summary Widget | §3.3 | 🔴 Missing |
| Recent Leads Widget | §3.3 | 🔴 Missing |
| Recent Activity Feed | §3.3 | 🔴 Missing |
| Quick Actions (CRM) | §3.3 | 🔴 Missing |
| Lead List View | §4.1 | 🔴 Missing |
| Lead Detail View | §4.2 | 🔴 Missing |
| Lead Status Transitions | §4.3 | 🔴 Missing |
| Lead Conversion Modal | §4.5 | 🔴 Missing |
| Client (CRM) Management | §5 | 🔴 Missing |
| Engagement Management | §6 | 🔴 Missing |
| Pipeline Kanban View | §7 | 🔴 Missing |
| Activity Timeline | §8 | 🔴 Missing |
| Activity Logging Modal | §8.6 | 🔴 Missing |
| CRM Settings Editor | §9 | 🔴 Missing |
| Global CRM Search | §10 | 🔴 Missing |
| SlidePanel Pattern | §11.1 | 🔴 Not used — full page nav instead |
| Bulk Operations | §12 | 🔴 Missing |
| Optimistic Concurrency UX | §13.5 | 🔴 Missing |
| New Leads Badge (polling) | DOC-050 §25 | 🔴 Missing |
| Portable Text Editor | DOC-050 §18 | 🔴 Missing |
| Error Boundary | DOC-050 §15 | 🔴 Missing |

### 4.4 Hebrew/RTL Compliance

| Check | Result |
|-------|--------|
| `<html lang="he" dir="rtl">` | 🟢 Present in `layout.js` line 24 |
| `direction: rtl` in CSS | 🟢 Present in `globals.css` line 6 |
| Hebrew font (Heebo) | 🟢 Loaded via Google Fonts |
| All labels in Hebrew | 🟢 Confirmed — buttons, headers, messages |
| English strings in admin | 🟡 "Hero" tab label is English, "Back Office" subtitle is English |
| RTL layout throughout | 🟢 Sidebar left, content right (RTL convention) |

**Defects:** "Hero" label in sidebar is English (should be Hebrew per DOC-000 §3). "Back Office" subtitle in sidebar header is English.

---

## 5. Security Assessment

### 5.1 Authentication

| Check | Status | Severity |
|-------|--------|----------|
| NextAuth exists | 🔴 No | Critical |
| Google OAuth configured | 🔴 No | Critical |
| Email whitelist implemented | 🔴 No | Critical |
| Triple-layer enforcement | 🔴 No (0 of 3 layers) | Critical |
| Domain allowlist (@wdiglobal.com, @wdi.co.il, @wdi.one) | 🔴 No | Critical |
| ADMIN_ALLOWED_EMAILS read from env | 🔴 No | Critical |
| Any auth on `/api/` routes | 🔴 No | Critical |

**DOC-010 §2.1 defect #1 ("No authentication whatsoever") is UNRESOLVED.**

All 19 API endpoints are publicly writable. Demonstration: `curl -X DELETE https://{backoffice-url}/api/team/{id}` would delete a team member without any authentication.

### 5.2 Path Injection

**DOC-010 §2.1 defect #4:** The upload API now validates `folder` against an allowlist (`wdi-backoffice/app/api/upload/route.js` line 14):
```javascript
const allowedFolders = ['images', 'images/team', 'images/projects', 'images/clients', 'images/press'];
```

| Finding | Status |
|---------|--------|
| Image upload folder allowlist | 🟢 Resolved |
| Video upload folder hardcoded to 'videos' | 🟢 Resolved |
| Upload still requires no authentication | 🔴 Critical |

### 5.3 XSS Vulnerabilities

**DOC-010 §2.1 defect #6 ("XSS risk — main.js uses innerHTML") is UNRESOLVED.**

`js/main.js` lines 146-157 use `container.innerHTML` with unsanitized template literals:
```javascript
container.innerHTML = filteredProjects.map(project => `
  <a href="/projects/${project.id}.html" ...>
    <span class="project-category">${project.category}</span>
    <h3>${project.title}</h3>
    <p class="project-client">${project.client}</p>
  </a>
`).join('');
```

All data fields (`project.id`, `project.category`, `project.title`, `project.client`) are inserted without HTML escaping. Since the API accepts arbitrary JSON without validation, an attacker could inject malicious HTML/JavaScript through any data field.

Line 215 also joins bio text with `<br>` tags and inserts via innerHTML.

### 5.4 Input Validation

| Route Category | Validation | Status |
|----------------|-----------|--------|
| 17 data CRUD routes | Zero server-side validation | 🔴 Critical |
| Image upload route | File type, size, folder allowlist | 🟢 Present |
| Video upload route | File type, size | 🟢 Present |

No Zod library. No Zod schemas. No `z.object()` anywhere. DOC-000 §10.1 requires Zod for request/schema validation.

### 5.5 Additional Security Findings

| Check | Finding | Severity |
|-------|---------|----------|
| CSRF protection | None | 🔴 Critical |
| Secrets in code | `GITHUB_TOKEN` used but not committed (env var) | 🟢 OK |
| `.gitignore` | **Does not exist** | 🟡 Warning |
| `.git/` deployment | Unclear — static site publishes root dir; `.git/` may be deployed | 🟡 Warning |
| Content Security Policy | None | 🟡 Warning |
| Cookie security | No cookies (no auth = no session cookies) | 🔴 N/A |
| CORS restrictions | None visible | 🟡 Warning |
| Rate limiting (any kind) | None | 🔴 Critical |

### 5.6 January 2026 Defect Resolution Status

| # | Defect (DOC-010 §2.1) | Resolved |
|---|----------------------|----------|
| 1 | No authentication whatsoever | 🔴 UNRESOLVED |
| 2 | GitHub API as database | 🔴 UNRESOLVED |
| 3 | Broken build pipeline (`scripts/update-indexes.js` missing) | ❓ Unverified — script may exist |
| 4 | Path injection vulnerability (upload folder) | 🟢 RESOLVED (allowlist added) |
| 5 | No input validation | 🔴 UNRESOLVED |
| 6 | XSS risk (innerHTML) | 🔴 UNRESOLVED |
| 7 | Data model inconsistency (categories, field names) | 🔴 UNRESOLVED |
| 8 | No TypeScript | 🔴 UNRESOLVED |
| 9 | No tests | 🔴 UNRESOLVED |
| 10 | No error monitoring | 🔴 UNRESOLVED |
| 11 | `.git/` directory deployed | ❓ Unverifiable without production access |
| 12 | Content Library empty | 🟡 PARTIALLY RESOLVED — 6 JSON files exist in `data/content-library/` |

**Resolution Rate: 1 of 12 defects resolved (path injection). 1 partially resolved (content library). 8 unresolved. 2 unverifiable.**

---

## 6. Public Website & SEO

### 6.1 Rendering Architecture

| Requirement | Expected (DOC-000 §10.1) | Actual | Status |
|-------------|--------------------------|--------|--------|
| Server-rendered (SSR) via Next.js | Yes | No — static HTML with client-side JS | 🔴 Non-compliant |
| All content from Sanity CMS | Yes | JSON files + some hardcoded HTML content | 🔴 Non-compliant |
| No hardcoded content | Yes (DOC-000 §6.5) | Service detail pages are hardcoded HTML | 🔴 Non-compliant |

The public site loads data from `/data/` JSON files using `fetch()` in `js/main.js`. Individual service pages (`/services/*.html`) and project pages (`/projects/*.html`) contain hardcoded HTML content — not CMS-managed content.

### 6.2 Page Inventory (DOC-000 §9)

| Route | Expected | Exists | Type | Status |
|-------|----------|--------|------|--------|
| `/` | דף הבית | `index.html` | Static HTML | 🟡 |
| `/about` | אודות | `about.html` | Static HTML | 🟡 |
| `/services` | שירותים | `services.html` | Static HTML | 🟡 |
| `/services/[slug]` | עמוד שירות | `services/*.html` (8 pages) | Hardcoded HTML | 🔴 |
| `/projects` | פרויקטים | `projects.html` | Static HTML | 🟡 |
| `/projects/[slug]` | עמוד פרויקט | `projects/*.html` (13 pages) | Hardcoded HTML | 🔴 |
| `/team` | הצוות | `team.html` | Static HTML | 🟡 |
| `/clients` | לקוחות | `clients.html` | Static HTML | 🟡 |
| `/press` | כתבו עלינו | Not found as separate page | — | 🔴 Missing |
| `/jobs` | משרות | `jobs.html` | Static HTML | 🟡 |
| `/job-application` | הגשת מועמדות | `job-application.html` | Static HTML | 🟡 |
| `/join-us` | הצטרפות למאגר ספקים | `join-us.html` | Static HTML | 🟡 |
| `/content-library` | מאגר מידע | `content-library.html` | Static HTML | 🟡 |
| `/innovation` | חדשנות וטכנולוגיה | `innovation.html` | Static HTML | 🟡 |
| `/contact` | צור קשר | `contact.html` | Static HTML + Netlify Forms | 🟡 |
| `/terms` | תנאי שימוש | **Not found** | — | 🔴 Missing |
| `/privacy` | מדיניות פרטיות | **Not found** | — | 🔴 Missing |
| `/accessibility` | הצהרת נגישות | **Not found** | — | 🔴 Missing |

### 6.3 SEO Compliance

| Requirement (DOC-000 §8.8) | Status |
|-----------------------------|--------|
| Meta tags on every public page | 🟢 Present on main pages |
| Open Graph tags | 🟢 Present (og:type, og:url, og:title, og:description, og:image, og:locale) |
| Canonical URLs | 🟢 `<link rel="canonical">` present |
| Dynamic sitemap | 🟡 Static `sitemap.xml` exists (not dynamically generated) |
| `robots.txt` | 🟢 Present |
| JSON-LD: Organization | 🟢 Present in `index.html` |
| JSON-LD: LocalBusiness | 🔴 Missing |
| JSON-LD: Service | 🔴 Missing |
| JSON-LD: Project | 🔴 Missing |
| JSON-LD: Person | 🔴 Missing |
| JSON-LD: JobPosting | 🔴 Missing |

### 6.4 Hebrew/RTL on Public Site

| Check | Status |
|-------|--------|
| `<html lang="he" dir="rtl">` on all pages | 🟢 Present |
| Hebrew font (Assistant) | 🟢 Loaded via Google Fonts |
| RTL layout throughout | 🟢 CSS custom properties + RTL-aware styles |
| All content in Hebrew | 🟢 Confirmed |

---

## 7. Cross-Document Consistency

### 7.1 DOC-040 §9.2 Invariants vs. DOC-020 §5

All invariants referenced in DOC-040 §9.2 (INV-001 through INV-037) exist in DOC-020 §5. **Consistent.**

### 7.2 DOC-030 Sidebar vs. DOC-020 Entities

| DOC-030 Sidebar Tab | DOC-020 Entity | Consistent |
|---------------------|----------------|------------|
| צוות | TeamMember §3.8 | 🟢 |
| פרויקטים | Project §3.7 | 🟢 |
| שירותים | Service §3.6 | 🟢 |
| לקוחות (תוכן) | Client Content §3.9 | 🟢 |
| כתבו עלינו | PressItem §3.11 | 🟢 |
| משרות | Job §3.12 | 🟢 |
| מאגר מידע | ContentLibraryItem §3.13 | 🟢 |
| Hero | HeroSettings §3.14 | 🟢 |
| הגדרות אתר | SiteSettings §3.15 | 🟢 |
| לוח בקרה | CRM Dashboard (no entity) | 🟢 |
| לידים | Lead §3.1 | 🟢 |
| לקוחות CRM | Client CRM §3.2 | 🟢 |
| התקשרויות | Engagement §3.3 | 🟢 |
| צינור מכירות | Pipeline (Lead view) | 🟢 |
| הגדרות CRM | CrmSettings §3.5 | 🟢 |

**Consistent.**

### 7.3 DOC-040 API Routes vs. DOC-030 Features

Every DOC-040 API route corresponds to a DOC-030 Back Office feature. **Consistent.**

### 7.4 CrmSettings Defaults in DOC-040 §2.7 vs. DOC-030 Labels

| CrmSettings Field | DOC-040 Default | DOC-030 Usage | Consistent |
|-------------------|----------------|---------------|------------|
| pipelineStages labels | ליד חדש, נוצר קשר, מתאים, הצעה נשלחה, נסגר בהצלחה, לא רלוונטי | Used in §7.1 Pipeline | 🟢 |
| serviceTypes | 8 Hebrew service names | Used in §4.2, §6.2 | 🟢 |
| leadSources | 5 Hebrew sources | Used in §4.2 | 🟢 |
| defaultPriority | "medium" (DOC-040) vs "בינוני" (DOC-020, DOC-030) | 🟡 DOC-040 uses English key, others use Hebrew label |

### 7.5 DOC-050 References

DOC-050 references DOC-030 sections (§3.3, §4, §5, §6, §7, §8, §9, §11, §12, §13) and DOC-040 sections (§2.2, §2.3, §2.6, §4.1, §4.3, §8.1). All referenced sections exist. **Consistent.**

### 7.6 Minor Inconsistency Found

DOC-030 §3.1 CMS sidebar (v1.1) lists "Hero" with `Play` icon and `hero` tab param. The public site content entity is "HeroSettings." DOC-030 §11.2 says testimonials are scoped under projects, but the sidebar table still shows `projects` tab param — consistent because testimonials are within the project SlidePanel.

**Overall Cross-Document Consistency: Strong.** The six documents are internally consistent with only one minor discrepancy (English vs. Hebrew key for defaultPriority in DOC-040 §2.7).

---

## 8. Gap Registry

| Gap ID | Document Reference | Expected | Actual | Severity |
|--------|-------------------|----------|--------|----------|
| GAP-001 | DOC-000 §10.1 | TypeScript strict mode | JavaScript only | Critical |
| GAP-002 | DOC-000 §10.1 | Sanity CMS | GitHub API + JSON files | Critical |
| GAP-003 | DOC-000 §10.1 | NextAuth + Google OAuth | Zero authentication | Critical |
| GAP-004 | DOC-000 §10.1 | Zod validation | No validation library | Critical |
| GAP-005 | DOC-000 §10.1 | Upstash Redis rate limiting | No rate limiting | Critical |
| GAP-006 | DOC-000 §10.1 | Sentry error monitoring | console.error only | High |
| GAP-007 | DOC-000 §10.1 | Cloudflare Turnstile | No bot prevention | High |
| GAP-008 | DOC-000 §10.1 | Next.js SSR for public site | Static HTML | Critical |
| GAP-009 | DOC-000 §6.5 | All content from CMS | JSON files + hardcoded HTML | Critical |
| GAP-010 | DOC-000 §8.7 | Zero TypeScript suppressions | Zero TypeScript | Critical |
| GAP-011 | DOC-010 §2.2 | Unified Next.js app | Split: static site + separate Next.js backoffice | Critical |
| GAP-012 | DOC-010 §2.2 | `/api/admin/` namespace | `/api/{entity}` routes | High |
| GAP-013 | DOC-010 §2.2 | `/api/public/leads` | No public lead endpoint | Critical |
| GAP-014 | DOC-010 §2.2 | Edge middleware auth | No middleware.ts | Critical |
| GAP-015 | DOC-010 §2.2 | Triple-layer auth | Zero auth layers | Critical |
| GAP-016 | DOC-010 §2.1 #1 | Authentication required | Zero authentication | Critical |
| GAP-017 | DOC-010 §2.1 #2 | Sanity as database | GitHub API as database | Critical |
| GAP-018 | DOC-010 §2.1 #5 | Input validation | No server-side validation | Critical |
| GAP-019 | DOC-010 §2.1 #6 | No XSS | innerHTML without sanitization in main.js | Critical |
| GAP-020 | DOC-010 §2.1 #7 | Consistent data model | 3 competing category systems | High |
| GAP-021 | DOC-010 §2.1 #8 | TypeScript | JavaScript only | Critical |
| GAP-022 | DOC-010 §2.1 #9 | Tests exist | Zero tests | High |
| GAP-023 | DOC-010 §2.1 #10 | Error monitoring | Console.error only | High |
| GAP-024 | DOC-020 INV-024 | Field name "role" | "position" in 16/20 files | High |
| GAP-025 | DOC-020 INV-013 | 6-value sector enum | "category" with non-canonical values | High |
| GAP-026 | DOC-020 INV-017 | 4-value category enum | Mixed canonical + non-canonical values | High |
| GAP-027 | DOC-020 INV-037 | projectRef required on testimonials | No projectRef field | High |
| GAP-028 | DOC-020 INV-023 | Optimistic concurrency | No updatedAt on any entity | High |
| GAP-029 | DOC-020 §3.1-3.5 | 5 CRM entity types | Zero CRM entities | Critical |
| GAP-030 | DOC-020 §3.15, INV-014, INV-025 | SiteSettings singleton | Entity doesn't exist | High |
| GAP-031 | DOC-030 §3.1 | 9 CMS + 6 CRM sidebar tabs | 10 flat tabs (CMS only, no CRM) | Critical |
| GAP-032 | DOC-030 §3.3 | CRM Dashboard with widgets | Content stats page | Critical |
| GAP-033 | DOC-030 §4-6 | Lead/Client/Engagement management | None | Critical |
| GAP-034 | DOC-030 §7 | Pipeline Kanban view | None | Critical |
| GAP-035 | DOC-030 §8 | Activity timeline | None | Critical |
| GAP-036 | DOC-030 §9 | CRM Settings editor | None | Critical |
| GAP-037 | DOC-030 §10 | Global CRM Search | None | Critical |
| GAP-038 | DOC-030 §11.5 | No standalone Testimonials tab | Standalone tab EXISTS | High |
| GAP-039 | DOC-030 §11.10 | Site Settings editor | None | High |
| GAP-040 | DOC-040 §2.2-2.9 | 30+ governed API endpoints | 19 ungoverned endpoints | Critical |
| GAP-041 | DOC-040 §4.1 | Structured error envelope | Raw error strings | High |
| GAP-042 | DOC-040 §8.1 | Structured success envelope | Raw JSON responses | High |
| GAP-043 | DOC-050 §2 | Deterministic state machine | Ad-hoc state management | High |
| GAP-044 | DOC-050 §3 | In-flight mutation locking | No locking mechanism | High |
| GAP-045 | DOC-050 §15 | Error boundary | No error boundary | Medium |
| GAP-046 | DOC-050 §18 | Portable Text editor | No rich text editing | Medium |
| GAP-047 | DOC-000 §9 | /terms, /privacy, /accessibility pages | Missing | Medium |
| GAP-048 | DOC-000 §8.8 | JSON-LD for 6 Schema.org types | Only Organization | Medium |
| GAP-049 | DOC-000 §8.8 | Dynamic sitemap | Static sitemap.xml | Low |
| GAP-050 | DOC-000 §3 | All UI text in Hebrew | "Hero" and "Back Office" in English | Low |
| GAP-051 | — | `.gitignore` file | Does not exist | Medium |
| GAP-052 | DOC-020 INV-026 | Structured degrees array | Unstructured/absent | Medium |

---

## 9. Mitigation & Refactoring Proposal

### 9.1 Critical — Must Fix Before Any Deployment

These items represent active security vulnerabilities or fundamental architectural gaps that make the system unsafe.

| Priority | Action | Governing Doc | Complexity | Dependencies |
|----------|--------|---------------|------------|--------------|
| C-01 | **Initialize unified Next.js 14+ TypeScript project** — Replace the dual-stack architecture (static HTML + separate Next.js backoffice) with a single Next.js App Router application in TypeScript strict mode. This is the foundational prerequisite for all subsequent work. | DOC-000 §10.1, DOC-010 §2.2 | XL | None — this is the foundation |
| C-02 | **Integrate Sanity CMS** — Set up Sanity project, define all 15 entity schemas per DOC-020, configure read/write clients. Migrate all JSON data from `data/` directory to Sanity documents. This replaces the GitHub API database. | DOC-000 §10.1, DOC-010 §2.2, DOC-020 | XL | C-01 |
| C-03 | **Implement authentication (NextAuth + Google OAuth)** — Configure NextAuth with Google provider, JWT sessions, email whitelist (ADMIN_ALLOWED_EMAILS), domain allowlist (@wdiglobal.com, @wdi.co.il, @wdi.one), and triple-layer enforcement (edge middleware → server layout → API route guard). | DOC-000 §5.6, DOC-010 §3.5, DOC-030 §2.2 | L | C-01 |
| C-04 | **Implement API route protection** — Move all admin routes under `/api/admin/`, add authentication guard to every route. Implement the governed error envelope (DOC-040 §4.1) and success envelope (DOC-040 §8.1). | DOC-040 §2.1, §4.1, §7.1 | L | C-01, C-03 |
| C-05 | **Implement Zod input validation** — Define Zod schemas for every entity matching DOC-020 definitions. Validate all API inputs server-side. Enforce enum values, required fields, and type constraints. | DOC-000 §10.1, DOC-040 §3 | L | C-01, C-02 |
| C-06 | **Fix XSS vulnerabilities** — Replace all `innerHTML` usage in `js/main.js` with safe DOM manipulation or template sanitization. Once the public site is migrated to Next.js SSR (C-01), this file is eliminated entirely. | DOC-010 §2.1 #6 | S | C-01 eliminates the issue |
| C-07 | **Implement public lead intake (`POST /api/public/leads`)** — Build the governed lead submission endpoint with Turnstile verification, duplicate detection, and CRM lead creation. Remove Netlify Forms from the contact page. | DOC-040 §2.2, DOC-010 §5.1 | M | C-01, C-02, C-05 |
| C-08 | **Implement rate limiting (Upstash Redis)** — Configure rate limit tiers: admin 60/min, auth 10/min, public leads 5/min, upload 20/min. | DOC-000 §6.8, DOC-010 §2.2 | M | C-01 |

### 9.2 High — Must Fix Before Production Launch

| Priority | Action | Governing Doc | Complexity | Dependencies |
|----------|--------|---------------|------------|--------------|
| H-01 | **Build complete CRM system** — Implement all 5 CRM entity types (Lead, Client CRM, Engagement, Activity, CrmSettings) with full lifecycle management, status transition enforcement, activity generation, and optimistic concurrency. | DOC-020 §3.1-3.5, DOC-040 §2.2-2.7 | XL | C-01, C-02, C-03, C-04, C-05 |
| H-02 | **Build CRM Back Office** — Implement all 6 CRM sidebar tabs: Dashboard, Leads, Clients CRM, Engagements, Pipeline (Kanban), CRM Settings. Implement SlidePanel pattern, Activity timeline, Activity logging modal, lead conversion, and bulk operations. | DOC-030 §3-10, DOC-050 §6-7, §16-27 | XL | H-01 |
| H-03 | **Build content management Back Office** — Rebuild all CMS tabs under `/admin` with SlidePanel pattern, proper field layouts per DOC-030 §11, and DOC-050 UX contracts. Move testimonials into project context. Remove standalone testimonials tab. | DOC-030 §11, DOC-050 §19 | L | C-01, C-02, C-03 |
| H-04 | **Implement SiteSettings entity** — Create SiteSettings singleton in Sanity, build editor page per DOC-030 §11.10, implement fail-fast on missing (INV-025). | DOC-020 §3.15, DOC-030 §11.10 | M | C-02 |
| H-05 | **Fix data model inconsistencies** — Rename "position" to "role" across all data (INV-024). Rename project "category" to "sector" and map to canonical 6-value enum (INV-013). Map team categories to canonical 4-value enum (INV-017). Add projectRef to all testimonials (INV-037). | DOC-020 §3.7, §3.8, §3.10, INV-013, INV-017, INV-024, INV-037 | M | C-02 |
| H-06 | **Implement optimistic concurrency** — Add updatedAt to all mutable entities. Enforce updatedAt check on every mutation. Implement conflict UX per DOC-050 §4. | DOC-020 INV-023, DOC-050 §4 | M | C-02, C-05 |
| H-07 | **Implement Global CRM Search** — Build search endpoint at `/api/admin/crm-search` with cross-entity search capability. Build search UI per DOC-050 §26. | DOC-030 §10, DOC-040 §2.8 | M | H-01 |
| H-08 | **Implement Sentry error monitoring** — Configure `@sentry/nextjs`, structured logging with correlation IDs. | DOC-010 §2.2 | S | C-01 |
| H-09 | **Add `.gitignore`** — Exclude `.env*`, `node_modules/`, `.next/`, build artifacts. | Best practice | S | None |
| H-10 | **Add test suite** — Unit, integration, and E2E tests. DOC-010 §2.1 defect #9 requires resolution. | DOC-010 §2.1 #9 | L | C-01 |

### 9.3 Medium — Must Fix Before v1.0 Milestone

| Priority | Action | Governing Doc | Complexity | Dependencies |
|----------|--------|---------------|------------|--------------|
| M-01 | **Migrate public site to Next.js SSR** — Replace all 33+ static HTML pages with Next.js server-rendered pages. All content sourced from Sanity. Eliminates main.js, eliminates XSS surface, enables dynamic content. | DOC-000 §10.1, DOC-010 §3.1 | XL | C-01, C-02 |
| M-02 | **Implement complete SEO** — JSON-LD for Organization, LocalBusiness, Service, Project, Person, JobPosting. Dynamic sitemap generation. | DOC-000 §8.8 | M | M-01 |
| M-03 | **Build missing public pages** — /terms, /privacy, /accessibility as CMS-managed content. | DOC-000 §9 | S | M-01 |
| M-04 | **Implement Portable Text editor** — Rich text editing for Project description, Service detailContent, Job description per DOC-050 §18. | DOC-050 §18 | M | C-02, H-03 |
| M-05 | **Implement error boundary** — Top-level error boundary with Hebrew fatal error screen per DOC-050 §15. | DOC-050 §15 | S | C-01 |
| M-06 | **Implement deterministic state machine** — DOC-050 §16 mutation lifecycle for all Back Office forms. | DOC-050 §16 | M | H-03 |
| M-07 | **Implement structured degrees** — TeamMember.degrees array with {title, degree, institution, year} structure per INV-026. | DOC-020 INV-026 | S | C-02 |
| M-08 | **Implement data migration** — Migrate all existing JSON data to Sanity with schema reconciliation per DOC-010 §7. Zero data loss (DOC-000 §6.9). | DOC-010 §7 | L | C-02 |

### 9.4 Low — Improvement Opportunities

| Priority | Action | Governing Doc | Complexity | Dependencies |
|----------|--------|---------------|------------|--------------|
| L-01 | **Replace emoji icons** — Use Lucide icons per DOC-030 §3.1 icon column. | DOC-030 §3.1 | S | H-03 |
| L-02 | **Fix English strings** — "Hero" → Hebrew label, "Back Office" → Hebrew label. | DOC-000 §3 | S | H-03 |
| L-03 | **Dynamic sitemap** — Replace static sitemap.xml with Next.js dynamic generation. | DOC-000 §8.8 | S | M-01 |
| L-04 | **CSP headers** — Add Content Security Policy headers. | Security best practice | S | C-01 |
| L-05 | **Mobile bottom bar** — Implement mobile navigation per DOC-030 §3.2. | DOC-030 §3.2 | S | H-03 |

---

*End of audit report.*
