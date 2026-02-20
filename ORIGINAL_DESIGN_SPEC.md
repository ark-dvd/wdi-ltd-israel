# ORIGINAL DESIGN SPECIFICATION — WDI Ltd Israel

> **Purpose**: Pixel-matching reference for rebuilding the Next.js site to match the original static HTML/CSS/JS design.
> **Source files**: `css/style.css`, `css/mobile-fixes.css`, `css/team-new.css`, `index.html`, `about.html`, `team.html`, `services.html`, `projects.html`, `clients.html`, `contact.html`, `js/main.js`

---

## 1. Design Tokens (CSS Custom Properties)

### 1.1 Color Palette

```
--primary:          #1a365d    /* Deep navy blue — brand primary */
--primary-light:    #2d4a7c    /* Lighter navy — hover states */
--primary-dark:     #0f2744    /* Darkest navy — hero overlays, page headers */
--secondary:        #c9a227    /* Gold/amber — accents, badges, team roles */
--secondary-light:  #dbb84a    /* Lighter gold — hover states */
--accent:           #e8b923    /* Bright gold — CTA buttons, highlights */
```

### 1.2 Neutral Scale

```
--gray-50:   #f8f9fa
--gray-100:  #f1f3f5
--gray-200:  #e9ecef
--gray-300:  #dee2e6
--gray-400:  #adb5bd
--gray-500:  #868e96
--gray-600:  #495057
--gray-700:  #343a40
--gray-800:  #212529
--gray-900:  #1a1a2e
```

### 1.3 Functional Colors

```
--success:   #2ecc71
--warning:   #f39c12
--danger:    #e74c3c
--info:      #3498db
--white:     #ffffff
--black:     #000000
```

### 1.4 Typography

```
--font-hebrew: 'Assistant', 'Rubik', sans-serif
```

