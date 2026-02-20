# DOC-040 — WDI API Contract & Mutation Semantics

**Status:** Canonical
**Effective Date:** February 19, 2026
**Version:** 1.1
**Timestamp:** 20260219-1711 (CST)
**Governing Documents:** DOC-000 (v1.0); DOC-010 (v1.0); DOC-020 (v1.1); DOC-030 (v1.1)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260219-1701 | Initial release — full API contract for WDI Ltd Israel rebuild |
| 1.1 | 20260219-1711 | Testimonials are now project-bound (INV-037). §2.9.5 Testimonial endpoints replaced by project-scoped endpoints at /api/admin/projects/[id]/testimonials. Standalone /api/admin/testimonials route removed. projectRef now required on create. |

---

## 1. Executive Intent

DOC-020 defines what the system knows. DOC-030 defines what the operator sees. This document defines the contract between them.

The API is the single enforcement boundary for the WDI data model. Every invariant defined in DOC-020 is enforced here. The Back Office does not enforce invariants — it submits requests and displays results. The API is the gatekeeper.

If the API accepts a mutation, the mutation is valid. If the API rejects a mutation, the mutation did not occur. There is no ambiguity. There is no partial acceptance. There is no silent failure.

---

## 2. API Surface

### 2.1 Route Namespace

All administrative API routes live under `/api/admin/`. All require a valid, server-verified session with triple-layer enforcement (DOC-010 §2.2).

The public lead intake endpoint lives under `/api/public/`. No authentication required. Abuse prevention required.

Public content read endpoints served via server-side data fetcher functions. No authentication required.

### 2.2 Lead Endpoints

**GET /api/admin/leads**

List all leads. Supports filtering and sorting.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by status enum value |
| sort | string | No | Sort field (default: updatedAt) |
| order | string | No | asc or desc (default: desc) |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Records per page (default: 25) |

Response: Paginated list of Lead summaries: id, name, email, status, source, updatedAt. Includes total count and pagination metadata.

---

**GET /api/admin/leads/:id**

Retrieve a single Lead with all fields.

Response: Full Lead per DOC-020 §3.1. Must include **activities** array — complete Activity timeline, chronological (oldest first). Activities always embedded. No separate fetch required.

---

**POST /api/public/leads**

Create a Lead from a public web form submission. The only public-facing mutation endpoint.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name |
| email | string | Yes | Valid email address |
| message | string | Yes | Inquiry content |
| company | string | No | Business name |
| phone | string | No | Phone number (Israeli format) |
| servicesInterested | string[] | No | Service interest values (validated against CrmSettings.serviceTypes) |
| abusePrevention | string | Yes | Abuse prevention verification token |

**Server-Set Fields:** id, source ("טופס אתר"), status ("new"), createdAt, updatedAt.

**Duplicate Lead Behavior:** Before creating, check for existing active Lead with same email. If exists: execute Duplicate Lead Policy (DOC-020 §3.1) — no new Lead, Activity "duplicate_submission" appended, message appended to notes. Atomic. Response identical regardless of merge vs. new creation.

**Abuse Prevention:** Missing/invalid token → reject. Fail-closed.

---

**POST /api/admin/leads**

Create a Lead manually by operator.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name |
| email | string | Yes | Valid email |
| message | string | Yes | Inquiry content |
| company | string | No | Business name |
| phone | string | No | Phone number |
| servicesInterested | string[] | No | From CrmSettings.serviceTypes |
| status | string | No | Initial status (default: "new") |
| priority | string | No | "high", "medium", or "low" (default from CrmSettings.defaultPriority) |
| estimatedValue | number | No | Estimated value in ₪ |
| referredBy | string | No | Referral source |
| description | string | No | Project description |

**Server-Set Fields:** id, source ("manual_entry"), createdAt, updatedAt.

**Active Lead Constraint:** If active Lead exists for email, reject (INV-021).

---

**PATCH /api/admin/leads/:id**

