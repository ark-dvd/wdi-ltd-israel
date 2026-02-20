# DOC-030 — WDI Back Office & Operational Model

**Status:** Canonical
**Effective Date:** February 19, 2026
**Version:** 1.1
**Timestamp:** 20260219-1711 (CST)
**Governing Documents:** DOC-000 — WDI System Charter & Product Promise (v1.0); DOC-010 — WDI Architecture & Responsibility Boundaries (v1.0); DOC-020 — WDI Canonical Data Model (v1.1)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260219-1655 | Initial release — full Back Office operational model for WDI Ltd Israel rebuild |
| 1.1 | 20260219-1711 | Testimonials are now project-bound. §3.1 sidebar: "המלצות" tab removed. §11.2 Project Management: Linked Testimonials section upgraded from read-only to full CRUD. §11.5 Testimonial Management removed as standalone tab. |

---

### Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

---

## 1. Executive Intent

DOC-020 defines what the system knows. This document defines how the operator interacts with that knowledge.

The Back Office is the operator's only interface to the governed system. It is the surface through which content is managed, leads are tracked, clients are maintained, and operational decisions are made. If the Back Office misrepresents system state, the operator makes decisions based on false information. If the Back Office conceals errors, the operator believes operations succeeded when they failed. If the Back Office allows mutations that the data model forbids, the data model's invariants are violated through the front door.

The entire Back Office interface is in Hebrew, right-to-left. Every label, message, tooltip, placeholder, error, confirmation, and empty state is in Hebrew. The operator never encounters English text in the admin interface except for technical identifiers (URLs, slugs, email addresses).

This document specifies the behavioral contract between the Back Office and the operator. Every screen, every interaction, every feedback mechanism, and every error state described here is a binding requirement.

---

## 2. Back Office Domain Overview

### 2.1 Domain Boundary

The Back Office Domain encompasses all authenticated administrative interfaces served under the `/admin` route tree. It includes every screen, form, list, filter, action, and feedback element that the operator interacts with to manage the WDI system.

The Back Office does not include the public website, the contact form, the lead intake API, or any visitor-facing element.

### 2.2 Authentication Entry Conditions

**Domain Allowlist:** Only Google accounts from three authorized domains may access the Back Office: `@wdiglobal.com`, `@wdi.co.il`, `@wdi.one`. Any login attempt from an email outside these domains is rejected before checking the individual email allowlist.

**Email Allowlist:** Within authorized domains, only emails listed in `ADMIN_ALLOWED_EMAILS` (Netlify environment variable) are permitted. This list is managed operationally — not locked in canonical documents.

**Triple-Layer Enforcement:**
1. Edge middleware — blocks all `/admin` routes without valid session
2. Server layout — re-verifies session at layout render
3. API route guard — every `/api/admin/` endpoint independently verifies session

**Unauthenticated Access:** If a request reaches any `/admin` route without a valid, server-verified session, the system must redirect to the login screen. No Back Office content, layout chrome, navigation element, or data fragment may render before authentication is confirmed server-side. There is no anonymous preview. There is no skeleton loading state before authentication completes.

**Session Expiration:** If the session expires during active use, the next server interaction must detect it and redirect to login. No silent re-authentication. No cached data display. The operator must re-authenticate explicitly.

**No Degraded Mode:** Authentication is binary: the operator is authenticated and has full access, or sees only the login screen. No read-only mode for expired sessions.

**Login Failure:** Error messages must not reveal whether the email exists in the whitelist. Must not expose OAuth internals.

### 2.3 Session Behavioral Contract

Session state is server-authoritative. Session indicators in the UI (operator name, avatar) are convenience elements only. Every server request re-validates the session independently.

---

## 3. Navigation & Operational Screens

The Back Office provides operational contexts organized into two clearly separated sections: CMS (ניהול תוכן) and CRM (ניהול לקוחות).

### 3.1 Sidebar Structure

The sidebar is divided into two labeled sections with visual section headers.

**CMS Section** (header: "ניהול תוכן"):

| Tab Label | Icon | Tab Param | Manages | Section Reference |
|-----------|------|-----------|---------|-------------------|
| צוות | Users | `team` | TeamMember entities | §11.1 |
| פרויקטים | FolderOpen | `projects` | Project entities (with embedded Testimonials) | §11.2 |
| שירותים | Briefcase | `services` | Service entities | §11.3 |
| לקוחות (תוכן) | Building | `clients-content` | Client (Content) entities | §11.4 |
| כתבו עלינו | Newspaper | `press` | PressItem entities | §11.6 |
| משרות | BriefcaseBusiness | `jobs` | Job entities | §11.7 |
| מאגר מידע | Library | `content-library` | ContentLibraryItem entities | §11.8 |
| Hero | Play | `hero` | HeroSettings singleton | §11.9 |
| הגדרות אתר | Settings | `site-settings` | SiteSettings singleton | §11.10 |

