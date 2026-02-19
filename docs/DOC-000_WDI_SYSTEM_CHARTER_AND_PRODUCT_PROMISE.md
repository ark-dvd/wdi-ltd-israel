# DOC-000 — WDI System Charter & Product Promise

**Status:** Canonical
**Effective Date:** February 19, 2026
**Version:** 1.0
**Timestamp:** 20260219-1638 (CST)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260219-1638 | Initial release — full system charter for WDI Ltd Israel rebuild initiative |

---

### Document Standards

Canonical documents are written in Hebrew where content is user-facing and in English for technical specifications. All timestamps use Central Standard Time (CST). Version numbers are assigned only upon founder approval.

---

## 1. Executive Intent

This document exists because wdi.co.il has been built and rebuilt without a governing specification. The result has been predictable: an HTML site with hardcoded content that cannot be managed, a backoffice system that fails to upload images, schema mismatches between the admin interface and the live site, Sanity CMS that was adopted and then abandoned, and a widening gap between what the site should represent and what it actually does.

That ends here.

WDI Ltd Israel is a boutique project management, supervision, and engineering consulting company that has operated since 2013. The company oversees construction projects across six sectors — security, commercial, industrial, residential, infrastructure, and public — managing budgets, timelines, quality, and compliance for clients who trust WDI with their most significant capital investments. If WDI's own website cannot manage its content through a CMS, cannot track its inbound leads through a CRM, and cannot authenticate its operators through a secured admin panel — then the company's digital presence fails to reflect the professionalism that defines its actual work.

This charter establishes the canonical definition of what wdi.co.il is, what it must do, what it must never do, and the quality standard against which every implementation decision will be measured.

All design decisions, implementation work, feature additions, and operational changes must conform to the definitions and constraints established herein. When conflicts arise between this document and any other specification, design document, implementation artifact, or verbal agreement, this document prevails unless it is formally revised through documented change control.

No convenience, deadline pressure, or expedient workaround supersedes this charter.

---

## 2. What wdi.co.il Is

wdi.co.il serves three simultaneous roles within a single deployment:

### 2.1 Corporate Marketing Site

wdi.co.il is the public-facing identity of WDI Ltd Israel. It presents the company to prospective clients, government entities, and industry partners. It communicates WDI's expertise across project management disciplines, displays completed projects as evidence of delivery capability, presents the professional team behind the company, and provides a mechanism for inbound inquiries.

The site presents the following categories of information:

- **Services:** WDI's professional service offerings (project management, supervision, engineering consulting, client representation, PMO, QA/QC, document control, permits and licensing). Each service has a dedicated detail page with comprehensive descriptions. Service definitions and their presentation are governed by CMS content, not by source code.

- **Projects:** Completed and ongoing projects across WDI's six sectors (security, commercial, industrial, residential, infrastructure, public). Each project has a dedicated detail page presenting the client, scope, sector, and visual documentation. Projects are the primary evidence of WDI's delivery capability.

- **Team:** The professionals who comprise WDI — founders, management, department heads, and project managers. Each team member is presented with their role, qualifications, and professional background.

- **Content Library (מאגר מידע):** Professional resources, publications, and reference materials that demonstrate WDI's thought leadership in the Israeli construction industry.

- **Press (כתבו עלינו):** Media coverage and articles written about WDI's work and contributions to the industry.

- **Jobs (משרות):** Open positions at WDI, with an application mechanism for candidates.

### 2.2 Operational Control Panel

wdi.co.il includes a protected administrative interface — the Back Office — through which the WDI operator manages all public-facing content and all inbound business relationships.

The Back Office is not decorative. If an administrative route exists, it must authenticate correctly, persist changes to durable storage, reflect persisted state on reload, and surface errors honestly when operations fail. An admin panel that accepts input but does not save it, or displays controls that do not affect system behavior, is a defect — not a feature in progress.

The Back Office is entirely in Hebrew, right-to-left. Every label, every message, every tooltip, every placeholder, every error, every confirmation — Hebrew.

### 2.3 Lead Intake and Prospect CRM

wdi.co.il captures inbound inquiries from the public contact form and provides a structured system for tracking those inquiries through a prospect lifecycle. The CRM is operational: it records who inquired, what they need, and where the relationship stands. It tracks leads from initial inquiry through qualification, proposal, engagement, and resolution.