Update mutable fields.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes | Optimistic concurrency token (INV-023) |
| name | string | No | |
| email | string | No | |
| company | string | No | |
| phone | string | No | |
| notes | object | No | New note to append (append-only) |
| priority | string | No | "high", "medium", or "low" |
| estimatedValue | number | No | |
| referredBy | string | No | |
| description | string | No | |

**Immutable fields** (id, createdAt, source, convertedToClientId, convertedAt) rejected or ignored.

**Notes:** Append-only. No modifications to existing notes accepted.

---

**POST /api/admin/leads/:id/transition**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes | Concurrency token |
| targetStatus | string | Yes | Target status value |

Validated against Lead Status Transition Matrix (DOC-020 §3.1, INV-022). Forbidden transitions rejected.

---

**POST /api/admin/leads/:id/archive**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes | Concurrency token |

Lead must be in pipeline or outcome status. Pre-archival status recorded in Activity metadata.

---

**POST /api/admin/leads/:id/restore**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes | Concurrency token |

Lead must be "archived". Restores to pre-archival status from Activity metadata.

---

**POST /api/admin/leads/:id/convert**

Convert Lead to Client (CRM) and create initial Engagement.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes | Concurrency token |
| engagementTitle | string | No | Default: "{lead.name} — התקשרות" |
| engagementType | string | No | Default: lead.servicesInterested[0] if exists |
| engagementValue | number | No | Default: lead.estimatedValue or 0 |

**Enforcement:** Status must be "won" (INV-007). Not previously converted (INV-006). Atomic Sanity transaction: Client created + Engagement created + Lead updated. All or nothing.

Response: `{ client: Client, engagement: Engagement }`. Activities: "lead_converted", "client_created", "engagement_created".

### 2.3 Client (CRM) Endpoints

**GET /api/admin/clients-crm**

List all Clients (CRM). Supports filtering by status (active, completed, inactive, archived).

Response: Paginated list: id, name, email, status, updatedAt.

---

**GET /api/admin/clients-crm/:id**

Full Client record per DOC-020 §3.2. Response includes:
- **activities** — Complete Activity timeline, chronological
- **sourceLead** — Resolved to { _id, name, status } via GROQ join. Null if no source lead.
- **engagementCount** — Count of linked Engagements
- **totalEngagementValue** — Sum of Engagement values

---

**POST /api/admin/clients-crm**

Manual Client creation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name or business name |
| email | string | Yes | Unique among Clients (INV-008) |
| company | string | No | |
| phone | string | No | Israeli format |
| address | string | No | Israeli address |
| preferredContact | string | No | "phone", "email", or "text" |
| status | string | No | Default: "active" |

**Server-Set:** id, createdAt, updatedAt. sourceLead = null.

---

**PATCH /api/admin/clients-crm/:id**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes | Concurrency token |
| name | string | No | |
| email | string | No | Must remain unique (INV-008) |
| company | string | No | |
| phone | string | No | |
| address | string | No | |
| preferredContact | string | No | |
| notes | object | No | Append-only |

---

**POST /api/admin/clients-crm/:id/transition**
**POST /api/admin/clients-crm/:id/archive**
**POST /api/admin/clients-crm/:id/restore**

Same contract as Lead equivalents, validated against Client Status Transition Matrix (DOC-020 §3.2).

### 2.4 Bulk CRM Endpoints

**POST /api/admin/leads/bulk**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | Yes | "status_change" or "archive" |
| ids | string[] | Yes | Lead IDs |
| concurrencyTokens | object | Yes | Map of ID → updatedAt |
| targetStatus | string | Conditional | Required for "status_change" |

Enforcement: all IDs must exist, all tokens must match, all transitions must be permitted, atomic. Activity of type "bulk_operation" required (INV-027).

**Failure Response:** Standard error envelope with recordErrors array.

---

**POST /api/admin/clients-crm/bulk**

Same contract as Lead bulk, validated against Client transition matrix.

