# RECOVERY_LOG.md — Phase 0 Git History Recovery

**Generated:** 2026-02-19
**Method:** `git show <commit_before_deletion>:<filepath>`
**All recovered items saved to:** `migration/archive/data-recovered/`

---

## 1. Recovered Team Members

### 1.1 itamar-shapiro.json
- **Delete commit:** `d5961dc` (Jan 5, 2026) — "Remove departed team members (Shai, Li-Chen, Itamar)"
- **Recovery command:** `git show d5961dc^:data/team/itamar-shapiro.json`
- **Saved to:** `migration/archive/data-recovered/team/itamar-shapiro.json`
- **Content:**
  ```json
  {
    "name": "איתמר שפירא",
    "position": "מנהל פרוייקט",
    "image": "/images/team/itamar-shapiro.jpg",
    "linkedin": "https://www.linkedin.com/in/itamar-shapiro-618a60a8/",
    "bio": "1984, בוסטון, ארה\"ב. מתגורר במחנה מרים. הנדסאי אזרחי (טכניון, 2002).",
    "category": "team",
    "order": 106
  }
  ```
- **Associated image:** `images/team/itamar.jpg` (3.6 MB) — also recovered

### 1.2 li-chen-koren.json
- **Delete commit:** `d5961dc` (Jan 5, 2026) — same commit as above
- **Recovery command:** `git show d5961dc^:data/team/li-chen-koren.json`
- **Saved to:** `migration/archive/data-recovered/team/li-chen-koren.json`
- **Content:**
  ```json
  {
    "name": "לי-חן קורן",
    "position": "אדמיניסטרציה",
    "image": "/images/team/li-chen-koren.jpg",
    "linkedin": "https://www.linkedin.com/in/li-chen-koren-a7032220b/",
    "bio": "",
    "category": "admin",
    "order": 10
  }
  ```
- **Associated image:** `images/team/li-chen.jpg` (3.1 MB) — also recovered

### 1.3 shai-klartag.json
- **Delete commit:** `d5961dc` (Jan 5, 2026) — same commit as above
- **Recovery command:** `git show d5961dc^:data/team/shai-klartag.json`
- **Saved to:** `migration/archive/data-recovered/team/shai-klartag.json`
- **Content:**
  ```json
  {
    "name": "שי קלרטג",
    "position": "מנהל פרוייקט",
    "image": "/images/team/shai-klartag.jpg",
    "linkedin": "https://www.linkedin.com/in/shai-klartag-760b7098/",
    "bio": "1987, חיפה. מתגורר בריחן. מהנדס אזרחי (BSc טכניון, 2013).",
    "category": "team",
    "order": 103
  }
  ```
- **Note:** No associated image `shai-klartag.jpg` found in git history — image was never committed.

### 1.4 yonatan-raymond.json
- **Delete commit:** `86b609a` (Jan 8, 2026) — "Delete חבר צוות yonatan-raymond"
- **Recovery command:** `git show 86b609a^:data/team/yonatan-raymond.json`
- **Saved to:** `migration/archive/data-recovered/team/yonatan-raymond.json`
- **Content:**
  ```json
  {
    "id": "yonatan-raymond",
    "name": "יונתן ריימונד",
    "position": "מנהל פרויקט",
    "image": "/images/team/yonatan-raymond.jpg",
    "linkedin": "",
    "category": "team",
    "order": 104,
    "birthYear": "",
    "birthPlace": "",
    "residence": "",
    "educationType": "",
    "degrees": []
  }
  ```
- **Note:** Image `yonatan-raymond.jpg` still exists at HEAD. yonatan-raymond is in `data/team.json` (consolidated) but was deleted from individual files.

### 1.5 arik-davidi.json (pre-delete version)
- **Delete commit:** `8deb0b9` (Jan 18, 2026) — "Delete team: arik-davidi"
- **Recovery command:** `git show 8deb0b9^:data/team/arik-davidi.json`
- **Saved to:** `migration/archive/data-recovered/team/arik-davidi-pre-delete.json`
- **Purpose:** Preserved because this version had richer data (degrees, education, birthplace) than the replacement `אריק-דוידי.json`
- **Content includes:** BSc Civil Engineering (Technion 2002), MBA (Open University 2010), birthPlace: צפת, birthYear: 1974

---

## 2. Recovered Job Postings

