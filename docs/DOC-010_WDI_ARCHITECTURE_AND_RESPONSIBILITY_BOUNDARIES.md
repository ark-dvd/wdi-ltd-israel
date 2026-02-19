# DOC-010 — WDI Architecture & Responsibility Boundaries

**Status:** Canonical
**Effective Date:** February 19, 2026
**Version:** 1.0
**Timestamp:** 20260219-1640 (CST)
**Governing Document:** DOC-000 — WDI System Charter & Product Promise (v1.0)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260219-1640 | Initial release — full architecture and responsibility boundaries for WDI Ltd Israel rebuild |

---

### Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

---

## 1. Executive Intent

Architectural boundaries exist because without them, every component eventually tries to compensate for every other component. The result is a system where nothing is responsible for anything because everything is partially responsible for everything.

wdi.co.il has failed this way before. Content was hardcoded in static HTML files because no CMS was connected. A contact form was wired to Netlify Forms because no CRM existed. A backoffice was built that writes JSON to GitHub via API tokens because Sanity CMS was adopted and then abandoned. Team member categories in the backoffice don't match the categories on the live site. Image uploads commit to GitHub successfully but return HTTP 500 to the operator. Each compensation appeared to solve an immediate problem. Collectively, they created a system where no single component can be trusted to do its job because no component has a defined job.

Blurred ownership creates silent failure. When a website renders hardcoded content instead of CMS content, the page looks correct — but the operator cannot change it. When a backoffice accepts edits but the persistence layer returns 500, the save appears to work — but the data may be corrupted. When there is no authentication whatsoever, the admin appears to function — but anyone on the internet can delete all content.

This document defines which component owns what, what each component is forbidden from doing, and how components interact across boundaries. These boundaries are structural, not advisory. Violating them produces defects, not trade-offs.

---

## 2. System Architecture

### 2.1 Current State (Observed from Repository — 20260219)

The following describes the actual state of the wdi.co.il repository as evidenced by independent audits (ChatGPT CTO Simulation, Claude CTO Simulation, 2026-01-18) and confirmed by direct file inspection.

**Repository structure:**

The repository contains two distinct codebases in a single repo (`ark-dvd/wdi-ltd-israel`):

- **Static Site (root):** Pure HTML/CSS/JS files. index.html, about.html, team.html, services.html, projects.html, contact.html, jobs.html, job-application.html, join-us.html, clients.html, content-library.html, innovation.html, 404.html. CSS in `/css/` (style.css ~2000 lines, mobile-fixes.css). JavaScript in `/js/main.js`. Static data in `/data/` as JSON files organized in per-entity folders with `_index.json` manifests. Static HTML detail pages under `/services/` (8 pages) and `/projects/`. Media under `/images/`, `/videos/`, `/documents/`.

- **Backoffice (wdi-backoffice/):** Next.js 14.2.3 application using App Router with JavaScript (not TypeScript). Tailwind CSS. `lib/github.js` — the GitHub API integration layer that replaces a traditional CMS/database. API routes under `app/api/` for all entities (projects, team, services, clients, testimonials, press, jobs, content-library, hero, upload, upload-video). UI pages under `app/` for each entity (list, new, edit).

**Critical defects identified by independent audits:**

1. **No authentication whatsoever.** The backoffice has zero AuthN/AuthZ. No middleware, no session checks, no API protection. Every API route is publicly writable. Anyone can create, edit, or delete all content.

2. **GitHub API as database.** `lib/github.js` uses GITHUB_TOKEN to read/write JSON files and upload media directly to the repository. This creates SPOF dependency, rate limiting risks (5000 req/hour), sequential file reads (O(n) API calls per entity list), and repository bloat from media commits.

3. **Broken build pipeline.** `netlify.toml` references `scripts/update-indexes.js` which does not exist. Builds fail.

4. **Path injection vulnerability.** Upload API accepts `folder` parameter from client without allowlist — theoretically allows writing to any path in the repo.

5. **No input validation.** API routes accept and persist arbitrary JSON without schema validation. Malformed content can break the live site.

6. **XSS risk.** `js/main.js` uses `innerHTML` to render JSON data into the DOM without sanitization.