### 2.5 Activity Endpoints

**GET /api/admin/activities?entityType={type}&entityId={id}**

List Activities for a specific entity. Chronological (oldest first).

---

**GET /api/admin/activities/recent**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Default: 20, max: 100 |

Recent Activities across all CRM entities. Reverse chronological. Each includes entity context. All activity types from DOC-020 §3.4 renderable.

---

**POST /api/admin/activities**

Manual activity creation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| entityType | string | Yes | "lead", "client", or "engagement" |
| entityId | string | Yes | Must reference existing entity |
| type | string | Yes | Manual types only: "call_logged", "email_sent", "email_received", "site_visit_scheduled", "site_visit_completed", "quote_sent", "quote_accepted", "quote_rejected", "custom" |
| notes | string | Yes | Activity description |
| callDuration | number | No | Minutes. Accepted only for "call_logged" |
| quoteAmount | number | No | ₪. Accepted only for quote types |

**Server-Set:** id, performedBy (operator email), createdAt, description (auto-generated in Hebrew).

**Rejected types:** System-only types (lead_created, status_change, lead_converted, etc.) must not be accepted in manual creation.

### 2.6 Engagement Endpoints

**GET /api/admin/engagements**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter by engagement status |
| clientId | string | No | Filter by client reference |
| sort | string | No | Default: createdAt |
| order | string | No | Default: desc |

Response includes resolved client reference: { _id, name, email }.

---

**GET /api/admin/engagements/:id**

Full Engagement per DOC-020 §3.3. Includes resolved **client** { _id, name, email, phone } and **activities** timeline.

---

**POST /api/admin/engagements**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | (INV-033) |
| client | string (ref ID) | Yes | Must reference existing Client (INV-034) |
| engagementType | string | No | From CrmSettings.serviceTypes |
| value | number | No | ₪ |
| status | string | No | Default: "new" |
| estimatedDuration | string | No | |
| scope | string[] | No | |
| startDate | string (date) | No | |
| expectedEndDate | string (date) | No | |
| actualEndDate | string (date) | No | |
| description | string | No | |
| internalNotes | string | No | |

**Server-Set:** id, createdAt, updatedAt. Activity "engagement_created" generated atomically.

---

**PUT /api/admin/engagements/:id**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes | Concurrency token |
| title | string | No | |
| engagementType | string | No | |
| value | number | No | |
| estimatedDuration | string | No | |
| scope | string[] | No | |
| startDate | string (date) | No | |
| expectedEndDate | string (date) | No | |
| actualEndDate | string (date) | No | |
| description | string | No | |
| internalNotes | string | No | |

**Immutable:** id, createdAt, client (cannot be reassigned).

---

**DELETE /api/admin/engagements/:id**

Requires updatedAt. Permanent deletion permitted regardless of status.

---

**POST /api/admin/engagements/:id/transition**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | Yes | Target engagement status |
| updatedAt | string (ISO) | Yes | Concurrency token |

Validated against Engagement Transition Matrix (DOC-020 §3.3). When target is "completed", auto-set actualEndDate if not set.

### 2.7 CRM Settings Endpoints

**GET /api/admin/crm-settings**

Retrieve CrmSettings singleton. If not exists, return defaults:

| Field | Default Value |
|-------|---------------|
| pipelineStages | [{key: "new", label: "ליד חדש", color: "#ef4444"}, {key: "contacted", label: "נוצר קשר", color: "#8b5cf6"}, {key: "qualified", label: "מתאים", color: "#3b82f6"}, {key: "proposal_sent", label: "הצעה נשלחה", color: "#f59e0b"}, {key: "won", label: "נסגר בהצלחה", color: "#10b981"}, {key: "lost", label: "לא רלוונטי", color: "#6b7280"}] |
| engagementStatuses | [{key: "new", label: "חדש", color: "#f59e0b"}, {key: "in_progress", label: "בביצוע", color: "#3b82f6"}, {key: "review", label: "בבדיקה", color: "#8b5cf6"}, {key: "delivered", label: "נמסר", color: "#10b981"}, {key: "completed", label: "הושלם", color: "#059669"}, {key: "paused", label: "מושהה", color: "#ef4444"}, {key: "cancelled", label: "בוטל", color: "#111827"}] |
| serviceTypes | ["ניהול פרויקטים", "פיקוח", "ייעוץ הנדסי", "ייצוג מזמין", "PMO", "בקרת איכות", "בקרת מסמכים", "רישוי והיתרים"] |
| leadSources | ["טופס אתר", "שיחת טלפון", "הפניה", "לינקדאין", "אחר"] |
| defaultPriority | "medium" |
| currency | "₪" |
| engagementLabel | "התקשרות" |

---

**PUT /api/admin/crm-settings**

Upsert the singleton.

**Validation:**
- pipelineStages: ≥ 2 entries, each with non-empty key, label, color. Keys unique.
- engagementStatuses: ≥ 2 entries, same rules.
- serviceTypes: non-empty, no duplicates.
- leadSources: non-empty, "טופס אתר" must exist. No duplicates.
- defaultPriority: "high", "medium", or "low".
- currency: 1–3 chars.
- engagementLabel: non-empty.

### 2.8 CRM Search Endpoint

**GET /api/admin/crm-search**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Minimum 2 characters |

**Search Scope:**
- Leads: name, email, company (case-insensitive)
- Clients (CRM): name, email, company
- Engagements: title, resolved client name

Response: `{ leads: [...], clients: [...], engagements: [...] }`. Max 10 per type. Ordered by relevance then createdAt desc.

### 2.9 Content Entity Endpoints

**Common CRUD Patterns:**

- **GET /api/admin/{entity}** — List all. Filter by isActive.
- **POST /api/admin/{entity}** — Create. Server sets: id, createdAt, updatedAt.
- **PUT /api/admin/{entity}/:id** — Update. Requires updatedAt (INV-023).
- **DELETE /api/admin/{entity}/:id** — Hard delete. Requires updatedAt. Only if never activated (INV-019).

#### 2.9.1 Team Endpoints

**Route:** `/api/admin/team` (list, create), `/api/admin/team/[id]` (update, delete)

| Field | Type | Required (Create) | Description |
|-------|------|-------------------|-------------|
| name | string | Yes | Full name |
| role | string | Yes | Professional title. Canonical field name (INV-024). |
| category | string | Yes | Enum: "founders", "management", "department-heads", "project-managers" (INV-017) |
| image | image reference | No | Portrait photo |
| bio | string | No | Professional background |
| qualifications | string | No | Professional qualifications |
| degrees | array | No | Each: { title, degree, institution, year } (INV-026) |
| linkedin | string | No | URL |
| email | string | No | |
| phone | string | No | Israeli format |
| isActive | boolean | No (default: true) | |
| order | number | No | Within category |

**Category Validation:** Must be one of the 4 canonical values (INV-017).

**Degrees Validation:** When present, each element must have title (string, required), degree (string, required), institution (string, required), year (number, optional) per INV-026.

**Field Name Enforcement:** The field "position" must never appear in any request or response. The canonical name is "role" (INV-024).

#### 2.9.2 Project Endpoints

**Route:** `/api/admin/projects` (list, create), `/api/admin/projects/[id]` (update, delete)

**GET /api/admin/projects/:id** includes `linkedTestimonials` array.

| Field | Type | Required (Create) | Description |
|-------|------|-------------------|-------------|
| title | string | Yes | Project name |
| slug | string | Yes | URL-safe, unique (INV-030) |
| client | string | Yes | Client display name (not CRM reference) |
| sector | string | Yes | Enum: "security", "commercial", "industrial", "infrastructure", "residential", "public" (INV-013) |
| description | block content | No | Rich text (Portable Text) |
| scope | string[] | No | Work items |
| location | string | No | |
| images | image reference[] | No | Gallery |
| featuredImage | image reference | No | Card thumbnail |
| isFeatured | boolean | No (default: false) | Homepage display |
| startDate | string (date) | No | |
| completedAt | string (date) | No | |
| isActive | boolean | No (default: true) | |
| order | number | No | |

