# CANONICAL-AMENDMENT-001 — CRM Deferred, Intake/Triage Introduced

**Status:** Active — LOCK READY
**Effective Date:** February 20, 2026
**Version:** 1.3
**Timestamp:** 20260221-0045 (CST)
**Authority:** Owner decision — Arik Dvir, Co-Founder & Partner, WDI Ltd Israel
**Amends (Surgical):** DOC-020, DOC-030, DOC-040, DOC-050, DOC-060, DOC-070 (HE/EN)
**References (Non-amending):** DOC-000, DOC-010
**Referenced By:** REMEDIATION-001 v1.5

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260220-2130 | Initial release — full CRM deferral and Intake/Triage introduction |
| 1.1 | 20260220-2215 | QA revision: tightened authority boundaries (Amends vs. References header); outcome field changed from Optional to Required with server-set default 'pending'; audit trail scalability note added (§3.2.3); public form routes aligned with DOC-000 §9 (§3.5); charter promise clarity added (§7) |
| 1.2 | 20260220-2330 | Lock readiness tightening — wording hardening and governance clarification. Public route enforcement hardened (§3.5). Manual intake creation validation clarified (§3.4.2). Server authority over invariants made explicit (§3.2.2). |
| 1.3 | 20260221-0045 | Lock readiness tightening — server-exclusive audit field enforcement added (INV-IT-04 expanded, §3.2.3); PATCH outcome preservation semantics tightened (§3.4.2). |

---

## 1. Executive Summary

By owner decision, the full CRM module specified in the canonical document suite (DOC-000 through DOC-070) is **deferred** from the v1.0 recovery scope. It is designated for a future Phase 2+ implementation.

In its place, a bounded **Intake & Triage** capability is introduced to handle operational requirements for submission management. This amendment defines the exact scope of what is deferred, what is introduced, and the surgical changes required in each canonical document.

**This is a scope decision, not an architecture decision.** The underlying technology stack, governance model, authentication model, and CMS scope are unchanged. The amendment removes complexity without altering structural integrity.

**Authority scope:** This amendment surgically modifies DOC-020, DOC-030, DOC-040, DOC-050, DOC-060, and DOC-070. It does not amend DOC-000 (System Charter) or DOC-010 (Architecture & Responsibility Boundaries) — those documents are referenced for context but their content is unchanged.

---

## 2. What Is Deferred (Full CRM Module)

The following capabilities, as specified across the canonical documents, are **deferred to future Phase 2+**. They are not deleted from the canonical documents — they are marked as out-of-scope for v1.0 and preserved for future implementation.

### 2.1 Deferred Entities (DOC-020)

| Entity | DOC-020 Section | Status |
|--------|----------------|--------|
| Lead | §3.16+ (CRM entities) | Deferred |
| ClientCRM | §3.16+ (CRM entities) | Deferred |
| Engagement | §3.16+ (CRM entities) | Deferred |
| Activity | §3.16+ (CRM entities) | Deferred |
| CRMSettings | §3.16+ (CRM entities) | Deferred |

### 2.2 Deferred Back Office Screens (DOC-030)

| Screen | DOC-030 Section | Status |
|--------|----------------|--------|
| CRM Dashboard (לוח בקרה) | §3.1 sidebar CRM section | Deferred |
| Leads list and detail (לידים) | CRM section | Deferred |
| Clients CRM list and detail (לקוחות CRM) | CRM section | Deferred |
| Engagements list and detail (התקשרויות) | CRM section | Deferred |
| Pipeline view (צינור מכירות) | CRM section | Deferred |
| CRM Settings (הגדרות CRM) | CRM section | Deferred |

### 2.3 Deferred API Endpoints (DOC-040)

| Endpoint Group | DOC-040 Section | Status |
|---------------|----------------|--------|
| `/api/admin/leads/*` (list, detail, create, update, transition, archive, restore, convert, bulk) | CRM API section | Deferred |
| `/api/admin/clients-crm/*` (list, detail, create, update, transition, archive, restore, bulk) | CRM API section | Deferred |
| `/api/admin/engagements/*` (list, detail, create, update, transition) | CRM API section | Deferred |
| `/api/admin/activities/*` (entity-scoped, recent feed, manual creation) | CRM API section | Deferred |
| `/api/admin/pipeline` | CRM API section | Deferred |
| `/api/admin/crm-settings` | CRM API section | Deferred |
| `/api/admin/crm-search` | CRM API section | Deferred |
| `/api/public/leads` (lead intake) | Public API section | **Replaced** by `/api/public/intake` (see §3) |

