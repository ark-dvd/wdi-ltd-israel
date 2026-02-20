# DOC-060 — WDI Implementation Plan & Execution Roadmap

**Status:** Canonical
**Effective Date:** February 19, 2026
**Version:** 1.0
**Timestamp:** 20260219-1830 (CST)
**Governing Documents:** DOC-000 (v1.0); DOC-010 (v1.0); DOC-020 (v1.1); DOC-030 (v1.1); DOC-040 (v1.1); DOC-050 (v1.0); DOC-070 (v1.0)
**Input:** AUDIT-001 — Canonical Compliance Report (20260219)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260219-1830 | Initial release — full implementation plan based on AUDIT-001 findings |

---

## 1. Executive Intent

AUDIT-001 found 52 gaps, 0 of 37 invariants enforced, and near-zero compliance with the canonical specification. The codebase is not broken — it is absent. What exists is a static HTML marketing site and a cosmetic admin shell with no authentication, no CMS, no CRM, no validation, and active XSS vulnerabilities.

This document defines how we get from that reality to the system described in DOC-000 through DOC-050. The plan is phased, dependency-ordered, and ruthlessly prioritized. Every phase has a Definition of Done. Every phase produces a deployable artifact. No phase proceeds until the previous phase is verified.

**Three iron rules govern this entire plan:**

1. **Zero Data Loss.** Not one character of text, not one image, not one video, not one document is lost. Data that has already been lost in previous deploys will be recovered from Git history before any migration begins.

2. **Security First.** No deployment of the new system occurs without authentication. The current system's publicly-writable API is an active liability. The first deployable artifact must close that door.

3. **Quality Gates Are Non-Negotiable.** Lighthouse ≥ 97 in all four categories (Performance, Accessibility, Best Practices, SEO). GEO optimization for LLM discoverability. Hebrew RTL native throughout. TypeScript strict. Zero suppressions.

---

## 2. Phase 0 — Data Archaeology & Preservation

**Duration:** 1–2 days
**Dependency:** None — this happens before anything else
**Priority:** ABSOLUTE — data loss is irreversible

### 2.1 Objective

Recover every piece of content that has ever existed in the wdi-ltd-israel repository, including data lost between deploys. Produce a complete, verified data archive that serves as the migration source for all subsequent phases.

### 2.2 Actions

#### 2.2.1 Git History Excavation

The repository uses GitHub as a database. Every data change is a Git commit. The full history contains everything — including content that was deleted or overwritten.

| Action | Command Pattern | Target |
|--------|----------------|--------|
| Extract all historical versions of `data/testimonials/` | `git log --all --diff-filter=D -- data/testimonials/` then `git show <sha>:<path>` | Recover deleted testimonials |
| Extract all historical versions of every `data/` subfolder | Same pattern for each entity type | Recover any deleted content |
| Extract all historical media assets | `git log --all --diff-filter=D -- images/ videos/ documents/` | Recover deleted images/videos/documents |
| Compare latest `main` vs. all Netlify deploy commits | `git log --all -- data/` with date correlation | Identify data lost between deploys |
| Export Wayback Machine snapshots of wdi.co.il | Archive.org lookup for all known pages | Capture any content not in Git |
| Scrape live wdi.co.il thoroughly | All pages, all images, all JSON endpoints | Baseline of what visitors see today |

#### 2.2.2 Data Inventory & Reconciliation

Produce a manifest file (`migration/DATA_MANIFEST.md`) documenting:

| Entity | Count in Git HEAD | Count in Git History (max) | Count on Live Site | Delta | Recovery Action |
|--------|-------------------|---------------------------|-------------------|-------|-----------------|
| Projects | ? | ? | ? | ? | ? |
| TeamMembers | ? | ? | ? | ? | ? |
| Services | ? | ? | ? | ? | ? |
| Clients (logos) | ? | ? | ? | ? | ? |
| Testimonials | ? | ? | ? | ? | ? |
| Press | ? | ? | ? | ? | ? |
| Jobs | ? | ? | ? | ? | ? |
| ContentLibrary | ? | ? | ? | ? | ? |
| HeroSettings | ? | ? | ? | ? | ? |
| Images | ? | ? | ? | ? | ? |
| Videos | ? | ? | ? | ? | ? |
| Documents | ? | ? | ? | ? | ? |

