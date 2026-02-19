# DOC-050 — WDI Back Office UX Interaction Contract

**Status:** Canonical
**Effective Date:** February 19, 2026
**Version:** 1.0
**Timestamp:** 20260219-1717 (CST)
**Governing Documents:** DOC-000 (v1.0); DOC-010 (v1.0); DOC-020 (v1.1); DOC-030 (v1.1); DOC-040 (v1.1)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260219-1717 | Initial release — full UX interaction contract for WDI Ltd Israel rebuild |

---

## 1. Executive Intent

DOC-030 defines what the operator must see. DOC-040 defines what the API accepts and returns. This document defines how the Back Office UI connects them — the exact behavioral contract that governs every user interaction from button click to screen update.

The Back Office is not the enforcement boundary. The API is. The UI does not validate invariants authoritatively — it provides early feedback for operator convenience. If the API rejects a request, the API is right and the UI must communicate the rejection faithfully.

Every rule in this document is binding. The standard is deterministic, honest, and complete: given the same API response, the UI must always produce the same visible result.

All operator-facing text in the Back Office is in Hebrew. RTL layout is native throughout.

---

## 2. Standard Request Lifecycle

Every mutation follows a fixed lifecycle. No step may be skipped. No step may occur out of order.

### 2.1 Lifecycle Phases

**Phase 1 — Idle (ממתין):** UI displays current persisted state. All mutation controls enabled per context. Operator may interact freely.

**Phase 2 — In-Flight (בביצוע):** Mutation initiated. Request sent. The UI must:

- Disable controls that could trigger same or conflicting mutation (§3).
- Display unambiguous in-flight indicator ("שומר..." with spinner).
- Not display success, error, or any result state.

**Phase 3a — Success (הצלחה):** API returned success. The UI must:

- Replace local entity state with response.data (§10).
- Append response.activity to local timeline (if applicable).
- Display success indicator that appeared only after confirmation.
- Re-enable mutation controls based on new entity state.

**Phase 3b — Error (שגיאה):** API returned error. The UI must:

- Parse error envelope (category, code, message, fieldErrors, recordErrors, retryable).
- Display error per §9.
- Re-enable controls for correction and retry.
- Not modify entity state.

**Phase 3c — Network Unknown (תוצאה לא ידועה):** No response received. The UI must:

- Construct network_unknown envelope locally (§5).
- Not display success.
- Advise operator: "תוצאת הפעולה לא ידועה. אנא טען מחדש לבדיקה."
- Re-enable controls after timeout.

### 2.2 Lifecycle Invariants

- **MUST NOT** display Phase 3a before API response is received and parsed.
- **MUST NOT** remain in Phase 2 indefinitely. Timeout: 8 seconds → Phase 3c.
- **MUST NOT** transition from Phase 2 to Phase 1 without passing through 3a, 3b, or 3c.

---

## 3. In-Flight Mutation Locking

### 3.1 Lock Scope

When in-flight, disable:

- The save/submit button that initiated the request.
- Any other save/submit button on the same form.
- Status transition actions on the same entity.
- Archive, restore, convert, delete actions on the same entity.
- Bulk action controls if entity is part of pending bulk operation.

Controls on unrelated entities need not be disabled.

### 3.2 Visual State During Lock

Locked state must be visually distinct from idle disabled. Button showing "שומר..." with spinner = valid. Greyed-out button with no context = not valid.

### 3.3 Double-Submit Prevention

- **MUST** intercept repeated clicks/submissions at client layer before network.
- **MUST NOT** rely solely on server-side idempotency.
- **MUST NOT** queue multiple mutation requests for same entity.

### 3.4 Lock Release

Released when Phase 3a, 3b, or 3c is reached. Not before. If operator navigates away during in-flight, mutation completes (or times out); lock state discarded with view.

---

## 4. Optimistic Concurrency UX

### 4.1 Token Management

Every mutable entity includes updatedAt (DOC-020 INV-023).

- **Storage:** Store updatedAt from every GET detail and mutation success response.
- **Submission:** Include stored updatedAt in every mutation request body.
- **Refresh:** After success, replace stored updatedAt with response.data.updatedAt.

### 4.2 Conflict Handling (409)

When API returns conflict (category: "conflict", code: "CONFLICT_DETECTED"):

1. Display conflict notification: "הרשומה שונתה מאז שטענת אותה. השינויים שלך לא נשמרו."
2. Offer "טען מחדש" action.
3. **MUST NOT** silently retry with new updatedAt.
4. **MUST NOT** merge operator's unsaved edits with server state.
5. **MUST NOT** discard operator's input without informing them.