- **Primary font**: Google Fonts `Assistant` (weights: 300, 400, 500, 600, 700)
- **Fallback**: `Rubik`, `sans-serif`
- **Direction**: RTL (`dir="rtl"`, `lang="he"`)
- **Base font-size**: 16px (body)
- **Line-height**: 1.7 (body)
- **Letter-spacing**: 0.3px (body)
- **Color**: `var(--gray-800)` (#212529)

#### Heading Sizes

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| h1 | 3.5rem | 700 | var(--primary) |
| h2 | 2.5rem | 700 | var(--primary) |
| h3 | 1.75rem | 600 | var(--primary) |
| h4 | 1.25rem | 600 | var(--primary) |
| Section h2 | 2.5rem | 700 | var(--primary) |

### 1.5 Spacing

```
--section-padding:  100px    /* vertical section padding */
--container-max:    1200px   /* max-width for .container */
Container padding:  0 24px   /* horizontal padding */
```

### 1.6 Shadows

```
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08)
--shadow-md:  0 4px 12px rgba(0,0,0,0.1)
--shadow-lg:  0 8px 25px rgba(0,0,0,0.12)
--shadow-xl:  0 15px 40px rgba(0,0,0,0.15)
```

### 1.7 Transitions

```
--transition-fast:   0.2s ease
--transition-normal: 0.3s ease
--transition-slow:   0.5s ease
```

### 1.8 Border Radius

```
--radius-sm:  8px
--radius-md:  12px
--radius-lg:  16px
--radius-xl:  24px
```

---

## 2. Global Layout

### 2.1 Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
```

### 2.2 Section

```css
.section {
  padding: 100px 0;    /* var(--section-padding) */
}
```

### 2.3 Background Variants

- `.bg-light`: background `var(--gray-50)` (#f8f9fa)
- `.bg-gray`: background `var(--gray-100)` (#f1f3f5)
- `.bg-white`: background `#ffffff`
- `.bg-primary`: background `var(--primary)`, text white

### 2.4 Section Header

```css
.section-header {
  text-align: center;
  margin-bottom: 60px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
}

.section-header p {
  font-size: 1.1rem;
  color: var(--gray-600);
  line-height: 1.8;
}

/* Gold underline decoration */
.section-header h2::after {
  content: '';
  display: block;
  width: 60px;
  height: 3px;
  background: var(--secondary);   /* gold */
  margin: 16px auto 0;
  border-radius: 2px;
}
```

---

## 3. Header / Navigation

### 3.1 Structure

```html
<header class="header">
  <div class="container">
    <div class="header-content">
      <a class="logo" href="index.html">
        <img class="logo-white" src="images/wdi-logo-white.png" alt="WDI Logo" />
        <img class="logo-dark" src="images/wdi-logo.png" alt="WDI Logo" />
      </a>
      <nav class="nav-links">
        <!-- Dropdown groups + direct links -->
      </nav>
      <button class="mobile-toggle">☰</button>
    </div>
  </div>
</header>
```

### 3.2 Header CSS

```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 20px 0;
  transition: all 0.3s ease;
  background: transparent;
}

/* Scrolled state (added via JS at 50px scroll) */
.header.scrolled {
  background: white;
  box-shadow: 0 2px 20px rgba(0,0,0,0.1);
  padding: 12px 0;
}
```

### 3.3 Logo

```css
.logo img {
  height: 50px;
  transition: height 0.3s ease;
}

.header.scrolled .logo img {
  height: 40px;
}

/* Dual logo swap */
.header:not(.scrolled) .logo-dark  { display: none; }
.header:not(.scrolled) .logo-white { display: block; }
.header.scrolled .logo-white       { display: none; }
.header.scrolled .logo-dark        { display: block; }
```

### 3.4 Navigation Links

```css
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;     /* 4px gap between nav items */
}

.nav-links > a,
.nav-group > .nav-group-title {
  color: rgba(255,255,255,0.9);
  text-decoration: none;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* Scrolled: dark text */
.header.scrolled .nav-links > a,
.header.scrolled .nav-group > .nav-group-title {
  color: var(--gray-700);
}
```

### 3.5 Dropdown Menus

```css
.nav-dropdown {
  position: absolute;
  top: 100%;
  right: 0;        /* RTL — aligned to right */
  min-width: 220px;
  background: white;
  border-radius: 12px;
  box-shadow: var(--shadow-xl);  /* 0 15px 40px rgba(0,0,0,0.15) */
  padding: 8px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s ease;
}

.nav-group:hover .nav-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.nav-dropdown a {
  display: block;
  padding: 10px 16px;
  color: var(--gray-700);
  font-size: 0.9rem;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-dropdown a:hover {
  background: var(--gray-50);
  color: var(--primary);
}
```

### 3.6 Navigation Menu Structure

```
├── אודות (About) — dropdown
│   ├── אודות WDI (About WDI)     → about.html
│   ├── הצוות שלנו (Our Team)      → team.html
│   └── לקוחות (Clients)           → clients.html
├── שירותים (Services) — dropdown
│   ├── כל השירותים (All Services)  → services.html
│   └── [Dynamic service links from JSON data]
├── פרויקטים (Projects) — direct link → projects.html
├── ספריית ידע (Knowledge Library) — direct link → library.html
├── צור קשר (Contact) — dropdown
│   ├── צור קשר (Contact)           → contact.html
│   ├── דרושים (Careers)            → join-us.html
│   └── הצטרפות כקבלן (Join as Contractor) → supplier.html
```

---

## 4. Hero Section (Homepage)

### 4.1 Structure

```html
<section class="hero" id="hero">
  <video class="hero-video" autoplay muted loop playsinline>
    <source src="videos/hero-video.mp4" type="video/mp4" />
  </video>
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <h1>מאתגר להצלחה</h1>
    <p>
      קבוצת WDI הנדסה – חברת ניהול פרויקטים, פיקוח ויעוץ הנדסי מובילה בישראל.
      ...
    </p>
    <div class="hero-buttons">
      <a href="services.html" class="btn btn-primary">השירותים שלנו</a>
      <a href="contact.html" class="btn btn-outline-light">דברו איתנו</a>
    </div>
  </div>
</section>
```

### 4.2 Hero CSS

```css
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(145deg, #0a1628 0%, var(--primary-dark) 50%, #1a3a5c 100%);
}

.hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  object-fit: cover;
  opacity: 0.5;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(26, 54, 93, 0.55) 0%,
    rgba(15, 39, 68, 0.65) 50%,
    rgba(10, 22, 40, 0.75) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 0 24px;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 1.25rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 32px;
  line-height: 1.8;
  text-shadow: 0 1px 5px rgba(0,0,0,0.2);
}
```

### 4.3 Hero Buttons

```css
.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
```

---

## 5. Buttons

### 5.1 Base Button

```css
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}
```

### 5.2 Button Variants

```css
/* Primary — Gold background, dark text */
.btn-primary {
  background: var(--secondary);       /* #c9a227 gold */
  color: var(--primary-dark);         /* #0f2744 dark navy */
  border-color: var(--secondary);
}
.btn-primary:hover {
  background: var(--secondary-light); /* #dbb84a */
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(201, 162, 39, 0.3);
}

/* Outline Light — transparent with white border */
.btn-outline-light {
  background: transparent;
  color: white;
  border-color: rgba(255,255,255,0.4);
}
.btn-outline-light:hover {
  background: rgba(255,255,255,0.1);
  border-color: white;
  transform: translateY(-2px);
}

/* Secondary — Navy background, white text */
.btn-secondary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
.btn-secondary:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
}
```

---

## 6. Page Header (Sub-pages)

### 6.1 Structure

```html
<section class="page-header">
  <div class="container">
    <nav class="breadcrumb">
      <a href="index.html">עמוד הבית</a>
      <span class="breadcrumb-sep">›</span>
      <span>Page Title</span>
    </nav>
    <h1>Page Title</h1>
    <p>Page subtitle / description</p>
  </div>
</section>
```

### 6.2 Page Header CSS

```css
.page-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 160px 0 80px;    /* 160px top accounts for fixed header */
  color: white;
  text-align: center;
}

.page-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.8;
}

/* Breadcrumb */
.breadcrumb {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 20px;
}

.breadcrumb a {
  color: white;
  text-decoration: none;
}

.breadcrumb-sep {
  margin: 0 8px;
}
```

---

## 7. Service Cards

### 7.1 Structure

```html
<div class="service-card">
  <div class="service-card-icon">
    <i class="fas fa-hard-hat"></i>
  </div>
  <h3>Service Title</h3>
  <p>Service description...</p>
  <a href="service-detail.html" class="service-card-link">
    קרא עוד <i class="fas fa-arrow-left"></i>
  </a>
</div>
```

### 7.2 Service Card CSS

```css
.service-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
  text-align: center;
}

.service-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);        /* 0 8px 25px rgba(0,0,0,0.12) */
  transform: translateY(-3px);
}

.service-card-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
  font-size: 1.5rem;
}

.service-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary);
  margin-bottom: 12px;
}

.service-card p {
  color: var(--gray-600);
  line-height: 1.7;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.service-card-link {
  color: var(--secondary);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
}

.service-card-link:hover {
  color: var(--secondary-light);
}
```

### 7.3 Services Grid

```css
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}
```

### 7.4 Services Hero (services.html specific)

```css
.services-hero {
  position: relative;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(145deg, #0a1628 0%, var(--primary-dark) 50%, #1a3a5c 100%);
}
/* Same video + overlay pattern as homepage hero */
/* Uses video: services-video.mp4 */
```

---

## 8. Project Cards

### 8.1 Structure

```html
<a class="project-card" href="project-detail.html">
  <div class="project-card-image">
    <img src="images/project.jpg" alt="Project Name" loading="lazy" />
    <div class="project-card-overlay">
      <span class="project-card-category">Category Badge</span>
      <h3>Project Title</h3>
      <p>Short description...</p>
    </div>
  </div>
</a>
```

### 8.2 Project Card CSS

```css
.project-card {
  display: block;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.project-card:hover {
  transform: scale(1.05);
}

.project-card-image {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.project-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .project-card-image img {
  transform: scale(1.1);
}

.project-card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.8) 0%,
    rgba(0,0,0,0.4) 60%,
    transparent 100%
  );
  color: white;
}

.project-card-category {
  display: inline-block;
  background: var(--secondary);      /* gold */
  color: var(--primary-dark);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.project-card-overlay h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: white;
}

.project-card-overlay p {
  font-size: 0.85rem;
  opacity: 0.9;
  color: white;
}
```

### 8.3 Projects Grid

```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}
```

### 8.4 Project Filter Buttons

```css
.filter-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 24px;
  border: 2px solid var(--gray-200);
  border-radius: 25px;           /* pill shape */
  background: white;
  color: var(--gray-600);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover,
.filter-btn.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--gray-50);
}
```

Filter categories: `all`, `industry`, `infrastructure`, `government`

---

## 9. Team Section

### 9.1 NEW Team Cards (team-new.css — current design)

```html
<div class="team-card">
  <div class="team-card-image">
    <img src="images/person.jpg" alt="Name" />
    <div class="team-card-overlay">
      <h4>Person Name</h4>
      <p class="team-card-position">Job Title</p>
      <p class="team-card-bio">Biography text...</p>
      <a class="team-card-linkedin" href="https://linkedin.com/in/...">
        <i class="fab fa-linkedin"></i> LinkedIn
      </a>
    </div>
  </div>
  <h4 class="team-card-name">Person Name</h4>
  <p class="team-card-role">Job Title</p>
</div>
```

### 9.2 Team Card CSS (Square Cards with Hover Overlay)

```css
.team-grid-new {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1100px;
  margin: 0 auto;
}

.team-card-image {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;         /* SQUARE */
  overflow: hidden;
  background: var(--gray-100);
}

.team-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

/* Hover overlay — navy blue semi-transparent */
.team-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(26, 54, 93, 0.92);   /* primary with 92% opacity */
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;         /* RTL alignment */
  padding: 25px 30px;
  opacity: 0;
  transition: opacity 0.3s ease;
  text-align: right;
}

.team-card:hover .team-card-overlay { opacity: 1; }
.team-card:hover .team-card-image img { transform: scale(1.05); }

/* Overlay content */
.team-card-overlay h4 { font-size: 1.4rem; margin-bottom: 8px; color: white; }
.team-card-overlay .team-card-position { color: var(--secondary); font-weight: 600; font-size: 1rem; margin-bottom: 16px; }
.team-card-overlay .team-card-bio { font-size: 1rem; line-height: 1.9; color: rgba(255,255,255,0.95); max-height: 150px; overflow-y: auto; }
.team-card-overlay .team-card-linkedin {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: white;
  background: rgba(255,255,255,0.15);
  padding: 10px 18px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: auto;
}

/* Below-image info */
.team-card-name { margin-top: 16px; font-size: 1.15rem; color: var(--gray-900); }
.team-card-role { color: var(--secondary); font-weight: 600; font-size: 0.9rem; }
```

### 9.3 Team Categories

Dynamic loading from JSON, rendered in category sections:
- `management` — הנהלה
- `administration` — מינהל
- `department-heads` — ראשי מחלקות
- `project-managers` — מנהלי פרויקטים

---

## 10. Testimonials & Client Logos

### 10.1 Testimonials

```css
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.testimonial-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: var(--shadow-md);          /* 0 4px 12px rgba(0,0,0,0.1) */
  border: 1px solid var(--gray-100);
  transition: all 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

/* Quote icon */
.testimonial-card::before {
  content: '"';
  font-size: 4rem;
  color: var(--secondary);   /* gold */
  font-family: Georgia, serif;
  line-height: 1;
  display: block;
  margin-bottom: 10px;
}

.testimonial-text {
  font-size: 1rem;
  color: var(--gray-700);
  line-height: 1.8;
  margin-bottom: 20px;
  font-style: italic;
}

.testimonial-author {
  font-weight: 600;
  color: var(--primary);
}

.testimonial-role {
  font-size: 0.85rem;
  color: var(--gray-500);
}
```

### 10.2 Client Logos

```css
.clients-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 30px;
  align-items: center;
}

.client-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.client-logo img {
  max-height: 60px;
  max-width: 120px;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.3s ease;
}

.client-logo:hover img {
  filter: grayscale(0%);
  opacity: 1;
}
```

---

## 11. Contact Page

### 11.1 Layout

```css
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}
```

### 11.2 Contact Info

```
Email:   info@wdi-ltd.co.il
Phone:   03-6122122
Address: רח' הברזל 30, תל אביב (Ramat HaChayal)
Map:     Google Maps iframe embed
Social:  LinkedIn, Facebook, Instagram, YouTube
```

### 11.3 Contact Form Card

```css
.contact-form-card {
  background: white;
  border-radius: 24px;
  padding: 40px;
  box-shadow: var(--shadow-lg);
}

/* Form inputs */
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
  outline: none;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--gray-700);
  font-size: 0.9rem;
}
```

---

## 12. Footer

### 12.1 Structure

```html
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <!-- Column 1: Logo + description + social -->
      <div class="footer-about">
        <img src="images/wdi-logo-white.png" alt="WDI" class="footer-logo" />
        <p>Description text...</p>
        <div class="social-links">
          <a href="..."><i class="fab fa-linkedin-in"></i></a>
          <a href="..."><i class="fab fa-facebook-f"></i></a>
          <a href="..."><i class="fab fa-instagram"></i></a>
          <a href="..."><i class="fab fa-youtube"></i></a>
        </div>
      </div>
      <!-- Column 2: Company links -->
      <div class="footer-links">
        <h4>החברה</h4>
        <ul>...</ul>
      </div>
      <!-- Column 3: Services (2-column sub-grid) -->
      <div class="footer-links footer-services">
        <h4>שירותים</h4>
        <ul class="two-column">...</ul>
      </div>
      <!-- Column 4: Contact info -->
      <div class="footer-contact">
        <h4>צור קשר</h4>
        <p><i class="fas fa-map-marker-alt"></i> Address</p>
        <p><i class="fas fa-phone"></i> Phone</p>
        <p><i class="fas fa-envelope"></i> Email</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 WDI Ltd. כל הזכויות שמורות.</p>
      <div class="footer-badges">
        <!-- Duns 100 badge -->
      </div>
    </div>
  </div>
</footer>
```

### 12.2 Footer CSS

```css
.footer {
  background: var(--gray-900);      /* #1a1a2e */
  color: rgba(255,255,255,0.8);
  padding: 60px 0 0;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-logo {
  height: 45px;
  margin-bottom: 16px;
}

.footer h4 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  font-weight: 600;
}

.footer-links ul {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--secondary);
}

/* Social icons */
.social-links {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.social-links a {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.social-links a:hover {
  background: var(--secondary);
  transform: translateY(-2px);
}

/* Footer bottom */
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: rgba(255,255,255,0.5);
}
```

---

## 13. About Page Specifics

### 13.1 Company Story

```css
.company-story {
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
}

.company-story p {
  font-size: 1.1rem;
  line-height: 1.9;
  color: var(--gray-600);
}
```

### 13.2 Values Grid

```css
.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.value-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.value-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
}

.value-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  font-size: 1.25rem;
}

.value-card h3 {
  font-size: 1.1rem;
  color: var(--primary);
  margin-bottom: 8px;
}

.value-card p {
  color: var(--gray-600);
  font-size: 0.9rem;
  line-height: 1.7;
}
```

### 13.3 Press Section

```css
.press-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.press-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.press-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.press-card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.press-card-content {
  padding: 24px;
}

.press-card h3 {
  font-size: 1.1rem;
  color: var(--primary);
  margin-bottom: 8px;
}
```

---

## 14. CTA Section

```css
.cta-section {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  padding: 80px 0;
  text-align: center;
  color: white;
}

.cta-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
}

.cta-section p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto 32px;
}
```

---

## 15. Scroll Animations

```css
/* Elements start invisible, animate in on scroll */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

Implemented via IntersectionObserver in `js/main.js`:
- `threshold: 0.1`
- `rootMargin: '0px 0px -50px 0px'`

---

## 16. Responsive Breakpoints

### 16.1 Desktop (default)

- Full 3-column team grid, 4-column footer, side-by-side contact
- Container: `max-width: 1200px`

### 16.2 Tablet (max-width: 768px)

```css
/* Navigation hidden, mobile toggle visible */
.nav-links         { display: none; }
.mobile-toggle     { display: flex; }
.nav-links.active  { display: flex; flex-direction: column; /* full-screen overlay */ }

/* Hero adjustments */
.hero-content h1   { font-size: 2.5rem; }
.hero-content p    { font-size: 1.05rem; }

/* Footer single column */
.footer-grid       { grid-template-columns: 1fr; }

/* Contact single column */
.contact-grid      { grid-template-columns: 1fr; }

/* Section padding reduced */
.section            { padding: 60px 0; }
.page-header        { padding: 100px 0 50px; }
```

### 16.3 Mobile (max-width: 480px)

```css
.hero-content h1    { font-size: 2rem; }
.hero-content p     { font-size: 0.95rem; }
.hero-buttons       { flex-direction: column; align-items: center; }
.section-header h2  { font-size: 1.75rem; }
```

### 16.4 Small Mobile (max-width: 360px)

```css
.hero-content h1    { font-size: 1.75rem; }
.hero-buttons .btn  { font-size: 0.9rem; padding: 12px 20px; width: 100%; }
```

### 16.5 Mobile-fixes.css Extras

```css
/* Use dynamic viewport height for hero */
.hero { min-height: 100dvh; }

/* Prevent horizontal overflow */
body { overflow-x: hidden; }

/* Page header reduced top padding on mobile */
.page-header { padding-top: 100px; }
```

### 16.6 Team Responsive

```css
/* 900px: 2-column team grid */
@media (max-width: 900px) {
  .team-grid-new { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}

/* 600px: still 2 columns, smaller overlay text */
@media (max-width: 600px) {
  .team-grid-new { grid-template-columns: repeat(2, 1fr); gap: 15px; }
  .team-card-overlay h4 { font-size: 1.1rem; }
  .team-card-overlay .team-card-bio { font-size: 0.8rem; max-height: 80px; }
  .team-card-name { font-size: 1rem; }
  .team-card-role { font-size: 0.85rem; }
}
```

---

## 17. Icons

- **Library**: Font Awesome 6 (CDN)
- **Loaded via**: `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">`

### Key Icons Used

| Context | Icon Class | Description |
|---------|-----------|-------------|
| Service: Project Mgmt | `fas fa-hard-hat` | Hard hat |
| Service: Engineering | `fas fa-drafting-compass` | Compass |
| Service: Consulting | `fas fa-lightbulb` | Lightbulb |
| Service: BIM | `fas fa-cubes` | 3D cubes |
| Service: Green Build | `fas fa-leaf` | Leaf |
| Service: Safety | `fas fa-shield-alt` | Shield |
| Social: LinkedIn | `fab fa-linkedin-in` | LinkedIn |
| Social: Facebook | `fab fa-facebook-f` | Facebook |
| Social: Instagram | `fab fa-instagram` | Instagram |
| Social: YouTube | `fab fa-youtube` | YouTube |
| Contact: Address | `fas fa-map-marker-alt` | Map pin |
| Contact: Phone | `fas fa-phone` | Phone |
| Contact: Email | `fas fa-envelope` | Envelope |
| Arrow (RTL) | `fas fa-arrow-left` | Left arrow (points forward in RTL) |
| Share: WhatsApp | `fab fa-whatsapp` | WhatsApp |
| Nav dropdown | `fas fa-chevron-down` | Chevron down |

---

## 18. Data Loading (js/main.js)

Content is loaded dynamically from JSON files:

```
/data/team/       → Team member JSON files
/data/projects/   → Project JSON files
/data/clients/    → Client JSON files
/data/testimonials/ → Testimonial JSON files
/data/services/   → Service JSON files
```

Each JSON file contains structured data (name, title, image path, description, etc.). The `main.js` script fetches these via `fetch()` and renders them into the DOM using `innerHTML` with template literals.

### Key rendering patterns:
- **Team**: Grouped by `category` field, rendered in sections
- **Projects**: Filtered by `category` field (industry/infrastructure/government)
- **Services**: Rendered as service cards with icon, title, description
- **Clients**: Rendered as logo images
- **Testimonials**: Rendered as quote cards

---

## 19. Image & Media Files

### 19.1 Branding

| File | Path | Description |
|------|------|-------------|
| `wdi-logo.png` | `images/wdi-logo.png` | Dark logo (for scrolled header, footer alt) |
| `wdi-logo-white.png` | `images/wdi-logo-white.png` | White logo (for transparent header, footer) |
| `favicon.png` | `images/favicon.png` | Favicon PNG |
| `favicon.svg` | `images/favicon.svg` | Favicon SVG |
| `daflash-logo.png` | `images/daflash-logo.png` | Daflash credit logo |
| `duns100.webp` | `images/duns100.webp` | Duns 100 badge (WebP) |
| `duns100.svg` | `images/duns100.svg` | Duns 100 badge (SVG) |

### 19.2 Team Photos

| File | Path |
|------|------|
| `ilan-weiss.jpg` | `images/team/ilan-weiss.jpg` |
| `arik-davidi.jpg` | `images/team/arik-davidi.jpg` |
| `eyal-nir.jpg` | `images/team/eyal-nir.jpg` |
| `guy-golan.jpg` | `images/team/guy-golan.jpg` |
| `ido-kuri.jpg` | `images/team/ido-kuri.jpg` |
| `ori-davidi.jpg` | `images/team/ori-davidi.jpg` |
| `rotem-glick.jpg` | `images/team/rotem-glick.jpg` |
| `samson.jpg` | `images/team/samson.jpg` |
| `tamir-lederman.jpg` | `images/team/tamir-lederman.jpg` |
| `victor-lifshitz.jpg` | `images/team/victor-lifshitz.jpg` |
| `yarden-weiss.jpg` | `images/team/yarden-weiss.jpg` |
| `yonatan-raymond.jpg` | `images/team/yonatan-raymond.jpg` |
| `yossi-elisha.jpg` | `images/team/yossi-elisha.jpg` |

### 19.3 Client Logos

All in `images/clients/` directory:

`afcon.png`, `aurbach-halevy.png`, `beer-sheva.png`, `electra.png`, `iaf.png`, `ide.png`, `idf.png`, `kimmel.png`, `libeskind.png`, `menolid.png`, `minrav.png`, `mod.png`, `noble-energy.png`, `pmec.png`, `pmo.png`, `shapir.png`, `skorka.png`, `tahal.png`, `tmng.png`

### 19.4 Press Images

| File | Path |
|------|------|
| `calcalist.png` | `images/press/calcalist.png` |
| `themarker.png` | `images/press/themarker.png` |

### 19.5 Placeholder Images

| File | Path |
|------|------|
| `placeholder-person.jpg` | `images/placeholder-person.jpg` |
| `placeholder-person.svg` | `images/placeholder-person.svg` |
| `placeholder-project.jpg` | `images/placeholder-project.jpg` |
| `placeholder-project.svg` | `images/placeholder-project.svg` |

### 19.6 Videos

| File | Path | Usage |
|------|------|-------|
| `hero-video.mp4` | `videos/hero-video.mp4` | Homepage hero background |
| `services-video.mp4` | `videos/services-video.mp4` | Services page hero background (referenced in services.html) |

---

## 20. Tailwind CSS Mapping Guide

For converting original CSS custom properties to Tailwind classes:

| Original Token | Tailwind Equivalent | Notes |
|----------------|-------------------|-------|
| `var(--primary)` #1a365d | Custom: `text-wdi-primary` | Must define in tailwind.config |
| `var(--primary-light)` #2d4a7c | Custom: `text-wdi-primary-light` | Must define in tailwind.config |
| `var(--primary-dark)` #0f2744 | Custom: `text-wdi-primary-dark` | Must define in tailwind.config |
| `var(--secondary)` #c9a227 | Custom: `text-wdi-secondary` | Must define in tailwind.config |
| `var(--secondary-light)` #dbb84a | Custom: `text-wdi-secondary-light` | Must define in tailwind.config |
| `var(--accent)` #e8b923 | Custom: `text-wdi-accent` | Must define in tailwind.config |
| `var(--gray-50)` | `gray-50` | Standard Tailwind (close enough) |
| `var(--gray-100)` | `gray-100` | Standard Tailwind |
| `var(--gray-200)` | `gray-200` | Standard Tailwind |
| `var(--gray-900)` #1a1a2e | Custom or `gray-900` | Original is slightly different |
| `border-radius: 16px` | `rounded-2xl` (= 16px) | Exact match |
| `border-radius: 20px` | `rounded-[20px]` | Custom value |
| `border-radius: 24px` | `rounded-3xl` (= 24px) | Exact match |
| `border-radius: 10px` | `rounded-[10px]` | Custom value |
| `padding: 32px` | `p-8` (= 32px) | Exact match |
| `padding: 100px 0` | `py-[100px]` | Custom value |
| `gap: 24px` | `gap-6` (= 24px) | Exact match |
| `gap: 30px` | `gap-[30px]` | Custom value |
| `max-width: 1200px` | `max-w-[1200px]` | Custom value |
| `font-size: 3.5rem` | `text-[3.5rem]` | Custom value |
| `font-size: 2.5rem` | `text-4xl` (≈ 2.25rem) | Use `text-[2.5rem]` for exact |

### Tailwind Config Extensions Needed

```js
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        'wdi-primary': '#1a365d',
        'wdi-primary-light': '#2d4a7c',
        'wdi-primary-dark': '#0f2744',
        'wdi-secondary': '#c9a227',
        'wdi-secondary-light': '#dbb84a',
        'wdi-accent': '#e8b923',
      },
      fontFamily: {
        hebrew: ['Assistant', 'Rubik', 'sans-serif'],
      },
    },
  },
};
```

---

## 21. Key Visual Identity Patterns

### CRITICAL patterns to replicate:

1. **Gold underline after section h2** — 60px wide, 3px height, `var(--secondary)`, centered
2. **Card hover: translateY(-3px) + shadow-lg** — consistent across all card types
3. **Transparent → white header on scroll** — with logo swap (white ↔ dark)
4. **Hero video background** — autoplay muted loop, 50% opacity, gradient overlay
5. **Project cards with bottom gradient overlay** — category badge in gold
6. **Team square cards with navy overlay on hover** — 92% opacity overlay
7. **Client logos grayscale → color on hover** — grayscale(100%) opacity 0.6 → full
8. **Filter pill buttons** — rounded-full, 2px border, active state
9. **RTL throughout** — text-align right, flex-direction awareness
10. **Font Awesome icons** — used everywhere for service icons, social links, contact info
11. **Page headers with gradient** — primary → primary-dark, 160px top padding
12. **Section structure** — centered header with subtitle + gold underline, then grid content