**CRM Section** (header: "ניהול לקוחות"):

| Tab Label | Icon | Tab Param | Manages | Section Reference |
|-----------|------|-----------|---------|-------------------|
| לוח בקרה | BarChart3 | `dashboard` | CRM overview | §3.3 |
| לידים | UserPlus | `leads` | Lead entities | §4 |
| לקוחות CRM | UserCheck | `clients-crm` | Client (CRM) entities | §5 |
| התקשרויות | Handshake | `engagements` | Engagement entities | §6 |
| צינור מכירות | Columns3 | `pipeline` | Lead pipeline Kanban view | §7 |
| הגדרות CRM | SlidersHorizontal | `crm-settings` | CrmSettings singleton | §9 |

**Sidebar Behavioral Rules:**

- CMS tabs navigate directly to their content management view. No CMS dashboard. Clicking "צוות" opens the TeamMember list. Clicking "פרויקטים" opens the Project list.
- CRM tabs navigate to their respective operational views. "לוח בקרה" is the CRM overview.
- The Leads tab (לידים) displays an unread count badge showing Leads with status "חדש". Badge is red circle with white text. Polled every 60 seconds. Disappears when zero.
- Currently active tab is visually highlighted.
- Section headers are non-clickable labels.

### 3.2 Mobile Bottom Bar

| Position | Label | Icon | Tab Param |
|----------|-------|------|-----------|
| 1 | לוח בקרה | BarChart3 | `dashboard` |
| 2 | פרויקטים | FolderOpen | `projects` |
| 3 | צוות | Users | `team` |
| 4 | צינור | Columns3 | `pipeline` |
| 5 | הגדרות | Settings | `site-settings` |

Visible only on mobile. Desktop uses full sidebar.

### 3.3 CRM Dashboard

Default landing page after login. When no specific tab is set, navigates to `?tab=dashboard`.

**Stats Row (4 clickable cards):**

| Stat Card | Hebrew Label | Data Source | Click Navigates To |
|-----------|-------------|-------------|-------------------|
| לידים חדשים | New Leads | Count of Leads with status "חדש" | `?tab=leads` (filtered to status "חדש") |
| לקוחות פעילים | Active Clients | Count of Clients (CRM) with status "פעיל" | `?tab=clients-crm` |
| התקשרויות פעילות | Active Engagements | Count of Engagements with status in [חדש, בביצוע, בבדיקה] | `?tab=engagements` |
| ערך צינור | Pipeline Value | Sum of estimatedValue for active pipeline Leads | `?tab=pipeline` |

Stats fetched from API on load. Not cached across sessions. Failure shows error with retry — not zeros.

**Pipeline Summary Widget:**

- Summary line: "X לידים חדשים, Y בטיפול"
- Link: "צפה בצינור ←" navigating to `?tab=pipeline`
- Distribution bar: horizontal color bar from CrmSettings.pipelineStages

**Recent Leads Widget:**

- 5 most recent Leads by createdAt descending
- Per row: name, source badge, relative date, status badge
- Each row opens Lead detail (SlidePanel)
- Footer: "צפה בכל הלידים ←" to `?tab=leads`
- Empty: "אין לידים עדיין"

**Recent Activity:**

- Fetched from `/api/admin/activities/recent`
- Chronological list with type icon, description, entity name, performedBy, timestamp
- All in Hebrew
- Empty: "אין פעילות אחרונה" (only when API returns zero)
- Must NOT receive hardcoded empty array as prop

**Quick Actions:**

| Action | Hebrew Label | Behavior |
|--------|-------------|----------|
| ליד חדש | New Lead | Opens lead creation form |
| התקשרות חדשה | New Engagement | Opens engagement creation form |
| צפה בצינור | View Pipeline | Navigates to `?tab=pipeline` |

### 3.4 CMS Section — No Dashboard

No CMS overview screen. Each CMS tab goes directly to its content list.

### 3.5 Universal Screen Rules

**Data Freshness:** Every screen loads current persisted state from the API on initial render. No browser cache, local storage, or previous session state.

**Loading States:** Unambiguous loading indicator. Not mistakable for empty state. Loading message in Hebrew.

**Empty States:** Explicit Hebrew empty state message specific to context (e.g., "אין חברי צוות", "אין פרויקטים", "אין לידים עדיין").

**Error States:** Explicit Hebrew error with retry action. Not mistakable for empty or loading.

### 3.6 Data Fetch Timeout