### 4.3 Conflict Example Payload

```json
{
  "category": "conflict",
  "code": "CONFLICT_DETECTED",
  "message": "הרשומה שונתה מאז שטענת אותה. השינויים שלך לא נשמרו.",
  "fieldErrors": null,
  "recordErrors": null,
  "retryable": false,
  "currentUpdatedAt": "2026-02-19T15:42:18.000Z"
}
```

---

## 5. Network Unknown UX Policy

### 5.1 When Applies

No response within 8 seconds, or network error (connection refused, DNS failure, TLS failure).

### 5.2 Client-Constructed Envelope

```json
{
  "category": "network_unknown",
  "code": "NETWORK_UNKNOWN",
  "message": "תוצאת הפעולה לא ידועה. אנא טען מחדש לבדיקה לפני ניסיון חוזר.",
  "fieldErrors": null,
  "recordErrors": null,
  "retryable": false
}
```

### 5.3 UI Behavior

- **MUST NOT** display success.
- **MUST** display message prominently.
- **MUST** offer "טען מחדש" action.
- **MUST NOT** automatically retry.
- **MUST** re-enable controls after displaying unknown state.

---

## 6. Bulk Operations UX

### 6.1 Record Selection

Checkboxes on list view. Display selected count at all times. Maintain selection across pagination. Clear on filter change or navigation.

### 6.2 Concurrency Token Collection

Collect updatedAt for every selected record from list data. Send as concurrencyTokens map.

### 6.3 Preflight Validation

Client-side preflight is optional UX convenience. Not authoritative.

### 6.4 Confirmation

Hebrew confirmation dialog per DOC-030 §12:

- Action being performed.
- Exact record count: "להעביר לארכיון 7 לידים?"
- Operator must explicitly confirm.

### 6.5 Bulk Success

- Display: "7 לידים הועברו לארכיון בהצלחה"
- Refresh list view.
- Clear selection.

### 6.6 Bulk Failure with recordErrors

- Display top-level error message.
- Render recordErrors as table: entity name (resolved from ID), error code, Hebrew message.
- **MUST NOT** show only top-level message.
- **MUST NOT** show raw entity IDs.

---

## 7. Lead, Client & Engagement Detail View Contract

### 7.1 Activities Timeline Source

GET detail response includes embedded "activities" array (DOC-040 §2.2, §2.3, §2.6).

- **MUST** render from embedded array.
- **MUST** render chronological (oldest first, newest last).
- **MUST NOT** fetch from separate endpoint.

### 7.2 Activity Append After Mutation

On success, append response.activity to local timeline at correct position. Rendering optimization — next full fetch confirms.

### 7.3 Timeline Immutability

Per DOC-030 §8: No edit, no delete, no inline editing on Activities. Immutable entries.

---

## 8. Form Validation Policy

### 8.1 Client-Side Validation Role

Permitted for immediate feedback only (empty required fields, invalid email format, invalid transition). Advisory only.

### 8.2 API Authority

- **MUST** always submit to API regardless of client-side validation.
- **MUST** display API errors even if client-side predicted success.
- **MUST NOT** suppress or reinterpret API error messages.

### 8.3 fieldErrors Mapping

Map each fieldError key to corresponding form field. Display inline adjacent to field. Unmatched keys display in form-level error area.

---

## 9. Error Rendering & Copy Rules

### 9.1 Error Display by Category

| Category | UI Treatment |
|----------|-------------|
| validation | Inline fieldErrors adjacent to fields; top-level message in form error area. Bulk: recordErrors table. |
| conflict | Dedicated conflict banner with "טען מחדש" action. |
| auth | Redirect to login screen. No toast. |
| not_found | Navigate to "לא נמצא" state or back to list with notification. |
| server | Toast/banner with message and "נסה שוב" suggestion. |
| network_unknown | Dedicated banner with "טען מחדש" action. No success indicator. |

### 9.2 Error Copy Rules

- **MUST** display message field as-is (Hebrew, written for operators).
- **MUST NOT** display stack traces, exception names, HTTP status codes, raw JSON, or DOC-040 §4.3 prohibited content.
- **MUST NOT** auto-dismiss error messages on timer (DOC-030 §13). Errors persist until corrective action.

### 9.3 Error Persistence

Errors remain visible until operator edits the causing field, initiates new action, or navigates away. No timed toasts for errors.

---

## 10. Deterministic State Reconciliation

### 10.1 The Replace Rule