The CRM is the same system proven in the daflash platform, adapted for WDI's domain: construction industry services, Hebrew language, and Israeli business context.

---

## 3. What wdi.co.il Is Not

The following behaviors are explicitly prohibited. Their presence in any deployment constitutes a defect requiring remediation, not a known limitation to be documented and deferred.

**Not a demo or prototype.** wdi.co.il is production software representing a real company with real clients and a 12-year operational history. Placeholder content, stubbed functionality, and "happy path only" implementations are unacceptable.

**Not a cosmetic admin shell.** If an admin route exists, it must function completely. A form that accepts input but does not persist it is worse than no form at all — it creates false confidence that work has been saved.

**Not a hardcoded marketing site.** No visible content on the public site may be hardcoded in source files. Hero text, hero video, service descriptions, project details, team member profiles, client logos, testimonials, press articles, job listings, content library items, navigation labels, and all other visitor-facing content must be managed through the CMS. If content appears on the site, it must be editable from the Back Office.

**Not a system that mutates state silently.** No operation may change persisted data without explicit user initiation and observable confirmation. Background processes that alter content, status, or configuration without operator awareness are prohibited.

**Not a system that saves partially.** When the operator initiates a save, either all intended changes persist successfully or none do, and the operator is informed of the outcome in either case. Partial application of changes without indication is prohibited.

**Not a system that claims success on failure.** If an operation fails — save, delete, publish, authenticate — the system must communicate that failure. Success indicators on failed operations are the most dangerous class of defect because they erode operator trust in every subsequent interaction.

**Not a system with mixed languages.** Every user-facing element — on the public site and in the admin panel — is in Hebrew. The only exceptions are proper nouns (company names, technology names) and technical identifiers that have no Hebrew equivalent. English text appearing in the UI where Hebrew is expected is a defect.

---

## 4. Primary User Personas

### 4.1 WDI Operator

The primary administrative user. Manages all website content, reviews inbound leads, progresses prospect relationships, and maintains the operational state of the system. This user is the company founder or a designated team member. They are professionally competent but should not need to interact with source code, database consoles, or deployment infrastructure to accomplish routine operational tasks.

The operator expects: changes save reliably, the admin reflects current persisted state on every load, search finds existing records, and the system never lies about what it did. The operator works in Hebrew and expects the entire admin experience to be in Hebrew, right-to-left.

### 4.2 Prospective Client

A visitor to wdi.co.il evaluating whether to engage WDI for project management, supervision, or consulting services. This visitor may be a private developer, a government procurement officer, a general contractor, or a corporate facilities manager. They interact only with the public website. They review services, examine completed projects, meet the team, and may submit an inquiry through the contact form.

The prospect expects: accurate information about services and capabilities, professional presentation that reflects WDI's standing in the Israeli construction industry, evidence of successfully managed projects, and a contact form that works. The entire experience is in Hebrew, right-to-left.

### 4.3 Job Candidate

A construction professional evaluating employment or subcontracting opportunities with WDI. This visitor reviews open positions and submits an application with supporting documents.

The candidate expects: clear position descriptions, a functioning application process, and professional presentation. Hebrew, right-to-left.

### 4.4 Future WDI Team Member

An eventual internal user who may join the WDI operation and need to understand, use, or extend the system. This persona requires that documentation is accurate, that system behavior matches documented behavior, and that the codebase is navigable without tribal knowledge.

---

## 5. Core System Components

### 5.1 Public Website

The visitor-facing presentation of WDI. Renders all content from the CMS. Displays services, projects across six sectors, team members with qualifications, client logos, testimonials, press coverage, job listings, content library, and company information. Provides a contact form that submits inquiries to the Lead Intake System, and a job application form. Must be fully responsive across desktop, tablet, and mobile viewports.

The Public Website does not own content. It renders what the Content Store provides. It does not own leads. It delivers form submissions to the Lead Intake System.

The entire public website is in Hebrew, right-to-left. Layout, typography, navigation flow, and reading order are all RTL-native.

### 5.2 Back Office (Admin)

