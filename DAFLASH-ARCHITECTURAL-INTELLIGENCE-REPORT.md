# daflash — Architectural Intelligence Report

**Classification:** Internal — CTO Eyes Only
**Prepared for:** WDI Ltd Israel rebuild initiative
**Date:** 2026-02-19
**Source project:** `daflash` (commit `0e4619e`, branch `main`)
**Methodology:** Full codebase audit — every file read, every pattern catalogued

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Data Model](#3-data-model)
4. [Canonical Documentation Audit](#4-canonical-documentation-audit)
5. [Design Patterns & Conventions](#5-design-patterns--conventions)
6. [Build, Test & Deploy Pipeline](#6-build-test--deploy-pipeline)
7. [Lessons for WDI](#7-lessons-for-wdi)

---

## 1. Executive Summary

### What daflash is

daflash is a dual-purpose Next.js 14 application that serves as both a **public corporate marketing site** and a **private CRM/back-office operational panel**, backed by Sanity CMS as its sole data store. It was built to "Maybach-grade" standards — a self-imposed quality framework demanding zero TypeScript errors, zero suppression directives, server-enforced business rules, atomic transactions, and an append-only audit trail for every CRM mutation.

### What makes it exceptional

1. **Governance-first methodology.** Five canonical documents (DOC-000 through DOC-050, each with formal versioning and change control) define every entity, invariant, API contract, and UI behavior *before* code is written. The code is subordinate to the documentation — not the other way around.

2. **35 data model invariants** (INV-001 through INV-035) are formally specified and server-enforced. These include status transition matrices, optimistic concurrency control, duplicate prevention, email uniqueness, append-only audit trails, and atomic multi-entity transactions.

3. **Zero TypeScript errors, zero suppression directives.** `tsc --noEmit` passes clean. No `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, or `as any` anywhere in the codebase.

4. **Full CRM with 7-state lead lifecycle, 4-state client lifecycle, 7-state engagement lifecycle, and 22 activity types** — all with server-enforced state machines and append-only activity logs.

5. **Anti-optimistic update policy.** The UI never mutates local state before API confirmation. Every mutation follows a 5-phase lifecycle (Idle → InFlight → Success/Error/NetworkUnknown → Idle) with no shortcuts.

### What it gets wrong

1. **Zero tests.** No test files, no test framework, no CI/CD pipeline, no pre-commit hooks.
2. **In-memory rate limiting** resets on every server restart — non-functional in serverless.
3. **No error monitoring** — `console.error` only, no Sentry or equivalent.
4. **No custom error pages** (404, 500) — uses Next.js defaults.
5. **Missing `og-image.png`** — referenced in metadata but absent from the repository.
6. **Code duplication** — `formatDate`, `formatCurrency`, `getRefId`, `generateSlug`, toast rendering, and activity type maps are duplicated across 3-6 files each.

### The scorecard

| Dimension | Grade | Notes |
|-----------|-------|-------|
| Architecture & Separation of Concerns | **A** | Clean 7-domain responsibility model, strict public/admin boundary |
| TypeScript Discipline | **A+** | Strict mode, zero errors, zero suppressions |
| Documentation & Governance | **A+** | 5 canonical docs with formal versioning, 35 invariants |
| Data Model Design | **A** | Comprehensive state machines, audit trail, concurrency control |
| API Contract Discipline | **A** | Standardized envelopes, consistent error codes, atomic transactions |
| Security Posture | **A-** | Triple auth enforcement, Turnstile, CSP headers, email whitelist |
| UI/UX Engineering | **B+** | Consistent design system, good mobile support, but code duplication |
| Testing & CI/CD | **F** | Zero tests, no pipeline, no hooks |
| Error Handling & Observability | **C** | No monitoring, no custom error pages, console-only logging |
| Performance & Caching | **B-** | `force-dynamic` on all pages, no CDN, some JS-side filtering |
| SEO | **A-** | Comprehensive structured data, sitemap, robots — but missing OG image |

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 14.1.0 | SSR, routing, API routes |
| Runtime | React | 18.x | UI rendering |
| Language | TypeScript | 5.x | Strict mode, zero errors |
| CMS / Database | Sanity | @sanity/client 6.12.3 | All data storage (content + CRM) |
| Auth | NextAuth | 4.24.13 | Google OAuth, JWT sessions |
| Validation | Zod | 3.22.4 | Request/schema validation |
| Styling | Tailwind CSS | 3.3.0 | Utility-first CSS |
| Icons | Lucide React | 0.309.0 | SVG icon library |
| Bot Prevention | Cloudflare Turnstile | — | Public form abuse prevention |
| Hosting | Netlify | @netlify/plugin-nextjs | CDN, serverless functions |
| Analytics | Google Analytics 4 | G-QPL4VWSV8G | Traffic analytics |

### 2.2 Architectural Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                        NETLIFY CDN                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Static Assets│  │  301 Redirects│  │ Security Headers     │  │
│  │ (1yr cache)  │  │              │  │ (CSP, HSTS, etc.)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                     NEXT.JS APP ROUTER                          │
│                                                                 │
│  ┌─────────────────────┐    ┌────────────────────────────────┐  │
│  │   PUBLIC PAGES      │    │   ADMIN PAGES                  │  │
│  │   (Server Components)│    │   (/admin — single page)      │  │
│  │                     │    │                                │  │
│  │  / (Homepage)       │    │  ┌──────────────────────────┐  │  │
│  │  /services          │    │  │  AdminTabRouter           │  │  │
│  │  /products          │    │  │  (12 client-side tabs     │  │  │
│  │  /products/[slug]   │    │  │   via ?tab= query param)  │  │  │
│  │  /portfolio         │    │  └──────────────────────────┘  │  │
│  │  /portfolio/[slug]  │    │                                │  │
│  │  /pricing           │    │  CMS: Services, Products,     │  │
│  │  /insights          │    │       Pricing, Portfolio,      │  │
│  │  /insights/[slug]   │    │       Insights, Site Settings  │  │
│  │  /contact           │    │                                │  │
│  │  /terms, /privacy   │    │  CRM: Dashboard, Leads,       │  │
│  │  /accessibility     │    │       Clients, Engagements,    │  │
│  └─────────────────────┘    │       Pipeline, CRM Settings   │  │
│                             └────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API ROUTES                             │   │
│  │                                                          │   │
│  │  /api/public/leads       POST (rate limited + Turnstile) │   │
│  │  /api/admin/leads/*      CRUD + transition/archive/...   │   │
│  │  /api/admin/clients/*    CRUD + transition/archive/...   │   │
│  │  /api/admin/engagements/* CRUD + transition              │   │
│  │  /api/admin/activities   GET + POST                      │   │
│  │  /api/admin/crm-search   GET (cross-entity)              │   │
│  │  /api/admin/crm-settings GET + PUT (singleton)           │   │
│  │  /api/admin/services/*   CRUD                            │   │
│  │  /api/admin/products/*   CRUD                            │   │
│  │  /api/admin/pricing/*    CRUD                            │   │
│  │  /api/admin/projects/*   CRUD                            │   │
│  │  /api/admin/testimonials/* CRUD                          │   │
│  │  /api/admin/articles/*   CRUD + publish/unpublish        │   │
│  │  /api/admin/settings     GET + PUT (singleton)           │   │
│  │  /api/admin/upload       POST (image upload)             │   │
│  │  /api/auth/[...nextauth] GET + POST                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────┐                                     │
│  │    MIDDLEWARE           │                                     │
│  │  Edge: JWT check on    │                                     │
│  │  /admin/* routes        │                                     │
│  └────────────────────────┘                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │     SANITY CLOUD      │
                │                       │
                │  Read: sanityClient   │
                │  (no CDN, no cache)   │
                │                       │
                │  Write: sanityWrite   │
                │  Client (with token)  │
                │                       │
                │  10+ document types   │
                │  Atomic transactions  │
                └───────────────────────┘
```

### 2.3 Authentication Architecture

**Triple-layer enforcement:**

1. **Edge Middleware** (`middleware.ts`): Checks JWT on all `/admin/:path*` routes via `getToken()`. Redirects to NextAuth sign-in if missing.
2. **Server-side Layout** (`app/admin/layout.tsx`): `getServerSession(authOptions)` check. Redirects to `/admin/login` if null.
3. **API Route Guard** (`lib/auth/middleware.ts`): `requireAdmin(request)` on every `/api/admin/*` route — rate limit → JWT decode → email whitelist check.

**Key decisions:**
- JWT-only sessions (no database session store), 24-hour max age.
- Google OAuth is the sole provider.
- Email whitelist via `ADMIN_ALLOWED_EMAILS` env var. **If empty or missing, ALL access is denied** (fail-closed).
- Case-insensitive email comparison.
- Explicit cookie name `next-auth.session-token` (prevents Netlify HTTPS prefix issues).

### 2.4 Data Access Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Public Pages    │────▶│  data-fetchers.ts│────▶│ sanityClient │
│  (Server Comp.)  │     │  (22 functions)  │     │ (read-only)  │
└──────────────────┘     └──────────────────┘     └──────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Admin Dashboard │────▶│  Direct GROQ     │────▶│ sanityClient │
│  (Server Comp.)  │     │  (inline queries)│     │ (read-only)  │
└──────────────────┘     └──────────────────┘     └──────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Admin Tabs      │────▶│  crm-api.ts      │────▶│ API Routes   │
│  (Client Comp.)  │     │  (client SDK)    │     │ (Next.js)    │
└──────────────────┘     └──────────────────┘     └──────────────┘
                                                        │
                                                        ▼
                                                  ┌──────────────┐
                                                  │sanityWrite   │
                                                  │Client        │
                                                  │(with token)  │
                                                  └──────────────┘
```

**Key decisions:**
- CDN explicitly disabled (`useCdn: false`) — admin needs instant consistency after writes.
- `sanityWriteClient` (with `SANITY_API_TOKEN`) only used in API routes, never exposed to client bundles.
- `projectId` defaults to `'placeholder'` when env var is absent — prevents build failures while ensuring runtime calls fail gracefully.
- All fetchers wrap calls in try/catch, returning `[]` or `null` on failure — silent degradation.

### 2.5 Responsibility Domains (DOC-010)

| # | Domain | Owns | Prohibited From |
|---|--------|------|-----------------|
| 1 | Public Website | SSR pages, SEO, structured data, contact form | Direct Sanity writes, business logic |
| 2 | Back Office | Admin UI, tab routing, form management | Authoritative business rule enforcement |
| 3 | CRM | Lead/Client/Engagement lifecycle, pipeline, search | Content management |
| 4 | Content | Service/Product/Project/Article/Pricing CRUD | CRM operations |
| 5 | Authentication | OAuth, JWT, email whitelist, session management | Business logic, data access |
| 6 | Configuration | Site settings, CRM settings (singletons) | Multi-tenant |
| 7 | Deployment | Netlify, environment config, security headers | Runtime business logic |

---

## 3. Data Model

### 3.1 Entity Inventory

#### CRM Entities

| Entity | Type | States | Key Fields |
|--------|------|--------|------------|
| **Lead** | Document | 7: new → contacted → qualified → proposal_sent → won/lost, archived | name, email, source, status, priority, estimatedValue, notes, servicesInterested |
| **Client** | Document | 4: active ↔ completed ↔ inactive, archived | name, email, status, originLeadId, address, preferredContact |
| **Engagement** | Document | 7: new → in_progress → review → delivered → completed, paused, cancelled | title, client (ref), value, engagementType, scope[], dates, linkedProduct/Service |
| **Activity** | Document | — (immutable) | entityType, entityId, type (22 variants), description, performedBy, metadata |
| **CrmSettings** | Singleton | — | pipelineStages[], engagementStatuses[], serviceTypes[], leadSources[], defaults |

#### Content Entities

| Entity | Type | Key Fields |
|--------|------|------------|
| **Service** | Document | name, slug, icon, tagline, description, highlights[], isActive, order |
| **Product** | Document | name, slug, tagline, description (PT), features[], heroImage, ctaText, isActive, order |
| **PricingPlan** | Document | name, price, originalPrice, billingFrequency, features[], badge, callForQuote, entityType, entityRef |
| **Project** | Document | clientName, slug, logo, websiteUrl, description (PT), projectType, technologies[], scope[], screenshots[], isActive |
| **Testimonial** | Document | clientName, quote, companyName, companyUrl, isFeatured, projectRef, isActive |
| **Article** | Document | title, slug, excerpt, body (PT), category, tags[], isDraft, isPublished, publishedAt |
| **SiteSettings** | Singleton | hero, about, contact, branding, social, legal pages |

### 3.2 Status Transition Matrices

#### Lead Lifecycle (7 states)

```
     ┌─── new ───▶ contacted ───▶ qualified ───▶ proposal_sent ───▶ won ─(convert)─▶ Client
     │       │           │             │                │
     │       └───────────┴─────────────┴────────────────┘
     │                              │
     │                          ▼ lost ▼
     │
     └───(any non-archived)───▶ archived ─(restore)─▶ pre-archival status
```

- `won` and `lost` are terminal (no outbound transitions).
- `archived` is reached via dedicated `/archive` endpoint (outside normal matrix).
- Restoration recovers the pre-archival status from the most recent `lead_archived` activity.
- Conversion (`won` → Client + Engagement) is atomic via Sanity transaction.

#### Client Lifecycle (4 states)

```
     active ◀──▶ completed ──▶ inactive ──▶ active
                                  │
                                  └──▶ archived ─(restore)─▶ active
```

#### Engagement Lifecycle (7 states)

```
     new ──▶ in_progress ──▶ review ──▶ delivered ──▶ completed
      │          │              │           │
      └──────────┴──────────────┴───────────┘───▶ paused ──▶ (resume to prior)
                                                   │
                                                   └──▶ cancelled
```

### 3.3 Key Invariants (Selection)

| ID | Description | Enforcement |
|----|-------------|-------------|
| **INV-006** | Lead cannot be converted twice | Server checks `convertedToClientId` is null |
| **INV-007** | Lead must be `won` to convert | Server checks `status === 'won'` |
| **INV-008** | Client email is unique | GROQ query before create/update |
| **INV-011** | Activity is immutable after creation | Sanity schema `readOnly: true`, no PATCH endpoints |
| **INV-020** | CRM mutations are atomic | Sanity `transaction()` for all multi-document writes |
| **INV-021** | Duplicate active leads merge (public) / reject (admin) | GROQ duplicate check, conditional merge |
| **INV-022** | Status transitions validated against matrix | `isValidTransition(matrix, from, to)` |
| **INV-023** | Optimistic concurrency via `updatedAt` | Every mutation carries `updatedAt`; 409 on mismatch |
| **INV-027** | Bulk ops create one Activity per affected entity | Loop in transaction, not single batch activity |
| **INV-030** | Article slug uniqueness | GROQ check before create |
| **INV-031** | Product slug uniqueness | GROQ check before create |
| **INV-035** | CrmSettings is singleton | Fixed `_id: 'crmSettings'`, `createOrReplace` |

### 3.4 Lead Conversion Flow (Most Complex Transaction)

Single atomic Sanity transaction creating/patching **6 documents:**

1. `tx.create(clientDoc)` — new Client with `originLeadId` backlink
2. `tx.create(engagementDoc)` — new Engagement referencing the Client
3. `tx.patch(leadId)` — updates Lead with `convertedToClientId`, `convertedAt`
4. `tx.create(leadActivity)` — `lead_converted` activity
5. `tx.create(clientActivity)` — `client_created` activity
6. `tx.create(engagementActivity)` — `engagement_created` activity

All six succeed or none do. The engagement defaults are derived from lead data (title from name + service, type from first service, value from estimated value).

---

## 4. Canonical Documentation Audit

### 4.1 Documentation Hierarchy

```
DOC-000: System Charter (v2.0)
    └── DOC-010: Architecture & Responsibility Boundaries (v2.1)
        └── DOC-020: Canonical Data Model (v2.1) — 35 invariants
            └── DOC-030: Back Office & Operational Model (v2.1)
                └── DOC-040: API Contract & Mutation Semantics (v2.1)
                    └── DOC-050: Back Office UX Interaction Contract (v2.1) — 31 rules
```

**Subordination rule:** Lower-numbered documents override higher-numbered ones on conflict. DOC-000 is supreme.

### 4.2 DOC-000 — System Charter (v2.0)

**Purpose:** Defines the product's identity, scope, and non-negotiable guarantees.

**Key declarations:**
- daflash = marketing site + operational control panel + lead intake CRM + platform reference implementation.
- "Maybach-grade" quality standard — the system must be engineering excellence personified.
- **Five non-negotiable guarantees:**
  1. Save means persisted.
  2. Reload reflects current state.
  3. No operation fails silently.
  4. Security is fail-closed.
  5. All public content is CMS-managed.

**Compliance assessment:** The codebase upholds these guarantees. Every mutation is confirmed server-side before UI update. Security is fail-closed (empty whitelist = deny all). All public content comes from Sanity. The one gap: some hero text and CTA banners are hardcoded, technically violating guarantee #5.

### 4.3 DOC-010 — Architecture & Responsibility Boundaries (v2.1)

**Purpose:** Defines the 7 responsibility domains and their ownership rules.

**Key content:**
- Each domain has explicit "owns", "does not own", and "prohibited from" declarations.
- v2.1 documents all previously-identified violations as RESOLVED (demo data removed, Netlify forms replaced, API envelopes made compliant, CRM built, optimistic concurrency added).
- Current gaps: Product detail pages, Article rich text editing, dynamic navbar — all addressed in the RESTRUCTURE-PLAN.
- Ongoing risks: shared Sanity data store (CRM + content in one dataset), in-memory rate limiting, Portable Text complexity.

**Compliance assessment:** All resolved violations are confirmed resolved in the codebase. The remaining gaps are documented and have implementation plans.

### 4.4 DOC-020 — Canonical Data Model (v2.1)

**Purpose:** Defines every entity, field, invariant, status machine, and forbidden pattern.

**Key content:**
- Complete entity definitions for all 12 document types.
- 35 formally-numbered invariants (INV-001 through INV-035).
- Status transition matrices for Lead (7-state), Client (4-state), Engagement (7-state).
- Duplicate lead merge policy (5-minute idempotency window on public submissions).
- Conversion rules (Lead → Client + optional Engagement, atomic).
- Forbidden patterns (e.g., no direct status field manipulation via PATCH, no mutation without concurrency token).

**Compliance assessment:** The codebase faithfully implements the data model. Status transition matrices in `crm-validations.ts` match DOC-020 exactly. Invariants INV-006, INV-007, INV-008, INV-020, INV-021, INV-022, INV-023, INV-027 are all enforced in API routes. The Sanity schema files (`schemas/crm/`) show minor drift — the activity schema lists 11 types while the TypeScript union has 22 — but this is a Studio-side concern, not a runtime issue since the API creates activities directly.

### 4.5 DOC-030 — Back Office & Operational Model (v2.1)

**Purpose:** Defines the complete behavioral contract for the admin UI.

**Key content:**
- CMS/CRM sidebar split with exact tab enumeration.
- CRM Dashboard with 4 stat cards, pipeline summary, recent leads, activity feed.
- Full CRUD contracts for all entity types.
- Pipeline Kanban (dynamic columns from CrmSettings, no drag-and-drop in v1).
- Activity Logging modal with conditional fields.
- CRM Settings management (5 config sub-sections).
- Global CRM Search (cross-entity, 2-char minimum, 300ms debounce).
- New Leads Badge (60-second polling, 99+ cap).
- Deterministic UI guarantees: no success before persistence, no silent operations, no phantom controls, in-flight mutation lock.
- **Maybach Definition of Done** with 8 criteria categories.

**Compliance assessment:** The codebase implements all specified features. The sidebar split, dashboard components, pipeline Kanban, CRM settings, search, and badge are all present and functional. The activity feed is wired to a real API (previously identified as disconnected in the audit — this was fixed). Minor gaps: drag-to-reorder visual affordance without implementation, no `beforeunload` warning on settings pages.

### 4.6 DOC-040 — API Contract & Mutation Semantics (v2.1)

**Purpose:** Defines every API endpoint, request/response shapes, and mutation rules.

**Key content:**
- Complete endpoint inventory (28+ route files).
- Three response envelope formats:
  - Success: `{ success: true, data, activity }`
  - List: `{ data, total, page, limit }`
  - Error: `{ category, code, message, fieldErrors, recordErrors, retryable }`
- 6 error categories, 10 error codes, 5 HTTP status mappings.
- Mutation semantics: atomicity (Sanity transactions), optimistic concurrency (updatedAt tokens), idempotency (5-minute window on public leads).
- Status transition enforcement via server-side matrices.
- Activity generation contract: every CRM mutation produces activity documents.
- Bulk operations: all-or-nothing semantics, per-record concurrency tokens, max 100 records.

**Compliance assessment:** Every API route uses `lib/api-helpers.ts` for response envelopes — **fully compliant**. All admin routes use `requireAdmin()`. All CRM mutations create activity documents. Bulk operations implement all-or-nothing validation with per-record error reporting. Content entity routes (services, products, etc.) lack concurrency control — this is a documented gap.

### 4.7 DOC-050 — Back Office UX Interaction Contract (v2.1)

**Purpose:** Defines the exact UX behavior for every mutation lifecycle, error state, and interaction pattern.

**Key content (31 enforceability rules):**
- 5-phase mutation lifecycle: Idle → InFlight → Success/Error/NetworkUnknown → Idle.
- **Anti-optimistic update policy:** Local state never mutated before API confirmation.
- **Replace Rule:** After successful mutation, `response.data` replaces entire local entity state.
- Optimistic concurrency UX: conflict banner + Reload button on 409.
- Network Unknown: 8-second timeout, synthetic error envelope, operator must verify.
- Portable Text editor contract (no autosave, all block types, image upload to Sanity pipeline).
- Article draft/publish lifecycle (3-state: draft/published/unpublished, Save ≠ Publish).
- Pipeline Kanban (dynamic columns, no drag-and-drop, 100-lead limit).
- CRM Settings UX (batch save, `beforeunload` warning).
- Activity Logging modal (type → conditional fields → save).
- New Leads Badge (60s polling, 99+ cap).
- CRM Search (300ms debounce, 2-char minimum, grouped results).

**Compliance assessment:** The `crm-api.ts` client implements the 8-second timeout with `AbortController` and constructs synthetic `network_unknown` errors — matching DOC-050 Section 5 exactly. The anti-optimistic update policy is followed throughout (all mutations wait for server response). The conflict handling pattern (409 → yellow banner → auto-reload) is implemented in `EngagementsTab.tsx`. Article publish/unpublish with concurrency control is implemented. The `beforeunload` warning is specified in DOC-050 Section 22 but **not implemented** in `SiteSettingsTab.tsx` or `LandingPageEditor.tsx` — a documented gap.

### 4.8 Supporting Documents

| Document | Purpose | Key Finding |
|----------|---------|-------------|
| **CRM-GAP-ANALYSIS.md** | Comparison between daflash and a reference CRM ("be-project") | Identified 7 completely missing features, 6 partially existing features, and 10 daflash-exclusive features worth preserving |
| **DAFLASH-CRM-ENHANCEMENT-PLAN** | Phased plan to close all CRM gaps | 6 phases, renames "Deal" to "Engagement", adds CrmSettings singleton, enriches Lead/Client/Activity models |
| **DAFLASH-RESTRUCTURE-PLAN** | Public site + CMS restructure plan | Adds Product, Article, Project detail pages; dynamic navbar; CMS/CRM sidebar split |
| **AUDIT-PART1 through PART5** | Comprehensive codebase audit | 10 critical findings (see Section 6.3) |

---

## 5. Design Patterns & Conventions

### 5.1 API Design Pattern

Every API route follows this exact template:

```typescript
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 1. Auth guard (always first)
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    // 2. Parse and validate request body
    const body = await request.json();
    const data = schema.parse(body);

    // 3. Fetch current entity
    const entity = await sanityClient.fetch(GROQ_QUERY, { id });
    if (!entity) return errorResponse('not_found', 'NOT_FOUND', 'Entity not found');

    // 4. Concurrency check (CRM entities only)
    if (entity.updatedAt !== data.updatedAt) {
      return errorResponse('conflict', 'CONFLICT_DETECTED', '...', {
        fieldErrors: { updatedAt: entity.updatedAt }
      });
    }

    // 5. Business rule validation
    if (!isValidTransition(MATRIX, entity.status, data.targetStatus)) {
      return errorResponse('validation', 'TRANSITION_FORBIDDEN', '...');
    }

    // 6. Atomic mutation (always via transaction for CRM)
    const tx = sanityWriteClient.transaction();
    tx.patch(id).set({ ...changes, updatedAt: new Date().toISOString() });
    tx.create({ _type: 'activity', ...activityDoc });
    await tx.commit();

    // 7. Return success envelope
    return successResponse(updatedEntity, activityDoc);
  } catch (error) {
    if (error.name === 'ZodError') {
      return errorResponse('validation', 'VALIDATION_FAILED', '...', {
        fieldErrors: error.flatten().fieldErrors
      });
    }
    return errorResponse('server', 'SERVER_ERROR', 'Internal server error');
  }
}
```

### 5.2 Client-Side CRM API SDK Pattern

`lib/crm-api.ts` provides typed functions for every CRM operation:

```typescript
// 8-second timeout (DOC-050 Section 5)
const REQUEST_TIMEOUT_MS = 8000;

async function crmFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new CrmAPIError(response.status, errorBody);
    }

    return response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new CrmAPIError(0, null); // Network Unknown
    }
    throw error;
  }
}
```

`CrmAPIError` provides convenience getters: `isConflict`, `isValidation`, `isNetworkUnknown`, `fieldErrors`.

### 5.3 Response Envelope Pattern

Three standardized envelopes via `lib/api-helpers.ts`:

```typescript
// Success (mutations)
{ success: true, data: T, activity: Activity | null }

