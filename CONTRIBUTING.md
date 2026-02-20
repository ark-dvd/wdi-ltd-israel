# Contributing — WDI Ltd Israel

## Getting Started

```bash
git clone https://github.com/ark-dvd/wdi-ltd-israel.git
cd wdi-ltd-israel
npm install
cp .env.example .env.local   # Fill in values (see README.md)
npm run dev
```

---

## Development Workflow

1. Create a feature branch from `main`
2. Make changes
3. Verify locally: `npm run type-check && npm run lint && npm run build`
4. Push and create a Pull Request
5. CI checks must pass before merge
6. Merge to `main` triggers production deploy

---

## Code Standards

### TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` types unless explicitly justified
- All API inputs validated with Zod schemas

### Components
- Server Components by default (Next.js App Router)
- Client Components only when needed (`'use client'` directive)
- Use `next/image` for all images (no raw `<img>` tags)

### Styling
- Tailwind CSS utility classes
- Brand colors via `wdi-primary`, `wdi-secondary` tokens
- RTL layout (`dir="rtl"` on `<html>`)
- Font: Assistant for public site, Heebo for admin

### API Routes
- All admin routes wrapped with `withAuth()` guard
- Zod validation on all request bodies
- Standardized error responses via `apiError()` / `apiSuccess()`
- Rate limiting applied via middleware

---

## Project Structure

```
src/
  app/(public)/          # Public pages (ISR, no auth)
  app/admin/             # Admin panel (auth-protected)
    (panel)/             # Main admin routes (require auth)
    login/               # Login page (no auth check)
  app/api/
    admin/               # Protected API routes
    public/              # Public API routes (rate-limited)
    auth/                # NextAuth routes
  components/
    admin/               # Admin-only components
    public/              # Public site components
  lib/
    auth/                # NextAuth config, guards
    sanity/              # Client, schemas, image helper
    validation/          # Zod input schemas
    api/                 # Response helpers
    data-fetchers.ts     # Sanity GROQ queries
    rate-limit.ts        # Upstash rate limiter
```

---

## Content Management

Content is managed via Sanity CMS (project `hrkxr0r8`, dataset `production`).

- **Edit content:** Use the admin panel at `/admin` or Sanity Studio
- **Schema changes:** Edit files in `src/lib/sanity/schemas/`, then deploy with `npx sanity@latest schema deploy`
- **ISR:** Public pages revalidate every hour; changes appear within 60 minutes

---

## Security Rules

- Never commit `.env` files or secrets
- Never add `console.log` with sensitive data
- All admin routes must use `withAuth()` guard
- All user input must be Zod-validated
- Images must use `next/image` (for optimization + CSP compliance)
- No `eval()` or `Function()` constructors in application code

---

## CI/CD

GitHub Actions run on every PR:

- **TypeScript:** `tsc --noEmit` must pass
- **ESLint:** `npm run lint` must pass
- **Build:** `npm run build` must succeed
- **Security:** No secrets in code, no prohibited paths

Production deploy triggers automatically on merge to `main` via Netlify.