7. **Data model inconsistency.** Dual content sources: folder-per-item (`data/<type>/*.json`) AND combined files (`data/<type>.json`) with fallback logic in `main.js` that masks failures. Team categories in backoffice (management, administration, department-heads, project-managers) don't match website categories (founders, admin, heads, team). Field naming conflicts (position vs. role).

8. **No TypeScript.** Entire backoffice in plain JavaScript. No type safety, no compile-time error detection.

9. **No tests.** Zero unit, integration, or E2E tests.

10. **No error monitoring.** Console.error only. No structured logging, no error reporting, no observability.

11. **`.git/` directory deployed.** Git metadata included in deploy artifacts, exposing repository history.

12. **Content Library empty.** Routes and UI exist in backoffice, but `data/content-library/` is empty despite 6 items existing on the live site.

**What is present and functional:**

- Static site renders correctly with existing hardcoded + JSON content
- Backoffice UI structure with entity CRUD screens
- RTL/Hebrew layout in backoffice (`app/layout.js` sets `dir="rtl"` and `lang="he"`)
- Tailwind configuration with RTL support and WDI brand colors
- GitHub API integration layer with uniform CRUD operations
- Media upload to repository (images and video)
- Netlify Forms integration for public contact/application forms

### 2.2 Target Canonical Architecture (Required by DOC-000 v1.0)

The following describes the architecture that must exist to satisfy DOC-000 v1.0 — WDI System Charter & Product Promise. The entire current codebase is replaced. Nothing from the current implementation carries forward except content data, media assets, and design intent.

**Application Framework:** Next.js 14+ with App Router, server-side rendering, and serverless API routes. TypeScript in strict mode. Zero suppressions.

**Public Website Layer:** Server-rendered pages that retrieve all content from the Content Store at render time. No hardcoded content in templates or components. Responsive across all viewport sizes. All pages in Hebrew, RTL-native. Specific page types:

- Service detail pages at `/services/[slug]`
- Project detail pages at `/projects/[slug]` — with sector classification, scope, images, linked testimonials
- Team listing at `/team` — with category sections (founders, management, department heads, project managers)
- Content library at `/content-library` — professional resources and publications
- Press coverage at `/press` — media articles about WDI
- Job listings at `/jobs` — open positions
- Job application form at `/job-application` — with CV upload
- Supplier registration at `/join-us`
- SEO with structured data (JSON-LD) for Organization, LocalBusiness, Service, Project, Person, JobPosting

**Back Office Layer:** Authenticated administrative interface at `/admin` and sub-routes. Organized into two clearly separated sidebar sections:

- **CMS Section (ניהול תוכן):** צוות (Team), פרויקטים (Projects), שירותים (Services), לקוחות (Clients/Logos), המלצות (Testimonials), כתבו עלינו (Press), משרות (Jobs), מאגר מידע (Content Library), Hero, הגדרות אתר (Site Settings) — each tab goes directly to content management (no CMS dashboard)
- **CRM Section (ניהול לקוחות):** לוח בקרה (Dashboard), לידים (Leads), לקוחות CRM (Clients CRM), התקשרויות (Engagements), צינור מכירות (Pipeline), הגדרות CRM (CRM Settings)
- The default landing page after login is the CRM Dashboard
- The entire Back Office interface is in Hebrew, right-to-left
- Every editing interface backed by a functional, authenticated API endpoint

**API Layer:** Protected routes under `/api/admin/` for all content and CRM mutations. Public endpoint for lead intake with server-side validation and abuse prevention. Every route enforces authentication (admin routes) and input validation via Zod. Specific route groups:

- Content CRUD: Team, Projects, Services, Clients (logos), Testimonials, Press, Jobs, Content Library, Hero, Site Settings, Upload, Upload Video
- CRM: Leads (list, detail, create, update, transition, archive, restore, convert, bulk), Clients CRM (list, detail, create, update, transition, archive, restore, bulk), Engagements (list, detail, create, update, transition), Activities (entity-scoped, recent feed, manual creation), Pipeline, CRM Settings, CRM Search
- Public: Lead intake with Turnstile abuse prevention
- Auth: NextAuth with rate limiting

**Content Store:** Sanity CMS as the single source of truth for all visitor-facing content and all CRM data. Schema definitions for every entity type. Read client (useCdn: false) for SSR rendering and admin reads, write client (with SANITY_API_TOKEN) for admin mutations.