After successful mutation: replace local entity with response.data. Not merge. Not patch. Replace.

- **MUST** replace entire local entity state with response.data.
- **MUST** update stored updatedAt to response.data.updatedAt.
- **MUST NOT** selectively merge fields.

### 10.2 Activity Append

Append response.activity to local timeline. Only additive operation; all other fields replaced.

### 10.3 Mutation Success Example Payload

```json
{
  "success": true,
  "data": {
    "id": "lead_abc123",
    "name": "דני כהן",
    "email": "dani@example.co.il",
    "message": "מעוניין בפיקוח על פרויקט מגורים",
    "source": "טופס אתר",
    "status": "contacted",
    "company": "כהן נכסים",
    "phone": "052-1234567",
    "servicesInterested": ["פיקוח"],
    "notes": [],
    "convertedToClientId": null,
    "convertedAt": null,
    "archivedAt": null,
    "createdAt": "2026-02-19T14:00:00.000Z",
    "updatedAt": "2026-02-19T15:30:00.000Z"
  },
  "activity": {
    "id": "act_002",
    "entityType": "lead",
    "entityId": "lead_abc123",
    "type": "status_change",
    "description": "סטטוס שונה מ-'חדש' ל-'נוצר קשר'",
    "performedBy": "arik@wdiglobal.com",
    "createdAt": "2026-02-19T15:30:00.000Z",
    "metadata": { "previousStatus": "new", "newStatus": "contacted" }
  }
}
```

### 10.4 Failure State Preservation

On error: entity state unchanged. Operator's unsaved edits remain visible but clearly not persisted.

---

## 11. Pagination & Filtering Contract

### 11.1 List View Query Parameters

All list views reflect state in URL query parameters: page, limit, sort, order, status filter, entity-specific filters (category for Team, sector for Projects, isActive for content entities).

URL shared or reloaded → same view renders.

### 11.2 Pagination Behavior

- Page, sort, direction persist across mutation-triggered refreshes.
- If page is empty after record removal, navigate to previous page.
- Total count reflects current filter.

### 11.3 Filtering Behavior

- Status filters present only DOC-020 values for the entity type.
- Filter change resets page to 1.

---

## 12. Accessibility & Operator Clarity

### 12.1 Focus Management

After error: focus to first error element. After dialog dismiss: focus returns to initiating control.

### 12.2 Disabled State Communication

aria-disabled for all disabled controls. If disabled outside in-flight lock, Hebrew explanation required (tooltip, adjacent text, or aria-label).

### 12.3 Feedback Channels

- **Success:** Brief toast + inline status update. Toast may auto-dismiss (5s) because inline state confirms. **MUST NOT** use toast as sole success indicator.
- **Error:** Persistent inline display. No auto-dismiss.
- **Conflict / Network Unknown:** Persistent banner. No toast. Operator must acknowledge or reload.
- **Bulk Results:** Modal or inline summary. Persists until dismissed.

### 12.4 Keyboard Operability

All mutation actions (save, transition, archive, restore, convert, delete, bulk confirm) keyboard-triggerable. Dialogs navigable and dismissable by keyboard.

### 12.5 RTL Layout

- All form layouts RTL native: labels right-aligned, inputs flow right-to-left.
- SlidePanel slides from left (RTL convention).
- Sidebar on right side of screen.
- Tables: columns ordered right-to-left.
- Error messages, toasts, banners all Hebrew.

---

## 13. Absolute Anti-Drift Policy

### 13.1 Optimistic Update Prohibition

- **MUST NOT** implement optimistic updates.
- **MUST NOT** mutate local entity state before API confirmation.
- **MUST NOT** keep shadow copies outside canonical state tree.
- **MUST NOT** merge partial state fragments after mutation. Replace Rule (§10.1) is absolute.
- **MUST NOT** reconcile via diffing.
- **MUST NOT** maintain derived caches not invalidated on every state replacement.

Derived UI values permitted only when computed deterministically from current canonical state.

The API response is the single source of truth. The UI is a projection layer.

### 13.2 Pre-Mutation UI State

Form input state (typed text, dropdown selections) is transient, not entity state. These must never be conflated.

---

## 14. In-Flight Mutation & View Unmount Policy

### 14.1 Unmount During In-Flight

- Client MAY abort HTTP request on unmount; UI MUST behave as if outcome is unknown.
- Response after unmount **MUST** be ignored. No state updates, toasts, or Activity appends.

### 14.2 Re-Mount After Unmount

- Re-fetch authoritative state from API.
- No restore of pre-unmount local state, form inputs, or in-flight indicators.
- Start from Phase 1 (Idle) with fresh data.