// List (queries)
{ data: T[], total: number, page: number, limit: number }

// Error (all failures)
{
  category: 'validation' | 'conflict' | 'auth' | 'not_found' | 'server',
  code: 'VALIDATION_FAILED' | 'CONFLICT_DETECTED' | 'TRANSITION_FORBIDDEN' | ...,
  message: string,
  fieldErrors?: Record<string, string>,
  recordErrors?: Array<{ id: string, code: string, message: string }>,
  retryable: boolean
}
```

All responses include `Cache-Control: no-store, no-cache, must-revalidate`.

### 5.4 Validation Pattern

**Content entities** use a generic `validate()` wrapper:
```typescript
function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S>
```

**CRM entities** call `.parse()` directly on Zod schemas, with richer schemas that include `updatedAt` for concurrency control.

**Portable Text** fields use `z.any().nullable().optional()` — validated by Sanity, not by Zod.

### 5.5 Admin Tab Architecture

All admin views live under a single Next.js page (`/admin`). Routing is via `?tab=X` query parameter:

```
/admin              → Dashboard (server component with GROQ queries)
/admin?tab=leads    → LeadTable (client component via AdminTabRouter)
/admin?tab=clients  → ClientTable
/admin?tab=engagements → EngagementsTab
/admin?tab=pipeline → PipelineView
/admin?tab=crm-settings → CrmSettingsTab
/admin?tab=services → ServicesTab
/admin?tab=products → ProductsTab
/admin?tab=pricing  → PricingTab
/admin?tab=portfolio → PortfolioTab
/admin?tab=insights → InsightsTab
/admin?tab=settings → SiteSettingsTab
```

**Trade-offs:**
- (+) Simpler file structure, fast tab switching (no full page navigation).
- (-) All tab components eagerly imported, no code splitting per tab.
- (-) No URL-based routing per tab (can't bookmark/share specific tabs).

### 5.6 CRM Tab Pattern (Leads, Clients)

Both `LeadTable` and `ClientTable` follow an identical pattern:
- URL-driven pagination and status filtering (`useSearchParams`).
- Server-side search (via API query params).
- Skeleton loading on initial fetch, existing data + spinner on subsequent fetches.
- Detail via `SlidePanel` component (slides from right).
- 25 items per page.

### 5.7 CMS Tab Pattern (Services, Products, etc.)

All CMS tabs follow an identical pattern:
- `useCallback` + `useEffect` for data fetching on mount.
- Local `useState` for list, form, panel, delete, toast.
- `SlidePanel` for add/edit forms.
- `ConfirmDialog` for delete confirmation.
- Card grid layout with hover-reveal actions.
- No pagination (fetch all at once).
- No concurrency control (last write wins).
- Inline toast for success/error feedback.

### 5.8 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#fe5557` | Buttons, active states, brand color |
| `primary-dark` | `#e54446` | Hover states |
| `font-heading` | Outfit (400-800) | All headings, buttons |
| `font-body` | Plus Jakarta Sans (400-600) | Body text |
| `rounded-xl` / `rounded-2xl` | — | Cards, panels |
| `shadow-sm` | — | Cards |
| Border color | `border-gray-100/200` | Card borders |
| Icon library | Lucide React (26 curated) | All icons |