If a fetch exceeds 8 seconds without response, transition to error state. Automatic silent retry is prohibited. Operator must explicitly retry.

### 3.7 List Staleness & Refresh

**Manual Refresh:** Every list view has a visible refresh control.

**Auto-Refresh After Mutation:** After operator's own mutation, list auto-refreshes.

**Cross-Session Staleness:** Not required to sync other sessions in real time. All mutations use updatedAt checks (DOC-020 INV-023).

---

## 4. Lead Operations Model

### 4.1 Lead List View

All Leads, default sort by updatedAt descending. Filter by status — only values from DOC-020 §3.1. Each Lead shows: name, email, status badge, source, updatedAt. Status labels in Hebrew per DOC-020 §3.1.

Archived leads accessible through explicit filter selection.

### 4.2 Lead Detail View

**Always Visible:** id, name, email, message, source, status, createdAt, updatedAt.

**Visible When Present:** company, phone, priority (colored badge — גבוה: red, בינוני: yellow, נמוך: green), estimatedValue (with ₪ from CrmSettings.currency), referredBy, description, servicesInterested, notes (chronological with timestamps), convertedToClientId (link to Client), convertedAt, archivedAt.

**CrmSettings-Driven Dropdowns:** Source for manual leads from CrmSettings.leadSources. Web form leads show source "טופס אתר" as read-only. ServicesInterested from CrmSettings.serviceTypes.

**Activity Timeline:** Complete Activity timeline per §8. Not optional.

**Notes Mutability Contract:** Append-only. No edit/delete on existing notes. Corrections require new note. Each addition generates "note_added" Activity.

### 4.3 Lead Status Transitions

Follow Status Transition Matrix (DOC-020 §3.1).

**Permitted transitions are visible.** For "חדש" → "סמן כנוצר קשר" and "סמן כלא רלוונטי" plus "העבר לארכיון".

**Forbidden transitions are absent.** Not disabled — absent from UI.

**Confirmation required.** Every transition states current and target status in Hebrew.

**Feedback required.** Success refreshes view and timeline. Failure shows error in Hebrew.

### 4.4 Duplicate Submission Visibility

Activity of type "duplicate_submission" (הגשה כפולה) must be visible in timeline with timestamp, new message content, and visual distinction.

### 4.5 Lead Conversion to Client

Available only when status is "נסגר בהצלחה" (won) AND convertedToClientId is null.

**Conversion Flow:**
1. Operator initiates
2. Confirmation dialog in Hebrew: Client (CRM) will be created; Lead preserved; action irreversible
3. Optional Engagement creation fields in conversion dialog (per §6.4)
4. On success: convertedToClientId as navigable link, Activity "lead_converted"
5. On failure: error displayed, no Client created, Lead unchanged

### 4.6 Lead Archival and Restore

**Archival:** Available for pipeline and outcome statuses. Confirmation: "הליד יועבר לארכיון. ניתן לשחזר בהמשך." Activity "lead_archived".

**Restore:** Available for archived leads. Shows pre-archival status. Confirmation: "הליד ישוחזר לסטטוס [status]." Activity "record_restored".

### 4.7 Lead Conflict Handling

On updatedAt mismatch:
- Display: "הרשומה שונתה מאז שטענת אותה. השינויים שלך לא נשמרו."
- Offer "טען מחדש" action
- No silent overwrite, no auto-merge, no auto-discard

---

## 5. Client (CRM) Operations Model

### 5.1 Client List View

All Clients (CRM), sort by updatedAt descending. Filter by status: פעיל, הושלם, לא פעיל, בארכיון.

### 5.2 Client Detail View

**Always Visible:** id, name, email, status, createdAt, updatedAt.

**Visible When Present:** company, phone, address, preferredContact (badge: טלפון/אימייל/הודעה), sourceLead (clickable card to originating Lead), notes, archivedAt.

**Linked Engagements Section:** All Engagements referencing this Client. Shows title, status badge, value (₪), startDate. "התקשרות חדשה" button pre-populated with client. Empty: "אין התקשרויות מקושרות ללקוח זה".

**Activity Timeline:** Complete. Not optional.

**Notes:** Same append-only rules as Lead.

### 5.3 Client Status Transitions

Follow DOC-020 §3.2 matrix. Same rules as Lead transitions — permitted visible, forbidden absent, confirmation required in Hebrew, feedback required.

### 5.4 Client Archival and Restore

Same contract as Lead. Hebrew confirmations.

### 5.5 Client Conflict Handling

Same contract as Lead. Hebrew messaging.

---

## 6. Engagement Operations Model

### 6.1 Engagement List View

