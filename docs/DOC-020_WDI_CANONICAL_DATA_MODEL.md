# DOC-020 — WDI Canonical Data Model

**Status:** Canonical
**Effective Date:** February 19, 2026
**Version:** 1.1
**Timestamp:** 20260219-1711 (CST)
**Governing Documents:** DOC-000 — WDI System Charter & Product Promise (v1.0); DOC-010 — WDI Architecture & Responsibility Boundaries (v1.0)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260219-1650 | Initial release — full canonical data model for WDI Ltd Israel rebuild |
| 1.1 | 20260219-1711 | Testimonial.projectRef changed from optional to required (INV-037). Testimonials are always project-bound. §2.3 Content-to-Content reference table updated. §3.10 Testimonial entity updated. |

---

### Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

---

## 1. Executive Intent

A data model defines what the system knows. Not what it displays. Not what the user types. Not what a form collects. What the system knows — the entities it tracks, the attributes it requires, the relationships it enforces, and the rules it applies to every mutation.

wdi.co.il has operated without a canonical data model. The consequences are documented in the audit reports: team member categories in the backoffice (management, administration, department-heads, project-managers) don't match the live website (founders, admin, heads, team). The field called "position" in one place is called "role" in another. Education data has no defined structure. The Content Library directory is empty despite 6 items appearing on the live site. Projects use English category identifiers but the website displays Hebrew labels with no mapping. JSON files are written without schema validation, meaning any malformed data breaks the live site silently.

This document defines the canonical data model for wdi.co.il. Every entity, attribute, relationship, lifecycle, and invariant specified here is binding. Implementation that contradicts this model — by omitting required fields, allowing forbidden mutations, or introducing unspecified entities — is non-compliant regardless of whether it functions.

All field labels displayed in the Back Office are in Hebrew. All status labels displayed in the Back Office are in Hebrew. All dropdown options displayed in the Back Office are in Hebrew.

---

## 2. Entity Overview (Target Architecture)

The WDI data model contains two distinct entity families: CRM entities that track business relationships, and Content entities that store website presentation material. These families are isolated from each other — no CRM entity references a Content entity and no Content entity references a CRM entity, except where explicitly documented.

### 2.1 CRM Entity Lifecycle

The CRM tracks the progression of an inquiry from initial contact through business relationship:

Visitor submits contact form → Lead is created with status "new" → Operator qualifies and progresses Lead through pipeline stages → Lead converts to Client (optional, explicit operator action) → Client record persists independently → Engagements track active work commitments

Each transition is recorded as an Activity. Activities are append-only. The full history of every Lead, Client, and Engagement is reconstructable from the Activity log.

A Lead that does not convert is never deleted. It is archived. A Client that originated from a Lead retains a permanent reference to the originating Lead. This reference is immutable.

### 2.2 Content Entity Model

Content entities store all visitor-facing website material. They are managed independently from CRM entities:

- **Service** defines a professional service offering with its own detail page (ניהול פרויקטים, פיקוח, ייעוץ הנדסי, etc.)
- **Project** defines a completed/ongoing project with its own detail page, classified by sector (בטחוני, מסחרי, תעשייה, תשתיות, מגורים, ציבורי)
- **TeamMember** defines a company team member with category, role, qualifications, education, and photo
- **Client (Content)** defines a client organization with logo, displayed in the clients section of the public site. Distinct from the CRM Client entity.
- **Testimonial** defines a client endorsement, optionally linked to a specific Project
- **PressItem** defines a media article or coverage piece about WDI
- **Job** defines an open position at WDI
- **ContentLibraryItem** defines a professional resource, publication, or reference material
- **HeroSettings** is a singleton that stores the homepage hero section content (video, headlines, CTAs)
- **SiteSettings** is a singleton that stores global site configuration (contact info, footer, SEO, social links)

Content entities use the **isActive toggle** visibility pattern: A boolean that controls public visibility. Active entities render on the public site; inactive entities are visible only in the Back Office.

### 2.3 Entity Isolation

CRM entities and Content entities occupy the same data store (Sanity) but are logically separate. No CRM entity references a Content entity. No Content entity references a CRM entity.

The service interests selected by a Lead on the contact form are stored as plain string values on the Lead record, validated against existing CrmSettings.serviceTypes at write time but not stored as foreign key references to Service content entities.

**Content-to-Content references** are permitted where explicitly documented in this specification:

| Source Entity | Reference Field | Target Entity | Cardinality | Required |
|---------------|-----------------|---------------|-------------|----------|
| Testimonial | projectRef | Project | Many-to-one | **Yes** |

This reference is mandatory. Every Testimonial must be linked to a Project. A Testimonial without a projectRef is invalid (INV-037). The referenced Project must exist at the time of write (referential integrity). Deleting or archiving a referenced Project does not cascade — the reference becomes stale and must be resolved by the operator. No circular references are permitted.

**CRM Entity References:**

| Source Entity | Reference Field | Target Entity | Cardinality | Required |
|---------------|-----------------|---------------|-------------|----------|
| Engagement | client | Client (CRM) | Many-to-one | Yes |
| Client (CRM) | sourceLead | Lead | One-to-one | No |
| Activity | entityId | Lead, Client (CRM), or Engagement | Many-to-one | Yes |

---

## 3. Entity Definitions

### 3.1 Lead (CRM Entity)

**Definition:** A Lead represents an inbound inquiry from a prospective client. Every contact form submission creates exactly one Lead (subject to the Duplicate Lead Policy below). Manual entry by the operator also creates a Lead. A Lead is the system's record of someone who has expressed interest in WDI's construction management services.

**Required Attributes:**

- id — Unique identifier, assigned at creation, immutable
- name — Full name of the inquiring person (שם)
- email — Email address (אימייל)
- message — The inquiry content (הודעה)
- source — Origin of the lead. For web form leads, auto-set to "טופס אתר" (read-only). For manual leads, populated from CrmSettings.leadSources.
- status — Current pipeline stage (must be a value from the defined status enum)
- createdAt — Timestamp of creation, assigned at creation, immutable
- updatedAt — Timestamp of last modification

**Optional Attributes:**