### 5.9 Security Pattern

| Layer | Mechanism | Configuration |
|-------|-----------|---------------|
| Edge | Middleware JWT check | `/admin/:path*` matcher |
| Server | `getServerSession()` in layout | Redirect to `/admin/login` |
| API | `requireAdmin()` guard | Rate limit → JWT → email whitelist |
| Public | Turnstile + rate limiting | 5 req/min, fail-closed |
| Headers | CSP, HSTS, X-Frame-Options, etc. | Defined in `next.config.js` |
| CORS | Sanity CDN and Google Analytics allowed | CSP `connect-src`, `img-src` |
| Cookies | Explicit `next-auth.session-token` name | Prevents HTTPS prefix issues |

---

## 6. Build, Test & Deploy Pipeline

### 6.1 Build Configuration

```
Build command:  npm ci && npm run build
Publish dir:    .next
Node.js:        (Netlify default)
Plugin:         @netlify/plugin-nextjs
```

- `tsc --noEmit` passes with **0 errors** (run as implicit part of `next build`).
- 29 total pages generated (2 static, 27 dynamic).
- All public pages use `export const dynamic = 'force-dynamic'` — no ISR, no SSG.

### 6.2 Deployment Architecture

```
Netlify:
  ├── CDN: Static assets (1-year immutable cache)
  ├── CDN: Dynamic pages (max-age=0, must-revalidate)
  ├── 301 Redirects: www → non-www, deprecated routes
  ├── Security headers: CSP, HSTS, etc.
  └── Serverless Functions: API routes, SSR pages

Environment Variables:
  ├── NEXT_PUBLIC_SANITY_PROJECT_ID
  ├── NEXT_PUBLIC_SANITY_DATASET (production)
  ├── SANITY_API_TOKEN (server-only)
  ├── GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
  ├── NEXTAUTH_SECRET / NEXTAUTH_URL
  ├── ADMIN_ALLOWED_EMAILS (comma-separated)
  └── TURNSTILE_SECRET_KEY (optional)
```