### 2.4 Deferred UX Interactions (DOC-050)

All UX interaction contracts specific to CRM screens — including lead status transitions, client lifecycle transitions, engagement management, activity logging, pipeline drag-and-drop, and CRM bulk operations — are deferred.

### 2.5 Deferred DOC-070 Screens

All CRM-related screens in the product specification (DOC-070 HE/EN) are marked as deferred. This includes but is not limited to: CRM dashboard mockups, lead management flows, client lifecycle screens, engagement detail screens, pipeline visualization, and CRM settings screens.

### 2.6 Deferred Implementation Phases (DOC-060)

| DOC-060 Phase | Status |
|--------------|--------|
| Phase 3 — CRM Implementation | **Replaced** by Intake+Triage implementation (see §3) |

---

## 3. What Is Introduced (Intake & Triage)

### 3.1 Purpose

Intake & Triage is a bounded operational capability that captures submissions from three public-facing forms, provides operators with a unified inbox to review and manage those submissions, and tracks each submission through a minimal lifecycle with audit trail.

It is **not a CRM**. It does not track client relationships, engagement history, sales pipeline, or business development activities. It answers one question: "Someone submitted something — have we dealt with it?"

### 3.2 IntakeSubmission Entity

**This entity replaces the Lead entity for v1.0 scope.** It is a new entity not present in the original DOC-020.

#### 3.2.1 Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | string | Auto | Sanity document ID |
| `_type` | `'intakeSubmission'` | Auto | Document type |
| `submissionType` | enum | Required | `'general'` / `'job_application'` / `'supplier_application'` |
| `submittedAt` | datetime | Auto | Timestamp of submission (server-set, immutable) |
| `source` | enum | Required | `'website_form'` / `'manual'` |
| **Contact Information** | | | |
| `contactName` | string | Required | Full name of submitter |
| `contactEmail` | string | Required | Email address (validated) |
| `contactPhone` | string | Optional | Phone number |
| `organization` | string | Optional | Company or organization name |
| **Submission Content** | | | |
| `subject` | string | Optional | Subject or title (general inquiries) |
| `message` | text | Optional | Free-text message body |
| `cvFileUrl` | string | Optional | URL to uploaded CV file (job applications only) |
| `positionAppliedFor` | string | Optional | Job title applied for (job applications only) |
| `supplierCategory` | string | Optional | Category of supplier services (supplier applications only) |
| `supplierExperience` | text | Optional | Description of relevant experience (supplier applications only) |
| **Triage Fields** | | | |
| `contactStatus` | enum | Required | `'not_contacted'` (default) / `'contacted'` |
| `relevance` | enum | Required | `'not_assessed'` (default) / `'high'` / `'medium'` / `'low'` |
| `outcome` | enum | Required | Default `'pending'` (server-set on creation). Type-specific values — see §3.2.2 |
| `internalNotes` | text | Optional | Operator notes (not visible to submitter) |
| **Audit** | | | |
| `auditTrail` | array | Auto | Array of audit entries — see §3.2.3 |

#### 3.2.2 Type-Specific Outcomes

| Submission Type | Allowed Outcome Values | Hebrew Labels | Default |
|----------------|----------------------|---------------|---------|
| `general` | `'pending'` / `'converted_to_client'` / `'not_converted'` | ממתין / הפך ללקוח / לא הומר | `'pending'` |
| `job_application` | `'pending'` / `'rejected'` / `'in_process'` / `'hired'` | ממתין / נדחה / בתהליך / התקבל | `'pending'` |
| `supplier_application` | `'pending'` / `'rejected'` / `'in_review'` / `'added_to_database'` | ממתין / נדחה / בבדיקה / נוסף למאגר | `'pending'` |

**Invariant (INV-IT-01):** The system must enforce that only valid outcome values for the submission's type are accepted. Setting `outcome: 'hired'` on a `general` submission is a defect.

**Invariant (INV-IT-02):** `outcome` must always be present on every IntakeSubmission document. On creation, the server sets `outcome` to `'pending'` for the relevant submission type. The public intake endpoint and manual creation endpoint must never produce a document with a null or absent `outcome`. Client-side code must not omit `outcome` — but even if it does, the server enforces the default.