**Sector Validation:** Must be one of 6 canonical values (INV-013).

**Slug Uniqueness:** INV-030. Duplicates rejected.

#### 2.9.3 Service Endpoints

**Route:** `/api/admin/services` (list, create), `/api/admin/services/[id]` (update, delete)

| Field | Type | Required (Create) | Description |
|-------|------|-------------------|-------------|
| name | string | Yes | |
| slug | string | Yes | Unique (INV-016) |
| description | string | Yes | |
| tagline | string | No | |
| icon | string | No | |
| highlights | array | No | Each: { title, description } |
| detailContent | block content | No | Rich text |
| image | image reference | No | |
| isActive | boolean | No (default: true) | |
| order | number | Yes | |

#### 2.9.4 Client Content Endpoints

**Route:** `/api/admin/clients-content` (list, create), `/api/admin/clients-content/[id]` (update, delete)

| Field | Type | Required (Create) | Description |
|-------|------|-------------------|-------------|
| name | string | Yes | Organization name |
| logo | image reference | No | |
| websiteUrl | string | No | |
| isActive | boolean | No (default: true) | |
| order | number | Yes | |

#### 2.9.5 Testimonial Endpoints (Project-Scoped)

Testimonials are project-bound (DOC-020 INV-037). All CRUD operations are scoped to a parent Project. There is no standalone `/api/admin/testimonials` route.

**Route:** `/api/admin/projects/[projectId]/testimonials` (list, create), `/api/admin/projects/[projectId]/testimonials/[id]` (update, delete)

**GET /api/admin/projects/:projectId/testimonials**

List all Testimonials for a specific Project. Returns array of Testimonial records linked to this Project.

---

**POST /api/admin/projects/:projectId/testimonials**

Create a Testimonial linked to the specified Project.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| clientName | string | Yes | Name of person quoted |
| quote | string | Yes | Testimonial text |
| companyName | string | No | Business name |
| role | string | No | Quoted person's role |
| image | image reference | No | Photo |
| isFeatured | boolean | No (default: false) | Homepage display |
| isActive | boolean | No (default: true) | Visibility |
| order | number | No | Display order |

**Server-Set Fields:** id, projectRef (auto-set to projectId from URL — not accepted from client), createdAt, updatedAt.

**Project Validation:** The Project referenced by projectId must exist. If not, reject with 404.

---

**PUT /api/admin/projects/:projectId/testimonials/:id**

Update an existing Testimonial. Requires updatedAt. projectRef is immutable — it cannot be changed after creation (the testimonial always belongs to the project it was created under).

---

**DELETE /api/admin/projects/:projectId/testimonials/:id**

Hard delete. Requires updatedAt. Only if never activated (INV-019).

#### 2.9.6 Press Endpoints

**Route:** `/api/admin/press` (list, create), `/api/admin/press/[id]` (update, delete)

| Field | Type | Required (Create) | Description |
|-------|------|-------------------|-------------|
| title | string | Yes | |
| source | string | No | Media outlet |
| publishDate | string (date) | No | |
| excerpt | string | No | |
| externalUrl | string | No | |
| image | image reference | No | |
| isActive | boolean | No (default: true) | |
| order | number | No | |

#### 2.9.7 Job Endpoints

**Route:** `/api/admin/jobs` (list, create), `/api/admin/jobs/[id]` (update, delete)

| Field | Type | Required (Create) | Description |
|-------|------|-------------------|-------------|
| title | string | Yes | Position title |
| description | block content | No | |
| requirements | block content or string[] | No | |
| location | string | No | |
| type | string | No | e.g., "full-time", "part-time", "freelance" |
| department | string | No | |
| contactEmail | string | No | |
| isActive | boolean | No (default: true) | |
| order | number | No | |