### 6.3 What's Missing (Critical)

| Gap | Severity | Impact |
|-----|----------|--------|
| **Zero test files** | Critical | No automated verification of any kind |
| **No CI/CD pipeline** | High | No GitHub Actions, no pre-commit hooks, no lint enforcement |
| **No custom error pages** | High | Default Next.js 404/500 pages shown to users |
| **No external error monitoring** | High | `console.error` only — errors invisible in production |
| **No ESLint config** | Medium | Only `next/core-web-vitals` — no custom rules |
| **In-memory rate limiter** | Medium | Resets on every serverless cold start |
| **Missing og-image.png** | Medium | Social sharing shows no image |
| **No `beforeunload` warning** | Medium | Settings pages silently lose unsaved changes |
| **Dashboard activity not wired** | Low | API exists but dashboard passed `activities={[]}` |
| **Data fetcher inconsistency** | Low | Some filter in GROQ, some in JS |

### 6.4 Scripts

| Script | Purpose | Run |
|--------|---------|-----|
| `migrate-landing-to-products.ts` | Convert `landingPage` → `product` documents | `npx tsx scripts/migrate-landing-to-products.ts` |
| `seed-crm-settings.ts` | Create default CrmSettings singleton | `npx tsx scripts/seed-crm-settings.ts` |
| `seed-missing-content.ts` | Seed real production data (site settings, testimonials, portfolio, landing pages) | `npx tsx scripts/seed-missing-content.ts` |