The authenticated administrative interface. Provides management capabilities for all CMS-managed content and all CRM data. Every content element visible on the public site has a corresponding management interface in the Back Office.

The Back Office is divided into two clearly separated sections:

- **CMS Section:** Manages all website content entities — team, projects, services, clients (logos/testimonials), press, jobs, content library, hero, and site settings.
- **CRM Section:** Manages all business relationship data — dashboard, leads, clients (CRM), engagements, pipeline, and CRM settings.

The Back Office must:
- Authenticate before granting access to any administrative function
- Load and display current persisted state on every page load
- Persist changes to durable storage on save
- Confirm success or report failure for every operation
- Never display stale state without indication
- Present the entire interface in Hebrew, right-to-left

### 5.3 Lead Intake System

The mechanism by which public inquiries become tracked prospects. Accepts submissions from the contact form, validates input, applies abuse prevention measures, and creates structured lead records in the CRM data store.

The Lead Intake System is fail-closed: if abuse prevention cannot be verified, submissions are rejected rather than accepted without protection. The system must never silently discard a valid submission.

### 5.4 Prospect CRM

The operational record of all inbound business relationships. Tracks leads from initial inquiry through qualification, engagement, and resolution. Provides the operator with a single view of all prospects and their current status.

The CRM includes:
- **Lead tracking** with a 7-state lifecycle (new → contacted → qualified → proposal_sent → won/lost, archived)
- **Client management** with a 4-state lifecycle (active ↔ completed ↔ inactive, archived)
- **Engagement tracking** with a 7-state lifecycle (new → in_progress → review → delivered → completed, paused, cancelled)
- **Activity audit trail** — immutable, append-only record of every CRM event
- **Pipeline visualization** — Kanban board view of leads by stage
- **CRM Settings** — configurable pipeline stages, service types, lead sources, and defaults

The CRM is not a marketing automation system. It is not a project management tool. It is not a billing system. It tracks who contacted WDI, what they need, and where the conversation stands.

All CRM interface text, labels, and messages are in Hebrew.

### 5.5 Content Store

The persistent storage layer for all CMS-managed content. Implemented through Sanity CMS. The Content Store is the single source of truth for all content displayed on the public website.

Content ownership rule: if it appears on the public site, the Content Store owns it. No content may bypass the Content Store by being hardcoded in templates, components, or configuration files.

The Content Store manages the following entity types:

| Entity | Hebrew Name | Description |
|--------|-------------|-------------|
| **Service** | שירות | Professional service offering with dedicated page (e.g., ניהול פרויקטים, פיקוח, ייעוץ הנדסי) |
| **Project** | פרויקט | Completed/ongoing project with dedicated detail page, sector classification, and visual documentation |
| **TeamMember** | חבר צוות | Company team member with role, qualifications, education, and professional background |
| **Client** | לקוח (תוכן) | Client organization with logo, displayed on the public site. Distinct from CRM Client entity. |
| **Testimonial** | המלצה | Client testimonial/recommendation with optional link to a specific project |
| **PressItem** | כתבה | Media coverage or article about WDI |
| **Job** | משרה | Open position at WDI |
| **ContentLibraryItem** | פריט מאגר מידע | Professional resource, publication, or reference material |
| **HeroSettings** | הגדרות Hero | Homepage hero section content including video, headlines, and CTAs |
| **SiteSettings** | הגדרות אתר | Global site configuration — contact info, footer, SEO, social links |

### 5.6 Authentication Layer

The mechanism by which operator identity is verified before granting Back Office access. Implemented through NextAuth with Google OAuth.

Authentication is binary: a request is either authenticated and authorized, or it is denied. There is no intermediate state. There is no degraded access. There is no anonymous administrative capability.

---

## 6. Non-Negotiable Product Guarantees

These guarantees are unconditional. They apply to every feature, every route, every interaction, every deployment. Violation of any guarantee constitutes a defect.

### 6.1 Save Means Persisted

When the operator initiates a save and receives confirmation of success, the data must be durably persisted. It must survive page reload, browser close, session expiration, and server restart. A save confirmation that does not correspond to durable persistence is a critical defect.

### 6.2 Reload Reflects Persisted State