All Engagements, sort by updatedAt descending. Filter by status from CrmSettings.engagementStatuses. Search by title or client name.

Each engagement shows: title, client name (clickable), engagementType badge, value (₪), status badge (colored per CrmSettings), startDate.

### 6.2 Engagement Detail View

SlidePanel with:

**Required Fields:**

| Field | Hebrew Label | Type | Notes |
|-------|-------------|------|-------|
| title | כותרת | Text input | Engagement display title |
| client | לקוח | Dropdown (searchable) | Required. Populated from Client (CRM) entities. Clickable link card. |

**Optional Fields:**

| Field | Hebrew Label | Type | Notes |
|-------|-------------|------|-------|
| engagementType | סוג התקשרות | Dropdown | From CrmSettings.serviceTypes |
| value | ערך | Number input | ₪ prefix from CrmSettings.currency |
| status | סטטוס | Dropdown | From CrmSettings.engagementStatuses, colored |
| estimatedDuration | משך משוער | Text input | e.g., "12 חודשים" |
| scope | היקף | Tag input | Add/remove scope items |
| startDate | תאריך התחלה | Date picker | |
| expectedEndDate | תאריך סיום משוער | Date picker | |
| actualEndDate | תאריך סיום בפועל | Date picker | |
| description | תיאור | Textarea | |
| internalNotes | הערות פנימיות | Textarea | Operator only |

**Activity Timeline:** Complete. Not optional. Includes "תיעוד פעילות" (Log Activity) button per §8.6.

### 6.3 Engagement Status Transitions

Follow DOC-020 §3.3 matrix. Permitted visible, forbidden absent. Confirmation required. When status reaches "הושלם", auto-suggest actualEndDate.

### 6.4 Engagement Creation from Lead Conversion

When Lead converts to Client (§4.5), conversion dialog includes optional Engagement fields:

| Field | Hebrew Label | Default |
|-------|-------------|---------|
| כותרת התקשרות | Engagement Title | Lead name + " — התקשרות" |
| סוג | Type | First from CrmSettings.serviceTypes |
| ערך | Value | Lead's estimatedValue if present |

Atomic: Client created + Engagement created + Lead updated + Activities generated. All or nothing.

### 6.5 Engagement Conflict Handling

Same contract as Lead. Hebrew messaging.

---

## 7. Pipeline View

### 7.1 Kanban Board Structure

Columns from CrmSettings.pipelineStages — not hardcoded. Horizontal scroll if needed.

**Column Header:** Color dot, Hebrew stage label, lead count, total estimatedValue sum (₪).

**Lead Cards:**

| Field | Display |
|-------|---------|
| name | Bold, primary |
| servicesInterested | Small text (first item) |
| estimatedValue | ₪ formatted |
| createdAt | Relative date |
| source | Small badge |

**Card Click:** Opens Lead detail SlidePanel. Status changes reflected in board on close.

### 7.2 Pipeline View Behavioral Rules

**No Drag-and-Drop (v1).** Status changes through SlidePanel only.

**Excluded:** Leads with status "בארכיון", "נסגר בהצלחה", "לא רלוונטי" not shown in Kanban.

**Empty Columns:** Always displayed with "אין לידים" message. Never hidden.

**If CrmSettings unavailable:** Error: "הגדרות צינור לא נמצאו. אנא הגדר את הגדרות CRM." with link to `?tab=crm-settings`.

---

## 8. Activity Visualization Model

### 8.1 Timeline Rendering

Every Lead, Client (CRM), and Engagement detail includes chronological Activity timeline (oldest first, newest last).

No gaps. All Activities displayed. Default is complete, unfiltered.

### 8.2 Required Visible Fields Per Activity

- type — Hebrew label with visual category icon
- description — Hebrew summary
- performedBy — Operator email or "מערכת"
- createdAt — Exact timestamp
- metadata — Context-specific (status change: from/to, call: duration, quote: amount)

### 8.3 Activity Immutability in UI

No edit control. No delete control. No inline editing. Activities are read-only.

### 8.4 Activity Type Visual Differentiation

| Category | Hebrew | Activity Types |
|----------|--------|---------------|
| סטטוס ומחזור חיים | Status & Lifecycle | status_change, lead_converted, record_restored, lead_archived, client_archived |
| תקשורת | Communication | call_logged, email_sent, email_received |
| ביקורי אתר | Site Visits | site_visit_scheduled, site_visit_completed |
| הצעות מחיר | Quotes | quote_sent, quote_accepted, quote_rejected |
| הערות | Notes | note_added |
| מערכת | System | duplicate_submission, bulk_operation, custom |

### 8.5 Bulk Operation Activities

Bulk_operation Activity visible in timeline of every affected record. Must indicate bulk context.