All scripts parse `.env.local` manually (no dotenv dependency), use `createIfNotExists` for idempotency, and include verification steps.

---

## 7. Lessons for WDI

### 7.1 Patterns to Adopt (Keep)

#### 1. Documentation-First Methodology
The 5-document canonical hierarchy (Charter → Architecture → Data Model → Operations → API → UX) is the most valuable pattern in the entire project. Write DOC-020 (data model with invariants) **before** writing any code. It forces you to think through every state transition, edge case, and forbidden pattern before a single line of TypeScript exists.

**For WDI:** Create an equivalent document hierarchy. Start with DOC-000 (what is WDI?), DOC-020 (entities, invariants, status machines), and DOC-040 (API contracts).

#### 2. Invariant Numbering System
Formally numbered invariants (INV-001 through INV-035) create a traceable contract between documentation and code. When code references `// INV-023: Optimistic concurrency check`, any developer can look up the canonical definition.

**For WDI:** Adopt the `INV-XXX` numbering system. Start at INV-001.

#### 3. API Envelope Standardization
Three envelopes (success, list, error) with consistent shapes across all endpoints. The `lib/api-helpers.ts` module ensures no route can accidentally return a non-standard response.

**For WDI:** Copy `api-helpers.ts` verbatim. Customize the error codes for your domain.

