# DOC-070 — Product Specification: wdi.co.il Website & Content Management System

**Status:** Canonical
**Effective Date:** February 20, 2026
**Version:** 1.0
**Timestamp:** 20260220-1530 (CST)
**Governing Documents:** DOC-000 (v1.0), DOC-010 (v1.0), DOC-020 (v1.0), DOC-030 (v1.0)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260220-1530 | Initial release — full product specification derived from working site screenshots, founder requirements, and prior conversation history |

---

## 1. Executive Intent

This document defines what the public website displays, how the operator manages every piece of content through the CMS, and the exact mapping between each public page and its CMS management interface.

**Binding Principle — Everything Is Editable:** Except visual design (colors, fonts, layout/CSS), every piece of content and every media asset displayed on the public website is editable through the CMS. No hardcoded content. No hardcoded links to images or videos. The operator uploads all media (images, videos) through the CMS. The operator selects icons from a bank of 100 relevant icons.

**Binding Principle — CMS Page Per Menu Item:** Every page accessible through the main navigation has a corresponding CMS management page. Additionally, Site Settings and CRM management pages exist.

---

## 2. Navigation Structure

### 2.1 Main Navigation (RTL, Right to Left)

The navigation bar contains 6 items, three with dropdown submenus:

| # | Item | Hebrew Label | Type | Subitems |
|---|------|-------------|------|----------|
| 1 | About | אודות | Dropdown | About the Company (אודות החברה), Our Team (הצוות שלנו), Press Coverage (כתבו עלינו), Clients (לקוחות) |
| 2 | Services | שירותים | Dropdown | 8 services — Design Management (ניהול תכנון), Requirements & Specification (מסמכי דרישות ואפיון), Execution Management & Supervision (ניהול ביצוע ופיקוח), Stakeholder Representation (ייצוג בעלי עניין), PMO Services (שירותי PMO), Quality Management (ניהול והבטחת איכות), Knowledge Management (ניהול הידע), Zoning & Permits (ניהול תב"ע והיתרים) |
| 3 | Projects | פרויקטים | Direct link | — |
| 4 | Innovation & Technology | חדשנות וטכנולוגיה | Direct link | — |
| 5 | Knowledge Base | מאגר מידע | Direct link | — |
| 6 | Contact | צור קשר | Dropdown | Leave Details (השאר פרטים), Join Our Registry (הצטרפות למאגר שלנו), Jobs (משרות) |

### 2.2 Navigation Management in CMS

**Navigation labels** (menu item names) are editable through Site Settings. The services dropdown list auto-updates from active Service entities (isActive = true) sorted by order field.

---

## 3. Public Pages & CMS Requirements

### 3.1 Homepage

**Public Display:**
- Fullscreen Hero section: background video, main headline ("מאתגר להצלחה"), subheadline, two CTA buttons (Contact, Services)
- White WDI logo on dark background in upper-right corner
- Footer (see Section 4)

**CMS Management (Page: Hero):**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| headline | כותרת ראשית | Text | No | Default: "מאתגר להצלחה" |
| subheadline | כותרת משנית | Text | No | |
| ctaText | טקסט כפתור ראשי | Text | No | |
| ctaLink | קישור כפתור ראשי | URL | No | |
| cta2Text | טקסט כפתור שני | Text | No | |
| cta2Link | קישור כפתור שני | URL | No | |
| videoUrl | וידאו רקע | Video upload | Yes | Max 40MB, compressed |
| backgroundImage | תמונת גיבוי | Image upload | No | Displayed if video fails to load |

**Singleton:** One record only. Cannot delete or create additional.

---

### 3.2 About the Company Page

**Public Display:**
- Top banner with page title
- Company description section (founders, history, vision) — rich text
- "Our Values" section: 4 value cards — Safety (בטיחות), Trust (אמון), Respect (דרך ארץ), Innovation (חדשנות). Each card: icon, title, description text
- "Press Coverage" section (3+ articles with source logo, date, title, link to article)
- CTA to Contact page

**CMS Management (Page: About):**

| Field | Hebrew Label | Type | Required |
|-------|-------------|------|----------|
| pageTitle | כותרת עמוד | Text | Yes |
| companyDescription | תיאור החברה | Rich Text | Yes |
| values | ערכים | Dynamic list | No |

**Each value in the values list:**

| Field | Hebrew Label | Type |
|-------|-------------|------|
| icon | אייקון | Icon picker (from bank) |
| title | כותרת | Text |
| description | תיאור | Rich Text |

**Press items** — Separate entity (PressItem), see Section 3.9. The About page displays active press items.

---

### 3.3 Team Page

**Public Display:**
- Top banner
- 4 category sections in **fixed order:** Founders (מייסדים) → Management (הנהלה) → Department Heads (ראשי תחומים) → Project Managers (מנהלי פרויקטים)
- Each team member: photo, name, role
- Click on member → expanded profile: biography, education, LinkedIn
- Bottom CTA: "Want to join the team?" linking to Jobs page

**CMS Management (Page: Team):**

Per team member (TeamMember entity):

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| name | שם | Text | Yes | |
| role | תפקיד | Text | Yes | Canonical name. NOT "position" |
| category | קטגוריה | Dropdown | Yes | founders / management / department-heads / project-managers |
| image | תמונה | Image upload | No | |
| bio | רקע מקצועי | Rich Text | No | |
| birthYear | שנת לידה | Number | No | |
| residence | מקום מגורים | Text | No | |
| qualifications | כישורים | Text | No | "הנדסאי" / "מהנדס" / other |
| degrees | תארים | Dynamic list | No | See degree structure below |
| linkedin | לינקדאין | URL | No | |
| email | אימייל | Email | No | |
| phone | טלפון | Text | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | Yes | Display order within category |

**Degree structure (each entry in degrees list):**

| Field | Hebrew Label | Type | Notes |
|-------|-------------|------|-------|
| title | שם תואר | Text | e.g., "הנדסה אזרחית" (Civil Engineering) |
| degree | רמת תואר | Dropdown | BSc / MSc / הנדסאי / טכנאי / Other |
| institution | מוסד | Text | e.g., "הטכניון" (Technion) |
| year | שנת סיום | Number | e.g., 2002 |

**Important:** Multiple degrees are supported. A person may have more than one first degree and more than one second degree.

---

### 3.4 Clients Page

**Public Display:**
- Top banner
- Logo grid of client organizations (Client Content entities)
- **Below logos: Featured Testimonials section** — displays only Testimonials where isFeatured = true

**CMS Management (Page: Clients Content):**

Per client (Client Content entity):

| Field | Hebrew Label | Type | Required |
|-------|-------------|------|----------|
| name | שם | Text | Yes |
| logo | לוגו | Image upload | No |
| websiteUrl | אתר | URL | No |
| isActive | פעיל | Toggle | Yes |
| order | סדר | Number | Yes |

**Featured testimonials** are managed through the Testimonial entity (see Section 3.12). Setting isFeatured = true causes display on the Clients page.

---

### 3.5 Services Listing Page

**Public Display:**
- Top banner
- Grid of 8 service cards, each with: icon, service name, short description
- Each card links to the specific service detail page

**CMS Management (Page: Services):**

Per service (Service entity):

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| name | שם | Text | Yes | |
| slug | Slug | Text (auto-generated) | Yes | Unique |
| tagline | תת-כותרת | Text | No | |
| description | תיאור קצר | Text | Yes | Displayed on card |
| icon | אייקון | Icon picker (from bank) | No | |
| detailContent | תוכן מפורט | Rich Text (Portable Text) | No | Displayed on detail page |
| highlights | נקודות מפתח | Dynamic list | No | Each item: title + description |
| image | תמונה | Image upload | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | Yes | |

---

### 3.6 Service Detail Page

**Public Display:**
- Banner with service name and short description
- Share buttons (WhatsApp, Facebook, Email)
- "About the Service" section: rich content from detailContent
- "Key Points" section from highlights
- Sidebar "Additional Services": links to other active services

**All fields managed in CMS** through Service entity (see 3.5).

---

### 3.7 Projects Listing Page

**Public Display:**
- Top banner
- Sector filters: All (הכל), Security (בטחוני), Commercial (מסחרי), Industrial (תעשייה), Infrastructure (תשתיות), Residential (מגורים), Public (ציבורי)
- Grid of project cards: background image, project name, client name, sector tag
- Bottom CTA: "Have a challenging project?" linking to Contact page

**CMS Management (Page: Projects):**

Per project (Project entity):

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| title | שם פרויקט | Text | Yes | |
| slug | Slug | Text (auto-generated) | Yes | Unique |
| client | מזמין | Text | Yes | Display name, not CRM reference |
| sector | ענף | Dropdown | Yes | security / commercial / industrial / infrastructure / residential / public |
| description | תיאור | Rich Text | No | |
| scope | היקף שירותים | String array | No | What WDI delivered |
| location | מיקום | Text | No | |
| featuredImage | תמונה ראשית | Image upload | No | Shown on project card |
| images | גלריית תמונות | Multi-image upload | No | |
| startDate | תאריך התחלה | Date | No | |
| completedAt | תאריך סיום | Date | No | |
| isFeatured | מוצג בדף הבית | Toggle | No | |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | Yes | |

---

### 3.8 Project Detail Page

**Public Display:**
- Banner with project name and client name, sector tag
- Info bar: Client, Sector, Year, Services delivered
- "About the Project" section: detailed description
- Image gallery
- **Testimonials section:** All Testimonials linked to this project via projectRef

**All fields managed in CMS** through Project entity (see 3.7).
**Testimonials** are managed through the Testimonial entity with projectRef pointing to this project (see 3.12).

---

### 3.9 Press Coverage (כתבו עלינו)

**Public Display:**
- Appears as a section within the About page
- 3+ articles, each with: source logo, date, title, link to original article

**CMS Management (Page: Press):**

Per article (PressItem entity):

| Field | Hebrew Label | Type | Required |
|-------|-------------|------|----------|
| title | כותרת | Text | Yes |
| source | מקור | Text | No |
| publishDate | תאריך פרסום | Date | No |
| excerpt | תקציר | Text | No |
| externalUrl | קישור | URL | No |
| image | תמונה/לוגו מקור | Image upload | No |
| isActive | פעיל | Toggle | Yes |
| order | סדר | Number | No |

---

### 3.10 Innovation & Technology Page

**Public Display:**
- Top banner
- Content about WDI's innovation approach, AI tools, WDI Agent
- Visual demonstration of innovation tools

**CMS Management (Page: Innovation):**

Singleton (one record):

| Field | Hebrew Label | Type | Required |
|-------|-------------|------|----------|
| pageTitle | כותרת עמוד | Text | Yes |
| content | תוכן | Rich Text | Yes |
| image | תמונה | Image upload | No |
| sections | סקשנים | Dynamic list | No |

Each section: title, content, image, icon.

---

### 3.11 Knowledge Base (מאגר מידע)

**Public Display:**
- List of links to professional documents and external sources
- Each item: icon, title, description, external link
- Sources include: Ministry of Defense (משהב"ט), Ministry of Construction, Ministry of Health, etc.

**CMS Management (Page: Knowledge Base):**

Per item (ContentLibraryItem entity):

| Field | Hebrew Label | Type | Required |
|-------|-------------|------|----------|
| title | כותרת | Text | Yes |
| description | תיאור | Text | No |
| category | קטגוריה | Text | No |
| icon | אייקון | Icon picker (from bank) | No |
| externalUrl | קישור חיצוני | URL | No |
| fileUrl | קובץ | File upload | No |
| image | תמונה | Image upload | No |
| isActive | פעיל | Toggle | Yes |
| order | סדר | Number | No |

---

### 3.12 Testimonials (ציטוטים / המלצות)

**BINDING RULE: A testimonial MUST be linked to a project.** It is forbidden to create a testimonial that is not connected to a specific project. The projectRef field is REQUIRED.

**Where testimonials appear on the public site:**
1. **On the specific project page** — every testimonial appears on the project detail page it is linked to
2. **On the Clients page** — only testimonials marked isFeatured = true are displayed below the client logo grid

**Where testimonials are entered in CMS:**
Testimonials are managed **from within the Project page in the CMS**. When the operator edits a project, they see the list of linked testimonials and can add a new one. Any testimonial created this way is automatically linked to the current project.

Additionally, a standalone Testimonials management page exists in the CMS showing all testimonials across all projects, with filter-by-project capability.

**Testimonial fields (Testimonial entity):**

| Field | Hebrew Label | Type | Required | Notes |
|-------|-------------|------|----------|-------|
| clientName | שם הממליץ | Text | Yes | |
| quote | תוכן ההמלצה | Text | Yes | |
| companyName | חברה | Text | No | |
| role | תפקיד | Text | No | |
| projectRef | פרויקט מקושר | Reference to Project | **Yes** | REQUIRED — cannot create testimonial without a project |
| image | תמונה | Image upload | No | |
| isFeatured | מוצג בעמוד לקוחות | Toggle | No | true = displayed on Clients page |
| isActive | פעיל | Toggle | Yes | |
| order | סדר | Number | No | |

**Amendment to DOC-020:** In DOC-020 §3.10, projectRef was defined as optional. This document amends it to **required**. A testimonial must be linked to a project.

---

### 3.13 Contact Page

**Public Display:**
- Form: Full name, Company, Email, Phone, Subject (dropdown), Message
- Contact details: Email, phone, address, Google map embed, social media icons

**CMS Management:**
- Form field labels and dropdown options — managed in Site Settings
- Contact details — managed in Site Settings (SiteSettings)
- Incoming form submissions → CRM Leads

---

### 3.14 Jobs Page

**Public Display:**
- List of open positions
- Each job: "New!" badge, title, job number, description, tags (location, type), share buttons, "Apply" button

**CMS Management (Page: Jobs):**

Per job (Job entity):

| Field | Hebrew Label | Type | Required |
|-------|-------------|------|----------|
| title | כותרת משרה | Text | Yes |
| description | תיאור | Rich Text | No |
| requirements | דרישות | Rich Text / tag list | No |
| location | מיקום | Text | No |
| type | סוג משרה | Dropdown | No |
| department | מחלקה | Text | No |
| contactEmail | אימייל | Email | No |
| isActive | פעילה | Toggle | Yes |
| order | סדר | Number | No |

---

### 3.15 Supplier Registration Page

**Public Display:**
- Explanation of supplier/consultant database purpose
- Registration form

**CMS Management:**

Singleton page:

| Field | Hebrew Label | Type | Required |
|-------|-------------|------|----------|
| pageTitle | כותרת עמוד | Text | Yes |
| content | תוכן הסבר | Rich Text | Yes |
| formFields | שדות טופס | Configuration | No |

---

## 4. Footer

### 4.1 Footer Structure

The footer is **identical across all pages**. No page-specific footer variants.

**Structure:**
- White WDI logo
- Company description (short text)
- Social media icons (LinkedIn, Facebook)
- 3 navigation columns:

| Column 1: Company (החברה) | Column 2: Services (שירותים) | Column 3: Contact (צור קשר) |
|---------------------------|------------------------------|------------------------------|
| About (אודות) | Design Management (ניהול תכנון) | info@wdi.co.il |
| Team (הצוות) | Requirements & Spec (מסמכי דרישות ואפיון) | 09-8322911 |
| Clients (לקוחות) | Supervision (ניהול ביצוע ופיקוח) | Leave Details (השאר פרטים) |
| Projects (פרויקטים) | Stakeholder Rep (ייצוג בעלי עניין) | Jobs (משרות) |
| | PMO (שירותי PMO) | |
| | QA (ניהול והבטחת איכות) | |
| | Knowledge Mgmt (ניהול הידע) | |
| | Zoning & Permits (ניהול תב"ע והיתרים) | |

- Bottom bar:
  - Right side: `© [year] WDI בע"מ. כל הזכויות שמורות.`
  - Left side: `Website by` followed by daflash logo (image, not text). Logo appears to the RIGHT of the words in RTL context. Logo width: ~80px.

### 4.2 Duns 100 Badge

Duns 100 badge/image with link to WDI's Duns 100 page. Displayed at bottom-left corner.

### 4.3 Footer Management in CMS

All footer elements are managed in SiteSettings:
- Company description text
- Social media links
- Contact details (email, phone)
- Copyright text
- daflash logo (image upload)
- Duns 100 link and image

**Services list in footer** auto-updates from active Service entities.

---

## 5. Media Management

### 5.1 Media Upload

All media (images, videos) is uploaded **through the CMS only**. No hardcoded links to static files. The operator:
- Uploads images (JPG, PNG, WebP) — reasonable size limits
- Uploads videos (MP4) — maximum 40MB
- Media deleted from CMS is deleted from storage

### 5.2 Icon Bank

The CMS provides a bank of **100 relevant icons** for the construction, engineering, and project management domain. The operator picks an icon from the bank for every icon field (services, values, knowledge base, etc.).

The bank includes icons for: safety, construction, planning, management, documents, quality, supervision, infrastructure, industrial, residential, public, security, commercial, sustainability, innovation, AI, digital tools, communication, people, knowledge management, permits, schedules, budgets, risks, and more.

---

## 6. Site Settings (SiteSettings)

### 6.1 Singleton

One record only. Cannot be deleted.

### 6.2 Fields

| Field | Hebrew Label | Type | Notes |
|-------|-------------|------|-------|
| companyName | שם חברה | Text | |
| phone | טלפון | Text | |
| email | אימייל | Text | |
| address | כתובת | Text | |
| footerText | תיאור בפוטר | Text | |
| socialLinks.linkedin | לינקדאין | URL | |
| socialLinks.facebook | פייסבוק | URL | |
| seoTitle | כותרת SEO ברירת מחדל | Text | |
| seoDescription | תיאור SEO ברירת מחדל | Text | |
| seoKeywords | מילות מפתח | Text | |
| ogImage | תמונת שיתוף | Image upload | |
| daflashLogo | לוגו daflash | Image upload | |
| duns100Image | תמונת Duns 100 | Image upload | |
| duns100Url | קישור Duns 100 | URL | |
| copyrightText | טקסט זכויות יוצרים | Text | |
| contactFormSubjects | נושאים בטופס צור קשר | List | Dropdown options for "Subject" field |
| googleMapsEmbed | מפת גוגל | Text (embed code) | |

---

## 7. SEO

### 7.1 Per-Page Requirements

- Unique `<title>` tag — derived from CMS content
- Unique `<meta description>` tag
- Open Graph tags (og:title, og:description, og:url, og:image)
- Schema.org JSON-LD: Organization, LocalBusiness, Service, Project, Person, JobPosting
- Canonical URL
- Auto-generated sitemap.xml
- robots.txt

### 7.2 SEO Management in CMS

Every content entity that has a public page (Service, Project, Job) may include optional SEO fields: SEO Title, SEO Description. If not filled, they are derived from the entity's standard title and description fields.

---

## 8. CMS Page Mapping

This table maps every CMS management page to its entity type and available operations.

| CMS Page | Entity / Entities | Type | Operations |
|----------|-------------------|------|------------|
| Hero | HeroSettings | Singleton | Edit only |
| About | AboutPage | Singleton | Edit only |
| Team | TeamMember | Collection | List, Create, Edit, Delete |
| Services | Service | Collection | List, Create, Edit, Delete |
| Projects | Project + linked Testimonials | Collection | List, Create, Edit, Delete |
| Testimonials | Testimonial | Collection | List, Create, Edit, Delete |
| Clients (Content) | Client (Content) | Collection | List, Create, Edit, Delete |
| Press | PressItem | Collection | List, Create, Edit, Delete |
| Jobs | Job | Collection | List, Create, Edit, Delete |
| Knowledge Base | ContentLibraryItem | Collection | List, Create, Edit, Delete |
| Innovation | InnovationPage | Singleton | Edit only |
| Supplier Registration | SupplierPage | Singleton | Edit only |
| Site Settings | SiteSettings | Singleton | Edit only |

---

## 9. Invariant Table (Rules That Cannot Be Violated)

| # | Rule | Explanation |
|---|------|-------------|
| INV-P01 | All visible content is editable via CMS | No hardcoded content |
| INV-P02 | All media is uploaded through CMS | No hardcoded image/video links |
| INV-P03 | Testimonial must be linked to a project | projectRef is a required field |
| INV-P04 | Testimonial with isFeatured=true displays on Clients page | In addition to displaying on the project page |
| INV-P05 | Footer is identical across all pages | No page-specific footer variants |
| INV-P06 | Service list in nav and footer = active services | Auto-updates from active Service entities |
| INV-P07 | Icons are picked from bank — not typed as text | Bank of 100 relevant icons |
| INV-P08 | Team category order is fixed | Founders → Management → Department Heads → Project Managers |
| INV-P09 | Role field is named "role", not "position" | Everywhere in the system |
| INV-P10 | Design (colors, fonts, layout) is not editable via CMS | Only developers change design |

---

## 10. Binding Nature

### 10.1 Violations Are Defects
Any implementation that contradicts a definition in this document is a defect that must be corrected.

### 10.2 Subordination
This document is subordinate to DOC-000, DOC-010, DOC-020, and DOC-030. All subsequent documents addressing UI design, development, or testing are subordinate to this document.

### 10.3 Amendment to DOC-020
This document amends DOC-020 §3.10: The projectRef field in the Testimonial entity changes from optional to **required**. A testimonial must be linked to a project.

---

*End of document.*