**Invariant (INV-IT-04) — Server Authority (Added v1.2, expanded v1.3):** The server is the sole source of truth for all defaults and invariant enforcement. Client-side validation, UI constraints, or CMS Studio configuration MUST NOT be relied upon to enforce invariants. All invariants (INV-IT-01 through INV-IT-03) are enforced at the API route handler level regardless of what the client sends. The following fields are **server-exclusive** — the client MUST NOT supply or modify them in any request (POST, PATCH, or otherwise): `auditTrail`, `submittedAt`, and `operatorEmail` (within audit trail entries). The server MUST derive `operatorEmail` from the authenticated session only. Any client-supplied values for these fields MUST be silently ignored by the server and treated as an attempted bypass — they do not cause a rejection, they are simply never written.

#### 3.2.3 Audit Trail Entry Structure

Each audit trail entry records a single state change:

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | datetime | When the change occurred (server-set) |
| `operatorEmail` | string | Authenticated operator who made the change |
| `field` | string | Which field changed (`contactStatus`, `relevance`, `outcome`, `internalNotes`) |
| `previousValue` | string | Value before change (null for first set) |
| `newValue` | string | Value after change |

**Invariant (INV-IT-03):** Audit trail entries are append-only. They cannot be edited or deleted. Every mutation to a triage field must produce an audit trail entry.

**Server-exclusive fields (Added v1.3):** The `timestamp` and `operatorEmail` fields in each audit trail entry are set exclusively by the server. The server derives `operatorEmail` from the authenticated session (NextAuth). No API request may supply, override, or modify these values. See INV-IT-04 for the general server authority rule.

**Scalability note (v1.1):** In v1.0, the audit trail is stored inline as an array on the IntakeSubmission document. This is appropriate for the expected volume of a boutique company's intake. If submission volume or audit trail depth grows significantly in future phases, the storage strategy may be migrated to separate immutable event documents (one per audit entry, referencing the parent submission). That migration is a Phase 2+ concern and does not affect v1.0 implementation.

### 3.3 Intake Inbox (Back Office Screen)

#### 3.3.1 Sidebar Position

The Intake Inbox replaces the entire CRM sidebar section. The Back Office sidebar structure becomes:

**CMS Section (ניהול תוכן):** Unchanged — all content entity tabs as specified in DOC-030.

**Intake Section (פניות נכנסות):**
- תיבת פניות (Intake Inbox) — single tab, replaces all CRM tabs

The default landing page after login remains the first operational screen. With CRM deferred, the default landing page is the **Intake Inbox** (if any submissions exist) or the first CMS tab.

#### 3.3.2 Inbox Screen Specification

**List View:**

The Intake Inbox displays all submissions in a single list with:

- Column: סוג (Type) — icon or label indicating general / job / supplier
- Column: שם (Name) — contact name
- Column: תאריך (Date) — submission date
- Column: סטטוס פנייה (Contact Status) — contacted / not contacted (visual indicator)
- Column: רלוונטיות (Relevance) — high / medium / low / not assessed
- Column: תוצאה (Outcome) — type-specific outcome value (always present; 'pending' for new submissions)

**Filters:**

- By submission type: all / general / job application / supplier application
- By contact status: all / contacted / not contacted
- By relevance: all / high / medium / low / not assessed
- By outcome: all / pending / [type-specific values]
- Date range

**Sort:** Default sort by submission date (newest first). Sortable by any column.

**Detail View:**

Clicking a submission opens a detail panel or page showing:

- All contact information fields
- All submission content fields
- Triage fields (contactStatus, relevance, outcome) — editable inline
- Internal notes — editable
- Full audit trail — read-only, displayed chronologically

Every change to a triage field or internal notes triggers an audit trail entry automatically.

#### 3.3.3 Empty State

If no submissions exist, the Inbox displays: "אין פניות במערכת" (No submissions in system). No fake data, no placeholder content.

### 3.4 Intake API Endpoints

#### 3.4.1 Public Endpoint

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | `/api/public/intake` | Accept new submission from public forms | None (public) — Turnstile/rate-limit protected |

**Request body:** Validated per submission type. Required fields enforced. `submissionType` determines which optional fields are relevant. The `outcome` field is not accepted from the client — the server sets it to `'pending'` on creation.

**Response:** Standard API envelope per DOC-040 conventions. Returns submission confirmation (no internal data exposed to public).