#### 4. Atomic CRM Mutations via Sanity Transactions
Every CRM mutation (entity change + activity creation) happens in a single atomic Sanity transaction. This guarantees the audit trail is never orphaned or missing.

**For WDI:** Use `sanityWriteClient.transaction()` for all multi-document mutations. Never create an activity in a separate API call from its parent entity mutation.

#### 5. Optimistic Concurrency Control
The `updatedAt` token pattern (INV-023) prevents stale overwrites without the complexity of pessimistic locking. The client sends the last-known `updatedAt`; the server rejects with 409 if it doesn't match.

**For WDI:** Implement this from day one. It costs almost nothing and prevents an entire class of data corruption bugs.

#### 6. Anti-Optimistic Update Policy
Never mutate local UI state before the server confirms. Combined with the 8-second timeout and `network_unknown` error synthesis, this eliminates an entire category of UI inconsistency bugs.

**For WDI:** Follow DOC-050's mutation lifecycle (Idle → InFlight → Success/Error/NetworkUnknown → Idle) exactly.

#### 7. Status Transition Matrices
Explicit `TRANSITIONS` maps (e.g., `{ new: ['contacted', 'lost'], contacted: ['qualified', 'lost'], ... }`) with a pure `isValidTransition(matrix, from, to)` function. Simple, testable, and impossible to accidentally bypass.

**For WDI:** Define your transition matrices in a single file. Test every valid and invalid transition.

#### 8. Triple Auth Enforcement
Edge middleware → server layout → API route guard. Each layer adds security in case another is bypassed.

**For WDI:** Keep all three layers. The email whitelist with fail-closed default is an excellent pattern for small-team admin panels.

#### 9. Zero TypeScript Suppressions
The discipline of zero `@ts-ignore` / `as any` forces you to fix type issues properly instead of sweeping them under the rug. This is maintainable long-term.

**For WDI:** Enforce this from the start. If you need `as any`, you have a design problem.

#### 10. Comprehensive Structured Data
10+ Schema.org types across all page types. Factory functions in a single file. Easy to maintain, massive SEO benefit.

**For WDI:** Copy the `structured-data-schemas.ts` pattern. Adapt the types for your domain.