### 2.1 design-manager.json
- **Delete commit:** `5fe9024` (Jan 18, 2026) — "Delete jobs: design-manager"
- **Recovery command:** `git show 5fe9024^:data/jobs/design-manager.json`
- **Saved to:** `migration/archive/data-recovered/jobs/design-manager.json`
- **Content:** מנהל/ת תכנון — full-time, חוצות שפיים

### 2.2 qa-engineer.json
- **Delete commit:** `86a7649` (Jan 6, 2026) — "Delete משרה qa-engineer"
- **Recovery command:** `git show 86a7649^:data/jobs/qa-engineer.json`
- **Saved to:** `migration/archive/data-recovered/jobs/qa-engineer.json`
- **Content:** מהנדס/ת בקרת איכות — full-time, חוצות שפיים / אתרים

### 2.3 document-coordinator.json
- **Delete commit:** `efc5931` (Jan 6, 2026) — "Delete משרה document-coordinator"
- **Recovery command:** `git show efc5931^:data/jobs/document-coordinator.json`
- **Saved to:** `migration/archive/data-recovered/jobs/document-coordinator.json`
- **Content:** רכז/ת מסמכים — full-time, חוצות שפיים

### 2.4 intern.json
- **Delete commit:** `7c6900e` (Jan 6, 2026) — "Delete משרה intern"
- **Recovery command:** `git show 7c6900e^:data/jobs/intern.json`
- **Saved to:** `migration/archive/data-recovered/jobs/intern.json`
- **Content:** מתמחה בניהול פרויקטים — part-time, חוצות שפיים

---

## 3. Recovered Media Assets

### 3.1 images/team/itamar.jpg
- **Delete commit:** `560753d`
- **Recovery command:** `git show 560753d^:images/team/itamar.jpg`
- **Saved to:** `migration/archive/media-recovered/itamar.jpg` (3,633,970 bytes)

### 3.2 images/team/li-chen.jpg
- **Delete commit:** `560753d`
- **Recovery command:** `git show 560753d^:images/team/li-chen.jpg`
- **Saved to:** `migration/archive/media-recovered/li-chen.jpg` (3,126,177 bytes)

### 3.3 images/wdi-logo.svg
- **Delete commit:** `d46b832`
- **Recovery command:** `git show d46b832^:images/wdi-logo.svg`
- **Saved to:** `migration/archive/media-recovered/wdi-logo.svg` (182 bytes)
- **Content:** Simple SVG text element — "WDI" in Arial, #1a365d

### 3.4 images/wdi-logo-white.svg
- **Delete commit:** `d46b832`
- **Recovery command:** `git show d46b832^:images/wdi-logo-white.svg`
- **Saved to:** `migration/archive/media-recovered/wdi-logo-white.svg` (182 bytes)
- **Content:** Simple SVG text element — "WDI" in white

---

## 4. Broken CMS Slug Files (Test Data Only)

### 4.1 "Yossi Ben Tulila" test record
- **Delete commit:** `ffe7e51` (Jan 5, 2026)
- **Saved to:** `migration/archive/data-recovered/team-broken-cms/yossi-ben-tulila-test.json`
- **Classification:** Test data — not real team member. Name "שף" (Chef) with test phone "123456789"

### 4.2 "Shimshon" test record
- **Delete commit:** `1b08351` (Jan 5, 2026)
- **Content:** Could not be fully recovered — file path encoding issue
- **Classification:** Test data — not real team member

---

## 5. Items NOT Recovered (Never Existed in Git)

| Item | Reason |
|------|--------|
| `shai-klartag.jpg` | Team member image was never committed |
| `itamar-shapiro.jpg` | Only `itamar.jpg` (shorter name) was committed |
| 5 recommendation PDFs | Never committed to repository (documents/ directory always empty) |
| Project hero images (13) | HTML references them but they may be served externally or not yet created |

---

## 6. Summary Statistics

| Category | Recovered | Already at HEAD | Never Existed |
|----------|:-:|:-:|:-:|
| Team member JSON | 5 | 18 | 0 |
| Job posting JSON | 4 | 3 | 0 |
| Images | 4 | 61 | 1 (shai-klartag) |
| Videos | 0 | 1 | 0 |
| PDFs | 0 | 0 | 5 (recommendation letters) |
| **Total** | **13** | **83** | **6** |
