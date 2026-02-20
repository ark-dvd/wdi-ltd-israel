# FORENSIC-001 — WDI Repository Forensic Freeze

**Status:** Final
**Issue Date:** February 20, 2026
**Investigator:** Claude Opus 4.6 (CTO simulation)
**Repository:** `https://github.com/ark-dvd/wdi-ltd-israel.git`
**Local Clone:** `C:\Users\Arik Davidi\Documents\GitHub\wdi-ltd-israel`
**HEAD Commit:** `40127e3f` (2026-02-20 09:45:55 CST)
**Governing Document:** REMEDIATION-001 v1.5 — Phase 0.0

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260220-1800 | Initial forensic freeze — full repository investigation |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Repository State Documentation](#2-repository-state-documentation)
3. [Git History Investigation (F-1 through F-6)](#3-git-history-investigation)
4. [Content Inventory](#4-content-inventory)
5. [Security Concerns](#5-security-concerns)
6. [Recovery Assessment](#6-recovery-assessment)
7. [Appendices](#7-appendices)

---

## 1. Executive Summary

The `wdi-ltd-israel` repository is in a **hybrid state**: the original static HTML site, its JSON data files, and a legacy GitHub-API-based backoffice coexist alongside a newly built Next.js 14 TypeScript application with Sanity CMS backend. No source code was "deleted" in the catastrophic sense — the old static site was never removed, and the new Next.js code was added on top. The Netlify deployment serves the **static HTML site** at `wdi.co.il`, not the Next.js app.

**Key findings:**
- **148 commits** on a single branch (`main`), no tags, no other branches
- **523 files** in the working tree (excluding `.git/`, `node_modules/`, `.next/`)
- **32-day gap** (Jan 19 – Feb 18) with zero activity
- **14 commits** from Feb 19–20, 2026 constitute the entire Next.js rebuild (all co-authored with Claude Opus 4.6)
- **No secrets exposed** — `.env.local` is gitignored, `.env.example` has empty placeholders
- **Dual data architecture** — aggregate JSON files and individual CMS-managed JSON files have significant count/field mismatches
- **2 probable test records** in data: "נסי ניסיון" (team) and "פרוייקט מטורף" (project)
- **5 recommendation PDFs** referenced in testimonials were **never committed** to the repository
- **Recovery is straightforward** — all git history is intact, phase-0 already recovered most deleted content

---

## 2. Repository State Documentation

### 2.1 File Counts by Category

| Category | File Count | Notes |
|----------|:---:|---|
| Static HTML pages | 28 | Root + `/projects/*.html` + `/services/*.html` |
| CSS | 3 | `css/style.css`, `css/mobile-fixes.css`, `css/team-new.css` |
| JavaScript (legacy) | 1 | `js/main.js` |
| Data JSON files | 84 | `data/` directory — aggregate + individual files |
| Images | 61 | `images/` — client logos, team photos, project images, assets |
| Videos | 1 | `videos/hero-video.mp4` (31.3 MB) |
| Next.js source (`src/`) | 91 | App routes, components, lib, hooks, middleware |
| Legacy backoffice (`wdi-backoffice/`) | 46 | JavaScript Next.js app using GitHub API |
| Migration archive (`migration/`) | 93 | Recovered data, design tokens, reconciliation maps |
| Documentation (`docs/`) | 12 | Canonical docs DOC-000 through DOC-070, AUDIT-001, etc. |
| Config files (root) | 14 | `package.json`, `netlify.toml`, `tsconfig.json`, etc. |
| Tests | 5 | `tests/e2e/` + `scripts/security-test.ts` + `playwright.config.ts` |
| Other | 4 | `README.md`, `.gitignore`, `.env.example`, `MIGRATION_CLEANUP.md` |
| **Total** | **~523** | Excluding `.git/`, `node_modules/`, `.next/` |

### 2.2 Key Configuration Files

#### `package.json` (root)
- **Framework:** Next.js 14.2.35, React 18.3.1, TypeScript 5.9.3
- **CMS:** `@sanity/client` 7.15.0, `@portabletext/react` 6.0.2
- **Auth:** `next-auth` 4.24.13
- **Validation:** `zod` 4.3.6
- **Rate limiting:** `@upstash/ratelimit` 2.0.8, `@upstash/redis` 1.36.2
- **Monitoring:** `@sentry/nextjs` 10.39.0
- **UI:** `lucide-react` 0.575.0, Tailwind CSS 3.4.19

#### `netlify.toml` (root)
- Build: `npm run build` → publish `.next/`
- Node 20, uses `@netlify/plugin-nextjs`
- 14+ redirect rules mapping old HTML paths → Next.js routes (301)
- Security redirect: `/wdi-backoffice/*` → `/admin` (301)
- Security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- Lists 12 required environment variables in comments

#### `.gitignore`
- Properly excludes: `node_modules/`, `.next/`, `.env`, `.env.local`, `.env.*.local`, `*.tsbuildinfo`, `next-env.d.ts`
- **Tracked but should be gitignored:** `next-env.d.ts` and `tsconfig.tsbuildinfo` are in `.gitignore` but exist in the working tree (may have been committed before the rule was added)

### 2.3 `wdi-backoffice/` Directory (Legacy)

A standalone Next.js app (JavaScript, not TypeScript) in a subfolder:
- **Framework:** Next.js 14.2.3, React 18.3.1, Tailwind 3.4.1
- **Data backend:** GitHub Contents API (`lib/github.js`) — reads/writes JSON files directly to the `data/` directory via `process.env.GITHUB_TOKEN`
- **Auth:** None (zero authentication)
- **Routes:** 17 API route files (CRUD for team, projects, services, clients, testimonials, jobs, press, content-library, hero, upload, upload-video)
- **Pages:** 28 page files (list/create/edit for each entity type + hero + dashboard)
- **Separate netlify.toml** with Node 18

### 2.4 `/data/` Directory — Complete JSON File Inventory

**Total: 84 JSON files across 9 subdirectories**

| Subdirectory | Files | Entity Type |
|---|:---:|---|
| `data/` (root-level aggregates) | 4 | `clients.json`, `projects.json`, `services.json`, `team.json` |
| `data/clients-items/` | 17 | 1 `_index.json` + 16 individual client files |
| `data/content-library/` | 6 | Individual content library items |
| `data/hero/` | 2 | `hero.json`, `hero-settings.json` |
| `data/jobs/` | 3 | Individual job postings |
| `data/press/` | 3 | Individual press articles |
| `data/projects/` | 15 | 1 `_index.json` + 14 individual projects (incl. 1 test) |
| `data/services/` | 9 | 1 `_index.json` + 8 individual services |
| `data/team/` | 19 | 1 `_index.json` + 18 individual team members (incl. 1 test + 1 duplicate) |
| `data/testimonials/` | 6 | 1 `_index.json` + 5 individual testimonials |

---

## 3. Git History Investigation

### F-1: Full Commit History Timeline

**Total commits:** 148 (all on `main` branch)
**Branches:** `main` only (local + `origin/main`)
**Tags:** None
**Authors:** "ark-dvd" (local desktop) and "Arik" (GitHub web UI)

#### Chronological Phases

| Phase | Date Range | Commits | Description |
|-------|-----------|:---:|---|
| Static site creation | Jan 5, 2026 | 1 | Initial upload: 76 files, pure HTML/CSS/JS |
| CMS content management | Jan 5–14, 2026 | ~95 | Team/project/service edits via Netlify CMS and GitHub web UI |
| Sanity Studio experiment | Jan 17, 2026 | 1 | Added `wdi-ltd-netlify-2026/` with Sanity Studio |
| GitHub API backoffice | Jan 18, 2026 | ~20 | Deleted Sanity, created `wdi-backoffice/`, GitHub API CRUD |
| **THE GAP** | **Jan 19 – Feb 18** | **0** | **32 days with zero commits** |
| Canonical docs | Feb 19, 2026 | 1 | DOC-000 through DOC-050 specifications |
| Next.js rebuild (phases 0–4) | Feb 19, 2026 | 10 | Data archaeology, foundation, API, admin panel, public SSR |
| Fixes & docs | Feb 19–20, 2026 | 3 | Bug fixes + DOC-070 |

#### Key Commits

| SHA | Date | Message | Significance |
|-----|------|---------|--------------|
| `2a848ea` | Jan 5, 17:02 | Add files via upload | **First commit** — static HTML site |
| `5fe2f47` | Jan 17, 22:31 | Add Sanity Studio | Sanity Studio experiment (lasted ~17 hours) |
| `6567df7` | Jan 18, 15:21 | Fix backoffice forms and add hero data | **Deleted** Sanity Studio + Netlify CMS admin |
| `527b37c` | Jan 18, 12:56 | Replace Sanity with GitHub API | Created `wdi-backoffice/` |
| `4aa272f` | Jan 18, 22:04 | Create team: arik-davidi | **Last pre-rebuild commit** |
| `94f2a89` | Feb 19, 17:27 | docs: add canonical specification | **First rebuild commit** (32-day gap) |
| `2698737` | Feb 19, 18:54 | phase-1: foundation | **Next.js 14 TypeScript introduced** for first time |
| `610a8b9` | Feb 19, 19:54 | phase-2: governed API surface | 40 route handlers, Zod validation |
| `3ea3501` | Feb 19, 20:37 | phase-3: back office complete | Admin shell, 15 tabs, SlidePanel |
| `2b32d5f` | Feb 19, 20:56 | phase-4: public website SSR | 18 public pages, JSON-LD, sitemap |
| `40127e3` | Feb 20, 09:45 | docs: add DOC-070 Product Specification | **Current HEAD** |

### F-2: When Was Next.js Source Last Present?

**Next.js was NEVER the main site framework before Feb 19, 2026.** The timeline:

1. **Jan 5–17:** Pure static HTML site (no framework)
2. **Jan 17–18:** Brief Sanity Studio experiment in a subfolder (`wdi-ltd-netlify-2026/`)
3. **Jan 18:** `wdi-backoffice/` — a separate Next.js app for the admin panel only (not the public site)
4. **Feb 19:** Next.js 14 TypeScript introduced as the main framework in `src/` (phase-1 commit `2698737`)

The `src/app/` directory was first created in commit `2698737` (Feb 19, 2026 18:54:57 CST).

### F-3: Deletion Commits

| SHA | Date | Files Deleted | Significance |
|-----|------|:---:|---|
| `6567df7` | Jan 18 | 14 files (17,835 lines) | Killed Sanity Studio + Netlify CMS admin |
| `d5961dc` | Jan 5 | 3 team JSON files | Removed departed team members |
| `560753d` | Jan 5 | 2 images (6.7 MB) | Removed departed member photos |
| `d46b832` | Jan 5 | 2 SVG logos | Replaced with PNG versions |
| Various | Jan 5–18 | ~10 individual files | CMS content deletions (jobs, team) |

**The original static HTML site was NEVER deleted.** All `.html`, `css/`, `js/`, `data/`, and `images/` files remain at HEAD.

### F-4: Force Pushes / History Rewrites

**No force pushes detected.**

Evidence examined:
- **Reflog:** 114 entries, showing one `reset HEAD~1` (commit `3685f74` "SEO upgrade" was undone and replaced by `3629ba2` "SEO enhancements") — minor, non-destructive
- **Rebase artifacts:** 13 orphaned commits from `pull --rebase` operations — normal workflow, not destructive
- **No `push --force`** evidence in local reflog
- **All orphaned commits** are explainable as pre-rebase copies

### F-5: Reconstructed Timeline

```
2026-01-05  ┌─ Static HTML site uploaded (76 files)
            │  95+ content management commits via CMS / GitHub web UI
2026-01-17  ├─ Sanity Studio added in subfolder (experiment)
2026-01-18  ├─ Sanity Studio deleted, Netlify CMS deleted
            ├─ GitHub API backoffice created (wdi-backoffice/)
            ├─ Multiple backoffice fixes
2026-01-18  └─ LAST COMMIT: "Create team: arik-davidi"
            │
            │  ══════ 32-DAY GAP — ZERO ACTIVITY ══════
            │
2026-02-19  ┌─ Canonical docs (DOC-000 through DOC-050) committed
            ├─ Phase 0: Data archaeology (recovered 13 items from git history)
            ├─ Phase 1: Next.js 14 TypeScript foundation (15 Sanity schemas, auth, middleware)
            ├─ Phase 2: 40 API route handlers (Zod validation, rate limiting, concurrency)
            ├─ Phase 3: Admin panel (9 CMS tabs, 6 CRM tabs, SlidePanel CRUD)
            ├─ Phase 4: 18 public pages (SSR from Sanity, JSON-LD, sitemap, Hebrew RTL)
            ├─ 4 fix commits (forms, env optionality, Sanity client, field mismatches)
2026-02-20  ├─ Admin panel bug fixes
            └─ DOC-070 Product Specification (HEAD)
```

### F-6: Single or Multiple Deletion?

**The old static site was NOT deleted at all.** Both the old and new code coexist at HEAD:

| Component | Status at HEAD |
|---|---|
| Static HTML pages (28 files) | Present |
| Legacy CSS/JS | Present |
| Legacy `data/` JSON files (84 files) | Present |
| Legacy `images/` (61 files) | Present |
| Legacy `wdi-backoffice/` (46 files) | Present |
| New `src/` Next.js app (91 files) | Present |
| New `docs/` (12 files) | Present |
| New `migration/` (93 files) | Present |

**Only deliberately deleted items:**
- Netlify CMS admin (`admin/config.yml`, `admin/index.html`) — single commit `6567df7` on Jan 18
- Sanity Studio (`wdi-ltd-netlify-2026/`) — same commit `6567df7` on Jan 18
- 3 departed team members — single commit `d5961dc` on Jan 5
- ~10 individual CMS records — scattered across Jan 5–18

---

## 4. Content Inventory

### 4.1 Summary Table

| Entity Type | Aggregate JSON | Individual Files | Live Site (HTML) | Recovered (archive) | Discrepancies |
|---|:---:|:---:|:---:|:---:|---|
| **Projects** | 13 | 14 (13 + 1 test) | 13 HTML pages | 0 | 1 test record (`פרוייקט-מטורף`) |
| **Team Members** | 12 | 18 (17 + 1 duplicate) | 12 (driven by aggregate) | 5 | 7 in files only; 1 in aggregate only; category/position mismatches |
| **Services** | 8 | 8 | 8 HTML pages | 0 | HTML has extensive content not in JSON |
| **Clients** | 19 | 16 | 19 (driven by aggregate) | 0 | 3 missing individual files (Noble Energy, IDF, PMEC) |
| **Testimonials** | 5 | 5 | 5 | 0 | Minor text differences |
| **Jobs** | N/A | 3 | 7 (hardcoded in HTML) | 4 | HTML authoritative; JSON incomplete |
| **Press** | N/A | 3 | 3 | 0 | Match |
| **Content Library** | N/A | 6 | 6 | 0 | Match |
| **Hero** | N/A | 2 | 1 section | 0 | Partial duplicate between 2 files |

### 4.2 Team Members — Complete Roster

#### In aggregate `team.json` (12 members):

| # | Name | Position | Category |
|---|---|---|---|
| 1 | אריק דוידי | מייסד, שותף | founders |
| 2 | גיא גולן | מנכ"ל WDI | founders |
| 3 | אילן וייס | מייסד, שותף | founders |
| 4 | ירדן וייס | אדמיניסטרציה | admin |
| 5 | איל ניר | ראש תחום פרויקטים תעשייתיים | heads |
| 6 | יוסי אלישע | ראש תחום פרויקטים מסחריים | heads |
| 7 | ויקטור ליפשיץ | ראש תחום פרויקטים ביטחוניים | heads |
| 8 | רותם גליק | מנהלת תכנון ורישוי | team |
| 9 | אורי דוידי | מנהל פרויקט | team |
| 10 | עידו כורי | מנהל פרויקט | team |
| 11 | תמיר לדרמן | מנהל פרויקט | team |
| 12 | יונתן ריימונד | מנהל פרויקט | team |

#### Additional members in individual files only (7):

| Name | Position | Category | Notes |
|---|---|---|---|
| אלי חנה | מנהל פרוייקט | team | AI-generated placeholder photo |
| אנה ליבורקין | מנהלת פרוייקט | team | AI-generated photo; MSc Moscow State U |
| יהלי דוידי | מזכירה | admin | AI-generated photo; Austin, TX |
| נאור זנה | מפקח | team | AI-generated photo |
| ענת שפרינגר | מנהלת משרד | admin | AI-generated photo |
| רוני בן נחום | מנהל פרוייקט | team | AI-generated photo |
| **נסי ניסיון** | **מתאם פרוייקט** | **project-managers** | **TEST DATA** — name means "Trial Test" |

#### Recovered from git history (archived, not active):

| Name | Position | Deleted | Reason |
|---|---|---|---|
| איתמר שפירא | מנהל פרוייקט | Jan 5 | Departed |
| לי-חן קורן | אדמיניסטרציה | Jan 5 | Departed |
| שי קלרטג | מנהל פרוייקט | Jan 5 | Departed |
| יונתן ריימונד | מנהל פרויקט | Jan 8 | Individual file deleted; still in aggregate |
| אריק דוידי (pre-delete) | מייסד שותף | Jan 18 | Replaced by Hebrew-named file |

### 4.3 Projects — Complete List (13 active + 1 test)

| # | ID | Title | Client | Category | Year | Featured |
|---|---|---|---|---|---|---|
| 1 | ashdod-desal | מתקן התפלה אשדוד | שותפות שפיר Blugen | תשתיות | 2023 | Yes |
| 2 | msc-galil | מרגלית סטארט-אפ סיטי גליל | MSC אראל מרגלית | תעשייה ומסחר | 2022 | Yes |
| 3 | msc-hanamal17 | מרגלית סטארטאפ סיטי הנמל 17 חיפה | MSC אראל מרגלית | תעשייה ומסחר | 2021 | No |
| 4 | msc-hanamal59 | מרגלית סטארטאפ סיטי הנמל 59 חיפה | MSC אראל מרגלית | תעשייה ומסחר | 2022 | No |
| 5 | msc-jerusalem | מרגלית סטארטאפ סיטי ירושלים | MSC אראל מרגלית | תעשייה ומסחר | 2023 | Yes |
| 6 | mobileye | מובילאיי (מערכות) | אפקון מערכות | תעשייה ומסחר | 2020 | Yes |
| 7 | msc-rothschild | מרגלית סטארט-אפ סיטי ת"א | MSC אראל מרגלית | תעשייה ומסחר | 2019 | No |
| 8 | intel-kg | אינטל קרית גת FOH | סולל בונה | תעשייה ומסחר | 2022 | Yes |
| 9 | alon-tavor | מיגון תחנת הכח אלון תבור | אם. אר. סי תפעול בע"מ | תשתיות | 2024 | No |
| 10 | eshkol | תחנת כח אשכול | דליה אנרגיות | תשתיות | 2021 | No |
| 11 | ashdod-port | נמל אשדוד | נמלי ישראל/אפקון | תשתיות | 2021 | Yes |
| 12 | marhas | מרכז ההספקה המטכ"לי | צה"ל/משהב"ט/שפיר | ממשלתי | 2023 | No |
| 13 | campus-merkaz | קמפוס מרכז | משהב"ט | ממשלתי | 2024 | Yes |
| — | **פרוייקט-מטורף** | **פרוייקט מטורף** | **מוטרפי** | **מסחרי** | **2026** | **TEST** |

**Category breakdown:** Industry & Commerce: 7 | Infrastructure: 4 | Government: 2

### 4.4 Services (8)

| # | ID | Title |
|---|---|---|
| 1 | design-management | ניהול תכנון |
| 2 | spec | מסמכי דרישות, אפיון ופרוגרמה |
| 3 | supervision | ניהול ביצוע ופיקוח |
| 4 | client-rep | ייצוג בעלי עניין |
| 5 | pmo | שירותי PMO |
| 6 | qa | ניהול והבטחת איכות |
| 7 | doc-control | ניהול הידע בפרוייקט |
| 8 | permits | ניהול תב"ע והיתרים |

### 4.5 Clients (19 in aggregate, 16 with individual files)

שפיר, אלקטרה, מנרב, Noble Energy*, משרד ראש הממשלה, משרד הביטחון, צה"ל*, חיל האוויר, Studio Libeskind, Skorka, אורבך הלוי, קימל אשכולות, אפקון, מנולד חירות, תה"ל, TMNG, עיריית באר שבע, IDE, PMEC*

*\* = Missing individual JSON file (exists only in aggregate `clients.json`)*

### 4.6 Testimonials (5)

| Author | Company |
|---|---|
| משה שקד | שפיר הנדסה אזרחית וימית בע"מ |
| רחל וינר | רחל וינר אדריכלות ונוף בע"מ |
| דוד בנד | מנורה מערכות מקבוצת שיכון ובינוי |
| בריאה אלון שמיר | שיכון ובינוי - סולל בונה תשתיות בע"מ |
| אלדד לבל | אמאב תחבורה ותנועה בע"מ |

### 4.7 Jobs (3 in JSON, 7 in HTML)

**JSON files:** מזכירה, מפקח/ת בנייה, מנהל/ת פרויקט

**HTML hardcoded (authoritative):** מזכירה, מנהל/ת פרויקט, מפקח/ת בנייה, מנהל/ת תכנון, מהנדס/ת בקרת איכות, רכז/ת מסמכים, מתמחה בניהול פרויקטים

### 4.8 Press (3)

| Title | Source | Date |
|---|---|---|
| תשתית לצמיחה | כלכליסט | Apr 2024 |
| הצלחה ישראלית | דה מרקר | Sep 2025 |
| ניהול תכנון כוללני | כלכליסט | Jan 2026 |

### 4.9 Content Library (6)

| Title | Category |
|---|---|
| משהב"ט - המפרט הכללי לעבודות בנייה | מפרטים ותקנות |
| משרד הבינוי והשיכון - מפרט לבקרת איכות | מפרטים ותקנות |
| משרד הבריאות - תכנון ובנייה | גופים ממשלתיים |
| USACE - Engineer Manual | מקורות בינלאומיים |
| משרד העבודה - רישום מהנדסים ואדריכלים | גופים ממשלתיים |
| נתיבי ישראל - המפרט הכללי | מפרטים ותקנות |

### 4.10 Live Site Observations

The live site at `wdi.co.il` serves:
- **Technology:** Static HTML (no framework bundles detected)
- **Analytics:** Google Analytics GA4 (G-PHVHJ62GPW)
- **Structured data:** Schema.org JSON-LD (Organization type)
- **Designer credit:** daflash.com
- **Duns 100 certification badge** referenced
- **Navigation:** About, Services, Projects, Innovation, Knowledge Base, Contact
- **Broken routes:** `/careers` → 404, `/knowledge` → 404

---

## 5. Security Concerns

### 5.1 Credential Exposure Assessment

| Item | Status | Risk |
|---|---|---|
| `.env.local` | **Not tracked** (in `.gitignore`) | None |
| `.env.example` | Tracked — all values empty | None |
| Sanity project ID `hrkxr0r8` | In `.env.local` (local only) | Low — public identifier |
| GitHub token | Referenced as `process.env.GITHUB_TOKEN` in `wdi-backoffice/lib/github.js` | None — not hardcoded |
| API keys / secrets | Grep scan: no matches for `ghp_`, `sk-`, `AKIA`, `AIza` patterns | None |
| **No secrets committed to git history** | Verified via `git log --all --diff-filter=A -- '*.env*'` | Clear |

### 5.2 Security Architecture Concerns

| Concern | Severity | Details |
|---|---|---|
| **Legacy backoffice: zero authentication** | **CRITICAL** | `wdi-backoffice/` has no auth — all API endpoints are publicly writable if deployed |
| **Legacy backoffice: GitHub API as database** | HIGH | `wdi-backoffice/lib/github.js` uses GitHub Contents API for CRUD — anyone with the endpoint URL can modify repository data |
| **Static HTML: no CSP headers** | MEDIUM | Static pages have no Content-Security-Policy |
| **netlify.toml redirects** | LOW | `/wdi-backoffice/*` → `/admin` (301) prevents direct access to legacy backoffice routes |
| **New Next.js app: properly architected** | OK | NextAuth, Zod validation, rate limiting, Sanity tokens — but NOT yet deployed |

### 5.3 Tracked Build Artifacts

| File | Should Be Gitignored? | Status |
|---|---|---|
| `tsconfig.tsbuildinfo` | Yes (listed in `.gitignore`) | Present in working tree — may have been committed before rule was added |
| `next-env.d.ts` | Yes (listed in `.gitignore`) | Present in working tree |
| `package-lock.json` | Depends on project policy | Present and tracked (normal for npm projects) |
| `videos/hero-video.mp4` (31.3 MB) | Consider LFS | Large binary file tracked in git |

---

## 6. Recovery Assessment

### 6.1 Is There Recoverable Next.js Source Code?

**Yes — the Next.js source code exists at HEAD.** It was never deleted. The `src/` directory contains 91 files with the complete Next.js 14 TypeScript application:

- `src/app/` — 69 route/page files (public pages, admin panel, API routes, auth)
- `src/components/` — 25 component files (admin + public)
- `src/hooks/` — 2 custom hooks
- `src/lib/` — 22 library files (Sanity schemas, auth, API utilities, validation)
- `src/middleware.ts` — auth/rate-limiting middleware

### 6.2 Is It Worth Restoring?

**Assessment: The Next.js code should be treated as a starting point, not a production-ready application.**

**Strengths:**
- Proper TypeScript strict mode with comprehensive types
- 15 Sanity schemas matching the canonical data model (DOC-020)
- 40 API route handlers with Zod validation
- NextAuth with Google OAuth
- Admin panel with 9 CMS + 6 CRM tabs
- 18 public SSR pages
- Rate limiting (Upstash), error monitoring (Sentry), bot prevention (Turnstile)

**Weaknesses:**
- Never deployed — no production testing
- Built in a single day (Feb 19, all phases 0–4)
- No unit tests (only e2e test stubs in `tests/e2e/`)
- CRM features (leads, engagements, pipeline) may be deferred per CANONICAL-AMENDMENT-001
- Static HTML pages coexist and need cleanup
- Legacy `wdi-backoffice/` needs removal
- Data discrepancies between JSON files and Sanity need reconciliation

### 6.3 What About the Old Static Site?

The static HTML site is:
- **Still live** at wdi.co.il via Netlify
- **Complete and functional** — all 28 HTML pages serve correctly
- **The authoritative content source** for some data (especially jobs, service details, about page content)
- **Should NOT be modified** until the Next.js app is ready to replace it

### 6.4 Recovery Actions Already Completed (Phase 0)

The phase-0 commit (`29e2fce`) already performed data archaeology and recovered:
- 5 deleted team member records → `migration/archive/data-recovered/team/`
- 4 deleted job postings → `migration/archive/data-recovered/jobs/`
- 4 media assets (2 photos, 2 SVGs) → `migration/archive/media-recovered/`
- 1 broken CMS test record → `migration/archive/data-recovered/team-broken-cms/`
- Design tokens → `migration/design-tokens/`
- Field/category/schema mappings → `migration/reconciliation/`
- Complete data manifest → `migration/DATA_MANIFEST.md`
- Recovery log → `migration/RECOVERY_LOG.md`

### 6.5 Outstanding Items Requiring Human Action

| Item | Owner | Priority |
|---|---|---|
| 5 recommendation PDFs (never committed) | Founder | HIGH — obtain originals |
| Netlify form submissions export | Admin | MEDIUM — export from Netlify dashboard |
| Verify team roster accuracy | Founder | HIGH — 7 members in files but not aggregate |
| Confirm test data for deletion | Founder | LOW — "נסי ניסיון" and "פרוייקט מטורף" |
| `wdi-backoffice/` security exposure | DevOps | HIGH — confirm it's not deployed separately |

---

## 7. Appendices

### 7.1 Data Discrepancy Matrix

| Entity | Aggregate Count | Individual Files | _index.json | HTML Pages | Notes |
|---|:---:|:---:|:---:|:---:|---|
| Projects | 13 | 14 | 13 | 13 | +1 test file not in index |
| Team | 12 | 18 | 17 | 12 | Complex mismatches — see §4.2 |
| Services | 8 | 8 | 8 | 8 | Field-level differences (icon, descriptions) |
| Clients | 19 | 16 | 16 | 19 | 3 missing individual files |
| Testimonials | 5 | 5 | 5 | 5 | Minor text differences |
| Jobs | — | 3 | — | 7 | HTML is authoritative source |
| Press | — | 3 | — | 3 | Match |
| Content Library | — | 6 | — | 6 | Match |

### 7.2 Data Quality Issues

1. `ilan-weiss.json`: `birthPlace` field contains `"1971"` (wrong field — should be birthYear)
2. 7 team files use `gemini_generated_image_*` filenames (AI-generated placeholder photos)
3. `אריק-דוידי.json`: duplicate of `arik-davidi` entry with inconsistent category (`management` vs `founders`)
4. `ori-davidi.json`: position mismatch ("מתאם פרויקט" vs aggregate "מנהל פרויקט")
5. `rotem-glick.json`: position mismatch ("מנהלת פרוייקט" vs aggregate "מנהלת תכנון ורישוי")
6. `eyal-nir.json`: category mismatch ("department-heads" vs aggregate "heads")
7. `yarden-weiss.json`: position mismatch ("מזכירה" vs aggregate "אדמיניסטרציה")
8. Inconsistent Hebrew spelling: "פרוייקט" vs "פרויקט" across files
9. `permits.json`: icon mismatch ("file-signature" in individual vs "stamp" in aggregate)
10. `david-band.json`: company name "מנורה" vs aggregate "מונרה"
11. `hero-settings.json`: partial duplicate of `hero.json` (missing video, CTA fields)
12. 13 project HTML pages reference images that don't exist in `images/projects/`

### 7.3 Migration Archive Contents

```
migration/
├── DATA_MANIFEST.md                    # Complete data inventory
├── RECOVERY_LOG.md                     # Git recovery operations log
├── archive/
│   ├── data-git-head/                  # Snapshot of all data/ at time of archaeology
│   │   ├── clients.json
│   │   ├── clients-items/ (17 files)
│   │   ├── content-library/ (6 files)
│   │   ├── hero/ (2 files)
│   │   ├── jobs/ (3 files)
│   │   ├── press/ (3 files)
│   │   ├── projects/ (15 files)
│   │   ├── services/ (9 files)
│   │   ├── team/ (19 files)
│   │   └── testimonials/ (6 files)
│   ├── data-recovered/
│   │   ├── jobs/ (4 files: design-manager, document-coordinator, intern, qa-engineer)
│   │   ├── team/ (5 files: arik-davidi-pre-delete, itamar-shapiro, li-chen-koren, shai-klartag, yonatan-raymond)
│   │   └── team-broken-cms/ (1 file: yossi-ben-tulila-test)
│   ├── html-extracted/
│   │   └── EXTRACTION_SUMMARY.md
│   └── media-recovered/ (4 files: itamar.jpg, li-chen.jpg, wdi-logo.svg, wdi-logo-white.svg)
├── design-tokens/
│   ├── colors.json                     # Brand: #1a365d, #c9a227, #e8b923
│   ├── spacing.json                    # Layout values
│   └── typography.json                 # Fonts: Assistant (public), Heebo (backoffice)
└── reconciliation/
    ├── category-mapping.json           # Legacy → canonical enum mapping
    ├── field-mapping.json              # Legacy → DOC-020 field names
    └── schema-transform.json           # Per-entity transformation rules
```

---

**END OF FORENSIC REPORT**

*This document is a point-in-time snapshot of the repository state at commit `40127e3f` (2026-02-20 09:45:55 CST). No modifications were made to the repository during this investigation.*