**Abuse prevention:** Cloudflare Turnstile (or equivalent) + rate limiting per DOC-000 §6.8.

#### 3.4.2 Admin Endpoints

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/api/admin/intake` | List all submissions (with filters and pagination) | Required |
| GET | `/api/admin/intake/[id]` | Get single submission detail | Required |
| PATCH | `/api/admin/intake/[id]` | Update triage fields (contactStatus, relevance, outcome, internalNotes) | Required |

**PATCH semantics:** The `outcome` field is required on the document but the PATCH endpoint accepts partial updates — an operator may update `contactStatus` without providing `outcome`. When `outcome` is omitted from a PATCH request, the server preserves the existing non-null outcome value unchanged. The server must reject any PATCH that attempts to set `outcome` to null, empty string, or a value invalid for the submission's type — such a request receives an HTTP 400 response and produces no mutation. The server only generates an audit trail entry for fields that actually change.

**All admin endpoints:**
- Require authenticated session (NextAuth + email whitelist per DOC-010)
- Validate input with Zod
- Return standard API envelope per DOC-040
- Enforce type-specific outcome validation (INV-IT-01)
- Auto-generate audit trail entries on every mutation (INV-IT-03)
- Do not support DELETE (submissions are permanent records)

**Manual creation semantics (Added v1.2):** Submissions with `source: 'manual'` may only be created through admin endpoints by authenticated operators. Manual creation MUST enforce the same validation rules as public intake — including all required fields, type-specific outcome validation (INV-IT-01), server-set defaults (INV-IT-02), and audit trail generation (INV-IT-03) — with the sole exception that Turnstile/rate-limit protection does not apply to authenticated admin requests. There is no separate "manual creation" code path with relaxed validation.

**Explicitly not implemented (deferred with CRM):**
- No bulk operations on submissions
- No submission-to-client conversion endpoint
- No submission archival
- No submission export

### 3.5 Public Form Integration (Updated v1.1)

The three public-facing forms submit to the single `/api/public/intake` endpoint with different `submissionType` values. The forms are hosted on the canonical public routes defined in DOC-000 §9:

| DOC-000 §9 Route | Form | submissionType | Specific Fields |
|-------------------|------|---------------|-----------------|
| `/contact` (צור קשר) | Contact form | `'general'` | subject, message |
| `/job-application` (הגשת מועמדות) | Job application form | `'job_application'` | positionAppliedFor, cvFileUrl, message |
| `/join-us` (הצטרפות למאגר ספקים) | Supplier registration | `'supplier_application'` | supplierCategory, supplierExperience, message |

All three forms collect: contactName, contactEmail, contactPhone (optional), organization (optional).

**NOTE:** The routes `/contact`, `/job-application`, and `/join-us` are listed in DOC-000 §9 (Page Inventory). This amendment does not introduce new routes — it specifies which existing routes submit to the Intake endpoint. If any of these routes are found to be missing from DOC-000 §9, a separate ROUTES-ADDENDUM-001 will formally add them. This amendment does not silently create public routes.

**Normative enforcement (Added v1.2):** Implementation MUST NOT create new public routes beyond those explicitly listed in DOC-000 §9. If a required route is missing from DOC-000 §9, a formal ROUTES-ADDENDUM-001 must be approved before implementation. Silent route creation is prohibited.

### 3.6 Boundary Definition — What Intake+Triage Is NOT

To prevent scope creep, the following capabilities are explicitly **outside** the Intake+Triage boundary and belong to the deferred CRM module:

| Capability | Status | Belongs To |
|-----------|--------|------------|
| Converting a submission into a CRM Client record | Deferred | CRM Phase 2+ |
| Tracking engagement history with a submitter beyond the single submission | Deferred | CRM Phase 2+ |
| Pipeline or deal visualization | Deferred | CRM Phase 2+ |
| Activity feed or timeline beyond the audit trail | Deferred | CRM Phase 2+ |
| Automated follow-up reminders or notifications | Deferred | CRM Phase 2+ |
| Submission assignment to specific team members | Deferred | CRM Phase 2+ |
| Dashboard with submission analytics, conversion rates, or KPIs | Deferred | CRM Phase 2+ |
| Bulk operations (bulk status change, bulk export) | Deferred | CRM Phase 2+ |
| Search across submissions by content | Deferred | CRM Phase 2+ |
| Email integration (sending emails from within the system) | Deferred | CRM Phase 2+ |

Any request to implement a capability from this list requires a formal change request per REMEDIATION-001 §5.3 (Architecture Freeze Clause).

---

## 4. Surgical Updates Required per Canonical Document

This section specifies the exact changes needed in each canonical document. Changes are additive (marking deferred, adding new content) — not destructive (deleting existing specification).

### 4.1 DOC-020 — Canonical Data Model

| # | Change | Location |
|---|--------|----------|
| 4.1.1 | Add header note: "CRM entities (Lead, ClientCRM, Engagement, Activity, CRMSettings) are deferred to Phase 2+ per CANONICAL-AMENDMENT-001. They remain specified for future implementation but are not implemented in v1.0." | Before CRM entity definitions |
| 4.1.2 | Add `IntakeSubmission` entity definition per this document §3.2 | New section after content entities, before (deferred) CRM entities |
| 4.1.3 | Add invariants for IntakeSubmission: INV-IT-01 (type-specific outcome enforcement), INV-IT-02 (outcome always present, server-set default), INV-IT-03 (audit trail append-only), INV-IT-04 (server authority over all invariant enforcement), submittedAt immutable | Invariants section |
| 4.1.4 | Update Entity Overview table (§2): add IntakeSubmission to active entities, mark CRM entities as "Deferred — Phase 2+" | §2 |

### 4.2 DOC-030 — Back Office & Operational Model

| # | Change | Location |
|---|--------|----------|
| 4.2.1 | Update sidebar specification (§3.1): replace CRM section with Intake section containing single "תיבת פניות" (Intake Inbox) tab | §3.1 sidebar |
| 4.2.2 | Add header note to CRM section: "All CRM screens are deferred to Phase 2+ per CANONICAL-AMENDMENT-001." | Before CRM screen definitions |
| 4.2.3 | Add Intake Inbox screen specification per this document §3.3 | New section after CMS screens, before (deferred) CRM screens |
| 4.2.4 | Update default landing page: Intake Inbox (if submissions exist) or first CMS tab | §2 or relevant navigation section |

### 4.3 DOC-040 — API Contract & Mutation Semantics

| # | Change | Location |
|---|--------|----------|
| 4.3.1 | Add header note to CRM API section: "All CRM endpoints are deferred to Phase 2+ per CANONICAL-AMENDMENT-001." | Before CRM endpoint definitions |
| 4.3.2 | Replace `/api/public/leads` with `/api/public/intake` per this document §3.4.1 | Public API section |
| 4.3.3 | Add admin Intake endpoints per this document §3.4.2 | Admin API section |
| 4.3.4 | Add Zod validation schemas for IntakeSubmission mutations, including: type-specific outcome enum enforcement, outcome non-nullable constraint, audit trail append-only constraint | Validation section |

### 4.4 DOC-050 — Back Office UX Interaction Contract

| # | Change | Location |
|---|--------|----------|
| 4.4.1 | Add header note to CRM interaction section: "All CRM UX interactions are deferred to Phase 2+ per CANONICAL-AMENDMENT-001." | Before CRM interaction definitions |
| 4.4.2 | Add Intake Inbox interaction contract: list filtering, detail view, inline triage editing, audit trail display, empty states, error states | New section |
| 4.4.3 | Specify feedback behavior: successful status change shows confirmation with updated audit trail; failed change shows error without altering displayed state | New section |

### 4.5 DOC-060 — Implementation Plan

| # | Change | Location |
|---|--------|----------|
| 4.5.1 | Phase 3 header updated: "Phase 3 — Intake+Triage Implementation (replaces CRM per CANONICAL-AMENDMENT-001)" | Phase 3 header |
| 4.5.2 | Phase 3 actions updated to reflect Intake+Triage scope instead of full CRM | Phase 3 action table |
| 4.5.3 | Phase 3 Definition of Done updated to reference Intake+Triage acceptance criteria (REMEDIATION-001 §5.4 IT-AC-1 through IT-AC-7) | Phase 3 DoD |

### 4.6 DOC-070 — Product Specification (HE/EN)

| # | Change | Location |
|---|--------|----------|
| 4.6.1 | Mark all CRM-related screens as "Deferred — Phase 2+" with a visual indicator (e.g., grayed header or [DEFERRED] label). **Do not remove them** — they serve as specification for future implementation. | All CRM screen sections |
| 4.6.2 | Add Intake Inbox screen specification with: list view layout, filter controls, detail view layout, audit trail display, empty state | New section after CMS screens |
| 4.6.3 | Define three submission flows with screen sequence: (a) General inquiry: contact form → confirmation → appears in Inbox, (b) Job application: application form → file upload → confirmation → appears in Inbox, (c) Supplier application: registration form → confirmation → appears in Inbox | New section |
| 4.6.4 | Update navigation structure: sidebar shows "פניות נכנסות" section with "תיבת פניות" tab; CRM section removed from sidebar (deferred) | Navigation/sidebar specification |
| 4.6.5 | All CMS screens and public site screens remain **unchanged** | Verification note |

---

## 5. What Does NOT Change

The following are explicitly unaffected by this amendment:

### 5.1 Public Website Scope

All 18 public routes specified in DOC-000 §9 remain in scope and unchanged. Every page, every component, every SEO requirement, every structured data specification — unchanged. The contact form, job application form, and supplier registration form remain on their respective pages; only their submission endpoint changes (from `/api/public/leads` to `/api/public/intake`).

### 5.2 CMS Scope

All content entity types remain in scope and unchanged: Team, Projects, Services, Clients (logos), Testimonials, Press, Jobs, Content Library, Hero, Site Settings. All CMS Back Office screens for these entities remain in scope and unchanged.

### 5.3 Authentication Model

NextAuth + Google OAuth + domain whitelist + email whitelist — unchanged. Triple-layer enforcement (edge middleware → server layout → API route guard) — unchanged. Session strategy, cookie configuration, rate limiting on auth endpoints — unchanged.

### 5.4 Governance Model

All architectural boundary rules from DOC-010 §4 remain in force: no silent compensation, no authority bypass, read does not imply write, UI is not source of truth, deployment does not change governance, no domain may invent defaults. These apply equally to Intake+Triage as they did to the full CRM.

### 5.5 SEO Commitments

All SEO requirements from DOC-000 — structured data (JSON-LD), Open Graph tags, canonical URLs, dynamic sitemap, robots.txt, Lighthouse ≥ 97, GEO optimization — unchanged.

### 5.6 Technology Stack

Next.js 14+ (App Router), TypeScript (strict), Sanity CMS, NextAuth, Zod, Tailwind CSS, Cloudflare Turnstile, Netlify — unchanged. Upstash Redis (rate limiting) and Sentry (error monitoring) remain specified; their implementation priority may be evaluated in REMEDIATION-001 §5.4 EDG-2 but they are not removed from the specification.

### 5.7 Data Model Invariants (Content Entities)

All 37 invariants specified in DOC-020 for content entities remain in force. CRM-specific invariants are deferred with the CRM module. New invariants for IntakeSubmission (INV-IT-01, INV-IT-02, INV-IT-03, INV-IT-04) are added.

---

## 6. Future Phase 2+ — CRM Reintroduction

When the full CRM module is implemented in a future phase:

- The deferred specifications in DOC-020, DOC-030, DOC-040, DOC-050, and DOC-070 are reactivated
- IntakeSubmission data is migrated or integrated into the CRM Lead entity as appropriate
- The Intake Inbox is either absorbed into the CRM interface or maintained as a simplified view
- A migration path from IntakeSubmission outcomes to CRM status lifecycles is defined at that time
- The deferred capabilities listed in §3.6 become available
- Audit trail storage strategy is evaluated for migration to separate event documents if volume warrants it

**This amendment does not define the Phase 2+ implementation plan.** It only preserves the specification for future use and ensures a clean boundary between v1.0 delivery and future expansion.

---

## 7. Binding Nature

This amendment is binding for v1.0 scope. It has the same authority as the canonical documents it surgically amends (DOC-020, DOC-030, DOC-040, DOC-050, DOC-060, DOC-070). Implementation that includes deferred CRM capabilities or excludes Intake+Triage capabilities is non-compliant.

This amendment is subordinate to DOC-000 (System Charter) and DOC-010 (Architecture & Responsibility Boundaries). It does not alter the charter's principles or the architecture's boundaries — it adjusts the scope of application for v1.0. If DOC-000 contains any explicit promise of CRM capabilities, that promise is interpreted as Phase 2+ and is not part of v1.0 delivery.

The canonical documents themselves are not rewritten by this amendment. They are annotated with deferral markers and supplemented with Intake+Triage specifications. The full CRM specification is preserved intact for future implementation.

---

*End of document.*