### 14.3 Race Condition Resolution

Most recent explicitly-initiated fetch wins. Late/orphaned responses discarded.

---

## 15. Fatal Rendering Error Boundary

### 15.1 Top-Level Error Boundary

**MUST** implement top-level error boundary catching unrecoverable rendering errors.

### 15.2 Fatal State Behavior

- Render deterministic fatal error screen: "משהו השתבש. אנא טען מחדש את הדף."
- Provide "טען מחדש" action (full page reload).
- **MUST NOT** render partially functional UI alongside error.
- **MUST NOT** display stack traces or developer diagnostics.
- **MUST NOT** auto-recover.

---

## 16. Deterministic State Machine

### 16.1 Formal Definition

| Current State | Trigger | Next State |
|---------------|---------|------------|
| Idle | Operator initiates mutation | InFlight |
| InFlight | API returns success | Success |
| InFlight | API returns error | Error |
| InFlight | Timeout / no response | NetworkUnknown |
| Success | State reconciliation complete (§10) | Idle |
| Error | Operator corrects and re-submits | InFlight |
| Error | Operator cancels / navigates away | Idle |
| NetworkUnknown | Operator reloads | Idle |
| NetworkUnknown | Operator navigates away | Idle |

Applies uniformly to all mutation types: CRM mutations, content mutations.

### 16.2 Prohibited Transitions

Idle → Success, Idle → Error, Idle → NetworkUnknown, InFlight → Idle, Error → Success, NetworkUnknown → Success, Success → Error, any duplicate transition. All are defects.

### 16.3 State Completeness

Every UI state during mutation must map to exactly one state in this machine. Undefined states are defects.

---

## 17. Business Logic Non-Authority Rule

### 17.1 The Non-Authority Principle

The UI is not authoritative for business logic.

- UI **MAY** perform advisory client-side validation (§8.1).
- UI **MUST NOT** enforce invariants authoritatively.
- UI **MUST NOT** replicate transition matrices as source of truth.
- UI **MUST NOT** enforce uniqueness via local state.
- UI **MUST NOT** enforce conversion eligibility as hard block.

If the UI and API disagree, the API is correct. Always.

### 17.2 Staleness of Client-Side Rules

Client-side validation is a snapshot at deployment time. May become stale. API is always current.

---

## 18. Portable Text Editor Contract

### 18.1 Scope

Portable Text fields exist on:

| Entity | Field | Context |
|--------|-------|---------|
| Project | description | Project description (DOC-020 §3.6) |
| Service | detailContent | Detailed service content (DOC-020 §3.7) |
| Job | description | Job posting content (DOC-020 §3.12) |

### 18.2 Supported Block Types

**Text Blocks:** Paragraph, Heading 1–4, Blockquote.

**Inline Marks:** Bold, Italic, Underline, Strikethrough, Code, Link.

**List Types:** Bulleted list, Numbered list.

**Custom Block Types:** Image (file, alt text required, caption optional), Code block (content, language annotation).

No block types beyond these. Additions require DOC-020 update first.

### 18.3 Editor Toolbar

- Text format selector: Paragraph, Heading 1–4, Blockquote
- Inline marks: Bold (Ctrl/Cmd+B), Italic (Ctrl/Cmd+I), Underline (Ctrl/Cmd+U), Strikethrough, Code, Link
- Lists: Bulleted, Numbered
- Inserts: Image, Code block

Standard keyboard shortcuts required.

### 18.4 No Autosave Policy

- **MUST NOT** autosave on timer, blur, or any event other than explicit Save.
- **MUST NOT** persist to localStorage or sessionStorage.
- **MUST NOT** sync to API in background.
- **MUST** treat unsaved content as transient.

Autosave violates anti-drift policy (§13).

### 18.5 Image Insertion Flow

1. Operator clicks Image insert button.
2. Upload dialog — select file.
3. Upload to Sanity media library. In-flight indicator displayed.
4. Success: image block inserted at cursor. Alt text prompt (required).
5. Failure: error message. No block inserted.

Image blocks are transient form state until form is saved.

### 18.6 Editor State Initialization

- Edit existing: initialize from API response data.
- Create new: empty content.
- **MUST NOT** restore previously unsaved edits.

### 18.7 Unsaved Changes Warning

"יש לך שינויים שלא נשמרו. האם אתה בטוח שברצונך לצאת?"

Convenience warning, not persistence mechanism.

### 18.8 Editor and Save Interaction

