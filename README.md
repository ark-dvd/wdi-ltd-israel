# WDI Israel Website

אתר סטטי מבוסס HTML/CSS/JavaScript להטמעה ב-Netlify.

## עדכון אחרון: ינואר 2026

---

## מבנה התיקיות

```
wdi-israel/
├── index.html              # דף הבית
├── about.html              # אודות + כתבו עלינו
├── team.html               # צוות
├── clients.html            # לקוחות
├── services.html           # שירותים
├── projects.html           # פרויקטים
├── contact.html            # צור קשר
├── jobs.html               # משרות
├── job-application.html    # טופס הגשת מועמדות
├── join-us.html            # הצטרפות למאגר
├── innovation.html         # חדשנות וטכנולוגיה
├── content-library.html    # מאגר מידע
├── admin.html              # פאנל ניהול
├── 404.html                # דף שגיאה
├── sitemap.xml             # מפת אתר
├── robots.txt              # הנחיות לסורקים
├── netlify.toml            # הגדרות Netlify
├── css/
│   └── style.css           # עיצוב ראשי
├── js/
│   └── main.js             # JavaScript ראשי
├── data/
│   ├── projects.json       # מאגר פרויקטים ⭐
│   ├── team.json           # מאגר צוות ⭐
│   ├── services.json       # מאגר שירותים
│   └── clients.json        # לקוחות והמלצות
├── services/               # 8 עמודי שירות פרטניים
├── projects/               # 13 עמודי פרויקט פרטניים
├── images/
│   ├── wdi-logo.png        # לוגו רגיל (רקע בהיר)
│   ├── wdi-logo-white.png  # לוגו לבן (רקע כהה)
│   ├── favicon.png         # אייקון לשונית
│   ├── duns100.webp        # תג Duns 100
│   ├── projects/           # תמונות פרויקטים
│   ├── team/               # תמונות צוות
│   └── clients/            # לוגואים של לקוחות
├── videos/
│   └── hero-video.mp4      # סרטון דף הבית
└── documents/              # מסמכי המלצה
```

---

## 🚀 התקנה ב-Netlify

1. העלה את כל התיקייה ל-GitHub או גרור ישירות ל-Netlify
2. הגדרות בילד - לא נדרשות (אתר סטטי)
3. הטפסים יעבדו אוטומטית (Netlify Forms)

---

## ⭐ איך להוסיף פרויקט חדש

### שלב 1: הוסף לקובץ data/projects.json

```json
{
  "id": "project-id",
  "title": "שם הפרויקט",
  "client": "שם הלקוח",
  "category": "תעשייה ומסחר",  // או: "תשתיות" / "ממשלתי"
  "image": "images/projects/project-id.jpg",
  "description": "תיאור קצר של הפרויקט",
  "services": ["ניהול תכנון", "פיקוח"],
  "year": "2024",
  "featured": true  // האם להציג בדף הבית
}
```

### שלב 2: צור עמוד פרויקט

צור קובץ `projects/project-id.html` (העתק עמוד קיים ושנה את הפרטים).

### שלב 3: הוסף תמונה

שמור תמונת הפרויקט ב: `images/projects/project-id.jpg`
- גודל מומלץ: 1200x900 פיקסלים
- פורמט: JPG או WebP

---

## ⭐ איך להוסיף/לעדכן חבר צוות

### עדכן data/team.json

```json
{
  "id": "first-last",
  "name": "שם מלא",
  "role": "תפקיד",
  "image": "images/team/first-last.jpg",
  "linkedin": "https://linkedin.com/in/...",
  "bio": "ביוגרפיה קצרה",
  "category": "team",  // או: "leadership" / "management"
  "order": 15  // סדר הצגה
}
```

### קטגוריות צוות:
- `leadership` - הנהלה
- `management` - ראשי תחומים  
- `team` - צוות

### הוסף תמונה

שמור תמונת הצוות ב: `images/team/first-last.jpg`
- גודל מומלץ: 400x400 פיקסלים (ריבוע)
- פורמט: JPG או WebP

---

## 📝 טפסים (Netlify Forms)

הטפסים מוגדרים אוטומטית:
- **contact** - טופס יצירת קשר
- **join-us** - הצטרפות למאגר קבלנים
- **job-application** - הגשת מועמדות למשרות

ההודעות יופיעו ב-Netlify Dashboard > Forms.

---

## 📁 תמונות נדרשות להשלמה

### תמונות צוות (images/team/)
- guy-golan.jpg
- arik-davidi.jpg
- ilan-weiss.jpg
- eyal-nir.jpg
- yossi-elisha.jpg
- victor-lifshitz.jpg
- itamar-shapiro.jpg
- rotem-glick.jpg
- li-chen-koren.jpg
- tamir-lederman.jpg
- shai-klartag.jpg
- ido-kuri.jpg
- yarden-weiss.jpg
- yonatan-raymond.jpg
- ori-davidi.jpg

### תמונות פרויקטים (images/projects/)
- ashdod-desal.jpg
- msc-galil.jpg
- msc-hanamal17.jpg
- msc-hanamal59.jpg
- msc-jerusalem.jpg
- mobileye.jpg
- msc-rothschild.jpg
- intel-kg.jpg
- alon-tavor.jpg
- eshkol.jpg
- ashdod-port.jpg
- marhas.jpg
- campus-merkaz.jpg

### לוגואים של לקוחות (images/clients/)
- shapir.png
- electra.jpg
- minrav.jpg
- chevron.png
- pmo.jpg (משרד רה"מ)
- mod.jpg (משה"ב)
- mof.jpg (משרד האוצר)
- iaf.jpg (חיל האוויר)
- libeskind.jpg
- skorka.jpg
- aurbach-halevy.jpg
- kimmel.jpg
- afcon.jpg
- menolid.jpg
- tahal.jpg
- tmng.jpg
- beer-sheva.jpg
- ide.jpg

### סרטון (videos/)
- hero-video.mp4 - סרטון לדף הבית

---

## 🎨 צבעים

- Primary (כחול): `#1a365d`
- Secondary (זהב): `#c9a227`
- Gray shades: `#f9fafb` to `#111827`

---

## 📱 תמיכה טכנית

Website by [daflash.com](https://daflash.com)