### 7.2 Patterns to Improve

#### 1. Add Tests Before Anything Else
The biggest gap. Before writing features, set up:
- Vitest (or Jest) for unit tests
- Testing Library for component tests
- Playwright for E2E tests
- At minimum: test every status transition matrix, every API endpoint, every Zod schema

**For WDI:** Budget 20% of development time for tests. Start with API route tests — they have the highest value-to-effort ratio.

#### 2. Add CI/CD Pipeline
GitHub Actions with:
- `tsc --noEmit` (already clean)
- `eslint` (add stricter rules)
- `vitest run` (unit + integration)
- `playwright test` (E2E on preview deploy)
- Pre-commit hooks via Husky + lint-staged

**For WDI:** Set this up before the first feature branch.

#### 3. Replace In-Memory Rate Limiting
Netlify serverless = new instance per invocation. In-memory `Map` is useless.
Options: Upstash Redis, Netlify Edge Functions with KV, or Cloudflare Workers KV.

**For WDI:** Use Upstash Redis for rate limiting from day one.

#### 4. Add Error Monitoring
Sentry, LogRocket, or equivalent. The `console.error` pattern means production errors are invisible.

**For WDI:** Add Sentry before launch. Configure source maps for meaningful stack traces.

#### 5. Extract Duplicated Code
`formatDate`, `formatCurrency`, `getRefId`, `generateSlug`, toast rendering, and activity type maps are duplicated across 3-6 files. Create a shared `lib/ui-helpers.ts` and `lib/constants.ts`.

**For WDI:** DRY these from the start. One source of truth for formatting functions, one source of truth for type maps.

#### 6. Add Custom Error Pages
`app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx` — all missing. Default Next.js error pages are unprofessional.

**For WDI:** Create branded error pages before launch.

#### 7. Code-Split Admin Tabs
All 12 tab components are eagerly imported in `AdminTabRouter`. Use `React.lazy()` or Next.js dynamic imports to load only the active tab.

**For WDI:** Use `next/dynamic` with `{ ssr: false }` for each tab component.

#### 8. Move to Proper File-Based Routing for Admin
The `?tab=X` query parameter routing means no code splitting, no bookmarkable URLs, and no proper loading states per tab. Consider `app/admin/leads/page.tsx`, `app/admin/clients/page.tsx`, etc.

**For WDI:** Use file-based routing for admin sections. Each section gets its own loading.tsx and error.tsx.

### 7.3 Patterns to Avoid

#### 1. `force-dynamic` on All Public Pages
Every public page sets `export const dynamic = 'force-dynamic'`, meaning no ISR or SSG. This means every request hits Sanity and does server-side rendering. For a marketing site with content that changes daily at most, this is wasteful.

**For WDI:** Use ISR with `revalidate: 60` (or similar) for public pages. Use `force-dynamic` only for pages that truly need per-request freshness.

#### 2. CDN Disabled (`useCdn: false`)
The Sanity CDN was disabled because admin updates needed instant consistency. But public pages don't need this — they can tolerate 60 seconds of staleness.

**For WDI:** Use two Sanity clients: `sanityClient` with `useCdn: true` for public pages, `sanityWriteClient` with `useCdn: false` for admin.

#### 3. Filtering in JavaScript Instead of GROQ
`getActiveServices()` fetches ALL services then filters with `.filter(s => s.isActive)`. The GROQ query should include `&& isActive == true`.

**For WDI:** Always filter in GROQ. Never fetch more data than you need.

#### 4. Content Entity Routes Without Concurrency Control
CMS entity routes (services, products, pricing, etc.) have no `updatedAt` check — last write wins. This is acceptable for single-admin systems but dangerous with multiple editors.

**For WDI:** If you'll have multiple admins, add optimistic concurrency to content entities too.

#### 5. No Pagination on CMS Tabs
All CMS tabs fetch all records at once. This works for <100 records but will degrade with scale.

**For WDI:** Add pagination from the start, even if your initial dataset is small.

### 7.4 File Structure Reference

