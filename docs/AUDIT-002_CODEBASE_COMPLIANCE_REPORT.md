# AUDIT-002 — WDI Codebase Compliance Report

**Auditor:** Claude Opus 4.6 (CTO simulation)
**Date:** February 20, 2026
**Codebase:** wdi-ltd-israel @ `ecca4d3` (HEAD after phase-0 cleanup)
**Canonical Docs:** DOC-000 v1.0, DOC-010 v1.0, DOC-020 v1.1, DOC-030 v1.1, DOC-040 v1.1, DOC-050 v1.0, DOC-070 v1.0, CANONICAL-AMENDMENT-001 v1.3

---

## Table of Contents

1. [Build Status](#1-build-status)
2. [Sanity Schema Compliance](#2-sanity-schema-compliance)
3. [API Route Compliance](#3-api-route-compliance)
4. [Authentication Compliance](#4-authentication-compliance)
5. [Public Pages Compliance](#5-public-pages-compliance)
6. [Admin Panel Compliance](#6-admin-panel-compliance)
7. [Intake+Triage Acceptance Criteria](#7-intaketriage-acceptance-criteria)
8. [Data Quality Issues](#8-data-quality-issues)
9. [CRM Features Inventory](#9-crm-features-inventory)
10. [Prioritized Fix List](#10-prioritized-fix-list)

---

## 1. Build Status

| Check | Result | Details |
|-------|--------|---------|
| `npm install` | PASS | Dependencies pre-installed, no errors |
| `npm run build` | **PASS** (exit 0) | 45 pages generated, 44 API routes compiled |
| `npm run type-check` | **PASS** (exit 0) | Zero TypeScript errors |
| `npm run lint` | **PASS** | 1 warning: `@next/next/no-img-element` in `ImageUpload.tsx:80` |

**Build warnings (non-blocking):**
- 22+ log lines: `SANITY_API_TOKEN is not set` — expected without token, mutations will fail at runtime
- 2 log lines: `UPSTASH_REDIS_REST_URL not set — rate limiting disabled` — expected for optional dependency

**Verdict:** Build is clean. Zero blockers.

---

## 2. Sanity Schema Compliance

### 2.1 Required Entity Types (v1.0)

| Entity | Schema Exists? | _type Value | All DOC-020 Fields? | Issues |
|--------|:-:|---|:-:|---|
| TeamMember | YES | `teamMember` | YES | `category` enum has 5 values (includes `administration`) but DOC-020 lists 4 (no `administration`) |
| Project | YES | `project` | YES | Field `sector` matches DOC-020; `scope` is `array of string` (DOC-020 says "tag input" which is compatible) |
| Service | YES | `service` | YES | Has extra fields: `howWdiDoesIt`, `ctaText` (not in DOC-020 but helpful) |
| Client (Content) | YES | `clientContent` | YES | Minimal schema — matches DOC-030 spec exactly |
| Testimonial | YES | `testimonial` | YES | `projectRef` enforced as required reference (INV-037) |
| PressItem | YES | `pressItem` | YES | All fields match |
| JobListing | YES | `job` | YES | `description` and `requirements` are Portable Text arrays |
| ContentLibraryItem | YES | `contentLibraryItem` | YES | All fields match |
| SiteSettings | YES | `siteSettings` | PARTIAL | Missing `seoKeywords` as proper tag list — stored as single string, DOC-030 says "tag input" |
| HeroSettings | YES | `heroSettings` | YES | `videoUrl` is `file` type (correct for Sanity upload) |
| IntakeSubmission | **NO** | — | — | **MISSING** — Required by AMENDMENT-001 |
| AboutPage | YES | `aboutPage` | N/A | Not in DOC-020 but referenced in DOC-030 |
| SupplierFormSettings | YES | `supplierFormSettings` | N/A | Not in DOC-020 but needed for join-us form |

### 2.2 CRM Entity Types (DEFERRED — should be disabled)

| Entity | Schema Exists? | Active in Code? | Issue |
|--------|:-:|:-:|---|
| Lead | YES | YES — full CRUD API routes + admin tab | Must disable |
| ClientCRM | YES | YES — full CRUD API routes + admin tab | Must disable |
| Engagement | YES | YES — full CRUD API routes + admin tab | Must disable |
| Activity | YES | YES — used by all CRM operations | Must disable |
| CrmSettings | YES | YES — full settings tab | Must disable |

### 2.3 Schema Field Compliance Details

**TeamMember — Minor Issues:**
- `category` enum: Code has `founders, management, department-heads, project-managers, administration`. DOC-020/DOC-030 lists only 4 categories (no `administration`). However, real data has admin staff (ירדן וייס "אדמיניסטרציה") so this extra enum value is justified.
- `degrees` structure matches DOC-030: `title, degree, institution, year` — correct.

**Project — Clean:**
- All required fields present: `title, slug, client, sector, description, scope, location, images, featuredImage, isFeatured, startDate, completedAt, order, isActive`
- `sector` enum has all 6 DOC-020 values: security, commercial, industrial, infrastructure, residential, public

**Service — Extra fields (acceptable):**
- `howWdiDoesIt` (array of string) and `ctaText` (string) are not in DOC-020 but add value from legacy HTML content
- `highlights` structure matches DOC-030: `title, description` — correct

**Testimonial — Clean:**
- `projectRef` is a required Sanity reference to `project` — enforces INV-037
- `clientName` and `quote` required — matches DOC-020

---

## 3. API Route Compliance

### 3.1 Content Entity Routes (v1.0 — Required)

| Route | Methods | Auth | Zod | Envelope | Concurrency | Matches DOC-040? | Issues |
|-------|---------|:---:|:---:|:---:|:---:|:---:|---|
| `/api/admin/team` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/team/[id]` | PUT, DELETE | YES | YES | YES | YES | PARTIAL | No GET for single item |
| `/api/admin/projects` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/projects/[id]` | GET, PUT, DELETE | YES | YES | YES | YES | YES | — |
| `/api/admin/projects/[id]/testimonials` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/projects/[id]/testimonials/[tid]` | PUT, DELETE | YES | YES | YES | YES | YES | — |
| `/api/admin/services` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/services/[id]` | PUT, DELETE | YES | YES | YES | YES | PARTIAL | No GET for single item |
| `/api/admin/clients-content` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/clients-content/[id]` | PUT, DELETE | YES | YES | YES | YES | PARTIAL | No GET for single item |
| `/api/admin/press` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/press/[id]` | PUT, DELETE | YES | YES | YES | YES | PARTIAL | No GET for single item |
| `/api/admin/jobs` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/jobs/[id]` | PUT, DELETE | YES | YES | YES | YES | PARTIAL | No GET for single item |
| `/api/admin/content-library` | GET, POST | YES | YES | YES | — | YES | — |
| `/api/admin/content-library/[id]` | PUT, DELETE | YES | YES | YES | YES | PARTIAL | No GET for single item |
| `/api/admin/hero` | GET, PUT | YES | YES | YES | YES | YES | Singleton |
| `/api/admin/about-page` | GET, PUT | YES | YES | YES | YES | YES | Singleton |
| `/api/admin/site-settings` | GET, PUT | YES | YES | YES | YES | YES | Singleton |
| `/api/admin/supplier-form-settings` | GET, PUT | YES | YES | YES | YES | YES | Singleton |
| `/api/admin/upload` | POST | YES | Manual | YES | — | PARTIAL | Rate limit not wired |

**Pattern Issue — Missing single-item GET:** Five `[id]` routes (team, services, clients-content, press, jobs, content-library) only support PUT and DELETE — no GET method. DOC-040 specifies `GET /api/admin/{entity}/:id` should return the full document. The admin panel works around this by refetching via the list endpoint, but this diverges from spec.

### 3.2 Public Routes

| Route | Methods | Auth | Zod | Rate Limit | Issues |
|-------|---------|:---:|:---:|:---:|---|
| `/api/public/leads` | POST | NO | YES | YES (5/min) | Exists but creates `lead` type (CRM). Should be replaced by `/api/public/intake` per AMENDMENT-001 |
| `/api/public/intake` | — | — | — | — | **MISSING** — Required by AMENDMENT-001 |

### 3.3 Special Routes

| Route | Auth | Issues |
|-------|:---:|---|
| `/api/debug/sanity-test` | **NO** | **SECURITY: Publicly accessible diagnostic route.** Not in DOC-040. Exposes document types, field names, write permission probes. Must be removed or auth-gated. |
| `/api/auth/[...nextauth]` | NextAuth | Standard, no issues |

### 3.4 CRM Routes (DEFERRED — must be disabled)

22 CRM route files exist and are fully functional:
- `/api/admin/leads/*` (7 routes)
- `/api/admin/clients-crm/*` (6 routes)
- `/api/admin/engagements/*` (4 routes)
- `/api/admin/activities/*` (2 routes)
- `/api/admin/crm-search` (1 route)
- `/api/admin/crm-settings` (1 route)
- `/api/admin/leads/[id]/convert` (1 route)

### 3.5 Dashboard Routes (Referenced but Missing)

The `DashboardTab.tsx` fetches from 4 API endpoints that **do not exist**:
- `/api/admin/dashboard/stats` — **MISSING**
- `/api/admin/dashboard/pipeline-summary` — **MISSING**
- `/api/admin/dashboard/recent-leads` — **MISSING**
- `/api/admin/dashboard/recent-activity` — **MISSING**

The dashboard tab will show errors when loaded.

### 3.6 Response Envelope Compliance

All admin routes use `apiSuccess`/`apiError`/`listResponse`/`validationError`/`notFoundError`/`serverError` helpers from `src/lib/api/response.ts`.

| DOC-040 Requirement | Implemented? | Notes |
|---|:---:|---|
| Error `category` field | YES | validation, conflict, auth, not_found, server |
| Error `code` field | YES | VALIDATION_FAILED, CONFLICT_DETECTED, etc. |
| Error `message` in Hebrew | PARTIAL | Some messages are Hebrew, some are English |
| `fieldErrors` map | YES | Zod errors mapped to field names |
| `recordErrors` for bulk | YES | Per-record error reporting |
| `retryable` boolean | YES | server errors set `retryable: true` |
| Success `data` field | YES | Full entity state returned |
| List `total, page, limit` | YES | All list endpoints |
| `network_unknown` category | N/A | Client-side construct (not server) |

---

## 4. Authentication Compliance

| DOC-010 §3.5 Requirement | Implemented? | Details |
|---|:---:|---|
| NextAuth with Google OAuth | YES | Single provider in `authOptions` |
| JWT session strategy | YES | `strategy: 'jwt'`, `maxAge: 86400` (24h) |
| Email allowlist (ADMIN_ALLOWED_EMAILS) | YES | Comma-separated env var, checked in `signIn` callback |
| Domain allowlist (@wdiglobal.com, @wdi.co.il, @wdi.one) | YES | `ALLOWED_DOMAINS` array, suffix match |
| Triple-layer enforcement | YES | See below |
| Binary decision (no partial access) | YES | No degraded/anonymous mode |
| No client-side-only auth | YES | All layers are server-side |

### Triple-Layer Enforcement

| Layer | File | Mechanism | Status |
|-------|------|-----------|:---:|
| 1. Edge Middleware | `src/middleware.ts` | `getToken()` from `next-auth/jwt`. Protects `/admin/:path*` and `/api/admin/:path*`. Fail-closed: 401 JSON for API, redirect for pages. | YES |
| 2. Server Layout | `src/app/admin/(panel)/layout.tsx` | `getServerSession(authOptions)`. Redirects to login if no session. | YES |
| 3. API Route Guard | `src/lib/auth/guard.ts` | `withAuth()` HOF wrapping every admin route handler. Calls `getServerSession`. Returns `unauthorizedError()`. | YES |

### Rate Limiting (DOC-010)

| Tier | Spec | Implemented? | Wired? |
|------|------|:---:|:---:|
| Admin: 60/min | `adminRateLimit` defined | YES | **NO** — not called in any admin route |
| Auth: 10/min | `authRateLimit` defined | YES | **NO** — not called in NextAuth route |
| Public leads: 5/min | `publicLeadRateLimit` defined | YES | YES — called in `public/leads` |
| Upload: 20/min | `uploadRateLimit` defined | YES | **NO** — not called in upload route |

**Issue:** Rate limiting is defined in `src/lib/rate-limit.ts` but only wired into one route (`public/leads`). The other three tiers are unused. This is acceptable if Upstash is deferred to v1.1, but the wiring should be added now even if Upstash env vars are optional.

---

## 5. Public Pages Compliance

### 5.1 Route Coverage (DOC-000 §9)

| Route | Page Exists? | SSR from Sanity? | SEO Meta? | JSON-LD? | Hebrew RTL? | Issues |
|-------|:---:|:---:|:---:|:---:|:---:|---|
| `/` | YES | YES (6 parallel fetches) | YES | `LocalBusiness`, `Review` | YES | — |
| `/about` | YES | **NO** (hardcoded) | Static only | None | YES | **DOC-000 §6.5 violation: hardcoded content** |
| `/services` | YES | YES | Static | None | YES | No dynamic metadata |
| `/services/[slug]` | YES (SSG) | YES | `generateMetadata` | `Service`, `FAQ` | YES | — |
| `/projects` | YES | YES | Static | None | YES | — |
| `/projects/[slug]` | YES (SSG) | YES | `generateMetadata` | `Project`, `Review` | YES | — |
| `/team` | YES | YES | Static | `Person` | YES | — |
| `/clients` | YES | YES | Static | `Review` | YES | — |
| `/press` | YES | YES | Static | None | YES | No `ArticleJsonLd` |
| `/jobs` | YES | YES | Static | `JobPosting` | YES | — |
| `/job-application` | YES | NO (form) | Static | None | YES | — |
| `/join-us` | YES | NO (form) | Static | None | YES | — |
| `/content-library` | YES | YES | Static | None | YES | — |
| `/innovation` | YES | **NO** (hardcoded) | Static | None | YES | **DOC-000 §6.5 violation: hardcoded content** |
| `/contact` | YES | NO (form) | Static | `LocalBusiness` | YES | — |
| `/terms` | YES | **NO** (hardcoded) | Static | None | YES | Acceptable — legal text |
| `/privacy` | YES | **NO** (hardcoded) | Static | None | YES | Acceptable — legal text |
| `/accessibility` | YES | **NO** (hardcoded) | Static | None | YES | Acceptable — legal text |

### 5.2 SEO Compliance (DOC-000 §8.8)

| Requirement | Status | Notes |
|---|:---:|---|
| JSON-LD: Organization | YES | Via `OrganizationJsonLd` in public layout |
| JSON-LD: LocalBusiness | YES | Homepage + contact page |
| JSON-LD: Service | YES | Service detail pages |
| JSON-LD: Project (CreativeWork) | YES | Project detail pages |
| JSON-LD: Person | YES | Team page |
| JSON-LD: JobPosting | YES | Jobs page |
| Dynamic sitemap | YES | `src/app/sitemap.ts` with static + dynamic routes |
| robots.txt | YES | Disallows `/admin`, `/api` |
| Open Graph tags | YES | Root layout sets `og:locale`, `og:type`, twitter card |
| Canonical URLs | PARTIAL | Some pages set canonical, not all |

### 5.3 Form Submission Architecture

| Form | Route | Submits To | Issue |
|------|-------|-----------|---|
| Contact | `/contact` | `POST /api/public/leads` | Creates a CRM `lead` doc — should create `intakeSubmission` (type: general) |
| Job Application | `/job-application` | Netlify Forms (POST to `/`) | Not via API — **AMENDMENT-001 requires `/api/public/intake`** |
| Supplier | `/join-us` | Netlify Forms (POST to `/`) | Not via API — **AMENDMENT-001 requires `/api/public/intake`** |

### 5.4 TypeScript Suppression Check (DOC-000 §8.7)

| Pattern | Count | Status |
|---------|:---:|:---:|
| `@ts-ignore` | 0 | PASS |
| `@ts-expect-error` | 0 | PASS |
| `@ts-nocheck` | 0 | PASS |
| `as any` | 0 | PASS |

**Zero TypeScript suppressions.** Full compliance with DOC-000 §8.7.

---

## 6. Admin Panel Compliance

### 6.1 CMS Tabs (DOC-030)

| Tab | Exists? | List | Create | Edit | Delete | SlidePanel? | Matches DOC-030? | Issues |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| צוות (Team) | YES | YES | YES | YES | YES | YES | YES | — |
| פרויקטים (Projects) | YES | YES | YES | YES | YES | YES (wide) | YES | Embedded testimonial CRUD present |
| שירותים (Services) | YES | YES | YES | YES | YES | YES (wide) | YES | — |
| לקוחות תוכן (Clients) | YES | YES | YES | YES | YES | YES | YES | — |
| כתבו עלינו (Press) | YES | YES | YES | YES | YES | YES | YES | — |
| משרות (Jobs) | YES | YES | YES | YES | YES | YES | YES | — |
| מאגר מידע (Content Library) | YES | YES | YES | YES | YES | YES | YES | — |
| Hero | YES | YES | — | YES | — | NO (inline) | YES | Singleton — correct |
| הגדרות אתר (Site Settings) | YES | YES | — | YES | — | NO (inline) | YES | Singleton — correct |
| אודות (About Page) | YES | YES | — | YES | — | NO (inline) | YES | Singleton — correct |
| הגדרות טופס ספקים (Supplier) | YES | YES | — | YES | — | NO (inline) | YES | Singleton — correct |
| **תיבת פניות (Intake Inbox)** | **NO** | — | — | — | — | — | — | **MISSING — Required by AMENDMENT-001** |

### 6.2 CRM Tabs (DEFERRED — should be hidden)

| Tab | Exists? | Visible in Sidebar? | Must Disable |
|-----|:---:|:---:|:---:|
| לוח בקרה (Dashboard) | YES | YES | YES |
| לידים (Leads) | YES | YES | YES |
| לקוחות CRM (Clients CRM) | YES | YES | YES |
| התקשרויות (Engagements) | YES | YES | YES |
| צינור מכירות (Pipeline) | YES | YES | YES |
| חיפוש CRM (CRM Search) | YES | YES | YES |
| הגדרות CRM (CRM Settings) | YES | YES | YES |

### 6.3 UX Compliance (DOC-050)

| DOC-050 Rule | Implemented? | Notes |
|---|:---:|---|
| Request lifecycle state machine | YES | `useRequestLifecycle` hook implements idle→in_flight→success/error/network_unknown |
| Double-submit prevention | YES | `inFlightRef` in hook prevents concurrent calls |
| 8-second timeout → network_unknown | **NO** | No explicit timeout in `useRequestLifecycle` — relies on browser/fetch default |
| Optimistic concurrency (updatedAt) | YES | All mutation forms send `updatedAt` |
| Conflict (409) display | YES | Error envelope rendering handles conflict category |
| Replace Rule (not merge) | YES | All tabs replace entire entity state from API response |
| No optimistic updates | YES | State only changes after API confirmation |
| SlidePanel from left (RTL) | YES | `SlidePanel` component uses left-side slide |
| Hebrew error messages | PARTIAL | Some API messages are Hebrew, some English |
| No toast as sole success indicator | PARTIAL | Toast is used but also inline state updates |
| Unsaved changes warning | YES | `useUnsavedChanges` on all singleton tabs |
| Portable Text editor | **MINIMAL** | `RichTextEditor` converts PT to/from plain text (no formatting toolbar). DOC-050 §18 requires full block type support (headings, bold, italic, links, lists, etc.) |
| Error boundary | YES | `ErrorBoundary` wraps admin shell |
| Auto-dismiss errors | NO (correct) | Errors persist until corrective action |
| Pagination in URL params | YES | `?tab=` + `?page=` used |

---

## 7. Intake+Triage Acceptance Criteria

Per CANONICAL-AMENDMENT-001 §3, evaluating IT-AC-1 through IT-AC-7:

| Criterion | Required | Status | Details |
|-----------|----------|:---:|---|
| IT-AC-1: IntakeSubmission entity with 3 types | `intakeSubmission` schema with general/job_application/supplier_application | **FAIL** | Schema does not exist |
| IT-AC-2: Public endpoint `/api/public/intake` | POST accepting submissions, validates by type | **FAIL** | Endpoint does not exist |
| IT-AC-3: Admin list endpoint `/api/admin/intake` | GET with filters, pagination, sort | **FAIL** | Endpoint does not exist |
| IT-AC-4: Admin detail endpoint `/api/admin/intake/[id]` | GET with full submission + audit trail | **FAIL** | Endpoint does not exist |
| IT-AC-5: Admin patch endpoint `/api/admin/intake/[id]` | PATCH for triage fields, generates audit trail | **FAIL** | Endpoint does not exist |
| IT-AC-6: Intake Inbox screen in Back Office | List + filters + detail + triage editing | **FAIL** | Tab does not exist |
| IT-AC-7: Three public forms submit to `/api/public/intake` | Contact, job-application, join-us forms | **FAIL** | Contact uses old leads API; other two use Netlify Forms |

**Intake+Triage: 0/7 acceptance criteria met.** The entire intake system needs to be built.

---

## 8. Data Quality Issues

Status of the 12 known issues from FORENSIC-001 §7.2:

| # | Issue | Status | Action Needed |
|---|---|:---:|---|
| 1 | `ilan-weiss.json`: birthPlace contains "1971" | OPEN | Fix in Sanity migration |
| 2 | 7 team files with AI-generated placeholder photos | OPEN | Replace with real photos (owner action) |
| 3 | Duplicate אריק-דוידי entries (Hebrew + English filenames) | OPEN | Deduplicate during Sanity migration |
| 4 | Position mismatches (ori-davidi, rotem-glick, eyal-nir, yarden-weiss) | OPEN | Resolve with owner during data migration |
| 5 | Inconsistent Hebrew spelling: "פרוייקט" vs "פרויקט" | OPEN | Normalize during migration |
| 6 | `permits.json` icon mismatch (stamp vs file-signature) | OPEN | Resolve during migration |
| 7 | `david-band.json` company name mismatch (מונרה vs מנורה) | OPEN | Fix during migration |
| 8 | `hero-settings.json` partial duplicate of `hero.json` | OPEN | Consolidate during Sanity migration |
| 9 | 13 project pages reference missing images in `images/projects/` | OPEN | Owner must provide project photos |
| 10 | 3 clients missing individual files (Noble Energy, IDF, PMEC) | OPEN | Add during migration |
| 11 | Jobs: 3 in JSON vs 7 in HTML (HTML authoritative) | OPEN | Extract all 7 from HTML during migration |
| 12 | Team aggregate (12) vs individual files (18) mismatch | RESOLVED | Test record removed in phase-0; remaining 17 are real data with differing schemas |

**Note:** Issues 1-11 are data issues in the legacy JSON files. They will be resolved during Sanity data migration (Phase 2). They do not affect the Next.js codebase itself.

---

## 9. CRM Features Inventory (for Isolation)

### 9.1 CRM Sanity Schemas (5 files)

| File | Schema Type | Lines |
|------|-----------|:---:|
| `src/lib/sanity/schemas/lead.ts` | `lead` | ~120 |
| `src/lib/sanity/schemas/client-crm.ts` | `clientCrm` | ~80 |
| `src/lib/sanity/schemas/engagement.ts` | `engagement` | ~100 |
| `src/lib/sanity/schemas/activity.ts` | `activity` | ~90 |
| `src/lib/sanity/schemas/crm-settings.ts` | `crmSettings` | ~110 |

### 9.2 CRM API Routes (22 files)

| Directory | Files | Routes |
|-----------|:---:|---|
| `src/app/api/admin/leads/` | 7 | list, create, detail, update, archive, restore, convert, transition, bulk |
| `src/app/api/admin/clients-crm/` | 6 | list, create, detail, update, archive, restore, transition, bulk |
| `src/app/api/admin/engagements/` | 4 | list, create, detail, update, delete, transition |
| `src/app/api/admin/activities/` | 2 | list, create, recent |
| `src/app/api/admin/crm-search/` | 1 | search across entities |
| `src/app/api/admin/crm-settings/` | 1 | get, upsert |
| `src/app/api/public/leads/` | 1 | public lead intake (to be replaced by intake) |

### 9.3 CRM Admin Tabs (7 files)

| File | Tab |
|------|-----|
| `src/components/admin/tabs/crm/DashboardTab.tsx` | CRM Dashboard |
| `src/components/admin/tabs/crm/LeadsTab.tsx` | Leads management |
| `src/components/admin/tabs/crm/ClientsCrmTab.tsx` | CRM Clients |
| `src/components/admin/tabs/crm/EngagementsTab.tsx` | Engagements |
| `src/components/admin/tabs/crm/PipelineTab.tsx` | Pipeline Kanban |
| `src/components/admin/tabs/crm/CrmSearchTab.tsx` | CRM Search |
| `src/components/admin/tabs/crm/CrmSettingsTab.tsx` | CRM Settings |

### 9.4 CRM Navigation Items

In `AdminSidebar.tsx`, the CRM section has 7 items:
- לוח בקרה (Dashboard)
- לידים (Leads) — with new lead count badge
- לקוחות CRM (Clients CRM)
- התקשרויות (Engagements)
- צינור מכירות (Pipeline)
- חיפוש CRM (CRM Search)
- הגדרות CRM (CRM Settings)

In `AdminShell.tsx`, the `TAB_MAP` includes all 7 CRM tab keys plus lead polling logic.

### 9.5 CRM Supporting Code

| File | CRM Dependencies |
|------|-----------------|
| `src/lib/api/transitions.ts` | `LEAD_TRANSITIONS`, `CLIENT_TRANSITIONS`, `ENGAGEMENT_TRANSITIONS` maps |
| `src/lib/api/activity.ts` | Activity creation helper used by all CRM routes |
| `src/lib/validation/schemas.ts` | CRM entity schemas (`leadSchema`, `clientCrmSchema`, `engagementSchema`, `activitySchema`, `crmSettingsSchema`) |
| `src/lib/validation/input-schemas.ts` | CRM input schemas (`leadAdminCreateSchema`, `leadUpdateSchema`, `transitionSchema`, `archiveSchema`, `leadConvertSchema`, `clientCrmCreateSchema`, `clientCrmUpdateSchema`, `engagementCreateSchema`, etc.) |
| `src/lib/rate-limit.ts` | `publicLeadRateLimit` (used by leads route) |

### 9.6 Isolation Strategy

**Recommended approach: Hide, don't delete.**

1. **AdminSidebar.tsx**: Remove CRM section items (7 nav items)
2. **AdminShell.tsx**: Remove CRM keys from `TAB_MAP` (7 entries), remove lead polling
3. **Mobile bottom bar**: Replace CRM items (Dashboard, Pipeline) with CMS items
4. **CRM API routes**: Leave in place but add comment headers marking them as deferred. They're already auth-gated so they're not a security risk.
5. **CRM schemas**: Leave in `schemas/index.ts` but comment them out of `allSchemas` array
6. **Public leads route**: Will be replaced by intake route

---

## 10. Prioritized Fix List

### P0 — Blocks Deployment (Security / Build)

| # | Issue | Location | Effort |
|---|---|---|---|
| P0-1 | **Remove `/api/debug/sanity-test` route** — publicly accessible, exposes schema internals, probes write permissions | `src/app/api/debug/sanity-test/route.ts` | 1 min (delete file) |
| P0-2 | **Hide CRM features from admin UI** — deferred per AMENDMENT-001, should not be visible to operators | `AdminSidebar.tsx`, `AdminShell.tsx` | 30 min |
| P0-3 | **Wire rate limiting to admin routes** — all admin routes have zero rate limiting; only `public/leads` is rate-limited. Even with Upstash deferred, the no-op fallback should be called. | All admin route files + upload route | 2 hr |

### P1 — Core Functionality Broken

| # | Issue | Location | Effort |
|---|---|---|---|
| P1-1 | **Build IntakeSubmission system** — 0/7 acceptance criteria met. Need: schema, public endpoint, admin endpoints, admin tab, form rewiring | New files across schemas, routes, components | 8 hr |
| P1-2 | **Dashboard tab references 4 missing API routes** — `/api/admin/dashboard/*` don't exist, tab will error | `DashboardTab.tsx` + missing route files | 2 hr (or remove dashboard tab if CRM is deferred) |
| P1-3 | **RichTextEditor is plain-text only** — DOC-050 §18 requires full Portable Text editing (headings, bold, italic, links, lists, images). Current implementation just converts lines to paragraphs. | `src/components/admin/RichTextEditor.tsx` | 4 hr (integrate proper PT editor) |
| P1-4 | **About page is hardcoded** — DOC-000 §6.5 requires all visible content be CMS-managed. About page renders static HTML instead of fetching from Sanity `aboutPage` singleton. | `src/app/(public)/about/page.tsx` | 1 hr |
| P1-5 | **Innovation page is hardcoded** — Same issue as about page. No CMS integration, no Sanity schema for innovation content. | `src/app/(public)/innovation/page.tsx` | 2 hr (need schema + page update) |
| P1-6 | **Contact form creates CRM `lead` instead of `intakeSubmission`** — per AMENDMENT-001, should use intake system | `src/components/public/ContactForm.tsx` | Part of P1-1 |
| P1-7 | **Job application form uses Netlify Forms** — should submit to `/api/public/intake` | `src/components/public/JobApplicationForm.tsx` | Part of P1-1 |
| P1-8 | **Supplier form uses Netlify Forms** — should submit to `/api/public/intake` | `src/components/public/SupplierForm.tsx` | Part of P1-1 |

### P2 — Spec Compliance Gaps

| # | Issue | Location | Effort |
|---|---|---|---|
| P2-1 | **Missing single-item GET on 5 entity routes** — team, services, clients-content, press, jobs, content-library `[id]` routes have no GET handler | 5 route files | 2 hr |
| P2-2 | **8-second timeout not implemented** — DOC-050 §5 requires network_unknown after 8s. `useRequestLifecycle` has no explicit timeout. | `src/hooks/useRequestLifecycle.ts` | 30 min |
| P2-3 | **Some API error messages in English** — DOC-050 §9 requires all error messages in Hebrew | Various API route files | 1 hr |
| P2-4 | **`siteSettings.seoKeywords` is a single string** — DOC-030 says "tag input" (should be array of strings) | Schema + admin tab | 30 min |
| P2-5 | **Upload route missing rate limiting** — `uploadRateLimit` is defined but not called | `src/app/api/admin/upload/route.ts` | 10 min |
| P2-6 | **No Intake Inbox admin tab** — AMENDMENT-001 requires a new tab in the Intake section | New component file | Part of P1-1 |
| P2-7 | **Missing `aboutPage` GET endpoint** — About page tab uses inline fetch but spec implies a standard admin endpoint | `src/app/api/admin/about-page/route.ts` | Exists (GET+PUT) — no issue |
| P2-8 | **Canonical URL not on all pages** — Some dynamic pages have it, static pages do not | Various page files | 1 hr |

### P3 — Quality / Polish

| # | Issue | Location | Effort |
|---|---|---|---|
| P3-1 | **ESLint warning: `<img>` in ImageUpload** — should use `next/image` for consistency | `src/components/admin/ImageUpload.tsx:80` | 15 min |
| P3-2 | **Lead polling in admin shell** — polls `/api/admin/leads` every 60s even when CRM is deferred | `AdminShell.tsx` | 10 min (remove with CRM isolation) |
| P3-3 | **Mobile bottom bar has CRM items** — Dashboard and Pipeline should be replaced with CMS items | `AdminSidebar.tsx` | 15 min |
| P3-4 | **`DAFLASH-ARCHITECTURAL-INTELLIGENCE-REPORT.md` and `structure.txt` in repo root** — debug/internal files that shouldn't be in production | Root directory | 5 min (delete) |
| P3-5 | **Legacy static HTML files coexist** — 28 HTML files, 3 CSS files, `js/main.js` still in repo root. Safe for now (netlify.toml redirects handle it) but should be cleaned post-launch. | Root directory | Listed in `MIGRATION_CLEANUP.md` |
| P3-6 | **Legacy `wdi-backoffice/` directory** — 46 files with zero-auth admin panel. Not deployed but shouldn't ship in production. | `wdi-backoffice/` | Phase 3+ cleanup |
| P3-7 | **12 data quality issues in legacy JSON** — See §8. Will be resolved during Sanity data migration. | `data/` directory | Migration phase |

---

## Summary

| Category | Total Items | Critical (P0) | Broken (P1) | Gaps (P2) | Quality (P3) |
|----------|:---:|:---:|:---:|:---:|:---:|
| Security | 1 | 1 (debug route) | 0 | 0 | 0 |
| CRM Isolation | 1 | 1 | 0 | 0 | 0 |
| Rate Limiting | 2 | 1 | 0 | 1 | 0 |
| Intake System | 8 | 0 | 8 | 0 | 0 |
| Rich Text | 1 | 0 | 1 | 0 | 0 |
| Content CMS | 2 | 0 | 2 | 0 | 0 |
| API Gaps | 2 | 0 | 0 | 2 | 0 |
| UX Compliance | 3 | 0 | 0 | 3 | 0 |
| Code Quality | 7 | 0 | 0 | 0 | 7 |
| **TOTAL** | **27** | **3** | **11** | **6** | **7** |

### What Works Well

- Build is clean with zero TypeScript errors or suppressions
- Authentication is properly triple-layered (edge middleware → server layout → API guard)
- Optimistic concurrency control on all mutations
- Comprehensive JSON-LD structured data
- RTL layout throughout
- Sanity schemas are well-structured and match DOC-020
- API response envelopes follow spec
- All admin API routes have auth guards
- `useRequestLifecycle` implements correct state machine
- No secrets in repository history

### What Needs Work Before Deployment

1. **Intake system (P1-1)** — Largest gap. The entire IntakeSubmission feature is missing.
2. **CRM isolation (P0-2)** — CRM features must be hidden from the UI.
3. **Debug route removal (P0-1)** — Trivial but critical security fix.
4. **Rich text editor (P1-3)** — Admin can't properly edit service/project descriptions.
5. **Hardcoded pages (P1-4, P1-5)** — About and Innovation must pull from CMS.

---

**END OF AUDIT REPORT**