### 8.6 Activity Logging (Manual)

"תיעוד פעילות" button on Lead, Client (CRM), and Engagement detail views. Opens modal:

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| סוג פעילות | Activity Type | Dropdown | Yes | שיחה, אימייל נשלח, אימייל התקבל, ביקור אתר תוכנן, ביקור אתר בוצע, הצעת מחיר נשלחה, הצעת מחיר התקבלה, הצעת מחיר נדחתה, מותאם אישית |
| הערות | Notes | Textarea | No | |
| משך שיחה | Call Duration | Number (דקות) | No | Visible only for "שיחה" |
| סכום הצעה | Quote Amount | Number (₪) | No | Visible only for quote types |

Modal shows entity name in header. On success: closes, timeline refreshes. On failure: stays open, error displayed, input preserved.

---

## 9. CRM Settings Management

CrmSettings is a singleton (DOC-020 §3.5). Single editable record. No create, delete, or archive.

### 9.1 שלבי צינור (Pipeline Stages)

Ordered list. Each stage: color swatch, Hebrew label, key (auto-generated, read-only). Add/remove/reorder (up/down arrows). Remove requires confirmation if leads exist in stage. Minimum 2 stages.

### 9.2 סטטוסי התקשרות (Engagement Statuses)

Same pattern as Pipeline Stages. Minimum 2 statuses.

### 9.3 סוגי שירות (Service Types)

Tag list with add/remove. Used in Lead servicesInterested and Engagement engagementType. No duplicates. No empty strings.

### 9.4 מקורות ליד (Lead Sources)

Tag list with add/remove. "טופס אתר" must always exist and cannot be removed.

### 9.5 ברירות מחדל ותצוגה (Defaults & Display)

| Field | Hebrew Label | Type | Default |
|-------|-------------|------|---------|
| עדיפות ברירת מחדל | Default Priority | Dropdown: גבוה/בינוני/נמוך | בינוני |
| סמל מטבע | Currency Symbol | Text (max 3 chars) | ₪ |
| תווית התקשרות | Engagement Label | Text | התקשרות |

### 9.6 Save Behavior

Single "שמור הגדרות" button. All sub-sections saved in one API call. Validation across all sub-sections before submit. Impact warning: "שינויים בשלבי הצינור ובסטטוסים ייכנסו לתוקף מיידית בכל תצוגות ה-CRM."

---

## 10. Global CRM Search

Search input at top of CRM section. Minimum 2 characters. Results from `/api/admin/crm-search?q={query}`.

**Grouped Results:**

| Entity Type | Hebrew Header | Result Display |
|-------------|-------------|----------------|
| Lead | לידים (N) | Name, email, status badge, source badge |
| Client (CRM) | לקוחות (N) | Name, email, status badge |
| Engagement | התקשרויות (N) | Title, client name, status badge, value |

Click navigates to appropriate tab and opens detail panel. Case-insensitive. Empty: "לא נמצאו תוצאות עבור '[query]'". Clear button (✕).

---

## 11. Content Management Operational Model

### 11.0 Content Entity List & Edit Rules

**List Views:** All content entity types have a list view. All support filtering by visibility (הכל / פעיל / מוסתר).

**Edit Views:** Load current state from API. All required fields from DOC-020 present. Optional fields clearly distinguishable. All labels in Hebrew.

**Visibility:** isActive toggle — פעיל (active, public) / מוסתר (hidden, admin only).

**Archival:** Only if not active. Must deactivate first, then archive. Restore returns to inactive.

**Hard Deletion:** Only if never activated. Confirmation: "פעולה זו תמחק את הרשומה לצמיתות. לא ניתן לבטל."

**Slug Uniqueness:** Validated at save time (server-side). Auto-generated, editable, URL-safe.

### 11.1 Team Management (צוות)

Manages TeamMember entities (DOC-020 §3.8).

**List View:** Grid of team cards grouped by category in canonical order (מייסדים → הנהלה → ראשי תחומים → מנהלי פרויקטים). Shows photo, name, role, category badge, isActive badge.

**SlidePanel Form:**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| name | שם | Text | Yes | |
| role | תפקיד | Text | Yes | Canonical field name. NOT "position" (DOC-020 INV-024). |
| category | קטגוריה | Dropdown | Yes | מייסדים, הנהלה, ראשי תחומים, מנהלי פרויקטים (DOC-020 §3.8) |
| image | תמונה | Image upload | No | Portrait photo |
| bio | רקע מקצועי | Textarea | No | |
| qualifications | כישורים | Textarea | No | |
| degrees | השכלה | Dynamic list | No | Each row: שם תואר (title), רמת תואר (degree), מוסד (institution), שנה (year). Add/remove rows. (DOC-020 INV-026) |
| linkedin | LinkedIn | URL input | No | |
| email | אימייל | Email input | No | |
| phone | טלפון | Tel input | No | Israeli format |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | No | Order within category |

