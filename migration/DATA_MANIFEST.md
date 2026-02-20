# DATA_MANIFEST.md — Phase 0 Data Inventory & Reconciliation

**Generated:** 2026-02-19
**Commit at HEAD:** 94f2a89923af4bd094af227c6f4c031acc4aed71
**Governing Document:** DOC-060 §2.2.2

---

## 1. Entity Inventory

| Entity | Count at Git HEAD | Max Count in Git History | Count on Live Site (HTML) | Delta (HEAD vs History) | Recovery Action |
|--------|:-:|:-:|:-:|:-:|---|
| **Projects** | 14 (incl. 1 test) | 14 | 13 (HTML pages) | 0 | None — `פרוייקט-מטורף` is test data only |
| **TeamMembers** | 18 (incl. 2 test) | 21 | 12 (team.json drives site) | **-3** | **RECOVERED:** itamar-shapiro, li-chen-koren, shai-klartag (intentionally removed "departed") |
| **Services** | 8 | 8 | 8 (HTML detail pages) | 0 | None — but HTML has extensive content NOT in JSON (see §3) |
| **Clients (logos)** | 16 (individual JSON) | 16 | 19 (clients.json) | **+3** | clients.json has 3 extra: Noble Energy, PMEC, IDF — individual files don't exist |
| **Testimonials** | 5 | 5 | 5 (clients.json) | 0 | None — no testimonials were lost |
| **Press** | 3 | 3 | 3 | 0 | None |
| **Jobs** | 3 (data/jobs/) | 7 | **7 (HTML hardcoded)** | **-4** | **RECOVERED:** design-manager, qa-engineer, document-coordinator, intern from git history. **Plus:** HTML has 7 jobs (202601–202607) not in JSON |
| **ContentLibrary** | 6 | 6 | 6 | 0 | None |
| **HeroSettings** | 2 | 2 | 1 (hero section) | 0 | None |
| **Images** | 61 | 66 | ~61 | **-5** | **RECOVERED:** itamar.jpg, li-chen.jpg, wdi-logo.svg, wdi-logo-white.svg, gemini test img |
| **Videos** | 1 | 1 | 1 | 0 | None |
| **Documents (PDFs)** | 0 | 0 | 5 referenced | **-5** | **MISSING:** 5 recommendation PDFs referenced in testimonials (letterUrl) were NEVER committed |

---

## 2. Critical Findings

### 2.1 Deleted Team Members (Intentional — "departed")

Commit `d5961dc` (Jan 5, 2026) — "Remove departed team members (Shai, Li-Chen, Itamar)":
- `itamar-shapiro.json` — מנהל פרויקט (project manager)
- `li-chen-koren.json` — אדמיניסטרציה
- `shai-klartag.json` — מנהל פרויקט

**Status:** All 3 recovered to `migration/archive/data-recovered/team/`

### 2.2 Deleted Team Member — Re-Created with Hebrew Filename

Commit `8deb0b9` (Jan 18, 2026) — "Delete team: arik-davidi"
Then commit `4aa272f` (Jan 18, 2026) — "Create team: אריק-דוידי"

arik-davidi.json was deleted and recreated as אריק-דוידי.json. The pre-delete version had richer data (degrees, birth info, education). **Both versions preserved.**

### 2.3 Deleted Job Postings

4 jobs deleted from `data/jobs/`:
- `design-manager.json` (deleted Jan 18) — מנהל/ת תכנון
- `qa-engineer.json` (deleted Jan 6) — מהנדס/ת בקרת איכות
- `document-coordinator.json` (deleted Jan 6) — רכז/ת מסמכים
- `intern.json` (deleted Jan 6) — מתמחה בניהול פרויקטים

**Status:** All 4 recovered to `migration/archive/data-recovered/jobs/`

### 2.4 Jobs HTML vs JSON Discrepancy — CRITICAL

`jobs.html` contains **7 hardcoded job listings** (IDs 202601–202607):
1. מזכירה (secretary) — נתניה
2. מנהל/ת פרויקט — מרכז הארץ
3. מפקח/ת בנייה — דרום
4. מנהל/ת תכנון — צפון
5. מהנדס/ת בקרת איכות — מרכז הארץ
6. רכז/ת מסמכים (Document Controller) — דרום
7. מתמחה בניהול פרויקטים — נתניה / מרכז

But `data/jobs/` only has 3 JSON files (secretary, construction-supervisor, project-manager). The HTML is the **authoritative source** for live job listings.

### 2.5 Missing Recommendation PDFs

5 testimonials reference PDF files via `letterUrl`:
- `/documents/recommendation-shapir.pdf`
- `/documents/recommendation-weiner.pdf`
- `/documents/recommendation-menora.pdf`
- `/documents/recommendation-solel-bone.pdf`
- `/documents/recommendation-amab.pdf`

The `documents/` directory exists but is **empty**. These files were **never committed** to the repository. **Action required:** Obtain originals from founder.

### 2.6 Service Detail Pages — Massive Content Gap