**CRM Data Store:** Sanity CMS (shared data store, distinct document types). Structured storage for leads, clients, engagements, activities, and CRM settings. Lead records created from validated contact form submissions. Status lifecycle management. Activity logging. Optimistic concurrency. Atomic transactions.

**Authentication Layer:** NextAuth with Google OAuth. JWT session strategy. Email whitelist for authorized operators (ADMIN_ALLOWED_EMAILS). Triple-layer enforcement: edge middleware → server layout → API route guard. Explicit cookie configuration. Rate limiting: admin 60/min, auth 10/min, public leads 5/min, upload 20/min.

**Rate Limiting:** Upstash Redis for persistent, serverless-safe rate limiting. No in-memory rate limiting (DOC-000 §6.8).

**Error Monitoring:** Sentry for production error tracking. Structured logging with correlation IDs.

**Deployment Environment:** Netlify. Git-based deployment with automated build pipeline. Required environment variables validated at build time.

---

## 3. Responsibility Domains

These domains define the target architecture required by DOC-000 v1.0. They apply to all implementation work from this point forward.

### 3.1 Public Website Domain

**Owns:**

- Rendering all visitor-facing pages using content retrieved from the Content Domain
- Page layout, navigation structure, visual design, and responsive behavior
- Hebrew language presentation and RTL-native layout on all pages
- Presenting the contact form, job application form, and supplier registration form to visitors
- Delivering validated form submissions to the Lead Intake path of the CRM Domain (contact form) and to Netlify-managed handling (job application, supplier registration)
- SEO metadata, structured data (JSON-LD for Organization, LocalBusiness, Service, Project, Person, JobPosting), Open Graph tags, canonical URLs, dynamic sitemap, and robots.txt
- Client-side interactivity (animations, navigation toggles, project sector filtering, form UX)

**Page Inventory (per DOC-000 v1.0 §9):**

| Route | Hebrew Name | Description |
|-------|-------------|-------------|
| `/` | דף הבית | Homepage — hero video, services overview, featured projects, client logos, featured testimonials, CTA |
| `/about` | אודות | Company information, history, values |
| `/services` | שירותים | Service listing page — grid of all active services |
| `/services/[slug]` | עמוד שירות | Individual service detail page |
| `/projects` | פרויקטים | Project listing with sector filters (בטחוני, מסחרי, תעשייה, תשתיות, מגורים, ציבורי) |
| `/projects/[slug]` | עמוד פרויקט | Individual project detail page — client, scope, sector, images, linked testimonials |
| `/team` | הצוות | Team listing with category sections (founders, management, department heads, project managers) |
| `/clients` | לקוחות | Client logos and testimonials |
| `/press` | כתבו עלינו | Press coverage and media articles |
| `/jobs` | משרות | Job listings |
| `/job-application` | הגשת מועמדות | Job application form (with CV upload) |
| `/join-us` | הצטרפות למאגר ספקים | Supplier/subcontractor registration |
| `/content-library` | מאגר מידע | Professional resources and publications |
| `/innovation` | חדשנות וטכנולוגיה | Innovation and technology initiatives |
| `/contact` | צור קשר | Contact form — lead intake |
| `/terms` | תנאי שימוש | Terms of use |
| `/privacy` | מדיניות פרטיות | Privacy policy |
| `/accessibility` | הצהרת נגישות | Accessibility statement |

**Does Not Own:**

- Content creation, editing, storage, or management
- Lead records, lead status, or any CRM state
- Authentication or access control of any kind
- Business logic beyond presentation
- Decision-making about what content to display (it renders what it receives)
- Default or fallback content when CMS data is absent

**Authority Rules:**

The Public Website Domain reads from the Content Domain and writes to the CRM Domain (via lead submission only). It never writes to the Content Domain. It never reads from the CRM Domain. It renders exactly what the Content Domain provides. If the Content Domain returns no data, the Public Website Domain displays an empty or error state — it does not fabricate content.

All rendering is in Hebrew with RTL layout. If content is missing, the empty state message is in Hebrew.

**Prohibited Behaviors:**

- Hardcoding any visitor-facing content string in templates or components
- Rendering fallback or demo content when the CMS returns empty
- Submitting leads to any destination other than the governed CRM intake path
- Caching content in a way that prevents operator changes from appearing
- Making direct calls to the Content Store (Sanity) without going through the data access layer
- Rendering any content in a language other than Hebrew (except proper nouns and technical identifiers)