When any page in the Back Office loads or reloads, it must display the current persisted state from the Content Store or CRM data store. The displayed state must match what was last successfully saved. Stale data, cached data from a previous session, or default/placeholder values displayed instead of persisted values are defects.

### 6.3 No Silent Failure

Every operation that can fail must communicate failure to the operator when it does. This includes save operations, delete operations, authentication attempts, API calls, and form submissions. The system must never swallow an error and present a neutral or positive state.

### 6.4 Fail-Closed Security

When the authentication or authorization system cannot determine the identity or permission level of a request, the request is denied. Ambiguity resolves to denial. Missing tokens, expired sessions, and malformed credentials result in rejection, not in degraded or anonymous access.

### 6.5 All Visible Content Managed by CMS

Every piece of content visible to the public on wdi.co.il must be manageable through the Back Office. This includes but is not limited to: hero section text, video, and calls-to-action; service names and descriptions; project details, images, and sector classifications; team member names, roles, qualifications, and photos; client logos; testimonials and attributions; press articles; job listings; content library items; contact information; footer content; and navigation labels.

If a new content section is added to the public site, a corresponding management interface must exist in the Back Office before the section is considered complete.

### 6.6 No Logic Hidden in Configuration

Configuration files define operational parameters. They do not contain business logic, access control rules, content, or behavioral conditions that alter system function. If a decision affects what the user sees or how the system behaves, it must be expressed in code that can be reviewed, tested, and reasoned about — not buried in environment variables or configuration objects.

### 6.7 No Security Through Obscurity

The system does not rely on hidden URLs, unlinked routes, undocumented parameters, or secret paths as security mechanisms. Administrative routes are protected by authentication, not by being hard to find.

### 6.8 No Reliance on In-Memory Serverless State

The system must not depend on in-memory state persisting between serverless function invocations. Rate limit counters, session data, and operational state that must survive across requests must use durable storage. If a cold start occurs, the system must function correctly with no in-memory state from previous invocations.

### 6.9 Zero Data Loss During Migration

Every piece of content, every image, every video, and every data record that exists on the current wdi.co.il must be preserved in the rebuilt system. The refactor is an architectural upgrade, not a content reset. If it exists today, it must exist tomorrow.

---

## 7. Language & Localization Requirements

### 7.1 Hebrew Throughout

The entire system — public website and Back Office — operates in Hebrew. This is not a localization feature. It is a foundational requirement. The system does not support multiple languages. It supports one language: Hebrew.

### 7.2 Right-to-Left Native

Layout, typography, navigation, form fields, tables, sidebars, modals, dropdowns, and all other UI components are RTL-native. RTL is not applied as an afterthought or a CSS override on an LTR base. The system is designed RTL from the ground up.

### 7.3 Gender-Appropriate Language

Hebrew is a gendered language. UI text must use appropriate grammatical forms. Where the gender of the subject is unknown or variable, masculine plural is acceptable per standard Hebrew convention for mixed or unknown audiences.

### 7.4 Date and Number Formats

Dates follow Israeli convention. Currency displays in Israeli Shekels (₪). Phone numbers follow Israeli format. Addresses follow Israeli postal convention.

---

## 8. Maybach-Grade Definition of Done

A feature is complete — and only complete — when it meets every condition in this section. Partial compliance is non-compliance.

### 8.1 Operational Reliability

The feature performs its stated function under normal use conditions without failure, workaround, or operator awareness of internal limitations. It does not degrade silently. It does not require specific sequences of action to avoid failure.

### 8.2 Honest UI

Every UI element corresponds to a real system capability. Buttons perform the actions they describe. Forms save what they accept. Status indicators reflect actual state. Progress indicators represent actual progress. Empty states are communicated, not hidden.

If data has not loaded, the UI says so. If a save failed, the UI says so. If a section has no content, the UI shows an empty state — it does not show stale data or a spinner that never resolves.

### 8.3 Deterministic Behavior

Given the same state and the same inputs, the system produces the same outputs. Behavior does not vary based on timing, request order, cache state, or serverless cold-start conditions. The operator can predict what the system will do because the system always does what it documented it would do.

### 8.4 Observable State Transitions

When the system moves from one state to another — saving, loading, error, success, empty — that transition is visible to the operator. The operator is never left wondering whether an action took effect. State transitions are explicit, not inferred.