#### 2.9.8 Content Library Endpoints

**Route:** `/api/admin/content-library` (list, create), `/api/admin/content-library/[id]` (update, delete)

| Field | Type | Required (Create) | Description |
|-------|------|-------------------|-------------|
| title | string | Yes | |
| description | string | No | |
| category | string | No | |
| fileUrl | file reference | No | |
| externalUrl | string | No | |
| image | image reference | No | |
| isActive | boolean | No (default: true) | |
| order | number | No | |

#### 2.9.9 Hero Settings Endpoints

**Route:** `GET /api/admin/hero` (load), `PUT /api/admin/hero` (save)

Singleton. No POST (create) or DELETE.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes (PUT) | Concurrency token |
| headline | string | No | |
| subheadline | string | No | |
| ctaText | string | No | |
| ctaLink | string | No | |
| videoUrl | file reference | No | Video upload. Max 40MB. |
| backgroundImage | image reference | No | |

**Singleton enforcement:** INV-036.

#### 2.9.10 Site Settings Endpoints

**Route:** `GET /api/admin/site-settings` (load), `PUT /api/admin/site-settings` (save)

Singleton. No POST or DELETE. Fail-fast if not exists (INV-025).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| updatedAt | string (ISO) | Yes (PUT) | Concurrency token |
| companyName | string | No | |
| phone | string | No | |
| email | string | No | |
| address | string | No | |
| footerText | string | No | |
| socialLinks | object | No | { linkedin, facebook, instagram, ... } |
| seoTitle | string | No | |
| seoDescription | string | No | |
| seoKeywords | string[] | No | |
| ogImage | image reference | No | |

### 2.10 Public Content Read Endpoints

Server-side data fetcher functions in `lib/data-fetchers.ts`. Not HTTP endpoints — internal TypeScript functions for Next.js SSR.

| Function | Return Type | Description |
|----------|-------------|-------------|
| `getActiveServices()` | Service[] | isActive = true, ordered by order |
| `getService(slug)` | Service \| null | Single service by slug |
| `getActiveProjects()` | Project[] | isActive = true, ordered by order. Includes sector, slug. |
| `getActiveProjectsBySector(sector)` | Project[] | isActive = true, filtered by sector |
| `getProject(slug)` | Project \| null | Single project with linked testimonials |
| `getTeamMembers()` | TeamMember[] | isActive = true, ordered by category display order then order |
| `getTeamMembersByCategory(category)` | TeamMember[] | Filtered by category |
| `getActiveClientsContent()` | ClientContent[] | isActive = true, ordered by order |
| `getFeaturedTestimonials()` | Testimonial[] | isFeatured = true AND isActive = true |
| `getActiveTestimonials()` | Testimonial[] | isActive = true |
| `getActivePressItems()` | PressItem[] | isActive = true, ordered by publishDate desc |
| `getActiveJobs()` | Job[] | isActive = true |
| `getActiveContentLibraryItems()` | ContentLibraryItem[] | isActive = true |
| `getHeroSettings()` | HeroSettings \| null | Singleton |
| `getSiteSettings()` | SiteSettings \| null | Singleton |

**Error Behavior:** List fetchers return `[]` on error. Single-entity fetchers return `null`. No exceptions thrown. No fallback/demo content.

---

## 3. Mutation Semantics

### 3.1 Atomicity

Every mutation is atomic. All state changes persist or none do. Compound mutations (Lead-to-Client conversion with Engagement creation) must be atomic across all involved entities via Sanity transactions.

### 3.2 Optimistic Concurrency Contract

Every mutation to a mutable entity must include updatedAt (INV-023). Validated before persistence. Mismatch → rejected with "conflict" category. No blind overwrites. Requests omitting updatedAt are rejected.