For every row where "Count in Git HEAD" < "Count in Git History (max)" — **recover the missing items.**

For every row where "Count on Live Site" ≠ "Count in Git HEAD" — **investigate and document.**

#### 2.2.3 Hardcoded Content Extraction

The static HTML pages contain content not in JSON data files:

| Source | Content Type | Extraction Method |
|--------|-------------|-------------------|
| `/services/*.html` (8 pages) | Service detailed descriptions, images | Parse HTML → extract text + image references |
| `/projects/*.html` (13 pages) | Project detailed descriptions, images, scope | Parse HTML → extract text + image references |
| `index.html` | Hero text, CTA text, featured sections | Parse HTML → extract all Hebrew text blocks |
| `about.html` | Company history, values, mission | Parse HTML → extract all content |
| `contact.html` | Contact info, office address, phone, email | Parse HTML → extract structured data |
| `innovation.html` | Innovation page content | Parse HTML → extract content |
| All CSS custom properties | Brand colors, fonts, spacing | Extract as design tokens |

#### 2.2.4 External Source Recovery

| Source | What to Recover | Method |
|--------|----------------|--------|
| Netlify deploy history | Previous deploy artifacts | Netlify CLI: `netlify deploys --json` |
| Netlify Forms submissions | Any lead data captured via forms | Netlify dashboard export |
| Google Search Console | Current indexed pages, search queries | Export via GSC dashboard |
| Google Business Profile | Current listing data, reviews | Manual export |
| Archive.org (Wayback Machine) | Historical site snapshots | `wayback-machine-downloader` or manual |

### 2.3 Deliverable

```
migration/
├── DATA_MANIFEST.md              # Complete inventory with counts + deltas
├── RECOVERY_LOG.md               # Every recovered item with source commit
├── archive/
│   ├── data-git-head/            # Current data/ directory snapshot
│   ├── data-recovered/           # Items recovered from Git history
│   ├── data-live-site/           # Scraped from live wdi.co.il
│   ├── html-extracted/           # Content extracted from static HTML
│   ├── media-all/                # Every image, video, document ever committed
│   └── netlify-forms/            # Exported form submissions
├── reconciliation/
│   ├── testimonials-recovery.json    # Specific recovery for known lost data
│   ├── field-mapping.json            # Old field names → canonical names
│   ├── category-mapping.json         # Old categories → canonical enums
│   └── schema-transform.json         # Full transformation rules
└── design-tokens/
    ├── colors.json               # Extracted brand colors
    ├── typography.json            # Font families, sizes
    └── spacing.json              # Layout measurements
```

### 2.4 Definition of Done

- [ ] Every entity type has a documented count at HEAD, max in history, and on live site
- [ ] Every item where HEAD count < history count has been recovered and placed in `data-recovered/`
- [ ] All testimonials confirmed recovered (known loss)
- [ ] All hardcoded HTML content extracted to structured JSON
- [ ] All media assets inventoried and preserved
- [ ] Netlify form submissions exported (if any)
- [ ] DATA_MANIFEST.md reviewed and approved by founder
- [ ] **Verification:** Total recovered content ≥ total content that ever existed

---

## 3. Phase 1 — Foundation

**Duration:** 3–5 days
**Dependency:** Phase 0 complete
**Goal:** Unified Next.js TypeScript project with Sanity CMS, authentication, and all data migrated. Zero public-facing changes.

### 3.1 Actions