**API:** `/api/admin/team` (list, create), `/api/admin/team/[id]` (update, delete).

### 11.2 Project Management (פרויקטים)

Manages Project entities (DOC-020 §3.7).

**List View:** Grid of project cards. Shows featuredImage (thumbnail), title, sector badge (colored per sector), client, isActive badge. Filter: הכל / פעיל / מוסתר. Additional filter: by sector (all 6 sectors).

**SlidePanel Form:**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| title | שם פרויקט | Text | Yes | |
| slug | Slug | Text (auto from title) | Yes | URL-safe, unique (INV-030) |
| client | מזמין | Text | Yes | Display string, not CRM reference |
| sector | ענף | Dropdown | Yes | בטחוני, מסחרי, תעשייה, תשתיות, מגורים, ציבורי (DOC-020 §3.7) |
| description | תיאור | Rich text (Portable Text) | No | |
| scope | היקף | Tag input | No | e.g., "ניהול פרויקט", "פיקוח" |
| location | מיקום | Text | No | |
| images | תמונות | Multi-upload | No | Gallery |
| featuredImage | תמונה ראשית | Image upload | No | Card thumbnail |
| isFeatured | מוצג בדף הבית | Toggle | No | |
| startDate | תאריך התחלה | Date picker | No | |
| completedAt | תאריך סיום | Date picker | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | No | |

**Linked Testimonials Section (Full CRUD):** At bottom of Project SlidePanel form. Testimonials are project-bound — they can only be created, edited, and deleted within the context of a Project (DOC-020 §3.10, INV-037).

| Action | Behavior |
|--------|----------|
| View | List of all Testimonials linked to this Project: clientName, quote (truncated), isFeatured badge, isActive badge |
| Create | "הוסף המלצה" button opens inline form or sub-SlidePanel with fields: clientName (required), quote (required), companyName, role, image, isFeatured toggle, isActive toggle, order. projectRef is auto-set to current Project (not editable). |
| Edit | Click a testimonial to open edit form with all fields. projectRef remains locked to current Project. |
| Delete | ✕ button per testimonial. Confirmation: "למחוק המלצה זו?" Hard delete permitted if never activated. Otherwise archive. |
| Empty State | "אין המלצות לפרויקט זה" |

Testimonial data is fetched from API. The relationship is owned by the Testimonial entity — the Project does not store testimonial IDs. API: `/api/admin/projects/[id]/testimonials` for project-scoped operations.

**API:** `/api/admin/projects` (list, create), `/api/admin/projects/[id]` (update, delete).

### 11.3 Service Management (שירותים)

Manages Service entities (DOC-020 §3.6).

**List View:** Services with name, isActive badge, order. Filter: הכל / פעיל / מוסתר.

**SlidePanel Form:**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| name | שם | Text | Yes | |
| slug | Slug | Text (auto from name) | Yes | Unique (INV-016) |
| tagline | תת-כותרת | Text | No | |
| description | תיאור | Textarea | Yes | |
| icon | אייקון | Icon picker | No | |
| highlights | נקודות מפתח | Dynamic list | No | Each: title + description |
| detailContent | תוכן מפורט | Rich text (Portable Text) | No | |
| image | תמונה | Image upload | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | Yes | |

**API:** `/api/admin/services` (list, create), `/api/admin/services/[id]` (update, delete).

### 11.4 Client Content Management (לקוחות תוכן)

Manages Client (Content) entities (DOC-020 §3.9). NOT CRM Clients.

**List View:** Logo grid. Name, logo thumbnail, isActive badge.

**SlidePanel Form:**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| name | שם | Text | Yes | |
| logo | לוגו | Image upload | No | |
| websiteUrl | אתר | URL input | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | Yes | |

**API:** `/api/admin/clients-content` (list, create), `/api/admin/clients-content/[id]` (update, delete).

### 11.5 ~~Testimonial Management (המלצות)~~ [REMOVED]

**Status:** REMOVED as of v1.1. Testimonials are now project-bound (DOC-020 INV-037). All Testimonial CRUD operations are performed within the Project Management interface (§11.2 Linked Testimonials Section). There is no standalone Testimonials tab in the sidebar.

### 11.6 Press Management (כתבו עלינו)

Manages PressItem entities (DOC-020 §3.11).