### 3.2 Back Office Domain

**Owns:**

- The authenticated administrative interface at `/admin` and all sub-routes
- Presenting current persisted state for all manageable entities
- Hebrew language and RTL layout for the entire admin interface — every label, message, tooltip, placeholder, error, and confirmation
- A clearly separated sidebar with two sections:
  - **CMS Section (ניהול תוכן):** צוות, פרויקטים, שירותים, לקוחות, המלצות, כתבו עלינו, משרות, מאגר מידע, Hero, הגדרות אתר — each linking directly to its content management tab (no CMS dashboard)
  - **CRM Section (ניהול לקוחות):** לוח בקרה (Dashboard), לידים (Leads), לקוחות CRM (Clients), התקשרויות (Engagements), צינור מכירות (Pipeline), הגדרות CRM (CRM Settings)
- The CRM Dashboard as the default landing page after login — displaying: clickable stat cards, Pipeline Summary widget, Recent Leads widget, Recent Activity feed
- Providing editing interfaces for all CMS-managed content, including:
  - Team CRUD — with category selection (founders, management, department heads, project managers), role, qualifications, education (degrees array with title, degree, institution, year), photo upload
  - Project CRUD — with sector classification (בטחוני, מסחרי, תעשייה, תשתיות, מגורים, ציבורי), client, scope, images, linked testimonials
  - Service CRUD — with detail page content, description, highlights
  - Client (logo) CRUD — with logo upload, company name
  - Testimonial CRUD — with optional project reference
  - Press CRUD — article/media coverage management
  - Job CRUD — position details, requirements, application handling
  - Content Library CRUD — professional resources and publications
  - Hero Settings editor — video upload, headlines, CTAs
  - Site Settings editor — contact info, footer, SEO, social links
- Providing management interfaces for all CRM data (Leads, Clients CRM, Engagements, Pipeline, Activities, CRM Settings)
- Communicating operation results (success, failure, validation errors) to the operator — in Hebrew
- Client-side form state management between operator input and save submission

**Does Not Own:**

- Data persistence (the Back Office submits; the API Layer and Content/CRM stores persist)
- Authentication decisions (the Back Office delegates to the Authentication Domain)
- Validation rules (the Back Office applies client-side validation for UX, but authoritative validation lives in the API Layer)
- Direct access to Sanity or any data store
- The public website rendering or visitor experience

**Authority Rules:**

The Back Office Domain communicates exclusively through the API Layer. It never reads from or writes to the Content Store or CRM Store directly. Every mutation request goes through an authenticated, validated API endpoint. Every read request retrieves from the API Layer or through authorized data fetching functions.

The Back Office must always reflect persisted state. When a page loads, it fetches current data from the API. It does not cache previous session state. It does not pre-fill forms from local storage. What the operator sees must be what the system knows.

**Prohibited Behaviors:**

- Calling Sanity APIs directly from client-side code
- Displaying optimistic state updates without server confirmation
- Caching form data across sessions
- Presenting controls or features that do not have corresponding functional API endpoints
- Displaying success states before receiving server confirmation
- Silently swallowing API errors
- Rendering any route without first verifying authentication
- Displaying any UI text in English where Hebrew is expected

### 3.3 CRM Domain

**Owns:**

- All lead records from the moment of creation
- Lead lifecycle: creation, status progression, conversion, archival
- Client records (CRM) created through lead conversion or manual entry
- Engagement records (lifecycle: new → in_progress → review → delivered → completed; also: paused, cancelled) representing active work commitments tied to clients
- CrmSettings singleton — pipeline configuration, engagement configuration, service types, lead sources, defaults. The services offered to leads and engagements are WDI's actual construction industry services as presented on the public site.
- Prospect pipeline stage definitions and status values
- Activity logging for all CRM entity state changes
- Validation rules for CRM data integrity
- Optimistic concurrency enforcement on all CRM mutations

**Does Not Own:**

- The contact form UX (that belongs to the Public Website Domain)
- Content management or website presentation
- Authentication (that belongs to the Authentication Domain)
- Notification or communication delivery

**Authority Rules:**