Editor content serialized as Portable Text in mutation request body with all other fields. Standard lifecycle (§2). On success: re-initialize from response.data per Replace Rule. On error: editor content preserved.

### 18.9 Entity-Specific Variations

**Project description:** Full editor. Project background, challenges, outcomes.

**Service detailContent:** Full editor. Detailed service information.

**Job description:** Full editor. Job posting details.

**Plain text fallback (v1):** description fields for Project and Service may use textarea as v1 fallback. If textarea, stores plain text; public site renderer handles both formats.

---

## 19. Project-Bound Testimonial CRUD UX Contract

### 19.1 Scope

This section governs the Testimonial CRUD interface embedded within the Project SlidePanel (DOC-030 §11.2). Testimonials are project-bound (DOC-020 INV-037). There is no standalone Testimonials tab.

### 19.2 Location

Bottom of Project SlidePanel form, below all Project fields. Section header: "המלצות" with count badge.

### 19.3 Testimonial List (Within Project)

Each testimonial in the linked list displays:

| Element | Content |
|---------|---------|
| clientName | Name of quoted person |
| quote | Truncated to 2 lines |
| isFeatured badge | "מוצג בדף הבית" (yellow badge, if true) |
| isActive badge | "פעיל" / "לא פעיל" |
| Edit button | Opens inline edit form or sub-SlidePanel |
| Delete button (✕) | With confirmation |

**Empty State:** "אין המלצות לפרויקט זה"

### 19.4 Create Testimonial

"הוסף המלצה" button opens inline form or sub-panel.

| Field | UI Element | Required |
|-------|-----------|----------|
| שם הממליץ | Text input | Yes |
| תוכן ההמלצה | Textarea | Yes |
| חברה | Text input | No |
| תפקיד | Text input | No |
| תמונה | Image upload | No |
| מוצג בדף הבית | Toggle | No (default: false) |
| פעיל | Toggle | No (default: true) |
| סדר | Number input | No |

**projectRef:** Auto-set to current Project. Not displayed. Not editable.

**Save:** Standard mutation lifecycle (§2). Calls `POST /api/admin/projects/[projectId]/testimonials`. On success: testimonial appears in list. On error: inline error display.

### 19.5 Edit Testimonial

Click edit → same form as create, pre-populated. PUT with updatedAt. Standard lifecycle.

### 19.6 Delete Testimonial

Click ✕ → confirmation dialog: "למחוק המלצה זו?" → on confirm: DELETE with updatedAt. On success: removed from list. On error: error display.

### 19.7 Interaction with Project Save

Testimonial CRUD is independent of Project Save. Adding/editing/deleting testimonials calls separate API endpoints and follows separate mutation lifecycles. The operator does not need to save the Project to persist testimonial changes.

---

## 20. Dynamic Navigation Dropdown Contract

### 20.1 Scope

Dynamic dropdown menus in public website navbar for **Services** and **Projects by Sector**.

### 20.2 Dropdown Data Source

| Dropdown | Data Fetcher | Filter | Sort |
|----------|-------------|--------|------|
| שירותים | `getActiveServices()` | isActive = true | order asc |
| פרויקטים | `getActiveProjects()` | isActive = true | by sector grouping |

### 20.3 Dropdown Rendering

**Services Dropdown:**

| Element | Source | Required |
|---------|--------|----------|
| Service name | service.name | Yes |
| Service icon | service.icon | If present |
| Link target | `/services/[service.slug]` | Yes |

**Projects Dropdown (by Sector):**

| Element | Source | Required |
|---------|--------|----------|
| Sector group header | Hebrew sector label | Yes |
| Project name | project.title | Yes |
| Link target | `/projects/[project.slug]` | Yes |

**Empty State:** "אין פריטים" or link without dropdown. No empty container.

### 20.4 CMS-to-Dropdown Sync

Server-side render. No real-time sync, WebSocket, or polling. Updated on next page render/revalidation.

### 20.5 Dropdown Order

Server-side sort is authoritative. No client-side re-sort. Same order value → secondary sort by name ascending. Deterministic.

### 20.6 Stale Dropdown Handling

Deactivated/deleted entity link → data fetcher returns null → 404 page. Expected behavior.

---

## 21. Pipeline Kanban UX Contract

### 21.1 Scope

Pipeline Kanban view (DOC-030 §7). Columns driven by CrmSettings.pipelineStages — no hardcoded columns.

### 21.2 Column Rendering