**SlidePanel Form:**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| title | כותרת | Text | Yes | |
| source | מקור | Text | No | Media outlet |
| publishDate | תאריך פרסום | Date picker | No | |
| excerpt | תקציר | Textarea | No | |
| externalUrl | קישור | URL input | No | |
| image | תמונה | Image upload | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | No | |

**API:** `/api/admin/press` (list, create), `/api/admin/press/[id]` (update, delete).

### 11.7 Job Management (משרות)

Manages Job entities (DOC-020 §3.12).

**SlidePanel Form:**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| title | כותרת משרה | Text | Yes | |
| description | תיאור | Rich text | No | |
| requirements | דרישות | Rich text / tag list | No | |
| location | מיקום | Text | No | |
| type | סוג משרה | Dropdown | No | משרה מלאה, משרה חלקית, פרילנס |
| department | מחלקה | Text | No | |
| contactEmail | אימייל ליצירת קשר | Email input | No | |
| isActive | פעילה | Toggle | Yes | |
| order | סדר | Number | No | |

**API:** `/api/admin/jobs` (list, create), `/api/admin/jobs/[id]` (update, delete).

### 11.8 Content Library Management (מאגר מידע)

Manages ContentLibraryItem entities (DOC-020 §3.13).

**SlidePanel Form:**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| title | כותרת | Text | Yes | |
| description | תיאור | Textarea | No | |
| category | קטגוריה | Text/Dropdown | No | |
| fileUrl | קובץ | File upload | No | |
| externalUrl | קישור חיצוני | URL input | No | |
| image | תמונה | Image upload | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | No | |

**API:** `/api/admin/content-library` (list, create), `/api/admin/content-library/[id]` (update, delete).

### 11.9 Hero Settings (Hero)

HeroSettings singleton (DOC-020 §3.14). Single editable record. No create/delete/archive.

| Field | Hebrew Label | Type | Notes |
|-------|-------------|------|-------|
| headline | כותרת ראשית | Text | |
| subheadline | כותרת משנית | Text | |
| ctaText | טקסט כפתור | Text | |
| ctaLink | קישור כפתור | URL input | |
| videoUrl | וידאו | Video upload | Mandatory per DOC-000. Max 40MB. Compression required. |
| backgroundImage | תמונת רקע | Image upload | Fallback if video unavailable |

**API:** `GET /api/admin/hero` (load), `PUT /api/admin/hero` (save).

### 11.10 Site Settings (הגדרות אתר)

SiteSettings singleton (DOC-020 §3.15). Single editable record. No create/delete/archive.

| Field | Hebrew Label | Type |
|-------|-------------|------|
| companyName | שם חברה | Text |
| phone | טלפון | Tel |
| email | אימייל | Email |
| address | כתובת | Textarea |
| footerText | תוכן תחתית | Textarea |
| socialLinks | קישורי רשתות חברתיות | Object (linkedin, facebook, instagram URLs) |
| seoTitle | כותרת SEO | Text |
| seoDescription | תיאור SEO | Textarea |
| seoKeywords | מילות מפתח | Tag input |
| ogImage | תמונת שיתוף | Image upload |

If SiteSettings does not exist (INV-025), fail-fast — not silent defaults.

**API:** `GET /api/admin/site-settings` (load), `PUT /api/admin/site-settings` (save).

---

## 12. Bulk Operations Model

### 12.1 Scope

Bulk operations apply to CRM entities (Leads, Clients CRM, Engagements). Permitted: bulk status change, bulk archival. No bulk conversion.

### 12.2 Selection and Confirmation

Explicit selection with visible count. Confirmation in Hebrew stating action and count. e.g., "להעביר לארכיון 7 לידים?"

### 12.3 Atomic Execution

All or nothing. No partial application.

### 12.4 Feedback

Success: "7 לידים הועברו לארכיון בהצלחה". List refreshes.
Failure: Error reason in Hebrew. No records modified.

### 12.5 Activity Generation

Every bulk operation generates bulk_operation Activity (DOC-020 INV-027).

---

## 13. Error & Conflict Handling Model

### 13.1 Error Classification

| Category | Hebrew | Description |
|----------|--------|-------------|
| Validation | שגיאת אימות | Input doesn't satisfy DOC-020 requirements |
| Conflict | התנגשות | updatedAt mismatch (INV-023) |
| Authentication | שגיאת הרשאה | Session expired/invalid → redirect to login |
| Server | שגיאת שרת | Unexpected API failure |
| Network | שגיאת רשת | Request didn't reach server |

### 13.2 Error Surfacing Rules

Field-level errors adjacent to field. Form-level errors visible without scrolling. Errors persist until corrected — no auto-dismiss. All messages in Hebrew for the operator.

### 13.3 Forbidden in UI