The CRM Domain is the sole authority on lead, client (CRM), and engagement data. No other domain creates, modifies, or deletes CRM records. The Public Website Domain delivers submissions to the CRM intake endpoint. The Back Office Domain reads from and writes to CRM data through the API Layer. The CRM Domain validates all data mutations and enforces lifecycle rules.

Once a lead enters the CRM, the CRM owns it entirely. The source of the lead (web form, manual entry) does not affect the CRM's authority over the record.

All CRM interface text, labels, status names, and messages are in Hebrew.

**Prohibited Behaviors:**

- Allowing direct data store writes that bypass validation
- Accepting lead submissions without abuse prevention verification
- Permitting status regressions without explicit operator action
- Silently discarding submissions that fail validation (must return error)
- Storing CRM data in any location other than the designated CRM data store

### 3.4 Content Domain

**Owns:**

- All CMS-managed content entities:
  - **Service** (שירות) — professional service offerings with dedicated pages
  - **Project** (פרויקט) — completed/ongoing projects with dedicated detail pages, sector classification, client, scope, images, linked testimonials
  - **TeamMember** (חבר צוות) — company team members with category, role, qualifications, education, photo
  - **Client** (לקוח תוכן) — client organizations with logos, displayed on the public site. Distinct from CRM Client entity.
  - **Testimonial** (המלצה) — client testimonials with optional reference to a specific Project
  - **PressItem** (כתבה) — media coverage and articles about WDI
  - **Job** (משרה) — open positions at WDI
  - **ContentLibraryItem** (פריט מאגר מידע) — professional resources, publications, reference materials
  - **HeroSettings** (הגדרות Hero) — homepage hero section content including video, headlines, CTAs
  - **SiteSettings** (הגדרות אתר) — singleton document governing contact info, footer content, SEO metadata, social links
- Content schema definitions and field structures
- Content validation rules
- Media assets uploaded through the admin (images, logos, videos, documents)
- The relationship between content entities (e.g., which testimonials are featured, which testimonials are linked to which projects)

**Does Not Own:**

- Content presentation or rendering (that belongs to the Public Website Domain)
- Content editing interfaces (that belongs to the Back Office Domain)
- CRM data of any kind
- Authentication or access control
- Application configuration or environment settings

**Authority Rules:**

The Content Domain is the single source of truth for all content displayed on the public website. When the Public Website Domain renders a page, it reads from the Content Domain. When the Back Office Domain saves content, it writes to the Content Domain through the API Layer.

No content exists outside the Content Domain. If text appears on the public site, the Content Domain stores it. If the Content Domain does not have an entry for a content element, that element does not render — it does not fall back to a hardcoded value.

**Prohibited Behaviors:**

- Allowing content writes without authentication verification
- Storing content in any location other than the designated Content Store (Sanity)
- Providing default or demo content in place of missing data in production
- Accepting partial content updates that leave entities in inconsistent states
- Serving stale content from cache when fresh content is available and retrievable

### 3.5 Authentication & Access Domain

**Owns:**

- Identity verification for all Back Office and API access
- Session creation, validation, and expiration
- OAuth flow management (Google OAuth provider integration)
- Authorization decisions: who is allowed to access administrative functions
- The email whitelist that defines authorized operators
- Cookie management and token handling

**Does Not Own:**

- User profiles or user data beyond what authentication requires
- Business logic decisions based on user identity
- Content, CRM data, or application state of any kind
- Rate limiting or abuse prevention for public endpoints (that is a CRM intake concern)

**Authority Rules:**

The Authentication Domain makes a binary decision: authenticated or denied. There is no partial access. There is no degraded mode. There is no anonymous administrative capability.

Every request to the Back Office Domain or to any `/api/admin/` endpoint must pass through authentication verification. Authentication verification happens server-side on every request. Client-side session indicators are convenience only — they do not constitute authorization.

**Prohibited Behaviors:**

- Granting access based on client-side session state alone
- Allowing any administrative route to render without server-side authentication verification
- Storing session secrets in client-accessible locations
- Allowing authentication bypass for development convenience in production builds
- Trusting referrer headers, origin headers, or client-provided identity claims as authentication

### 3.6 Configuration Domain

**Owns:**

- Environment variable definitions and requirements
- Build-time configuration (next.config, Tailwind, TypeScript)
- Platform-specific deployment configuration (netlify.toml)
- Feature flags, if any exist

**Does Not Own:**