| Element | Content | Rendering |
|---------|---------|-----------|
| Header — color dot | Stage color from CrmSettings | Filled circle, 8–12px |
| Header — label | Stage label (Hebrew) | Semibold text |
| Header — count | Number of leads | Badge |
| Header — total value | Sum of estimatedValue | Formatted with ₪ |
| Body — lead cards | Cards for leads in this stage | Stacked vertically |
| Empty placeholder | No leads | "אין לידים" gray text |

**Layout:** Horizontal scroll with `overflow-x-auto`. Min column width 240px. Single horizontal row always. RTL direction — first column on right.

### 21.3 Lead Card Behavior

| Element | Source | Rendering |
|---------|--------|-----------|
| Name | lead.name | Bold, 1-line truncate |
| Service | lead.servicesInterested[0] | Small gray text |
| Value | lead.estimatedValue | ₪ formatted. Hidden if 0/absent. |
| Relative date | lead.updatedAt | timeAgo Hebrew: "לפני יומיים", "לפני 5 שעות", "עכשיו" |
| Source badge | lead.source | Small pill: "טופס אתר", "הפניה" etc. |

Click card → opens LeadDetail SlidePanel. No drag-and-drop in v1.

### 21.4 Data Loading

Up to 100 leads on mount (single fetch). No lazy loading. Re-fetches on SlidePanel close.

---

## 22. CRM Settings UX Contract

### 22.1 Scope

CRM Settings page (DOC-030 §9). Configures pipeline stages, engagement statuses, service types, lead sources, defaults.

### 22.2 Page Layout

- Single scrollable page with Accordion/card sections.
- "שמור הגדרות" button fixed top-left (RTL).
- No autosave. `beforeunload` warning on unsaved changes.
- Standard lifecycle (§2).

### 22.3 Lead Pipeline Stages Section (שלבי צינור)

Each stage as row:

| Element | Behavior |
|---------|----------|
| Color swatch | Preset color picker. Presets: #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6, #6b7280, #111827, #059669. |
| Label input | Text. New stages: key auto-generated (slugify). Existing: key immutable. |
| Key display | Read-only. Auto-generated on new. Immutable on existing. |
| Up/down arrows | Reorder. First hides up, last hides down. |
| Remove (✕) | If leads exist: confirm with count. If not: immediate. |

"הוסף שלב" button: new stage at bottom, default color #6b7280.

### 22.4 Engagement Statuses Section (סטטוסי התקשרות)

Identical UI to §22.3. Operates on engagementStatuses array.

### 22.5 Service / Engagement Types Section (סוגי שירות)

Tag list: pills with ✕ remove. Text input + "+" to add. Duplicate prevention: "סוג זה כבר קיים". No confirmation on remove.

### 22.6 Lead Sources Section (מקורות ליד)

Same as §22.5. Protected value: "טופס אתר" cannot be removed. Remove button hidden/disabled with tooltip: "טופס אתר הוא מקור מערכת ולא ניתן למחיקה."

### 22.7 Defaults & Display Section (ברירות מחדל ותצוגה)

| Field | UI Element | Validation |
|-------|-----------|------------|
| עדיפות ליד ברירת מחדל | Dropdown: גבוה, בינוני, נמוך | Required |
| תווית התקשרות | Text input | Required, non-empty |
| סמל מטבע | Text input (max 3 chars) | Required, 1–3 chars |

---

## 23. Engagement Management UX Contract

### 23.1 Scope

Engagements tab (DOC-030 §6). List view + SlidePanel.

### 23.2 List View

| Column | Content | Behavior |
|--------|---------|----------|
| כותרת | Title + description preview | Primary identifier |
| לקוח | Client name | Clickable → ClientDetail |
| סוג | engagementType | Badge |
| ערך | Value | ₪ formatted |
| סטטוס | Status | Colored badge from CrmSettings |
| תאריך התחלה | startDate | Formatted date |

Row click → EngagementDetail SlidePanel. Filter by status. Search title and client name (300ms debounce). "התקשרות חדשה +" top-left (RTL).

### 23.3 SlidePanel

Header: title + status badge (colored per CrmSettings).

| Field | UI Element | Required |
|-------|-----------|----------|
| כותרת | Text input | Yes |
| לקוח | Searchable dropdown | Yes (immutable after creation) |
| סוג התקשרות | Dropdown from CrmSettings.serviceTypes | No |
| ערך | Number + ₪ prefix | No |
| סטטוס | Dropdown from CrmSettings.engagementStatuses | Yes |
| משך משוער | Text input | No |
| היקף | Dynamic array: input + Add, removable pills | No |
| תאריך התחלה | Date input | No |
| תאריך סיום משוער | Date input | No |
| תאריך סיום בפועל | Date input | No |
| תיאור | Textarea | No |
| הערות פנימיות | Textarea | No |