- company — Business name (חברה)
- phone — Phone number, Israeli format (טלפון)
- servicesInterested — List of service interest values selected at submission. Populated from CrmSettings.serviceTypes.
- notes — Operator-entered notes, append-style, timestamped (הערות)
- convertedToClientId — Reference to Client (CRM) entity if converted, null otherwise
- convertedAt — Timestamp of conversion, null if not converted
- archivedAt — Timestamp of archival, null if active
- priority — Lead priority: "גבוה" (high), "בינוני" (medium), "נמוך" (low). Default from CrmSettings.defaultPriority.
- estimatedValue — Estimated deal value in ₪. Default 0.
- referredBy — Referral source name (הופנה ע"י)
- description — Project description. Separate from the original message; used by the operator to document what the lead needs (תיאור פרויקט)

**Immutable Fields:**

- id — Never changes after creation
- createdAt — Never changes after creation
- source — Never changes after creation
- convertedToClientId — Set once at conversion, never modified thereafter
- convertedAt — Set once at conversion, never modified thereafter

**Lifecycle States (Status Enum):**

| Key | Hebrew Label | Description |
|-----|-------------|-------------|
| new | חדש | Just created, not yet reviewed |
| contacted | נוצר קשר | Operator has made initial contact |
| qualified | מתאים | Inquiry is a genuine business opportunity |
| proposal_sent | הצעה נשלחה | A quote or proposal has been delivered |
| won | נסגר בהצלחה | Lead has agreed to engage (triggers conversion eligibility) |
| lost | לא רלוונטי | Lead has declined or become unresponsive (terminal) |
| archived | בארכיון | Retained for historical record (retention; restore permitted) |

**Status Transition Matrix:**

| From | Allowed Transitions |
|------|-------------------|
| new | contacted, lost |
| contacted | qualified, lost |
| qualified | proposal_sent, lost |
| proposal_sent | won, lost |
| won | archived |
| lost | archived |
| new, contacted, qualified, proposal_sent | archived |
| archived | restore to the status held immediately before archival |

No backward movement through the pipeline is permitted. The only path from archived back to active is the explicit restore operation.

**Duplicate Lead Policy:**

At most one active Lead (status in: new, contacted, qualified, proposal_sent, won) may exist per unique email address at any given time. If a web form submission arrives for an email with an existing active Lead:

- A new Lead is not created.
- An Activity of type "duplicate_submission" is appended to the existing Lead.
- The existing Lead's updatedAt is updated.
- The new message content is appended into the existing Lead's notes as a timestamped entry.
- This entire operation must be atomic.

**Conversion Rules:**

- A Lead may be converted to a Client (CRM) only when its status is "won"
- Conversion is an explicit operator action, never automatic
- Upon conversion, a new Client (CRM) entity is created with a reference back to the Lead
- The Lead record is retained. It is not deleted, replaced, or merged
- A Lead may be converted exactly once

**Deletion Policy:**

Leads are never permanently deleted. The operator may archive a Lead. Archived Leads remain queryable. An archived Lead may be restored.

### 3.2 Client — CRM (CRM Entity)

**Definition:** A Client (CRM) represents a business relationship that has progressed beyond the inquiry stage. A Client may originate from Lead conversion or from direct manual creation by the operator. Distinct from Client (Content) which stores logos for the public site.

**Required Attributes:**

- id — Unique identifier, assigned at creation, immutable
- name — Full name or business name (שם)
- email — Primary email address (אימייל)
- status — Current relationship state (סטטוס)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Attributes:**

- company — Business name, if distinct from name (חברה)
- phone — Phone number, Israeli format (טלפון)
- sourceLead — Reference to the originating Lead, if converted (null if manually created)
- notes — Operator-entered notes, append-style, timestamped (הערות)
- archivedAt — Timestamp of archival
- address — Physical address, Israeli format (כתובת)
- preferredContact — Preferred contact method: "טלפון", "אימייל", or "הודעה"

**Lifecycle States (Status Enum):**

| Key | Hebrew Label | Description |
|-----|-------------|-------------|
| active | פעיל | Currently engaged with WDI |
| completed | הושלם | Engagement concluded successfully |
| inactive | לא פעיל | No current engagement, retained for future |
| archived | בארכיון | Historical record |

**Status Transition Matrix:**

| From | Allowed Transitions |
|------|-------------------|
| active | completed, inactive, archived |
| completed | inactive, archived |
| inactive | active, archived |
| archived | restore to previous status |

### 3.3 Engagement (CRM Entity)

**Definition:** An Engagement represents an active work commitment to a client. It is the system's record of a specific piece of work that WDI has agreed to deliver — project management for a construction site, supervision of a building project, engineering consulting, etc. An Engagement is always tied to a Client (CRM).

**Required Attributes:**

- id — Unique identifier, assigned at creation, immutable
- title — Descriptive title (e.g., "פיקוח על פרויקט Intel KG") (כותרת)
- client — Reference to the Client (CRM) entity. Must reference an existing Client document.
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Attributes:**

- engagementType — Type of work. Populated from CrmSettings.serviceTypes (e.g., "ניהול פרויקטים", "פיקוח", "ייעוץ הנדסי")
- value — Contract value in ₪. Default 0 (ערך)
- status — Current lifecycle state. Must be from CrmSettings.engagementStatuses. Default "חדש"
- estimatedDuration — Freeform duration (e.g., "12 חודשים") (משך משוער)
- scope — String array of work items (e.g., ["ניהול פרויקט", "בקרת איכות", "בקרת מסמכים"])
- startDate — ISO date string (תאריך התחלה)
- expectedEndDate — ISO date string (תאריך סיום משוער)
- actualEndDate — ISO date string (תאריך סיום בפועל)
- description — Project description (תיאור)
- internalNotes — Private operator notes (הערות פנימיות)

**Lifecycle States (Status Enum — Configurable via CrmSettings):**

| Key | Hebrew Label | Description |
|-----|-------------|-------------|
| new | חדש | Created, work not started |
| in_progress | בביצוע | Work actively performed |
| review | בבדיקה | Under review |
| delivered | נמסר | Deliverables handed to client |
| completed | הושלם | Concluded successfully (terminal) |
| paused | מושהה | Temporarily suspended |
| cancelled | בוטל | Cancelled (terminal) |

**Status Transition Matrix:**

| From | Allowed Transitions |
|------|-------------------|
| new | in_progress, paused, cancelled |
| in_progress | review, delivered, paused, cancelled |
| review | in_progress, delivered, paused, cancelled |
| delivered | completed, in_progress, cancelled |
| paused | new, in_progress, cancelled |
| completed | (terminal) |
| cancelled | (terminal) |

### 3.4 Activity (CRM Entity — Append-Only)

**Definition:** An Activity is an immutable record of a significant event in the lifecycle of a Lead, Client (CRM), or Engagement. Activities form the audit trail.

**Required Attributes:**

- id — Unique identifier, assigned at creation, immutable
- entityType — "lead", "client", or "engagement"
- entityId — The ID of the entity this activity belongs to
- type — Event category (must be from the defined type enum)
- description — Human-readable summary of what occurred (in Hebrew)
- performedBy — Actor identifier (operator email or "system")
- createdAt — Timestamp of the event, immutable

**Optional Attributes:**

- metadata — Structured contextual data relevant to the event type (e.g., previous/new status for status changes, call duration for calls, quote amount)

**Activity Type Enum:**

| Key | Hebrew Label |
|-----|-------------|
| status_change | שינוי סטטוס |
| note_added | הערה נוספה |
| lead_created | ליד נוצר |
| lead_converted | ליד הומר ללקוח |
| client_created | לקוח נוצר |
| lead_archived | ליד הועבר לארכיון |
| client_archived | לקוח הועבר לארכיון |
| record_restored | רשומה שוחזרה |
| record_updated | רשומה עודכנה |
| duplicate_submission | הגשה כפולה |
| bulk_operation | פעולה מרובה |
| call_logged | שיחה תועדה |
| email_sent | אימייל נשלח |
| email_received | אימייל התקבל |
| site_visit_scheduled | ביקור באתר תוכנן |
| site_visit_completed | ביקור באתר בוצע |
| quote_sent | הצעת מחיר נשלחה |
| quote_accepted | הצעת מחיר התקבלה |
| quote_rejected | הצעת מחיר נדחתה |
| custom | מותאם אישית |

**Immutable Nature:**

Activities are append-only. Once created, an Activity record is never modified and never deleted. There is no update operation. There is no delete operation. If an Activity was created in error, the correct remediation is to create a corrective Activity.

### 3.5 CrmSettings (CRM Entity — Singleton)

**Definition:** CrmSettings is a singleton that stores runtime-configurable CRM behavior parameters. It defines pipeline stages, engagement statuses, service types, lead sources, and defaults. There is exactly one CrmSettings record. It cannot be duplicated. It cannot be deleted.

**Required Fields:**

- id — Fixed singleton identifier, immutable
- pipelineStages — Array of stage definitions, each with: key, label (Hebrew), color. Default:

| key | label | color |
|-----|-------|-------|
| new | ליד חדש | #ef4444 |
| contacted | נוצר קשר | #8b5cf6 |
| qualified | מתאים | #3b82f6 |
| proposal_sent | הצעה נשלחה | #f59e0b |
| won | נסגר בהצלחה | #10b981 |
| lost | לא רלוונטי | #6b7280 |

- engagementStatuses — Array of status definitions, each with: key, label (Hebrew), color. Default:

| key | label | color |
|-----|-------|-------|
| new | חדש | #f59e0b |
| in_progress | בביצוע | #3b82f6 |
| review | בבדיקה | #8b5cf6 |
| delivered | נמסר | #10b981 |
| completed | הושלם | #059669 |
| paused | מושהה | #ef4444 |
| cancelled | בוטל | #111827 |

- serviceTypes — String array of WDI service types. Default: ["ניהול פרויקטים", "פיקוח", "ייעוץ הנדסי", "ייצוג מזמין", "PMO", "בקרת איכות", "בקרת מסמכים", "רישוי והיתרים"]
- leadSources — String array. Default: ["טופס אתר", "שיחת טלפון", "הפניה", "לינקדאין", "אחר"]
- defaultPriority — Default: "בינוני"
- currency — Default: "₪"
- engagementLabel — Default: "התקשרות"

**Singleton Rule:** Only one CrmSettings record may exist (INV-035). Creation of a second is prohibited. Deletion is prohibited.

---

### 3.6 Service (Content Entity)

**Definition:** A Service represents a professional service offering that WDI presents to visitors on the public website. Each service has its own detail page at `/services/[slug]`. WDI offers: ניהול פרויקטים (Project Management), פיקוח (Supervision), ייעוץ הנדסי (Engineering Consulting), ייצוג מזמין (Client Representation), PMO, בקרת איכות (QA/QC), בקרת מסמכים (Document Control), רישוי והיתרים (Permits and Licensing).

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- name — Display name in Hebrew (שם)
- slug — URL-safe identifier, derived from name, unique (INV-016)
- description — Descriptive text displayed to visitors (תיאור)
- order — Numeric display order for sorting (סדר)
- isActive — Visibility state (true = visible on public site) (פעיל)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- tagline — Short summary line (תת-כותרת)
- icon — Icon identifier for visual display
- highlights — Structured list of feature highlights, each with title and description (נקודות מפתח)
- detailContent — Rich text content for the service detail page (Portable Text) (תוכן מפורט)
- image — Service image (stored in Sanity media)
- archivedAt — Timestamp of archival

**Visibility State:** A Service with isActive = true renders on the public website and in the services listing. A Service with isActive = false is visible only in the Back Office.

**Rendering Guarantee:** If the Content Store returns this entity with isActive = true, the Public Website Domain must render it. If no active Services exist, the Public Website Domain renders an empty state in Hebrew.

### 3.7 Project (Content Entity)

**Definition:** A Project represents a completed or ongoing construction project that WDI showcases on the public website. Each project has its own detail page at `/projects/[slug]`. Projects are classified into one of six sectors. Projects are the primary evidence of WDI's delivery capability.

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- title — Project name in Hebrew (שם פרויקט)
- slug — URL-safe identifier, unique across all Projects (INV-032)
- client — Client name (display string, not a CRM reference) (מזמין)
- sector — Sector classification. Must be from the defined sector enum (ענף)
- isActive — Visibility state (פעיל)
- order — Numeric display order (סדר)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- description — Project description, rich text (Portable Text) (תיאור)
- scope — String array of work delivered (e.g., ["ניהול פרויקט", "פיקוח", "בקרת איכות"]) (היקף)
- location — Project location (מיקום)
- images — Image array, gallery of project photos (תמונות)
- featuredImage — Primary image for project cards (תמונה ראשית)
- isFeatured — Whether promoted to homepage display (מוצג בדף הבית)
- startDate — ISO date string (תאריך התחלה)
- completedAt — ISO date string (תאריך סיום)
- archivedAt — Timestamp of archival

**Sector Enum (Canonical):**

| Key | Hebrew Label |
|-----|-------------|
| security | בטחוני |
| commercial | מסחרי |
| industrial | תעשייה |
| infrastructure | תשתיות |
| residential | מגורים |
| public | ציבורי |

These are the only permitted sector values. All six sectors must be available as filters on the projects listing page.

**Linked Testimonials:** Testimonials that reference this Project via projectRef are displayed on the project detail page. The Project entity does not store testimonial references directly — the relationship is owned by the Testimonial entity.

**Rendering Guarantee:** Active Projects render on the public site. The projects listing page supports filtering by sector.

### 3.8 TeamMember (Content Entity)

**Definition:** A TeamMember represents a company team member displayed on the public website. Team members are organized into four categories.

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- name — Full name in Hebrew (שם)
- role — Professional title in Hebrew (תפקיד). This is the canonical field name. Not "position".
- category — Team category. Must be from the defined category enum (קטגוריה)
- isActive — Visibility state (פעיל)
- order — Display order within category (סדר)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- image — Portrait photo (stored in Sanity media) (תמונה)
- bio — Professional background text (רקע מקצועי)
- qualifications — Professional qualifications text (כישורים)
- degrees — Array of education records, each with:
  - title — Degree title, e.g., "הנדסאי בניין" (שם תואר)
  - degree — Degree level, e.g., "הנדסאי" (רמת תואר)
  - institution — Educational institution (מוסד)
  - year — Graduation year (שנה)
- linkedin — LinkedIn profile URL
- email — Professional email
- phone — Phone number, Israeli format
- archivedAt — Timestamp of archival

**Category Enum (Canonical):**

| Key | Hebrew Label | Display Order |
|-----|-------------|---------------|
| founders | מייסדים | 1 |
| management | הנהלה | 2 |
| department-heads | ראשי תחומים | 3 |
| project-managers | מנהלי פרויקטים | 4 |

These are the only permitted category values. The team listing page displays members grouped by category in the order specified above.

**Schema Reconciliation Note (Migration):** The current backoffice uses categories (management, administration, department-heads, project-managers) while the live site uses (founders, admin, heads, team). During migration, data must be mapped to the canonical enum above:

| Old Backoffice Value | Old Website Value | Canonical Value |
|---------------------|-------------------|-----------------|
| management | founders | founders |
| administration | admin | management |
| department-heads | heads | department-heads |
| project-managers | team | project-managers |

### 3.9 Client — Content (Content Entity)

**Definition:** A Client (Content) represents a client organization whose logo is displayed on the public website's clients page. This entity is entirely distinct from the CRM Client entity (§3.2). Content Clients exist for display purposes. CRM Clients track business relationships.

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- name — Client organization name (שם)
- isActive — Visibility state (פעיל)
- order — Display order (סדר)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- logo — Client logo image (stored in Sanity media) (לוגו)
- websiteUrl — Client website URL (אתר)
- archivedAt — Timestamp of archival

**Rendering Guarantee:** Active Content Clients render their logos on the public clients page.

### 3.10 Testimonial (Content Entity)

**Definition:** A Testimonial represents a client endorsement displayed on the public website. Every Testimonial is linked to a specific Project — there are no project-unbound testimonials. Testimonials are created in the context of a Project and appear on that project's detail page, as well as on the homepage (featured) and a dedicated testimonials page.

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- clientName — Name of the person quoted (שם הממליץ)
- quote — The testimonial text (תוכן ההמלצה)
- projectRef — Reference to a Project entity. Must reference an existing Project (INV-037). Every Testimonial must be project-bound. (פרויקט)
- isActive — Visibility state (פעיל)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- companyName — Business name of the quoted person (חברה)
- role — Role/title of the quoted person (תפקיד)
- isFeatured — Whether promoted to homepage display (מוצג בדף הבית)
- order — Display order (סדר)
- image — Photo of the quoted person (תמונה)
- archivedAt — Timestamp of archival

**Project Linking Semantics:** projectRef is mandatory. A Testimonial without a projectRef is invalid. The testimonial always appears on the referenced project's detail page. A single testimonial is linked to exactly one project. Multiple testimonials may link to the same project. Testimonials are created from within the Project management context in the Back Office (DOC-030 §11.2).

### 3.11 PressItem (Content Entity)

**Definition:** A PressItem represents a media article or coverage piece about WDI displayed on the press page (כתבו עלינו).

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- title — Article title (כותרת)
- isActive — Visibility state (פעיל)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- source — Media outlet name (מקור)
- publishDate — Publication date (תאריך פרסום)
- excerpt — Article excerpt or summary (תקציר)
- externalUrl — Link to the original article (קישור)
- image — Article image or press photo (תמונה)
- order — Display order (סדר)
- archivedAt — Timestamp of archival

### 3.12 Job (Content Entity)

**Definition:** A Job represents an open position at WDI displayed on the jobs page (משרות).

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- title — Position title in Hebrew (כותרת משרה)
- isActive — Visibility state (true = displayed on public site as open position) (פעילה)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- description — Position description, rich text (תיאור)
- requirements — Job requirements, rich text or string array (דרישות)
- location — Work location (מיקום)
- type — Employment type, e.g., "משרה מלאה", "משרה חלקית", "פרילנס" (סוג משרה)
- department — Department within WDI (מחלקה)
- contactEmail — Application email (אימייל ליצירת קשר)
- order — Display order (סדר)
- archivedAt — Timestamp of archival

### 3.13 ContentLibraryItem (Content Entity)

**Definition:** A ContentLibraryItem represents a professional resource, publication, or reference material displayed in the content library page (מאגר מידע). Per DOC-000 §9, this is an active feature with 6 known items on the live site.

**Required Fields:**

- id — Unique identifier, assigned at creation, immutable
- title — Item title in Hebrew (כותרת)
- isActive — Visibility state (פעיל)
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- description — Item description (תיאור)
- category — Content category for grouping/filtering (קטגוריה)
- fileUrl — URL or reference to downloadable file (קובץ)
- externalUrl — Link to external resource (קישור חיצוני)
- image — Thumbnail or cover image (תמונה)
- order — Display order (סדר)
- archivedAt — Timestamp of archival

### 3.14 HeroSettings (Content Entity — Singleton)

**Definition:** HeroSettings is a singleton that stores the homepage hero section configuration. There is exactly one HeroSettings record.

**Required Fields:**

- id — Fixed singleton identifier, immutable
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- headline — Main headline text in Hebrew (כותרת ראשית)
- subheadline — Secondary headline (כותרת משנית)
- ctaText — Call-to-action button text (טקסט כפתור)
- ctaLink — Call-to-action destination URL (קישור כפתור)
- videoUrl — Hero video (stored in Sanity media, with compression) (וידאו)
- backgroundImage — Fallback background image if video unavailable (תמונה)

**Singleton Rule:** Only one HeroSettings record may exist (INV-036). Deletion is prohibited.

**Video Upload:** Video upload is mandatory per DOC-000 requirements. Videos must be compressed. Maximum upload size: 25MB.

### 3.15 SiteSettings (Content Entity — Singleton)

**Definition:** SiteSettings is a singleton that stores global site configuration displayed across all public pages.

**Required Fields:**

- id — Fixed singleton identifier, immutable
- createdAt — Timestamp of creation, immutable
- updatedAt — Timestamp of last modification

**Optional Fields:**

- companyName — Company display name (שם חברה)
- phone — Company phone number (טלפון)
- email — Company email address (אימייל)
- address — Company address, Israeli format (כתובת)
- footerText — Footer content (תוכן תחתית)
- socialLinks — Object containing social media URLs: linkedin, facebook, instagram, etc. (קישורי רשתות חברתיות)
- seoTitle — Default SEO title (כותרת SEO)
- seoDescription — Default SEO description (תיאור SEO)
- seoKeywords — SEO keywords (מילות מפתח)
- ogImage — Default Open Graph image (תמונת שיתוף)

**Singleton Rule:** Only one SiteSettings record may exist (INV-014). Deletion is prohibited.

---

## 4. Cross-Entity Rules

### 4.1 CRM Entities Are Isolated from Content Entities

CRM entities (Lead, Client CRM, Engagement, Activity, CrmSettings) do not reference Content entities (Service, Project, TeamMember, Client Content, Testimonial, PressItem, Job, ContentLibraryItem, HeroSettings, SiteSettings). The two families share a data store but have no relational dependencies.

### 4.2 No Content Entity May Reference a CRM Entity

Services, Projects, TeamMembers, Testimonials, PressItems, Jobs, ContentLibraryItems, HeroSettings, and SiteSettings do not reference Leads, Clients (CRM), Engagements, or Activities. A Project's `client` field is a display string, not a CRM reference.

### 4.3 Content-to-Content References Are Permitted Where Documented

The only permitted Content-to-Content reference is Testimonial → Project (§2.3). This reference is mandatory — every Testimonial must be linked to a Project. No other Content-to-Content references exist.

### 4.4 IDs Are Immutable

Every entity ID is assigned at creation and never changes.

### 4.5 No External System Is Source of Truth

The Content Store (Sanity) is the source of truth for all entity data.

### 4.6 Client (Content) and Client (CRM) Are Completely Distinct

These two entity types share the word "client" but are unrelated. Client (Content) — §3.9 — stores logos for the public site. Client (CRM) — §3.2 — tracks business relationships. They have separate Sanity document types, separate schemas, and no cross-references.

---

## 5. Invariants

The following invariants are unconditional. Every write must satisfy all applicable invariants. Violations must be rejected at write time.

**INV-001:** Every entity must have a unique, immutable ID assigned at creation.

**INV-002:** Every entity must have a createdAt timestamp assigned at server time at the moment of persistence.

**INV-003:** Every mutable entity must have an updatedAt timestamp reflecting the most recent successful modification.

**INV-004:** A Lead must have a non-empty name, valid email, non-empty message, valid source, and valid status at all times.

**INV-005:** A Lead's status must be a member of the defined Lead status enum. No other values are permitted.

**INV-006:** A Lead may be converted to a Client (CRM) at most once.

**INV-007:** A Lead may only be converted when its status is "won" (נסגר בהצלחה).

**INV-008:** No two Client (CRM) records may share the same email address.

**INV-009:** A Client (CRM) must have a non-empty name, valid email, and valid status at all times.

**INV-010:** A Client (CRM) status must be from the defined Client status enum.

**INV-011:** An Activity record is immutable after creation. No field may be modified or deleted.

**INV-012:** An Activity must reference an existing Lead, Client (CRM), or Engagement via entityId.

**INV-013:** A Project sector must be a member of the defined sector enum. No other values are permitted.

**INV-014:** Only one SiteSettings record may exist. Creation of a second is prohibited. Deletion is prohibited.

**INV-015:** Only one HeroSettings record may exist. Deletion is prohibited.

**INV-016:** A Service slug must be unique across all Service entities.

**INV-017:** A TeamMember category must be a member of the defined category enum.

**INV-018:** Enum fields (Lead status, Client CRM status, Engagement status, Activity type, Project sector, TeamMember category, Lead priority) must contain only values defined in this document or in CrmSettings. Unrecognized values must be rejected.

**INV-019:** No CRM entity may be permanently deleted. Deletion is implemented as archival.

**INV-020:** Every CRM state mutation must generate a corresponding Activity record atomically.

**INV-021:** At most one active Lead per unique email address may exist at any given time.

**INV-022:** Lead and Client (CRM) status changes must follow the Status Transition Matrices defined in this document.

**INV-023:** Every mutation to a mutable entity must validate updatedAt (optimistic concurrency). Blind overwrites are prohibited.

**INV-024:** TeamMember.role is the canonical field name for professional title. The field "position" must not exist in the schema.

**INV-025:** If the SiteSettings singleton does not exist at application initialization, the application must fail to start. Silent fallback is prohibited.

**INV-026:** TeamMember.degrees, when present, must be an array of objects each containing: title (string, required), degree (string, required), institution (string, required), year (number, optional).

**INV-027:** Every bulk CRM mutation must generate at least one summarized Activity of type "bulk_operation".

**INV-030:** A Project slug must be unique across all Project entities.

**INV-033:** Engagement.title is required and must be non-empty.

**INV-034:** Engagement.client must reference an existing Client (CRM) document.

**INV-035:** CrmSettings is a singleton. Only one record may exist. Deletion is prohibited.

**INV-036:** HeroSettings is a singleton. Only one record may exist. Deletion is prohibited.

**INV-037:** Testimonial.projectRef is required and must reference an existing Project document. A Testimonial without a valid projectRef must be rejected at write time. There are no project-unbound testimonials.

---

## 6. Mutation Rules

### 6.1 Atomic Saves

Every write operation is atomic. Either all intended changes persist, or none do. No partial saves.

### 6.2 Validation Before Write

Every mutation must be validated before reaching the data store. Required fields present, types correct, enum values valid, invariants satisfied.

### 6.3 Server-Side Validation Is Authoritative

Client-side validation is convenience. Server-side validation (API Layer) is enforcement.

### 6.4 Every Mutation Must Be Confirmable

The API Layer must return explicit success or failure. The Back Office must display the result to the operator. In Hebrew.

### 6.5 Optimistic Concurrency

Every mutation must validate updatedAt. If the incoming updatedAt doesn't match persisted updatedAt, the write is rejected (conflict). No blind overwrites.

### 6.6 Bulk Mutation Governance

Bulk CRM operations must comply with all invariants. Every bulk mutation generates a summarized Activity. Bulk operations are atomic — all succeed or none do.

---

## 7. Forbidden Patterns

### 7.1 Storing JSON Blobs Instead of Structured Fields

Entity attributes must be individually addressable fields. No serialized JSON strings as single fields.

### 7.2 Using Optional Fields to Avoid Schema Decisions

A field is optional when business reality permits its absence. Not because the implementer is unsure.

### 7.3 Overloading Fields Semantically

One field, one concept. No using "notes" for status. No using "description" for configuration.

### 7.4 Allowing Null Where an Invariant Requires a Value

Required means non-null, non-empty, at all times.

### 7.5 Hard-Coded Enums in UI

Enum values are maintained in a single authoritative location. The UI reads from that source. No hard-coding dropdown options in form components.

### 7.6 Creating CRM Entities Without Audit Trail

Every CRM entity creation generates a corresponding Activity. Content entities do not require Activities but must have createdAt timestamps.

### 7.7 Using "position" Instead of "role"

The canonical field name for a team member's professional title is `role`. The field `position` must not exist anywhere in the schema, API, or UI. This is binding and non-negotiable per DOC-010 §7.2 schema reconciliation.

---

## 8. Binding Nature

### 8.1 Violations Are Defects

Any implementation that contradicts an entity definition, violates an invariant, or employs a forbidden pattern is non-compliant and must be corrected.

### 8.2 No Feature May Contradict Entity Definitions

A feature that requires a Lead without an email, a TeamMember without a category, or a Project with an undefined sector must be redesigned to conform to the model.

### 8.3 Subordination

This document is subordinate to DOC-000 (v1.0) and DOC-010 (v1.0). All subsequent documents addressing implementation, API design, or UI behavior are subordinate to this data model.

### 8.4 Change Control

This document may be revised when new entities are required, existing definitions need refinement, or business requirements change. Revisions require documentation of what changed and explicit assessment of impact on existing data.

---

*End of document.*