| ID | Action | Governing Doc | Complexity | Notes |
|----|--------|---------------|------------|-------|
| F-01 | Initialize Next.js 14+ project with App Router, TypeScript strict mode | DOC-000 §10.1 | M | Single unified project replacing both static site and backoffice |
| F-02 | Configure Tailwind CSS with RTL support, WDI brand tokens from Phase 0 | DOC-000 §10.1 | S | Use design tokens extracted in Phase 0 |
| F-03 | Set up Sanity CMS project + dataset | DOC-000 §10.1 | S | Create production dataset |
| F-04 | Define all 15 Sanity schemas per DOC-020 | DOC-020 §3.1–3.15 | L | All fields, types, enums, validation rules |
| F-05 | Implement schema-level invariant enforcement | DOC-020 §5 INV-001–037 | L | Sanity validation rules for all 37 invariants |
| F-06 | Run data migration from Phase 0 archive to Sanity | DOC-010 §7 | L | Use reconciliation mappings. Zero data loss verified. |
| F-07 | Implement NextAuth + Google OAuth | DOC-010 §3.5 | M | JWT, domain allowlist, email whitelist |
| F-08 | Implement triple-layer auth enforcement | DOC-010 §2.2 | M | Edge middleware → server layout → API guard |
| F-09 | Implement Zod validation schemas for all entities | DOC-000 §10.1, DOC-040 §3 | L | Match DOC-020 exactly |
| F-10 | Implement Upstash Redis rate limiting | DOC-000 §6.8 | S | 4 tiers: admin 60/min, auth 10/min, leads 5/min, upload 20/min |
| F-11 | Implement Sentry error monitoring | DOC-010 §2.2 | S | @sentry/nextjs, structured logging |
| F-12 | Configure .gitignore, env validation, netlify.toml | DOC-010 §3.6 | S | Build-time env validation (fail-fast) |
| F-13 | Configure Cloudflare Turnstile (account setup) | DOC-000 §10.1 | S | Keys for public lead intake |

### 3.2 Data Migration Detail (F-06)

This is the most critical action. The migration script must:

1. Read from `migration/archive/` (Phase 0 output)
2. Apply field mappings from `migration/reconciliation/field-mapping.json`:
   - `position` → `role` (16 team member files)
   - `category` → `sector` (projects), with value mapping
   - `author` → `clientName` (testimonials)
   - Team categories: `admin`→`management`, `heads`→`department-heads`, `team`→`project-managers`
   - Project sectors: `ממשלתי`→`public`, `תעשייה ומסחר`→split to `industrial`+`commercial`
3. Add missing required fields: `isActive: true`, `createdAt`, `updatedAt`, `order`
4. Upload all media to Sanity media library
5. Create Sanity document for every entity
6. Bind recovered testimonials to their projects (require manual mapping by founder)
7. Produce migration verification report: per-entity counts, field completeness

**Migration Verification:**

| Check | Method |
|-------|--------|
| Entity counts match | Compare Sanity document count per type vs. DATA_MANIFEST.md |
| All media accessible | Query Sanity for every media reference, verify URL resolves |
| All fields populated | Query for documents with null required fields |
| Testimonials bound to projects | Query for testimonials with null projectRef — must be zero |
| Rich text content preserved | Spot-check 5 service + 5 project descriptions |
| Hebrew text intact | Spot-check for encoding corruption |