- Content of any kind (configuration is not content)
- Business logic (configuration parameterizes behavior; it does not define it)
- Authentication rules (the email whitelist is an authentication concern, not a configuration concern)
- CRM pipeline definitions (those are CRM Domain concerns governed by CrmSettings)
- Visual design decisions (those are Public Website Domain concerns)

**Authority Rules:**

Configuration defines operational parameters: which Sanity project to connect to, which OAuth provider to use, what the deployment URL is, which Upstash Redis instance to connect to. Configuration does not contain business rules, access control lists disguised as config objects, content strings, or behavioral conditions that alter what users see.

If a value affects the content displayed to visitors, it belongs in the Content Domain, not in configuration. If a value determines who can log in, it belongs in the Authentication Domain, not in a config file.

**Prohibited Behaviors:**

- Storing content strings in environment variables or configuration files
- Embedding access control logic in configuration objects
- Using configuration to toggle behaviors that should be governed by code
- Relying on undocumented environment variables
- Allowing the application to start in an ambiguous state when required configuration is missing

### 3.7 Deployment & Runtime Domain

**Owns:**

- The production hosting environment (Netlify) and its configuration
- Build process execution and artifact generation
- Environment variable injection at build and runtime
- SSL/TLS termination and domain routing
- Deployment rollback and version management

**Does Not Own:**

- Application behavior (the application behaves the same regardless of where it runs)
- Content (content lives in the Content Store, not on the hosting platform)
- Authentication rules (authentication is application logic, not platform logic)
- CRM data (data lives in the Content Store, not on the deployment platform)

**Authority Rules:**

The Deployment Domain provides the runtime environment. It does not alter application governance. The same application code, connected to the same Content Store and the same Authentication configuration, must behave identically regardless of whether it runs on Netlify, Vercel, or a local development server.

Platform-specific features (Netlify Form handling for job applications and supplier registration) are acceptable only for non-governed data flows. The governed lead intake flow must use the application's own CRM intake endpoint, not Netlify Forms.

**Prohibited Behaviors:**

- Using platform-native features as the primary mechanism for governed functionality (lead intake must go through the CRM, not Netlify Forms)
- Deploying with missing required environment variables without failing the build
- Allowing the build process to succeed when TypeScript errors exist
- Relying on platform-specific CDN caching behavior for content freshness
- Permitting deployment without readiness verification

---

## 4. Non-Negotiable Boundary Rules

These rules apply across all domains. They are not guidelines. Violation of any rule constitutes a structural defect.

### 4.1 No Silent Compensation Between Domains

When one domain fails to provide what another domain needs, the consuming domain must surface the failure. It must not fabricate a substitute.

If the Content Domain returns no hero video, the Public Website Domain does not render a fallback video. If the Authentication Domain cannot verify a session, the Back Office Domain does not render the admin in a limited mode. If the API Layer rejects a save, the Back Office Domain does not show success.

Compensation hides failures. Hidden failures compound. Compounded failures destroy trust.

### 4.2 No Authority Bypass

No domain may assume the authority of another domain under any circumstances.

The Public Website Domain may not write content. The Back Office Domain may not write directly to the data store. The Configuration Domain may not define content. The Deployment Domain may not alter authentication rules.

If a domain needs something done that another domain owns, it must request it through the governed interface. There are no shortcuts.

### 4.3 Read Does Not Imply Write

A domain that reads from a data source does not gain write authority over that source.

The Public Website Domain reads content. It does not write content. The Back Office Domain reads CRM data to display it. Its write operations go through the API Layer with full authentication and validation. Read access is never a basis for claiming mutation authority.

### 4.4 UI Is Not Source of Truth

What the operator sees on screen is a rendering of persisted state. It is not the state itself.

If the UI shows a value that disagrees with the data store, the data store is correct. If the UI shows a success message but the API returned an error, the save failed. If the UI shows content that the CMS does not contain, the UI is lying.

The source of truth for content is the Content Store. The source of truth for CRM data is the CRM data store. The source of truth for authentication state is the server-side session. The UI renders truth. It does not define it.

### 4.5 Deployment Does Not Change Governance

Redeploying the application does not alter which domain owns what. Moving from one hosting platform to another does not change the authentication rules. Running in development mode does not relax the CMS content ownership constraint.

Governance is defined by this document. It does not vary by environment.

