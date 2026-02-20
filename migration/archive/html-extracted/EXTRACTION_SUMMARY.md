# HTML Content Extraction Summary

**Extracted:** 2026-02-19
**Method:** 3 parallel agents parsed all 33 HTML files and compared with data/ JSON

---

## Critical Content in HTML but NOT in JSON

### 1. about.html — Company Story (NO JSON equivalent)
- **Founding year:** 2013
- **Founders:** אילן וייס, אריק דוידי
- **Parent company:** קבוצת WDI / wdiglobal.com
- **4 Core Values:** דרך ארץ, אמון, בטיחות, חדשנות (each with 2 paragraphs)
- **Stats:** 10+ שנות ניסיון, 50+ פרויקטים, 30+ אנשי מקצוע

### 2. innovation.html — Innovation Page (NO JSON equivalent)
- **3 Innovation Cards:**
  1. ניהול מידע ושליפת נתונים (4 features)
  2. שימור וניהול ידע (4 features)
  3. ניתוח תוכניות ומסמכים (4 features)
- **WDI Agent Demo:** Complete mock UI with sidebar (9 menu items), demo conversation about project "קריית שפרינצק" (project #1847) with event table
- **Agent version:** v04.20122025.0445

### 3. contact.html — Contact Information (NO JSON equivalent)
- **Address:** חוצות שפיים, ת"ד 15, מיקוד 60990
- **Phone:** 09-8322911
- **Email:** info@wdi.co.il
- **Form fields:** Name, email, phone, subject (5 options), message, privacy consent
- **Google Maps embed:** iframe with coordinates

### 4. jobs.html — 7 Job Listings (ONLY 3 in JSON)
Jobs 202601–202607 with full descriptions, locations, tags:
1. מזכירה — נתניה (badge: חדש!)
2. מנהל/ת פרויקט — מרכז הארץ
3. מפקח/ת בנייה — דרום
4. מנהל/ת תכנון — צפון
5. מהנדס/ת בקרת איכות — מרכז הארץ
6. רכז/ת מסמכים — דרום
7. מתמחה — נתניה / מרכז (badge: סטודנטים)

**Plus:** "למה לעבוד ב-WDI?" section with 4 benefits

### 5. join-us.html — Supplier Registration (NO JSON equivalent)
- 16 specialty options (אדריכלות through אחר)
- 8 geographic region checkboxes
- 4 experience ranges
- Form: company name, ID, contact details, portfolio, profile PDF

### 6. job-application.html — Application Form (NO JSON equivalent)
- HR email: hr@wdi.co.il
- Form: name, email, phone, LinkedIn, experience, CV upload, notes, privacy consent
- "למה WDI?" sidebar with 4 bullet points

### 7. All 8 Service Detail Pages — Extensive Content NOT in JSON

Each service page has 3-6 principle categories with ~10 bullet points, a "How WDI does it" section with 3-4 method bullets, intro paragraphs, sidebar CTAs, and Schema.org structured data. **None of this is in the JSON files.**

Total across all 8 services:
- 43 principle category headings
- 86 detailed bullet points
- 28 method bullets
- 8 intro paragraphs
- 8 sidebar CTAs

### 8. index.html — Structured Data
- **JSON-LD Organization schema** with address, phone, email, social links
- **Google Analytics:** G-PHVHJ62GPW
- **Social links:** Facebook (WDILTD), LinkedIn (wdi-ltd)

### 9. All Pages — Shared Content
- **Navigation:** 8 service sub-links in dropdown
- **Footer:** Brand description, contact info, social links, Duns 100 badge
- **Font:** Assistant (Google Fonts, 6 weights: 200-800)

---

## Project Pages — Full Parity with JSON
All 13 project detail HTML pages have content that exactly matches their JSON counterparts. Only SEO metadata (meta description, page title) exists in HTML but not JSON.

## Clients/Team/Testimonials — Data-Driven
These pages load content dynamically from JSON files. No additional content in HTML beyond boilerplate.