### 3.3 Definition of Done

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] All 15 Sanity schemas defined and deployed
- [ ] All data migrated — entity counts match DATA_MANIFEST.md exactly
- [ ] All media assets in Sanity media library and accessible
- [ ] No `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `as any` in codebase
- [ ] NextAuth login flow works with Google OAuth
- [ ] Unauthenticated requests to `/api/admin/*` return 401
- [ ] Rate limiting active on all tiers
- [ ] Sentry receiving error reports
- [ ] Build-time env validation fails on missing required vars
- [ ] **Verification gate:** Founder reviews migrated data in Sanity Studio and confirms completeness

---

## 4. Phase 2 — Governed API Surface

**Duration:** 3–5 days
**Dependency:** Phase 1 complete
**Goal:** Every API endpoint defined in DOC-040 exists, is authenticated, validates input, enforces invariants, and returns proper envelopes.

### 4.1 Actions

| ID | Action | Governing Doc | Complexity | Endpoints |
|----|--------|---------------|------------|-----------|
| A-01 | Content CRUD routes (10 entities) | DOC-040 §2.9 | L | team, projects, services, clients, press, jobs, content-library, hero, site-settings + project-scoped testimonials |
| A-02 | Lead intake (public) | DOC-040 §2.2 | M | `POST /api/public/leads` with Turnstile, duplicate detection |
| A-03 | Lead management routes | DOC-040 §2.2 | L | List, detail, create, PATCH, transition, archive, restore, convert, bulk |
| A-04 | Client CRM routes | DOC-040 §2.3 | L | List, detail, create, PATCH, transition, archive, restore, bulk |
| A-05 | Engagement routes | DOC-040 §2.6 | M | Full CRUD + transition |
| A-06 | Activity routes | DOC-040 §2.5 | M | Recent feed, manual creation |
| A-07 | CRM Settings route | DOC-040 §2.7 | S | GET + PUT singleton |
| A-08 | CRM Search route | DOC-040 §2.8 | M | Cross-entity search |
| A-09 | Data fetcher functions (16) | DOC-040 §2.10 | M | getActiveServices, getActiveProjectsBySector, etc. |
| A-10 | Error envelope enforcement | DOC-040 §4.1 | M | All routes return governed envelopes |
| A-11 | Optimistic concurrency enforcement | DOC-040 §3.2, INV-023 | M | updatedAt check on every mutation |
| A-12 | Status transition matrix enforcement | DOC-040 §5 | M | Lead, Client, Engagement matrices |
| A-13 | Activity generation on CRM mutations | DOC-040 §6 | M | Atomic activity creation per INV-020 |

### 4.2 Definition of Done

- [ ] Every route in DOC-040 §2 exists and responds
- [ ] Every route behind `/api/admin/` returns 401 without auth
- [ ] Every mutation route validates input via Zod
- [ ] Every mutation route checks updatedAt (409 on conflict)
- [ ] Every CRM mutation generates Activity atomically
- [ ] Error envelope matches DOC-040 §4.1 exactly
- [ ] Success envelope matches DOC-040 §8.1 exactly
- [ ] Status transitions reject invalid paths
- [ ] `POST /api/public/leads` works with Turnstile, rejects without
- [ ] Duplicate lead detection within 5-minute window works
- [ ] All 16 data fetcher functions return correct data
- [ ] **Verification gate:** API integration tests pass (minimum: 1 test per route)

---

## 5. Phase 3 — Back Office

**Duration:** 5–8 days
**Dependency:** Phase 2 complete
**Goal:** Complete admin interface per DOC-030 and DOC-050. All CMS + CRM features operational.

### 5.1 Actions

| ID | Action | Governing Doc | Complexity |
|----|--------|---------------|------------|
| B-01 | Admin layout: sidebar (CMS 9 tabs + CRM 6 tabs), Hebrew, RTL | DOC-030 §3.1 | M |
| B-02 | SlidePanel component | DOC-030 §11.1, DOC-050 §2 | M |
| B-03 | Deterministic state machine (mutation lifecycle) | DOC-050 §16 | M |
| B-04 | Error rendering system (6 categories) | DOC-050 §9 | M |
| B-05 | CMS: Team management with SlidePanel | DOC-030 §11.3 | M |
| B-06 | CMS: Project management with testimonial CRUD | DOC-030 §11.2, DOC-050 §19 | L |
| B-07 | CMS: Service management | DOC-030 §11.4 | M |
| B-08 | CMS: Client (content) management | DOC-030 §11.6 | S |
| B-09 | CMS: Press, Jobs, Content Library management | DOC-030 §11.6–11.8 | M |
| B-10 | CMS: Hero Settings editor | DOC-030 §11.9 | S |
| B-11 | CMS: Site Settings editor | DOC-030 §11.10 | S |
| B-12 | CRM: Dashboard with widgets | DOC-030 §3.3 | L |
| B-13 | CRM: Lead management (list + detail + transitions) | DOC-030 §4 | L |
| B-14 | CRM: Client CRM management | DOC-030 §5 | L |
| B-15 | CRM: Engagement management | DOC-030 §6, DOC-050 §23 | L |
| B-16 | CRM: Pipeline Kanban | DOC-030 §7, DOC-050 §21 | M |
| B-17 | CRM: Activity timeline + logging modal | DOC-030 §8, DOC-050 §24 | M |
| B-18 | CRM: CRM Settings editor | DOC-030 §9, DOC-050 §22 | M |
| B-19 | CRM: Global search | DOC-030 §10, DOC-050 §26 | M |
| B-20 | CRM: Lead conversion modal | DOC-030 §4.5, DOC-050 §27 | M |
| B-21 | CRM: New leads badge (60s polling) | DOC-050 §25 | S |
| B-22 | Bulk operations UX | DOC-050 §6 | M |
| B-23 | Portable Text editor | DOC-050 §18 | M |
| B-24 | Error boundary (Hebrew fatal screen) | DOC-050 §15 | S |
| B-25 | Unsaved changes warning | DOC-050 §18.7 | S |

### 5.2 Definition of Done

- [ ] All 9 CMS tabs operational with full CRUD
- [ ] All 6 CRM tabs operational
- [ ] Testimonials managed only within Project context — no standalone tab
- [ ] SlidePanel pattern used consistently
- [ ] Every mutation follows deterministic state machine (Idle→InFlight→Success/Error/NetworkUnknown)
- [ ] No optimistic updates anywhere (DOC-050 §13.1)
- [ ] Replace Rule enforced (DOC-050 §10.1)
- [ ] All error messages in Hebrew
- [ ] RTL layout throughout — sidebar right, SlidePanel from left
- [ ] Pipeline Kanban renders from CrmSettings
- [ ] Activity timeline immutable
- [ ] Error boundary catches rendering failures with Hebrew message
- [ ] **Verification gate:** Founder performs full CRUD workflow for every entity type

---

## 6. Phase 4 — Public Website (SSR)

**Duration:** 5–8 days
**Dependency:** Phase 1 (Sanity data) + Phase 2 (data fetchers)
**Goal:** All public pages server-rendered from Sanity. Static HTML site fully replaced. Lighthouse ≥ 97 all categories. GEO-optimized.

**Note:** Phase 4 can run in parallel with Phase 3. They share Phase 1 + 2 as dependencies but not each other.

### 6.1 Actions

| ID | Action | Governing Doc | Complexity |
|----|--------|---------------|------------|
| P-01 | Homepage — hero video, services overview, featured projects, client logos, featured testimonials, CTA | DOC-000 §9 | L |
| P-02 | About page | DOC-000 §9 | M |
| P-03 | Services listing + `/services/[slug]` detail pages | DOC-000 §9 | M |
| P-04 | Projects listing (sector filters) + `/projects/[slug]` detail with linked testimonials | DOC-000 §9 | L |
| P-05 | Team page with category sections | DOC-000 §9 | M |
| P-06 | Clients page (logos + testimonials) | DOC-000 §9 | M |
| P-07 | Press page | DOC-000 §9 | S |
| P-08 | Jobs listing + job application form (with CV upload) | DOC-000 §9 | M |
| P-09 | Join Us (supplier registration) | DOC-000 §9 | S |
| P-10 | Content Library page | DOC-000 §9 | S |
| P-11 | Innovation page | DOC-000 §9 | S |
| P-12 | Contact page with governed lead intake (Turnstile) | DOC-000 §9 | M |
| P-13 | Terms, Privacy, Accessibility pages | DOC-000 §9 | S |
| P-14 | 404 page (Hebrew) | — | S |
| P-15 | Dynamic sitemap generation | DOC-000 §8.8 | S |
| P-16 | robots.txt | DOC-000 §8.8 | S |
| P-17 | Navigation with dynamic dropdowns (Services, Projects by sector) | DOC-050 §20 | M |
| P-18 | Responsive design — desktop, tablet, mobile | DOC-000 §5.1 | L |
| P-19 | Performance optimization (images, video, fonts, code splitting) | — | L |

### 6.2 SEO Implementation (DOC-000 §8.8)

| Schema.org Type | Pages | Fields |
|-----------------|-------|--------|
| Organization | All pages (global) | name, url, logo, contactPoint, address, sameAs (social links) |
| LocalBusiness | Homepage, Contact | geo, openingHours, telephone, priceRange, areaServed |
| Service | `/services/[slug]` | name, description, provider, areaServed, serviceType |
| Project | `/projects/[slug]` | name, description, image, location |
| Person | `/team` | name, jobTitle, worksFor, image, alumniOf |
| JobPosting | `/jobs` | title, description, datePosted, employmentType, hiringOrganization |

Every page must include:

- `<title>` — unique, Hebrew, ≤ 60 chars
- `<meta name="description">` — unique, Hebrew, ≤ 155 chars
- `<link rel="canonical" href="...">` — absolute URL
- Open Graph: og:type, og:url, og:title, og:description, og:image, og:locale (he_IL)
- Twitter Card: summary_large_image
- JSON-LD: appropriate Schema.org type(s)
- `<html lang="he" dir="rtl">`

### 6.3 GEO (Generative Engine Optimization)

LLMs discover and cite content differently from traditional search crawlers. The following optimizations make WDI discoverable and citable by AI systems (Google AI Overviews, Bing Copilot, ChatGPT, Perplexity, Claude):

#### 6.3.1 Structured Data Depth

Go beyond minimum Schema.org. Provide rich, nested structured data that LLMs can parse:

| Enhancement | Implementation |
|-------------|---------------|
| **Service details** | serviceType, areaServed: "Israel", provider: Organization ref, description with methodology keywords |
| **Project details** | Sector, client name, scope, location, budget range, duration — all in JSON-LD |
| **Team expertise** | Each Person schema includes: alumniOf, knowsAbout (list of expertise areas), hasCredential |
| **Company facts** | founding year (2013), number of employees, number of completed projects, sectors served |
| **FAQ schema** | Add FAQPage schema to service pages with common questions about each service type |
| **Review/Testimonial** | Map testimonials to Review schema with author, reviewBody, itemReviewed |

#### 6.3.2 Entity Clarity

LLMs need to identify WDI as a distinct, authoritative entity:

| Signal | Implementation |
|--------|---------------|
| **Consistent naming** | "WDI Ltd Israel" everywhere — same string in JSON-LD, meta tags, content |
| **Entity disambiguation** | Include legalName, alternateName (ו.ד.י בע"מ), foundingDate, founder names |
| **External links** | sameAs array: LinkedIn company page, Companies House (רשם החברות) link, Google Business Profile |
| **About page depth** | Company history with dates, milestones, sector expertise with evidence |
| **Cross-referencing** | Project pages link to services used. Service pages link to relevant projects. Team pages link to project involvement. |

#### 6.3.3 Citable Content

LLMs prefer content they can quote directly:

| Principle | Implementation |
|-----------|---------------|
| **Fact-first writing** | Lead paragraphs with concrete claims: "WDI has managed over 200 construction projects since 2013 across security, commercial, industrial, residential, infrastructure, and public sectors." |
| **Quantified evidence** | Project pages include: budget managed, duration, square meters, sector, specific deliverables |
| **Expertise signals** | Service pages describe methodology, relevant Israeli standards (תקן ישראלי), and regulatory expertise |
| **Question-shaped headings** | H2s on service pages formulated as questions users ask: "מה כולל שירות ניהול פרויקטים?" |
| **Bilingual SEO anchors** | While the site is Hebrew, include the English company name in meta and JSON-LD for English-language LLM queries |

#### 6.3.4 Technical GEO

| Signal | Implementation |
|--------|---------------|
| **Server-side rendering** | SSR ensures LLM crawlers see complete content (no client-side JS dependency) |
| **Clean HTML structure** | Semantic HTML5: `<article>`, `<section>`, `<nav>`, `<main>`, `<aside>` |
| **Fast response** | ≤ 200ms TTFB — LLM crawlers have aggressive timeouts |
| **Sitemap with lastmod** | Dynamic sitemap with accurate lastmod dates — signals content freshness |
| **No JavaScript-only content** | Every piece of content in the initial HTML response |

### 6.4 Lighthouse Targets

| Category | Target | Key Levers |
|----------|--------|------------|
| **Performance** | ≥ 97 | Image optimization (next/image, WebP/AVIF), hero video lazy-load with poster frame, font subsetting (Hebrew subset only), code splitting, minimal JS bundle, server-side rendering |
| **Accessibility** | ≥ 97 | Semantic HTML, ARIA labels (Hebrew), alt text on all images (Hebrew), sufficient color contrast, focus management, keyboard navigation, skip-to-content link |
| **Best Practices** | ≥ 97 | HTTPS everywhere, no console errors, no deprecated APIs, CSP headers, correct image aspect ratios, no document.write |
| **SEO** | ≥ 97 | All meta tags, canonical URLs, JSON-LD, descriptive link text, crawlable links, robots.txt, sitemap, hreflang (he), mobile-friendly |

**Hero Video Performance Strategy:**

The homepage hero video is the biggest performance risk. Strategy:

1. Poster frame (first frame as optimized WebP) displayed immediately
2. Video loaded with `loading="lazy"` and `preload="none"`
3. IntersectionObserver triggers video load only when hero is visible
4. Video served from Sanity CDN or dedicated CDN with proper caching headers
5. Video compressed: H.264, max 40MB (DOC-020 §3.14, DOC-070 §3.1), 720p sufficient for background
6. Fallback: if video fails to load, poster frame remains — no broken UI

### 6.5 Definition of Done

- [ ] All 18 public routes from DOC-000 §9 render from Sanity data
- [ ] Zero hardcoded content in components or templates
- [ ] Static HTML site completely removed from deployment
- [ ] Lighthouse ≥ 97 on all 4 categories (measured on: homepage, one service page, one project page, team page, contact page)
- [ ] JSON-LD present and valid on all relevant pages (test with Google Rich Results Test)
- [ ] GEO: Entity graph complete (Organization + LocalBusiness + all Service + all Project + all Person + all JobPosting)
- [ ] GEO: FAQ schema on all service pages
- [ ] GEO: Review schema on testimonial-bearing pages
- [ ] Dynamic sitemap with accurate lastmod dates
- [ ] Contact form submits to governed `POST /api/public/leads` — not Netlify Forms
- [ ] Mobile responsive on all pages (test: 375px, 768px, 1024px, 1440px)
- [ ] Hebrew RTL throughout — no LTR leaks
- [ ] All images optimized (next/image with WebP/AVIF)
- [ ] Core Web Vitals: LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1
- [ ] **Verification gate:** Lighthouse report submitted and reviewed. Google Rich Results Test passes.

---

## 7. Phase 5 — Hardening & Launch

**Duration:** 2–3 days
**Dependency:** Phases 3 + 4 complete
**Goal:** Production-ready deployment with security hardening, monitoring, and operational verification.

### 7.1 Actions

| ID | Action | Complexity |
|----|--------|------------|
| H-01 | Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | S |
| H-02 | Cookie security audit (httpOnly, secure, sameSite on all cookies) | S |
| H-03 | CORS configuration (restrict to wdi.co.il + admin subdomain) | S |
| H-04 | Penetration test — attempt unauthenticated access to all admin routes | M |
| H-05 | Load test — verify rate limiting under load | S |
| H-06 | E2E test suite — critical paths (login, create lead, create project, edit team, convert lead) | L |
| H-07 | Netlify deployment configuration — build commands, env vars, redirects | S |
| H-08 | DNS verification — wdi.co.il pointing to new deployment | S |
| H-09 | Old static site archive — save complete copy before cutover | S |
| H-10 | Google Search Console — submit new sitemap, verify ownership | S |
| H-11 | Google Business Profile — update website URL if needed | S |
| H-12 | Monitoring dashboards — Sentry alerts, Upstash dashboard, Sanity usage | S |
| H-13 | Operator training — walkthrough of full Back Office with founder | M |
| H-14 | .git/ exclusion from deploy artifacts verified | S |

### 7.2 Launch Checklist

| Check | Verified |
|-------|----------|
| All env vars set in Netlify production | ☐ |
| Authentication works in production | ☐ |
| All CMS CRUD operations work in production | ☐ |
| All CRM CRUD operations work in production | ☐ |
| Public lead intake works in production | ☐ |
| Hero video loads and plays | ☐ |
| All project pages render with images | ☐ |
| All service pages render with content | ☐ |
| Team page shows all members in correct categories | ☐ |
| Testimonials display on project pages and homepage | ☐ |
| Contact form submits successfully | ☐ |
| 404 page renders in Hebrew | ☐ |
| Lighthouse ≥ 97 on production URL | ☐ |
| Google Rich Results Test passes | ☐ |
| Sentry receiving errors (send test error) | ☐ |
| Rate limiting blocks excessive requests | ☐ |
| No console errors on any page | ☐ |
| Founder approves content appearance | ☐ |
| Mobile layout verified on real device | ☐ |
| SSL certificate valid | ☐ |
| Old static site archived | ☐ |

### 7.3 Definition of Done

- [ ] All launch checklist items verified
- [ ] Zero Critical or High severity issues open
- [ ] Founder has performed complete CRUD workflow in production
- [ ] Sentry, rate limiting, authentication all verified in production
- [ ] DNS cutover complete — wdi.co.il serves new system
- [ ] **System is live.**

---

## 8. Phase 6 — Post-Launch Optimization

**Duration:** Ongoing
**Dependency:** Phase 5 complete
**Goal:** Continuous improvement, competitor analysis, GEO monitoring.

### 8.1 Actions

| ID | Action | Timeline |
|----|--------|----------|
| O-01 | Monitor Google Search Console for indexing issues | Week 1 |
| O-02 | Submit key pages to Google for re-indexing | Week 1 |
| O-03 | Monitor Lighthouse scores — automated weekly checks | Ongoing |
| O-04 | Test GEO visibility: query LLMs for "חברות ניהול פרויקטים בישראל" and variants | Week 2 |
| O-05 | Competitor analysis: Lighthouse + structured data comparison vs. Poran Shrem | Week 2 |
| O-06 | Content enrichment: add FAQ content to service pages | Weeks 2–4 |
| O-07 | Internal linking optimization | Weeks 2–4 |
| O-08 | Core Web Vitals monitoring via CrUX dashboard | Ongoing |
| O-09 | Accessibility audit (manual + automated) | Month 2 |
| O-10 | Security review — quarterly | Quarterly |

---

## 9. Execution Timeline Summary

```
Phase 0 ─ Data Archaeology ──────── [Days 1-2]
                                         │
Phase 1 ─ Foundation ─────────────── [Days 3-7]
                                         │
Phase 2 ─ API Surface ───────────── [Days 8-12]
                                         │
                    ┌────────────────────┴────────────────────┐
Phase 3 ─ Back Office ─────── [Days 13-20]     Phase 4 ─ Public Site ─────── [Days 13-20]
                    └────────────────────┬────────────────────┘
                                         │
Phase 5 ─ Hardening & Launch ─────── [Days 21-23]
                                         │
Phase 6 ─ Post-Launch ───────────── [Ongoing]
```

**Total estimated duration: 23 working days to launch.**

---

## 10. Non-Negotiable Constraints (Summary)

| Constraint | Source | Enforcement |
|------------|--------|-------------|
| Zero data loss | DOC-000 §6.9 | Phase 0 verification + Phase 1 migration audit |
| Data recovery from history | Founder directive | Phase 0 Git archaeology |
| TypeScript strict, zero suppressions | DOC-000 §8.7 | CI check: `tsc --noEmit` |
| Authentication on all admin routes | DOC-010 §3.5 | Penetration test in Phase 5 |
| Hebrew throughout, RTL native | DOC-000 §7 | Manual review per phase |
| Lighthouse ≥ 97 all categories | daflash benchmark | Automated Lighthouse CI per Phase 4 |
| GEO optimization | Founder directive | LLM query testing in Phase 6 |
| All 37 invariants enforced | DOC-020 §5 | Schema-level + API-level enforcement |
| Deterministic UI state machine | DOC-050 §16 | Code review |
| No optimistic updates | DOC-050 §13.1 | Code review |
| Governed error envelopes (Hebrew) | DOC-040 §4 | API integration tests |

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data loss during migration | Medium | Critical | Phase 0 archive + dual verification (manifest counts + founder review) |
| Testimonial-to-project binding ambiguous | High | Medium | Founder manually reviews and approves mappings before migration |
| Hero video performance degrades Lighthouse | Medium | High | Poster frame strategy + lazy loading + compressed video |
| Sanity usage limits exceeded | Low | Medium | Monitor usage dashboard; optimize GROQ queries |
| Netlify build timeout on large site | Low | Medium | Optimize build; use ISR where appropriate |
| GEO visibility takes months to materialize | High | Medium | Front-load structured data; content enrichment in Phase 6 |
| Competitor (Poran Shrem) has strong SEO advantage | High | Medium | Superior structured data + GEO = differentiation vector |

---

## 12. Binding Nature

This document is subordinate to DOC-000 through DOC-050. It operationalizes their requirements into an execution sequence. If a conflict exists between this plan and any governing document, the governing document prevails.

Phase gates are enforced. A phase that has not met its Definition of Done does not proceed to the next phase. A feature that has not passed its verification gate is not considered complete.

No convenience, timeline pressure, or partial progress supersedes a Definition of Done.

---

*End of document.*