### 8.5 Clean Error Handling

Errors are caught, categorized, and communicated. Unhandled exceptions do not reach the user as raw stack traces or browser error pages. Error messages identify what went wrong and, where possible, what the operator can do about it. Errors do not corrupt state. Error messages are in Hebrew.

### 8.6 Complete Hebrew Presentation

Every string visible to any user — operator or visitor — is in Hebrew. Every layout is RTL. Every form reads right-to-left. Every table aligns right-to-left. Every navigation flows right-to-left. An English string visible in a Hebrew context is a defect.

### 8.7 Zero TypeScript Suppressions

No `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, or `as any` anywhere in the codebase. TypeScript strict mode enforced. If a type cannot be expressed, the design must change — not the type safety rules.

### 8.8 SEO Completeness

Every public page includes appropriate meta tags, structured data (JSON-LD), Open Graph tags, and canonical URLs. The site generates a dynamic sitemap and robots.txt. Rich snippets are configured for relevant Schema.org types (Organization, LocalBusiness, Service, Project, Person, JobPosting).

---

## 9. Public Page Inventory

The following pages constitute the public-facing wdi.co.il website. All content on these pages is sourced from the Content Store.

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

---

## 10. Technology Architecture

### 10.1 Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | SSR, routing, API routes |
| Language | TypeScript (Strict Mode) | Zero-error type safety |
| CMS / Database | Sanity CMS | All data storage (content + CRM) |
| Auth | NextAuth + Google OAuth | Authentication with email whitelist |
| Validation | Zod | Request/schema validation |
| Styling | Tailwind CSS | Utility-first CSS with RTL support |
| Bot Prevention | Cloudflare Turnstile | Public form abuse prevention |
| Hosting | Netlify | CDN, serverless functions |
| Rate Limiting | Upstash Redis | Persistent, serverless-safe rate limiting |
| Error Monitoring | Sentry | Production error tracking |

### 10.2 Single Production Deployment

There is exactly one production deployment of wdi.co.il. It is the live company website. The production deployment is the authoritative representation of the WDI business.

### 10.3 Source of Truth

The canonical codebase is the source of truth for system behavior. The Content Store (Sanity) is the source of truth for content. The CRM data store is the source of truth for lead and prospect data. The deployment environment is the source of truth for configuration secrets.

No source of truth may contradict another. If the codebase references a content schema, that schema must exist in the Content Store. If the admin displays a field, that field must correspond to persisted data. Disagreement between sources of truth is a defect.

---

## 11. Binding Nature

### 11.1 Violations Are Defects

Any behavior that contradicts this charter is a defect. It does not matter whether the behavior was intentional, inherited from a previous implementation, or introduced by convenience. If it violates the charter, it is wrong and must be corrected.

### 11.2 Convenience Does Not Override Governance

Hardcoding content to meet a deadline, skipping authentication on an admin route for easier testing, accepting partial saves to ship faster, or suppressing errors to avoid UI complexity — none of these are acceptable trade-offs. The charter defines the minimum acceptable standard. Work that cannot meet this standard is not ready for deployment.

### 11.3 Subordination

All subsequent canonical documents — architecture boundaries, data models, operational principles, security rules, configuration policies, and refactor plans — are subordinate to this charter. They extend and operationalize the commitments made here. They do not contradict, dilute, or reinterpret them.

### 11.4 Change Control

This document may be revised when business direction changes deliberately, technical understanding improves materially, or market conditions require scope adjustment. Revisions require clear documentation of what changed and why, an updated version number and timestamp, and explicit acknowledgment of any superseded commitments.

This charter does not change through omission, assumption, or accumulated deviation.

---

## 12. Summary

wdi.co.il exists to represent WDI Ltd Israel — a company that has managed some of Israel's most complex construction projects for over a decade. The standard is Maybach-grade: reliable, honest, deterministic, and complete. Every piece of content is managed through the CMS. Every lead is tracked through the CRM. Every admin function works as advertised. Every failure is communicated. Every word is in Hebrew. Every layout flows right-to-left.

This is not aspiration. This is specification. Everything built serves this purpose. Nothing built contradicts it.

---

*End of document.*