### 4.6 No Domain May Invent Defaults to Hide Missing Data

When data that should exist does not exist, the correct behavior is to surface that absence — not to fabricate a plausible default.

An empty projects list is an honest representation of a Content Store with no projects. A demo projects list that appears when no projects exist is a lie that prevents the operator from recognizing the problem.

Demo mode, fallback content, and synthetic defaults are prohibited in production. They mask failures and break the operator's ability to trust the system.

---

## 5. Cross-Domain Interaction Rules

### 5.1 Public Lead Submission Flow

**Path:** Public Website → API Layer → CRM Domain → CRM Data Store

| Step | Actor | Action |
|------|-------|--------|
| 1 | Visitor | Completes and submits the contact form |
| 2 | Public Website | Performs client-side validation, submits to lead intake API endpoint |
| 3 | API Layer | Verifies Turnstile abuse prevention, validates input server-side |
| 4 | CRM Domain | Creates lead record in the CRM data store with initial status "new" |
| 5 | API Layer | Returns success or error response to the Public Website |
| 6 | Public Website | Displays confirmation or error to the visitor (in Hebrew) |

**Who initiates:** Visitor, via Public Website.
**Who validates:** API Layer (server-side, authoritative).
**Who persists:** CRM Domain, via the CRM Data Store (Sanity).
**Who confirms:** API Layer returns result; Public Website renders it.

No step may be skipped. If abuse prevention cannot be verified, step 4 does not execute (fail-closed). If step 4 fails, step 6 displays an error — not a success.

### 5.2 Content Management Flow

**Path:** Operator → Back Office → API Layer → Content Domain → Content Store

| Step | Actor | Action |
|------|-------|--------|
| 1 | Operator | Navigates to content management section in Back Office |
| 2 | Back Office | Fetches current persisted state from API Layer and renders it |
| 3 | Operator | Makes changes and clicks Save (שמור) |
| 4 | Back Office | Submits changes to the authenticated API endpoint |
| 5 | API Layer | Verifies authentication, validates input via Zod |
| 6 | Content Domain | Writes validated data to the Content Store (Sanity) |
| 7 | API Layer | Returns success or error response |
| 8 | Back Office | Displays confirmation or error to the operator (in Hebrew) |

**Who initiates:** Operator, via Back Office.
**Who validates:** API Layer (server-side, authoritative).
**Who persists:** Content Domain, via the Content Store.
**Who confirms:** API Layer returns result; Back Office renders it.

Step 2 is mandatory. The Back Office must always load current persisted state before presenting editing controls. Pre-filling from local memory, browser cache, or previous session state is prohibited.

This flow applies to all content entities: Service, Project, TeamMember, Client (content), Testimonial, PressItem, Job, ContentLibraryItem, HeroSettings, and SiteSettings.

### 5.3 CRM Management Flow

**Path:** Operator → Back Office → API Layer → CRM Domain → CRM Data Store

This flow is structurally identical to the content management flow. The same steps, rules, and prohibitions apply. The operator manages CRM data through the Back Office, which communicates through the API Layer, which validates and persists through the CRM Domain.

### 5.4 Public Website Content Rendering Flow

**Path:** Visitor Request → Next.js SSR → Data Access Layer → Content Store → Rendered Page

| Step | Actor | Action |
|------|-------|--------|
| 1 | Visitor | Requests a page |
| 2 | Next.js Runtime | Invokes server-side rendering for the requested route |
| 3 | Data Access Layer | Queries the Content Store (Sanity) for required content |
| 4 | Content Store | Returns content data (or empty if no content exists) |
| 5 | Public Website Domain | Renders the page using the content received (Hebrew, RTL) |
| 6 | Next.js Runtime | Returns the rendered HTML to the visitor |

If step 4 returns no data, step 5 renders an appropriate empty or unavailable state in Hebrew. It does not render demo content. It does not render hardcoded fallback. It renders truth.

---

## 6. Conflict Resolution Hierarchy

When two sources of information disagree, the following hierarchy determines which prevails.

### 6.1 UI vs. Persisted Data

**Persisted data prevails.** If the admin UI shows a value that differs from what is stored in the Content Store or CRM data store, the stored value is correct. The UI must be refreshed or corrected.

### 6.2 Configuration vs. Code