### 3.3 Idempotency for Public Lead Submission

**Idempotency Key:** normalized email + normalized message within 5-minute window.

**Normalization:** Email lowercased, trimmed. Message trimmed.

**Retry vs. Duplicate:** Same email + same message within window = retry (no new Activity). Same email + different message or outside window = Duplicate Lead Policy (merge with Activity).

### 3.4 In-Flight Mutation Awareness

First request changes updatedAt. Second request with stale token fails via optimistic concurrency. No server-side request deduplication needed.

---

## 4. Error Model

### 4.1 Error Envelope

Every error response:

- **category** — "validation", "conflict", "auth", "not_found", "server", "network_unknown"
- **code** — Stable uppercase string: "VALIDATION_FAILED", "CONFLICT_DETECTED", "UNAUTHORIZED", "FORBIDDEN", "NOT_FOUND", "SERVER_ERROR", "TRANSITION_FORBIDDEN", "DUPLICATE_ACTIVE_LEAD", "CONVERSION_NOT_ELIGIBLE", "INVARIANT_VIOLATION", "NETWORK_UNKNOWN"
- **message** — Human-readable, Hebrew for admin endpoints. No stack traces, no internals.
- **fieldErrors** — Optional map of field → error. Field names as client knows them.
- **recordErrors** — Optional array for bulk failures: { id, code, message }
- **retryable** — Boolean. True for server/network. False for validation/conflict/auth.

### 4.2 Error Categories

| Category | HTTP Status | Retryable | Description |
|----------|-------------|-----------|-------------|
| validation | 400 | No | Invalid input |
| conflict | 409 | No | updatedAt mismatch |
| auth (unauthenticated) | 401 | No | No/invalid session |
| auth (unauthorized) | 403 | No | Email not in allowlist |
| not_found | 404 | No | Entity doesn't exist |
| server | 500 | Yes | Unexpected failure |
| network_unknown | (client-side) | No | No server response |

### 4.3 Prohibited Error Content

No stack traces, DB queries, internal field names, env values, auth tokens, raw HTTP codes as sole message.

---

## 5. Status Transition Enforcement

### 5.1 Lead Transition Matrix

| From | Allowed Transitions |
|------|-------------------|
| new | contacted, lost |
| contacted | qualified, lost |
| qualified | proposal_sent, lost |
| proposal_sent | won, lost |
| won | (archive or convert only) |
| lost | (archive only) |
| archived | restore to pre-archival status |

### 5.2 Client (CRM) Transition Matrix

| From | Allowed Transitions |
|------|-------------------|
| active | completed, inactive |
| completed | inactive |
| inactive | active |
| archived | restore to pre-archival status |

### 5.3 Engagement Transition Matrix

| From | Allowed Transitions |
|------|-------------------|
| new | in_progress, paused, cancelled |
| in_progress | review, delivered, paused, cancelled |
| review | in_progress, delivered, paused, cancelled |
| delivered | completed, in_progress, cancelled |
| paused | new, in_progress, cancelled |
| completed | (terminal) |
| cancelled | (terminal) |

### 5.4 Transition Rejection

Forbidden transitions return category "validation", code "TRANSITION_FORBIDDEN", with Hebrew message identifying current and target status.

---

## 6. Activity Generation Contract

### 6.1 Governing Rule

Every CRM state mutation generates an Activity atomically (INV-020). Activity created in same transaction as mutation. If Activity creation fails, entire operation rolls back.

### 6.2 Mutation-to-Activity Mapping