Stack traces, HTTP codes as primary message, raw JSON, internal field names, auth tokens, DB IDs without context.

### 13.4 No False Success

Success indicator only after API confirmation. No optimistic success display.

### 13.5 Optimistic Concurrency UX

On conflict: save does not persist. Notification in Hebrew. "טען מחדש" action offered. No auto-merge. No auto-discard. No auto-retry.

### 13.6 Network Uncertainty

Inform operator outcome is unknown: "תוצאת הפעולה לא ידועה. אנא טען מחדש לבדיקה." Recommend verify before retry.

### 13.7 Rate Safeguard

1-second disable window after bulk operations. No overlapping bulk operations. No parallel mutations from rapid clicking.

---

## 14. Deterministic UI Guarantees

### 14.1 Same State, Same UI

Deterministic rendering. No randomized ordering. No A/B testing of operational controls.

### 14.2 No Disabled Controls Without Explanation

Remove inapplicable controls (preferred). If visible but disabled, must explain why. "המרה אפשרית רק ללידים בסטטוס 'נסגר בהצלחה'."

### 14.3 No Success Before Persistence

Success indicators only after API confirmation. For all mutations. No exceptions. No optimistic UI.

### 14.4 No Silent Operations

Every mutation produces visible feedback: loading → success or error.

### 14.5 No Silent Merge

No record absorbs data from another without explicit operator action, except governed Duplicate Lead Policy.

### 14.6 No Phantom Controls

Every visible control has a functioning action. Buttons that do nothing are defects.

### 14.7 In-Flight Mutation Lock

While mutation is in-flight, controls that trigger same mutation are disabled with "שומר..." indicator. No double-submit. Client-side prevention required.

---

## 15. Maybach Definition of Done (Operational)

### 15.1 Data Integrity

- Every required field present and enforced
- Every invariant enforced (client + server)
- Only permitted transitions visible
- Only defined enum values selectable
- Slug uniqueness validated

### 15.2 Feedback Completeness

- Every mutation: loading → success → or error
- Success only after API confirmation
- Errors in Hebrew with clear identification
- Conflict states communicated with reload option

### 15.3 State Honesty

- Current persisted state from API
- No stale data presented as current
- No cached pre-population
- Empty/loading/error states explicitly communicated in Hebrew
- Dashboard displays live API data

### 15.4 Timeline Completeness

- Complete Activity timeline on every CRM entity detail
- All activity types render with icons and metadata
- No Activity editable or deletable
- Manual Activity Logging functional

### 15.5 Operational Safety

- Destructive actions require Hebrew confirmation
- Bulk operations show count and require confirmation
- Atomic bulk execution
- No single-click state changes

### 15.6 Authentication Integrity

- No content before server-side auth
- Session expiration → login redirect
- Triple-layer enforcement
- Domain allowlist (wdiglobal.com, wdi.co.il, wdi.one)

### 15.7 Navigation Integrity

- Sidebar separates CMS and CRM with Hebrew headers
- CMS tabs → direct content management, no dashboard
- CRM tabs include all 6 sections
- Dashboard is default landing page
- Mobile bottom bar: 5 designated screens
- Leads tab: new-count badge
- All navigation labels in Hebrew

### 15.8 Hebrew & RTL Completeness

- Entire Back Office in Hebrew
- RTL layout native
- All labels, messages, tooltips, placeholders, errors in Hebrew
- Status labels in Hebrew per DOC-020
- Empty states in Hebrew
- Confirmations in Hebrew
- No English text except technical identifiers

### 15.9 Engagement & Pipeline Completeness

- Engagement CRUD with lifecycle transitions
- Atomic creation from Lead conversion
- Pipeline Kanban from CrmSettings
- Pipeline cards clickable → Lead detail
- CRM Settings configurable
- Global CRM Search functional
- Manual Activity Logging on all CRM entities

---

## 16. Binding Nature

### 16.1 Violations Are Defects

Any behavior contradicting this document is a defect. English text where Hebrew is required is a defect. A save showing success before API confirmation is a defect. A form omitting a required field is a defect. A dashboard with hardcoded data is a defect.

### 16.2 Scope of Authority

This document governs behavioral contract. Not visual design, colors, or typography. What must be visible, what actions available, what feedback provided, what language used. Visual decisions that violate this contract are defects.

### 16.3 Subordination

Subordinate to DOC-000 (v1.0), DOC-010 (v1.0), DOC-020 (v1.1). If conflict with DOC-020, DOC-020 prevails. If conflict with DOC-010, DOC-010 prevails.

### 16.4 Change Control

Revisions require documentation of changes, updated version/timestamp, and impact assessment.

---

*End of document.*