Activity Timeline at bottom. "תיעוד פעילות" button.

Footer: שמור, מחק (with confirm: "פעולה זו תמחק את ההתקשרות לצמיתות. לא ניתן לבטל.").

### 23.4 New Engagement Defaults

status: "new", value: 0, scope: [], all dates: empty, all others: empty.

---

## 24. Activity Logging Modal UX Contract

### 24.1 Scope

Activity Logging modal from "תיעוד פעילות" button in Lead, Client, or Engagement detail.

### 24.2 Modal Content

**Title:** "תיעוד פעילות"

| Field | UI Element | Required |
|-------|-----------|----------|
| סוג פעילות | Dropdown | Yes |
| הערות | Textarea | Yes (min 1 char) |

Dropdown options (Hebrew): שיחה תועדה, אימייל נשלח, אימייל התקבל, ביקור אתר תוכנן, ביקור אתר בוצע, הצעת מחיר נשלחה, הצעת מחיר התקבלה, הצעת מחיר נדחתה, אחר.

**Conditional fields:**

| Condition | Field | UI Element |
|-----------|-------|-----------|
| שיחה תועדה | משך שיחה (דקות) | Number input |
| הצעת מחיר * | סכום | Number + ₪ |

### 24.3 Button Behavior

| Button | Behavior |
|--------|----------|
| שמור | Disabled until type selected AND notes non-empty. Standard lifecycle. `POST /api/admin/activities`. |
| ביטול | Closes modal. No confirmation needed. |

### 24.4 Post-Save

- Success: Toast "פעילות תועדה". Modal closes. Timeline refreshes.
- Error: Toast with API error. Modal stays open.

---

## 25. New Leads Badge UX Contract

### 25.1 Location

Sidebar, CRM section, "לידים" tab item. Badge top-left (RTL) of icon/label.

### 25.2 Visual

Red circular badge (`bg-red-500 text-white`). Integer count of leads with status == "new".

### 25.3 Polling

Fetches count via `GET /api/admin/leads?status=new`. Polls every 60 seconds. Starts on sidebar mount, stops on unmount.

### 25.4 Display Rules

| Count | Rendering |
|-------|-----------|
| 0 | Badge hidden |
| 1–99 | Numeric count |
| > 99 | "99+" |

Updates on: poll response, local status change, new lead creation.

---

## 26. Global CRM Search UX Contract

### 26.1 Location

Top of admin content area. Visible from all CRM tabs.

### 26.2 Search Input

| Element | Specification |
|---------|--------------|
| Icon | Magnifying glass, right-aligned (RTL) |
| Placeholder | "חיפוש לידים, לקוחות, התקשרויות..." |
| Min query | 2 characters |
| Debounce | 300ms |
| Loading | Spinner inside input |
| Clear | ✕ button — clears query, closes dropdown |

### 26.3 Results Dropdown

Grouped: "לידים (N)", "לקוחות (N)", "התקשרויות (N)". Up to 5 per group. "הצג את כל N התוצאות →" if more. Empty groups hidden.

| Element | Content |
|---------|---------|
| Entity icon | Type-specific |
| Primary text | Lead/Client: name. Engagement: title. |
| Secondary text | Lead/Client: email. Engagement: client name. |
| Status badge | Colored |

Click → navigate to tab + open detail panel.

### 26.4 Edge Cases

| Condition | Behavior |
|-----------|----------|
| No results | "לא נמצאו תוצאות עבור '[query]'" |
| Escape | Closes dropdown |
| Click outside | Closes dropdown |
| < 2 chars | Dropdown hidden, no API call |

---

## 27. Enhanced Lead Conversion UX Contract

### 27.1 Scope

Lead-to-Client conversion (DOC-030 §4, DOC-040 §2.2). Creates Client + Engagement atomically.

### 27.2 Button Visibility

"המר ללקוח" button appears when status == "won" AND convertedToClientId == null. Absent otherwise. API is authoritative gate (§17.1).

### 27.3 Conversion Modal

**Title:** "המרת ליד ללקוח"

**Section 1 — פרטי לקוח (read-only preview from lead):**

| Field | Source |
|-------|--------|
| שם | lead.name |
| אימייל | lead.email |
| טלפון | lead.phone |
| חברה | lead.company |

**Section 2 — יצירת התקשרות:**

Checkbox: "צור גם התקשרות ללקוח זה" (default: ON).

When checked:

| Field | UI Element | Default |
|-------|-----------|---------|
| כותרת התקשרות | Text input | "{lead.name} — התקשרות" |
| סוג התקשרות | Dropdown from CrmSettings.serviceTypes | lead.servicesInterested[0] |
| ערך משוער | Number + ₪ | lead.estimatedValue |

When unchecked: fields hidden, only Client created.

**Buttons:**

| Button | Behavior |
|--------|----------|
| המר | Standard lifecycle. `POST /api/admin/leads/[id]/convert`. |
| ביטול | Closes modal. |

### 27.4 Post-Conversion

- Success: Toast "ליד הומר ללקוח" + "התקשרות נוצרה" (if applicable). SlidePanel closes. List refreshes.
- Error: Error per §9. Modal stays open.
- Network unknown: §5 handling. Modal closes.

---

## 28. Enforceability Summary

1. **MUST NOT** display success before API confirms (§2.2, §10.1).
2. **MUST** disable mutation controls during in-flight and prevent double-submit (§3.1, §3.3).
3. **MUST** include stored updatedAt in every mutation request (§4.1).
4. **MUST NOT** silently retry or auto-merge on conflict; must display Hebrew notification and offer reload (§4.2).
5. **MUST** construct network_unknown envelope locally; must not display success (§5.2, §5.3).
6. **MUST** collect per-record concurrency tokens for bulk; render recordErrors on failure (§6.2, §6.6).
7. **MUST** render Activities timeline from embedded array in detail responses (§7.1).
8. **MUST** replace — not merge — local entity state after success (§10.1).
9. **MUST NOT** suppress, rewrite, or auto-dismiss API error messages (§8.2, §9.2, §9.3).
10. **MUST NOT** display stack traces, internal names, raw JSON (§9.2).
11. **MUST** map fieldErrors inline and recordErrors to table (§8.3, §6.6).
12. **MUST** persist pagination/filter state in URL query parameters (§11.1).
13. **MUST NOT** implement optimistic updates (§13.1).
14. **MUST NOT** keep shadow copies or derived caches outside canonical state (§13.1).
15. **MUST** ignore late responses after view unmount; re-fetch on mount (§14.1, §14.2).
16. **MUST** implement top-level error boundary with deterministic fatal screen in Hebrew (§15.1, §15.2).
17. **MUST** follow deterministic state machine (§16.1, §16.2, §16.3).
18. **MUST NOT** enforce business logic authoritatively (§17.1).
19. **MUST NOT** use toast as sole success indicator (§12.3).
20. **MUST NOT** autosave Portable Text editor content (§18.4).
21. **MUST** support all specified Portable Text block types (§18.2).
22. **MUST** render Pipeline columns from CrmSettings — no hardcoded columns (§21.2).
23. **MUST** render Engagement statuses from CrmSettings — no hardcoded statuses (§22.4, §23.2).
24. **MUST** populate dropdowns from CrmSettings — no hardcoded options (§22.5, §22.6).
25. **MUST** validate notes non-empty before enabling Activity Log save (§24.3).
26. **MUST** poll new leads badge at 60-second intervals (§25.3).
27. **MUST** debounce CRM Search at 300ms minimum (§26.2).
28. **MUST** create Testimonials only within Project context — no standalone creation (§19.1).
29. **MUST** render entire Back Office in Hebrew with RTL layout (§12.5).
30. **MUST** populate nav dropdowns from server-side data fetchers; no client-side caching (§20.2, §20.5).

---

## 29. Binding Nature

### 29.1 Violations Are Defects

Any Back Office UI behavior contradicting this document is a defect. A form displaying success before API response is a defect. A conflict error silently swallowed is a defect. A bulk failure hiding recordErrors is a defect. An optimistic update is a defect. A late response applied after unmount is a defect. A partial render after fatal error is a defect. An undefined UI state is a defect. An editor that autosaves is a defect. English text where Hebrew is required is a defect. A standalone Testimonials tab is a defect. LTR layout is a defect.

### 29.2 Relationship to DOC-030 and DOC-040

This document operationalizes DOC-030 behavioral requirements and DOC-040 API contract into UI implementation rules. Where DOC-030 states requirements, this document specifies exact data sources, UI behaviors, and state management. Where DOC-040 defines shapes, this document specifies rendering.

### 29.3 Subordination

Subordinate to DOC-000 (v1.0), DOC-010 (v1.0), DOC-020 (v1.1), DOC-030 (v1.1), DOC-040 (v1.1). Governing documents prevail on conflict.

---

*End of document.*