| Mutation | Activity Type | Required Metadata |
|----------|--------------|-------------------|
| Lead created (web form) | lead_created | source: "טופס אתר" |
| Lead created (manual) | lead_created | source: "manual_entry" |
| Lead status transition | status_change | previousStatus, newStatus |
| Lead archived | lead_archived | previousStatus |
| Lead restored | record_restored | restoredToStatus |
| Lead converted | lead_converted | newClientId |
| Lead fields updated | record_updated | changedFields |
| Lead note added | note_added | noteText |
| Duplicate submission | duplicate_submission | duplicateMessage, duplicateTimestamp |
| Client created (manual) | client_created | source: "manual_entry" |
| Client created (conversion) | client_created | source: "lead_conversion", originLeadId |
| Client status transition | status_change | previousStatus, newStatus |
| Client archived | client_archived | previousStatus |
| Client restored | record_restored | restoredToStatus |
| Client fields updated | record_updated | changedFields |
| Client note added | note_added | noteText |
| Engagement created | engagement_created | source, clientId |
| Engagement status transition | status_change | previousStatus, newStatus |
| Engagement fields updated | record_updated | changedFields |
| Manual activity logged | (varies by type) | type-specific metadata |
| Bulk CRM operation | bulk_operation | action, recordCount, affectedIds |

### 6.3 Activity Field Rules

Every Activity: id, entityType, entityId, type, description (auto-generated in Hebrew), performedBy, createdAt, metadata.

---

## 7. Authorization Boundary

### 7.1 Administrative API

All `/api/admin/` endpoints require valid session. Triple-layer enforcement (DOC-010).

- Unauthenticated → 401 UNAUTHORIZED
- Authenticated but not authorized (domain or email not in allowlist) → 403 FORBIDDEN
- Domain check: email must be @wdiglobal.com, @wdi.co.il, or @wdi.one
- Email check: must be in ADMIN_ALLOWED_EMAILS

### 7.2 Public API

POST /api/public/leads: abuse prevention only.
Data fetcher functions: no auth, read-only, published/active content only.

### 7.3 No Anonymous Admin Access

No debug routes, no dev backdoors, no unauthenticated admin endpoints in any environment.

---

## 8. Success Response Contract

### 8.1 Success Envelope

- **success** — true
- **data** — Complete, current state of mutated entity after mutation
- **activity** — Activity record generated (CRM mutations only)

### 8.2 List Response Envelope

- **data** — Array of entity records
- **total** — Total matching records
- **page** — Current page
- **limit** — Records per page

---

## 9. Binding Nature

### 9.1 Violations Are Defects

Any API behavior contradicting this contract is a defect.

### 9.2 Invariant Enforcement Summary

The API enforces:

- **INV-001–003**: ID, createdAt, updatedAt integrity
- **INV-004–005**: Lead required fields and status enum
- **INV-006–007**: Conversion rules
- **INV-008**: Client email uniqueness
- **INV-009–010**: Client required fields and status enum
- **INV-011**: Activity immutability (no update/delete endpoints)
- **INV-012**: Activity entity reference
- **INV-013**: Project sector enum
- **INV-014**: SiteSettings singleton
- **INV-015**: HeroSettings singleton (via INV-036)
- **INV-016**: Service slug uniqueness
- **INV-017**: TeamMember category enum
- **INV-018**: All enum field validation
- **INV-019**: No permanent CRM deletion; content deletion only if never activated
- **INV-020**: Activity generation for every CRM mutation
- **INV-021**: Active Lead per email uniqueness
- **INV-022**: Status transition matrix compliance
- **INV-023**: Optimistic concurrency
- **INV-024**: "role" field name enforcement (not "position")
- **INV-025**: SiteSettings existence at startup
- **INV-026**: Degrees structure validation
- **INV-027**: Bulk operation Activity requirement
- **INV-030**: Project slug uniqueness
- **INV-033**: Engagement title required
- **INV-034**: Engagement must reference existing Client
- **INV-035**: CrmSettings singleton
- **INV-036**: HeroSettings singleton
- **INV-037**: Testimonial.projectRef required — every testimonial must reference existing Project

### 9.3 Subordination

Subordinate to DOC-000 (v1.0), DOC-010 (v1.0), DOC-020 (v1.1), DOC-030 (v1.1). If conflict with DOC-020, DOC-020 prevails.

---

*End of document.*