**Code prevails for behavior. Configuration prevails for parameters.** Configuration defines operational parameters: which project ID, which OAuth provider, what the deployment URL is. Code defines behavior: how authentication works, how data is validated, how content is rendered. If a configuration value appears to change system behavior in a way that contradicts code-defined governance, the code governs.

### 6.3 Deployment vs. Canon

**Canon prevails.** This document and its subordinate canonical documents define system behavior. A deployment that deviates from canon — by disabling authentication, enabling demo mode, hardcoding content — is non-compliant regardless of whether it runs and appears to work.

### 6.4 Cache vs. Source of Truth

**Source of truth prevails.** If cached data disagrees with the Content Store, the Content Store is correct. Caching is a performance optimization. It is not a source of truth. When the two conflict, performance yields to accuracy.

### 6.5 Client-Side State vs. Server-Side State

**Server-side state prevails.** If the client application believes the user is authenticated but the server rejects the session, the user is not authenticated. If the client shows a form as "saved" but the server returned an error, the data is not saved.

---

## 7. Migration Obligations

### 7.1 Zero Data Loss

Per DOC-000 §6.9, every piece of content, every image, every video, and every data record that exists on the current wdi.co.il must be preserved in the rebuilt system. The following must be migrated:

| Source | Content | Target |
|--------|---------|--------|
| `data/projects/*.json` (13 files) | Project records | Sanity — Project documents |
| `data/team/*.json` | Team member records | Sanity — TeamMember documents |
| `data/services/*.json` (8 files) | Service records | Sanity — Service documents |
| `data/clients-items/*.json` (16 files) | Client logo records | Sanity — Client (content) documents |
| `data/testimonials/*.json` (5 files) | Testimonial records | Sanity — Testimonial documents |
| `data/press/*.json` | Press article records | Sanity — PressItem documents |
| `data/jobs/*.json` | Job listing records | Sanity — Job documents |
| `data/hero/hero-settings.json` | Hero configuration | Sanity — HeroSettings document |
| Live site content-library (6 items) | Content library items | Sanity — ContentLibraryItem documents |
| `/images/projects/`, `/images/team/`, `/images/clients/` | Media assets | Sanity — Media library |
| `/videos/hero-video.mp4` | Hero video | Sanity — Media library or CDN |
| `/documents/` | Recommendation documents | Sanity — Media library |
| `/services/*.html` (8 pages) | Service detail content | Sanity — Service entity rich text |
| `/projects/*.html` | Project detail content | Sanity — Project entity rich text |

### 7.2 Schema Reconciliation

The migration must resolve the known inconsistencies:

- **Team categories:** Backoffice uses (management, administration, department-heads, project-managers). Website uses (founders, admin, heads, team). The canonical categories per DOC-000 are: **founders, management, department-heads, project-managers**. All data must be mapped to these canonical values.
- **Field naming:** "position" and "role" refer to the same concept. The canonical field name is **role**.
- **Education structure:** The canonical format is an array of degree objects, each with: title, degree, institution, year.
- **File naming:** Team member files with non-standard encoding (U#05.. characters) must be normalized during migration.

---

## 8. Binding Nature

### 8.1 Violations Are Defects

Architectural boundary violations are defects. They are not trade-offs. They are not technical debt. They are not known limitations to be tracked in a backlog.

A component that compensates for another component's failure is defective. A domain that bypasses its own boundary rules is defective. A flow that skips validation, authentication, or persistence confirmation is defective. The defect exists regardless of whether the system appears to work.

### 8.2 Boundaries Are Structural

These boundaries do not relax under time pressure, scope negotiation, or operational convenience. They are not aspirational targets. They define the architecture. Work that does not conform to these boundaries does not conform to the architecture and must not be deployed.

### 8.3 Subordination

This document is subordinate to DOC-000 — WDI System Charter & Product Promise (v1.0). It operationalizes the architectural commitments established in the charter. All subsequent canonical documents that address implementation, data models, security, and operational procedures are subordinate to both DOC-000 and this document.

### 8.4 Change Control

This document may be revised when architectural understanding improves, new domains are identified, or existing domain boundaries require adjustment. Revisions require clear documentation of what changed and why, an updated version number and timestamp, and explicit acknowledgment of any boundary changes that affect other canonical documents.

This document does not change through accumulated implementation deviation.

---

*End of document.*