All 8 service HTML pages contain extensive content NOT in JSON:
- 8 intro paragraphs
- 43 principle category headings with 86 bullet points
- 8 "How WDI does it" sections with 28 method bullets
- 8 sidebar CTAs
- 8 SEO metadata sets
- 8 Schema.org structured data blocks

The JSON files contain only: `title`, `shortDescription`, `fullDescription`, `icon`, `image` (all images empty).

### 2.7 Consolidated vs Individual File Discrepancies

| File | Individual Files | Consolidated JSON | Delta |
|------|:---:|:---:|---|
| `data/clients.json` → clients | 16 individual | 19 in JSON | +3 (Noble Energy, PMEC, IDF missing as individual files) |
| `data/clients.json` → testimonials | 5 individual | 5 in JSON | Match |
| `data/team.json` | 18 individual (incl. Hebrew names) | 12 in JSON | +6 individual (Hebrew-named members added after team.json was last updated) |
| `data/projects.json` | 14 individual (incl. test) | 13 in JSON | +1 individual (test project) |

### 2.8 Broken CMS Slug Files (Test Data)

Two files with broken slugs were created and deleted during CMS debugging:
1. `map-order-10-name-יוסי-בן-טולילה-...` — test data ("Chef" named "Yossi Ben Tulila")
2. `map-educationtype-משכיל-ממש-residence-חברון-...` — test data

**Status:** Preserved in `migration/archive/data-recovered/team-broken-cms/` for reference only. Not real data.

### 2.9 Content Hardcoded in HTML Only (No JSON)

| Page | Content Type | Size |
|------|-------------|------|
| `about.html` | Company story, founding year (2013), founders, 4 core values, 3 stats | ~2,000 words |
| `innovation.html` | 3 innovation cards, WDI Agent demo (mock UI), intro text | ~1,500 words |
| `contact.html` | Address (חוצות שפיים), phone (09-8322911), email (info@wdi.co.il), form, Google Maps | Structured data |
| `job-application.html` | Application form, sidebar, HR email (hr@wdi.co.il) | Form + copy |
| `join-us.html` | Supplier registration form, 16 specialties, 8 regions | Form + copy |
| `index.html` | JSON-LD Organization schema, hero CTA, featured sections | Structured data |
| ALL pages | Navigation structure, footer, breadcrumbs, CTA sections | Boilerplate |

---

## 3. Media Inventory

### 3.1 Images at HEAD (61 files)

| Directory | Count | Types |
|-----------|:---:|---|
| `images/clients/` | 19 | Client logos (JPG, PNG) |
| `images/team/` | 27 | Team photos + placeholders + Gemini AI-generated |
| `images/projects/` | 2 | Upload test images only |
| `images/press/` | 2 | Publication logos |
| `images/` (root) | 11 | Logo variants, favicon, placeholders, badges |

### 3.2 Deleted Images (Recovered)

| File | Commit | Recovery |
|------|--------|----------|
| `images/team/itamar.jpg` | 560753d | Recovered → 3.6 MB |
| `images/team/li-chen.jpg` | 560753d | Recovered → 3.1 MB |
| `images/wdi-logo.svg` | d46b832 | Recovered → simple text SVG |
| `images/wdi-logo-white.svg` | d46b832 | Recovered → simple text SVG |
| `images/team/gemini_generated_image_ivocnjivocnjivoc.png` | f1f20fa | Still at HEAD (re-added) |

### 3.3 Videos at HEAD (1 file)

| File | Size |
|------|------|
| `videos/hero-video.mp4` | 31.3 MB |

### 3.4 Missing Project Images

13 project HTML pages reference `images/projects/{id}.jpg` but only 2 upload-test images exist in the directory. **The project images are NOT in the repository** — they may be served from a CDN or don't exist yet.

---

## 4. Design Tokens Extracted

Saved to `migration/design-tokens/`:
- `colors.json` — Brand colors (primary #1a365d, secondary #c9a227, accent #e8b923)
- `typography.json` — Fonts (Assistant for public, Heebo for backoffice)
- `spacing.json` — Layout values, transitions, shadows

---

## 5. Reconciliation Mappings

Saved to `migration/reconciliation/`:
- `field-mapping.json` — Legacy field names → DOC-020 canonical names
- `category-mapping.json` — Legacy enum values → canonical enums
- `schema-transform.json` — Complete transformation rules per entity type

---

## 6. Definition of Done Checklist

- [x] Every entity type has a documented count at HEAD, max in history, and on live site
- [x] Every item where HEAD count < history count has been recovered and placed in `data-recovered/`
- [x] All testimonials confirmed — 5 at HEAD, 5 in history, 0 lost
- [x] All hardcoded HTML content extracted to structured JSON (via agents)
- [x] All media assets inventoried and preserved
- [ ] Netlify form submissions exported — **REQUIRES MANUAL EXPORT from Netlify dashboard**
- [ ] DATA_MANIFEST.md reviewed and approved by founder
- [x] Total recovered content ≥ total content that ever existed
- [ ] **Missing PDFs:** 5 recommendation letters need to be obtained from founder
