# Migration Cleanup — Post-Launch File Removal

**Status:** DO NOT DELETE YET — Remove only after launch verification is complete.
**Reference:** DOC-060 §7 (H-09)

## Old Static HTML Files (root)

These files were the original static HTML site. They are superseded by the Next.js App Router pages under `src/app/(public)/`.

- `index.html` → replaced by `src/app/(public)/page.tsx`
- `about.html` → replaced by `src/app/(public)/about/page.tsx`
- `services.html` → replaced by `src/app/(public)/services/page.tsx`
- `projects.html` → replaced by `src/app/(public)/projects/page.tsx`
- `team.html` → replaced by `src/app/(public)/team/page.tsx`
- `clients.html` → replaced by `src/app/(public)/clients/page.tsx`
- `contact.html` → replaced by `src/app/(public)/contact/page.tsx`
- `jobs.html` → replaced by `src/app/(public)/jobs/page.tsx`
- `innovation.html` → replaced by `src/app/(public)/innovation/page.tsx`
- `join-us.html` → replaced by `src/app/(public)/join-us/page.tsx`
- `job-application.html` → replaced by `src/app/(public)/job-application/page.tsx`
- `content-library.html` → replaced by `src/app/(public)/content-library/page.tsx`
- `404.html` → replaced by `src/app/not-found.tsx`

## Old Service Detail HTML Files

- `services/supervision.html`
- `services/qa.html`
- `services/permits.html`
- `services/pmo.html`
- `services/client-rep.html`
- `services/spec.html`
- `services/design-management.html`
- `services/doc-control.html`

All replaced by `src/app/(public)/services/[slug]/page.tsx`

## Old Project Detail HTML Files

- `projects/alon-tavor.html`
- `projects/ashdod-desal.html`
- `projects/ashdod-port.html`
- `projects/campus-merkaz.html`
- `projects/eshkol.html`
- `projects/intel-kg.html`
- `projects/marhas.html`
- `projects/mobileye.html`
- `projects/msc-galil.html`
- `projects/msc-hanamal17.html`
- `projects/msc-hanamal59.html`
- `projects/msc-jerusalem.html`
- `projects/msc-rothschild.html`

All replaced by `src/app/(public)/projects/[slug]/page.tsx`

## Old Static Assets

- `css/` — entire directory (Tailwind CSS now compiled from `src/`)
- `js/main.js` — old vanilla JS (all interactivity now in React components)

## Old Data Directory

- `data/` — JSON data files (all content now in Sanity CMS)

## Old Admin Interface

- `wdi-backoffice/` — entire directory (replaced by `src/app/admin/`)

## Old Build Scripts

- `scripts/update-indexes.js` — old static site index builder (no longer needed)

## Verification Checklist Before Deletion

- [ ] All pages render correctly on production
- [ ] All Sanity data displays properly
- [ ] Contact form submits successfully
- [ ] Admin login and CRUD operations work
- [ ] 301 redirects from old URLs to new URLs verified
- [ ] Google Search Console shows no crawl errors
- [ ] Lighthouse scores meet targets (≥ 97 all categories)
- [ ] Founder has approved the live site