```
daflash/
├── app/
│   ├── layout.tsx              # Root layout (fonts, GA, structured data)
│   ├── page.tsx                # Homepage (SSR)
│   ├── globals.css             # Global styles + Tailwind layers
│   ├── robots.ts               # Dynamic robots.txt
│   ├── sitemap.ts              # Dynamic sitemap.xml
│   ├── contact/page.tsx        # Contact page
│   ├── services/page.tsx       # Services listing
│   ├── products/
│   │   ├── page.tsx            # Products listing
│   │   └── [slug]/page.tsx     # Product detail
│   ├── portfolio/
│   │   ├── page.tsx            # Portfolio listing
│   │   └── [slug]/page.tsx     # Project detail
│   ├── pricing/page.tsx        # Pricing page
│   ├── insights/
│   │   ├── page.tsx            # Articles listing
│   │   └── [slug]/page.tsx     # Article detail
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (auth gate)
│   │   ├── page.tsx            # Dashboard + tab router
│   │   ├── login/page.tsx      # OAuth login page
│   │   └── AdminShell.tsx      # Admin UI shell (client)
│   └── api/
│       ├── auth/[...nextauth]/ # NextAuth handler
│       ├── public/leads/       # Public lead submission
│       └── admin/              # 28+ admin API routes
│           ├── leads/          # CRUD + transition/archive/restore/convert/bulk
│           ├── clients/        # CRUD + transition/archive/restore/bulk
│           ├── engagements/    # CRUD + transition
│           ├── activities/     # GET + POST
│           ├── crm-search/     # Cross-entity search
│           ├── crm-settings/   # Singleton CRUD
│           ├── services/       # Content CRUD
│           ├── products/       # Content CRUD
│           ├── pricing/        # Content CRUD
│           ├── projects/       # Content CRUD
│           ├── testimonials/   # Content CRUD
│           ├── articles/       # CRUD + publish/unpublish
│           ├── settings/       # Singleton CRUD
│           └── upload/         # Image upload
├── components/
│   ├── public/                 # Public-facing components
│   │   ├── Header.tsx          # Async server component (fetches nav data)
│   │   ├── Footer.tsx          # Props-driven server component
│   │   ├── ContactForm.tsx     # Client component (dual submission)
│   │   ├── DesktopNav.tsx      # Hover dropdowns
│   │   ├── MobileNav.tsx       # Full-screen overlay (portal)
│   │   └── LucideIcon.tsx      # Dynamic icon resolver (26 icons)
│   ├── admin/
│   │   ├── AdminSidebar.tsx    # CMS/CRM split sidebar + new leads badge
│   │   ├── AdminTopBar.tsx     # Search bar + user menu
│   │   ├── AdminBottomBar.tsx  # Mobile bottom nav (5 tabs)
│   │   ├── AdminTabRouter.tsx  # Query-param based tab switching
│   │   ├── Dashboard*.tsx      # 5 dashboard sub-components
│   │   ├── crm/               # CRM tab components
│   │   │   ├── LeadTable.tsx   # Lead management
│   │   │   ├── ClientTable.tsx # Client management
│   │   │   ├── EngagementsTab.tsx # Engagement CRUD
│   │   │   ├── PipelineView.tsx # Kanban board
│   │   │   ├── CrmSettingsTab.tsx # CRM configuration
│   │   │   ├── CrmSearchBar.tsx # Global search
│   │   │   ├── ActivityTimeline.tsx # Activity feed
│   │   │   └── ...Detail/Form components
│   │   ├── tabs/              # CMS tab components
│   │   │   ├── ServicesTab.tsx
│   │   │   ├── ProductsTab.tsx
│   │   │   ├── PricingTab.tsx
│   │   │   ├── PortfolioTab.tsx
│   │   │   ├── TestimonialsTab.tsx
│   │   │   ├── InsightsTab.tsx
│   │   │   └── SiteSettingsTab.tsx
│   │   └── shared/            # Shared admin UI components
│   │       ├── SlidePanel.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── ImageUpload.tsx
│   │       └── Accordion.tsx
│   ├── StructuredData.tsx      # JSON-LD injector
│   ├── structured-data-schemas.ts # 10+ Schema.org factories
│   ├── Providers.tsx           # NextAuth SessionProvider wrapper
│   └── ErrorBoundary.tsx       # Class-based error boundary
├── lib/
│   ├── sanity.ts               # Sanity client instances (read + write)
│   ├── data-fetchers.ts        # 22 public data query functions
│   ├── api-helpers.ts          # Response envelope helpers
│   ├── validations.ts          # Zod schemas (content entities)
│   ├── crm-validations.ts      # Zod schemas + transition matrices (CRM)
│   ├── crm-api.ts              # Client-side CRM API SDK
│   ├── rate-limit.ts           # In-memory rate limiter
│   ├── turnstile.ts            # Cloudflare Turnstile verification
│   ├── render-helpers.ts       # Safe content extraction utilities
│   └── auth/
│       ├── config.ts           # NextAuth configuration
│       └── middleware.ts       # API route auth guard
├── schemas/
│   ├── index.ts                # All TypeScript type definitions
│   └── crm/                    # Sanity schema definitions
│       ├── activity.ts
│       ├── client.ts
│       └── lead.ts
├── scripts/
│   ├── migrate-landing-to-products.ts
│   ├── seed-crm-settings.ts
│   └── seed-missing-content.ts
├── docs/                       # 17 governance documents
│   ├── DOC-000 through DOC-050 (v1 and v2 variants)
│   ├── CRM-GAP-ANALYSIS.md
│   ├── DAFLASH-CRM-ENHANCEMENT-PLAN-2026-02-18.md
│   └── DAFLASH-RESTRUCTURE-PLAN-2026-02-18.md
├── middleware.ts               # Edge: JWT check on /admin/*
├── next.config.js              # Security headers, redirects, image config
├── tailwind.config.ts          # Brand tokens, fonts, colors
├── netlify.toml                # Build + cache config
└── .env.example                # 9 required env vars
```

### 7.5 Migration Checklist for WDI

**Phase 0 — Foundation (Before Writing Any Feature Code)**

- [ ] Create DOC-000 (WDI System Charter)
- [ ] Create DOC-020 (WDI Data Model with invariants)
- [ ] Create DOC-040 (WDI API Contracts)
- [ ] Set up Next.js 14+ with TypeScript strict mode
- [ ] Set up Tailwind CSS with WDI brand tokens
- [ ] Set up Sanity project with read/write clients
- [ ] Copy `lib/api-helpers.ts` (response envelopes)
- [ ] Copy `lib/auth/config.ts` and `lib/auth/middleware.ts` (auth pattern)
- [ ] Set up Vitest + Testing Library
- [ ] Set up GitHub Actions CI pipeline
- [ ] Set up Sentry error monitoring
- [ ] Create custom error pages (404, 500)
- [ ] Set up Upstash Redis for rate limiting

**Phase 1 — Core Infrastructure**

- [ ] Implement data model schemas (Zod + TypeScript types)
- [ ] Implement status transition matrices
- [ ] Implement CRUD API routes with envelope pattern
- [ ] Implement optimistic concurrency control
- [ ] Implement auth flow (NextAuth + Google OAuth + email whitelist)
- [ ] Write tests for all API routes and transition matrices

**Phase 2 — Admin Panel**

- [ ] Implement admin layout with auth gate
- [ ] Implement file-based routing (not query-param tabs)
- [ ] Implement shared components (SlidePanel, ConfirmDialog, StatusBadge, etc.)
- [ ] Implement CRM tabs (Leads, Clients, etc.)
- [ ] Implement CMS tabs (Content management)
- [ ] Implement Dashboard

**Phase 3 — Public Site**

- [ ] Implement public pages with ISR (not force-dynamic)
- [ ] Implement dynamic navbar from CMS data
- [ ] Implement structured data (JSON-LD)
- [ ] Implement sitemap and robots.txt
- [ ] Implement contact form with Turnstile
- [ ] Create and verify og-image.png

---

*End of report. This document should be treated as the canonical reference for the WDI rebuild initiative. All architectural decisions should be traceable to patterns identified here.*
