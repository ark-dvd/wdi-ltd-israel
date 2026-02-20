# REMEDIATION-001 — WDI Project Recovery & Remediation Plan

**Status:** Active — LOCK READY
**Issue Date:** February 20, 2026
**Version:** 1.5
**Timestamp:** 20260221-0045 (CST)
**Prepared For:** WDI Ltd Israel — Arik Dvir, Co-Founder & Partner
**Context:** Post-incident remediation plan following repository integrity failure
**Governing Documents:** DOC-000 through DOC-070 (WDI Canonical Document Suite); CANONICAL-AMENDMENT-001 (v1.3)

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260220-1200 | Initial release — full remediation plan based on independent audit findings |
| 1.1 | 20260220-1845 | Revised per external CTO review: added forensic freeze (Phase 0.0), expanded root cause analysis (§3.3–3.5), added backup & recovery governance (Phase 3 expanded), added live stability protocol (§5.2), added architecture freeze clause (§5.3), added executive decision gate before Phase 2B (§5.4), added canonical audit validation (§5.5), expanded risk register (§7) |
| 1.2 | 20260220-2130 | Owner decision applied: full CRM module deferred to future Phase 2+. Intake+Triage capability introduced as bounded replacement. §2.2 updated. §5.3 Architecture Freeze updated. §5.4 Executive Decision Gate updated (EDG-1 resolved). Phase 2B updated. Phase 4 updated. See CANONICAL-AMENDMENT-001 for full canonical impact. |
| 1.3 | 20260220-2215 | QA revision: Phase 2A.6 wording hardened (CRM isolation intent clarified). CANONICAL-AMENDMENT-001 reference updated to v1.1. |
| 1.4 | 20260220-2330 | Lock readiness tightening — wording hardening and governance clarification. Phase 0.0 forensic tag fallback added for non-GPG environments. Phase 0 secret history decision requirement added. CANONICAL-AMENDMENT-001 reference updated to v1.2. |
| 1.5 | 20260221-0045 | Lock readiness tightening — secret history decision governance tightened with Owner decision gate (Phase 0). CANONICAL-AMENDMENT-001 reference updated to v1.3. |

---

## 1. Purpose of This Document

This document provides a complete, honest accounting of what happened to the WDI Ltd Israel website project (wdi.co.il), what the current state is, and what must happen to recover. It is intended to be reviewed by an independent technical consultant to validate the assessment and the proposed recovery path.

The document covers: what was built, what went wrong, what remains salvageable, what is lost, and what the remediation plan is — in that order.

---

## 2. Project Background

### 2.1 The Business

WDI Ltd Israel is a boutique project management, supervision, and engineering consulting company operating in Israel since 2013. The company serves the Israeli construction industry across six sectors: security (בטחוני), commercial (מסחרי), industrial (תעשייה), infrastructure (תשתיות), residential (מגורים), and public (ציבורי).

### 2.2 The Website Project (Updated v1.2)

The objective is to rebuild wdi.co.il from a static HTML marketing site into a governed system comprising:

- A Hebrew RTL public website with rich SEO and structured data
- A content management system (CMS) for all website content
- An **Intake & Triage** capability for managing three submission types: general inquiries, job applications, and supplier applications — with contact status tracking, relevance assessment, type-specific outcomes, and audit trail
- An authenticated back office for operators
- Integration with the company's operational workflows

**Explicitly deferred (not in v1.0 scope):** Full CRM module including client lifecycle management, engagement tracking, pipeline/deal management, activity feeds, and CRM search. These capabilities are designated for a future Phase 2+ and are governed by CANONICAL-AMENDMENT-001.

### 2.3 The Approach Taken

The project followed a documentation-first methodology:

1. **Canonical Document Suite (DOC-000 through DOC-070):** Seven governing documents were authored defining system charter, architecture boundaries, data model, operational model, API contracts, UX interaction contracts, implementation plan, and product specification (Hebrew and English).
2. **Compliance Audit (AUDIT-001):** An audit was run against the canonical specifications to map gaps.
3. **Implementation Plan (DOC-060):** A phased execution roadmap was created based on audit findings.
4. **Canonical Amendment (CANONICAL-AMENDMENT-001):** Owner decision to defer full CRM and introduce Intake+Triage as bounded replacement. (Added v1.2)

The canonical documents are thorough, internally consistent, and represent significant intellectual investment. They remain valid and valuable, subject to surgical amendments documented in CANONICAL-AMENDMENT-001.

---

## 3. What Went Wrong — Incident Report

### 3.1 Summary

The repository (`ark-dvd/wdi-ltd-israel`) is in a **structurally invalid state**. The Next.js application source code that was being developed has been deleted from the working tree, while build artifacts, legacy files, and canonical documentation remain. The project cannot be built, deployed, or maintained in its current state.

### 3.2 Evidence (from Independent Audit — ChatGPT CTO Simulation, February 2026)

An independent audit of the repository ZIP snapshot found the following:

**Finding 1 — No Buildable Application Exists**

- `package.json` is missing from the repository root
- `package-lock.json` is missing
- All Next.js source files under `src/app/` are deleted
- Netlify build command (`npm run build`) fails immediately with `ENOENT: Could not read package.json`
- **Severity:** Critical — total build failure

**Finding 2 — Source Code Deleted, Build Artifacts Remain**

- The `.next/` directory (compiled build output) exists in the repository
- `.next/routes-manifest.json` proves a full Next.js application previously existed, including:
  - Public routes (`/about`, `/services`, `/projects`, etc.)
  - Admin routes (`/admin`, `/admin/login`)
  - API routes (`/api/auth/[...nextauth]`, `/api/admin/...`, dynamic `[id]`)
- The source code that produced this build has been deleted from the working tree
- Git status shows explicit deletions: `D package.json`, `D src/app/(public)/.../page.tsx`, etc.
- **Severity:** Critical — the application that implements the canonical documents no longer exists in source form

**Finding 3 — Three Competing Systems in One Repository**

The repository contains incompatible remnants of three different systems:

| System | Files Present | Status |
|--------|--------------|--------|
| Legacy static HTML site | `index.html`, `about.html`, `contact.html`, `/css/`, `/js/`, `/data/` | Present and intact — this is what wdi.co.il currently serves |
| Next.js application (source) | `src/app/`, `package.json`, components, lib, config | **Deleted** — only compiled `.next/` remains |
| Canonical document suite | `/docs/DOC-000` through `DOC-070`, `AUDIT-001` | Present and intact |

**Finding 4 — Security Exposure**

- `.env.local` containing `SANITY_API_TOKEN` (write-capable) is tracked in the repository
- Even if `.gitignore` now excludes it, the token has been committed to Git history
- `node_modules/` is tracked in the repository (dependency supply chain risk)
- `.next/` build output is tracked (information leakage)
- **Severity:** High — requires immediate token rotation

### 3.3 Root Cause Assessment

Based on Git state evidence, the most likely sequence of events:

1. A legacy static HTML site existed and was serving wdi.co.il
2. A Next.js application was developed alongside it (proven by `.next/routes-manifest.json`)
3. A cleanup operation was planned to remove legacy files after the Next.js migration was verified (documented in `MIGRATION_CLEANUP.md`)
4. **The cleanup was executed inversely** — the Next.js source was deleted instead of the legacy static files
5. This may have been caused by an accidental branch merge, an over-aggressive cleanup, or a misunderstanding of which files belonged to which system

### 3.4 Required Forensic Investigation (Added v1.1)

The root cause assessment in §3.3 is a hypothesis based on observable file state. Before remediation proceeds, the following forensic questions must be answered definitively:

| # | Investigation Item | Method | Output |
|---|-------------------|--------|--------|
| F-1 | Identify the exact commit SHA where `package.json` and `src/app/` were deleted | `git log --all --diff-filter=D -- package.json src/app/` | Specific commit SHA, timestamp, and commit message |
| F-2 | Identify the author of the deletion commit | `git show --format='%an <%ae> %ai' <SHA>` | Author name, email, and date |
| F-3 | Identify the branch the deletion occurred on | `git branch --contains <SHA>` and `git reflog` | Branch name and merge path to `main` |
| F-4 | Determine if history rewrite or force push occurred | `git reflog show main` — look for reset/rebase entries; check GitHub audit log for force push events | Confirmed or ruled out |
| F-5 | Reconstruct full timeline: when was the Next.js source last present, when was it deleted, and how many commits occurred between | `git log --all --oneline` correlated with file existence checks | Written timeline with dates and SHAs |
| F-6 | Determine if the deletion was a single commit or spread across multiple commits | `git log --all --stat -- src/app/ package.json` | Single event vs. progressive deletion |

**This investigation must be completed during Phase 0.0 (Forensic Freeze) and documented in a FORENSIC-001 report before any cleanup actions are taken.**

### 3.5 Contributing Factors

- No CI/CD pipeline to block destructive merges
- No build verification gate before deployment
- No branch protection rules on the repository
- Build artifacts (`.next/`, `node_modules/`) tracked in Git, creating confusion about what is source vs. output
- Secrets committed to repository without automated scanning
- No automated tests to catch regression

---

## 4. Current State Assessment

### 4.1 What Is Intact and Valuable

| Asset | Status | Value |
|-------|--------|-------|
| Canonical Documents (DOC-000 through DOC-070) | Intact | High — these define the complete target system and remain authoritative (subject to CANONICAL-AMENDMENT-001) |
| Compliance Audit (AUDIT-001) | Intact | High — maps all gaps between current state and target |
| Legacy static HTML site | Intact, serving on wdi.co.il | Medium — contains all current content and design, can be used as data source |
| Content data (JSON files in `/data/`) | Intact | High — team members, projects, services, clients, etc. |
| Design assets (images, videos, CSS) | Intact | High — brand assets, project photos, team photos |
| Product Specification in Hebrew (DOC-070) | Intact | High — complete screen-by-screen design reference with screenshots (CRM screens deferred per CANONICAL-AMENDMENT-001) |
| Git history | Available on GitHub | High — may contain recoverable source code from before the deletion |

### 4.2 What Is Damaged or Lost

| Asset | Status | Recovery Possibility |
|-------|--------|---------------------|
| Next.js application source code | Deleted from working tree | **Possibly recoverable** from Git history or developer machine |
| `package.json` and dependency manifest | Deleted | Possibly recoverable from Git history |
| CMS integration code | Deleted with source | Depends on Git history recovery |
| Authentication implementation | Deleted with source | Depends on Git history recovery |
| API routes implementation | Deleted with source | Depends on Git history recovery |
| Sanity API token confidentiality | Compromised (committed to repo) | Requires rotation — old token must be revoked |

### 4.3 What the Live Website Looks Like Today

The live site at wdi.co.il is serving the legacy static HTML site. It is functional as a marketing website but has:

- No content management system (content is hardcoded in HTML)
- No authentication or admin interface
- No intake management or CRM
- No structured data / JSON-LD for SEO
- No dynamic content capability
- Basic responsive design, Hebrew RTL functional
- Contact form routed through Netlify Forms (not governed intake endpoint)

---

## 5. Remediation Plan

### 5.1 Guiding Principles

1. **No speculative work.** Every action has a defined verification step.
2. **Security first.** Credential rotation before any development.
3. **Data preservation.** No content is lost during recovery.
4. **Canonical documents govern.** DOC-000 through DOC-070, as amended by CANONICAL-AMENDMENT-001, define the target system.
5. **Incremental verification.** Each phase produces a testable artifact before the next phase begins.
6. **Evidence preservation.** The current repository state is forensic evidence. It is archived before any modification. (Added v1.1)
7. **Live site stability.** The production website at wdi.co.il is not touched during recovery. (Added v1.1)
8. **Architecture freeze.** No features outside canonical scope are added during recovery. (Added v1.1)
9. **CRM is deferred.** Only Intake+Triage is in scope. Full CRM is a future phase. (Added v1.2)

### 5.2 Live Stability Protocol (Added v1.1)

The live site at wdi.co.il is currently serving the legacy static HTML site. It is functional and must remain so throughout the recovery process. The following constraints are in effect from the moment this plan is activated until Phase 4 (Validation & Handoff) is complete:

| # | Constraint | Rationale |
|---|-----------|-----------|
| LS-1 | **No DNS changes** to wdi.co.il or any associated subdomains | Prevent accidental routing to a non-functional system |
| LS-2 | **Disable Netlify auto-deploy** on the `main` branch immediately | Prevent repository cleanup (Phase 0) from triggering a broken deployment |
| LS-3 | **No content edits** on the live static site during recovery | Prevent divergence between live content and migration source data |
| LS-4 | **No Netlify configuration changes** (redirects, headers, build settings) | Prevent accidental disruption to the working site |
| LS-5 | All new development deploys to a **separate staging site** (e.g., `staging-wdi.netlify.app`) | Live site is untouched until cutover |
| LS-6 | Live site cutover requires **explicit founder approval** after Phase 4 verification | No silent or automatic production switch |

### 5.3 Architecture Freeze Clause (Updated v1.2)

During the recovery and rebuild process, the following constraints apply:

- **No new features** may be added that are not specified in DOC-000 through DOC-070 as amended by CANONICAL-AMENDMENT-001. The canonical documents plus amendment define the complete v1.0 scope.
- **Full CRM implementation is explicitly prohibited in recovery scope.** This includes: client lifecycle management, engagement tracking, pipeline/deal management, activity feeds, CRM dashboard, CRM search, and CRM settings. These are designated for future Phase 2+ per owner decision. See CANONICAL-AMENDMENT-001 §2 for the complete deferred inventory.
- **Intake+Triage is the only allowed CRM-like capability** in v1.0 scope. Its boundaries are defined in CANONICAL-AMENDMENT-001 §3. Any feature that exceeds the Intake+Triage boundary (e.g., converting a submission into a CRM client record, tracking engagement history, pipeline visualization) is a scope violation.
- **Any proposed scope change** — whether addition, removal, or modification — requires a documented change request with: the specific change, the rationale, the impact on timeline and budget, and written approval from the project owner before implementation begins.
- **No technology stack changes** from the architecture specified in DOC-000 §10.1 without documented justification and approval.

This clause exists because scope creep during recovery is a primary risk. Recovery is not an opportunity to redesign. It is an operation to reach the defined target state.

### 5.4 Executive Decision Gate — Scope Validation (Updated v1.2)

**Trigger:** This gate activates if Phase 1 (Source Code Archaeology) results in Path B (clean rebuild). It must be completed before Phase 2B begins.

**Purpose:** Before committing to a multi-week rebuild, the project owner must make an informed decision about scope and architecture.

**Resolved decisions (binding — v1.2):**

| # | Question | Decision | Status |
|---|---------|----------|--------|
| EDG-1 | Is the custom CRM justified? | **RESOLVED: Full CRM deferred.** Intake+Triage introduced as bounded replacement. See CANONICAL-AMENDMENT-001. | Closed |

**Remaining open decisions (must be answered with written decisions before Phase 2B):**

| # | Question | Options |
|---|---------|---------|
| EDG-2 | **Can 80% of value be delivered with a simplified architecture?** The canonical docs specify: Next.js + Sanity + NextAuth + Upstash Redis + Cloudflare Turnstile + Sentry. Would a simpler stack (e.g., Next.js + markdown/JSON content + basic auth + Netlify Forms) deliver the core value (professional website, SEO, content management, intake triage) faster? | Full stack per spec / Simplified stack / Hybrid approach |
| EDG-3 | **Should the rebuild be phased for early value delivery?** Instead of building CMS + Intake+Triage + full Back Office before any public-facing improvement, should the rebuild prioritize: (a) public website first (SEO value, professional presentation), (b) CMS second (operational capability), (c) Intake+Triage third (submission management)? | Full build per DOC-060 / Phased value delivery / Public site only for now |
| EDG-4 | **What is the budget ceiling?** Based on Path B timeline estimates (3–5 weeks developer time, reduced from original estimate now that CRM is deferred), what is the maximum acceptable investment before the project is paused for reassessment? | Specific figure documented |

**Intake+Triage acceptance criteria (must be met for v1.0 sign-off):**

| # | Criterion | Verification |
|---|----------|-------------|
| IT-AC-1 | All three submission types (general inquiry, job application, supplier application) are captured through governed public forms | Submit each type; verify record created in data store |
| IT-AC-2 | Each submission has contact status tracking: contacted / not contacted | Toggle status on a submission; verify persistence and audit trail entry |
| IT-AC-3 | Each submission has relevance assessment field | Set relevance on a submission; verify persistence |
| IT-AC-4 | Type-specific outcome tracking works correctly: General → converted to client / not converted; Job → rejected / in process / hired; Supplier → rejected / in review / added to database | Set each outcome type; verify only valid outcomes appear per submission type |
| IT-AC-5 | Audit trail records every status change with timestamp and operator identity | Change status 3 times; verify 3 audit entries with correct timestamps and operator |
| IT-AC-6 | Intake inbox in Back Office displays all submissions with filtering by type and status | Verify list view with filters; confirm all submissions visible |
| IT-AC-7 | Authentication required for all intake management operations | Attempt access without auth; verify rejection |

**This gate is not optional.** Skipping it risks repeating the pattern of over-investment in specification without proportional delivery.

### 5.5 Canonical Audit Validation (Added v1.1)

**Trigger:** Before any rebuild work begins (whether Path A or Path B), a rapid validation of the canonical documents is performed.

**Purpose:** The canonical documents were written to describe a target system. They have not been validated against a running implementation. Before they are used as a build specification, they must be checked for internal contradictions, over-specification, and alignment with current business needs.

**Scope:** This is a focused review (1–2 days maximum), not a rewrite. It produces an addendum, not a new document set. Note that CANONICAL-AMENDMENT-001 already addresses the largest scope adjustment (CRM deferral).

| # | Check | Method | Output |
|---|-------|--------|--------|
| CV-1 | **Internal contradictions** — do any two documents specify conflicting behavior for the same entity, route, or interaction? | Cross-reference DOC-020 entities against DOC-030 screens, DOC-040 endpoints, and DOC-050 interactions | List of contradictions (if any) with resolution |
| CV-2 | **Over-specification** — are there areas where the specification prescribes implementation details that constrain the developer without adding business value? | Review DOC-040 (API contracts) and DOC-050 (UX interactions) for prescriptive vs. essential requirements | List of areas where spec can be relaxed to "behavior requirement" rather than "implementation requirement" |
| CV-3 | **Business alignment** — has anything changed in WDI's business context since the documents were written that affects the specification? New services? Changed team structure? Different priorities? | Brief interview with project owner | Documented changes (if any) with impact on spec |
| CV-4 | **Implementability** — can a competent developer read DOC-000 through DOC-070 + CANONICAL-AMENDMENT-001 and build the system without ambiguity? Are there gaps where the developer would have to guess? | Developer review of docs (or external reviewer assessment) | List of ambiguities or gaps |

**Output:** A brief CANONICAL-VALIDATION-001 addendum documenting findings. If contradictions or business misalignment are found, the relevant canonical documents are updated before build begins.

---

### Phase 0.0 — Repository Forensic Freeze (Immediate — Before Any Other Action) (Added v1.1)

**Objective:** Preserve the current repository state as forensic evidence before any cleanup, modification, or recovery action is taken.

| # | Action | Verification |
|---|--------|-------------|
| 0.0.1 | Create a signed Git tag on the current `main` HEAD: `git tag -s forensic-freeze-20260220 -m "Pre-remediation forensic snapshot"`. If GPG signing is not available, create an annotated tag instead: `git tag -a forensic-freeze-20260220 -m "Pre-remediation forensic snapshot"` and explicitly record the commit SHA (`git rev-parse HEAD`). | Tag exists (signed or annotated); commit SHA documented |
| 0.0.2 | Create a full repository archive: `git bundle create wdi-forensic-20260220.bundle --all` | Bundle file created, contains all branches and tags |
| 0.0.3 | Create a ZIP snapshot of the entire working directory (including `.git/`): `zip -r wdi-full-snapshot-20260220.zip .` | ZIP file created |
| 0.0.4 | Compute and record SHA-256 hash of both the bundle and the ZIP | Hashes documented in this section (updated post-execution) |
| 0.0.5 | Upload archive to a separate storage location (not the same GitHub repo) — Google Drive, separate private repo, or cloud storage | Archive location documented, access verified |
| 0.0.6 | Execute forensic investigation items F-1 through F-6 from §3.4 | FORENSIC-001 report produced |
| 0.0.7 | Activate Live Stability Protocol (§5.2) — disable Netlify auto-deploy on `main` | Auto-deploy confirmed disabled in Netlify dashboard |

**Hashes (to be filled after execution):**

| Artifact | SHA-256 |
|----------|---------|
| `wdi-forensic-20260220.bundle` | _pending_ |
| `wdi-full-snapshot-20260220.zip` | _pending_ |
| `main` HEAD commit SHA | _pending_ |

**Integrity proof fallback (Added v1.4):** If signed tags are not available due to GPG not being configured, an annotated tag plus documented commit SHA and verified SHA-256 hashes of the bundle and ZIP shall constitute sufficient integrity proof.

**Definition of Done:** Repository state is preserved in at least two independent locations with verified hashes. Forensic investigation is documented. No modification has been made to the repository. Live stability protocol is active.

---

### Phase 0 — Containment (Day 1 — After Forensic Freeze)

**Objective:** Stop active security exposure and stabilize the repository.

| # | Action | Verification |
|---|--------|-------------|
| 0.1 | Rotate Sanity API token — revoke the compromised token and generate a new one | Old token returns 401 on any API call |
| 0.2 | Remove `.env.local` from Git tracking | `git ls-files .env.local` returns empty |
| 0.3 | Remove `.next/` from Git tracking | `git ls-files .next/` returns empty |
| 0.4 | Remove `node_modules/` from Git tracking | `git ls-files node_modules/` returns empty |
| 0.5 | Update `.gitignore` to permanently exclude: `.env*`, `.next/`, `node_modules/`, `*.log` | File reviewed and committed |
| 0.6 | Enable GitHub branch protection on `main` — require PR, require status checks | Settings verified in GitHub UI |
| 0.7 | Audit GitHub access — verify only authorized users have write access | Collaborator list reviewed |

**Definition of Done:** Repository is clean of secrets and build artifacts. Token is rotated. Branch protection is active.

**Secret history decision (Added v1.4):** Removing a secret from Git tracking (steps 0.2–0.4) prevents future exposure but does not purge it from Git history. The committed `.env.local` with `SANITY_API_TOKEN` remains in historical commits. The team must explicitly decide whether to: (a) rewrite Git history to purge all historical occurrences of the secret (using `git filter-repo` or `BFG Repo-Cleaner`), accepting the consequences of history rewrite (force push, invalidated SHAs, collaborator re-clone), or (b) accept historical exposure and rely solely on credential rotation (step 0.1) to neutralize the risk. This decision must be documented in the remediation log with rationale.

**Owner decision gate (Added v1.5):** The project Owner (Arik Dvir) is the sole approver for choosing between option (a) and option (b) above. The default posture is option (b) — rotate credentials only — unless the Owner explicitly approves option (a) after both of the following conditions are met: (1) the Phase 0.0 forensic archive and all backups are confirmed intact and stored in at least two independent locations, and (2) a collaborator coordination plan is documented covering force-push notification, re-clone instructions, and SHA invalidation impact. No team member may initiate history rewrite without written Owner approval.

---

### Phase 1 — Source Code Archaeology (Days 1–2)

**Objective:** Determine if the deleted Next.js source code can be recovered from Git history.

| # | Action | Verification |
|---|--------|-------------|
| 1.1 | Run `git log --all --oneline` to map full commit history | Complete commit timeline documented |
| 1.2 | Identify the commit(s) where `package.json` and `src/app/` were deleted (may already be answered by Phase 0.0 forensic investigation) | Specific commit SHA(s) documented |
| 1.3 | Identify the last commit where the full Next.js source existed | Specific commit SHA documented |
| 1.4 | Extract the full source tree from that commit using `git show` or `git checkout` | Files recovered to a `recovered/` directory |
| 1.5 | Verify recovered source against `.next/routes-manifest.json` — do all routes in the manifest have corresponding source files? | Route-to-source mapping documented |
| 1.6 | Attempt a local build of the recovered source (`npm install && npm run build`) | Build succeeds or failures are documented |
| 1.7 | Document findings: what was recovered, what is missing, what is the quality of recovered code | Written assessment produced |

**Decision Gate:** Based on Phase 1 findings, one of two paths:

- **Path A — Source Recovered:** Recovered code is viable. Proceed to Phase 2A (restoration from recovered source).
- **Path B — Source Irrecoverable or Inadequate:** Recovered code is absent, incomplete, or of insufficient quality. **Proceed to Executive Decision Gate (§5.4) before Phase 2B.**

---

### Phase 2A — Restoration from Recovered Source (Days 3–7, if Path A)

**Objective:** Restore the recovered Next.js application to a buildable, deployable state.

| # | Action | Verification |
|---|--------|-------------|
| 2A.1 | Create a clean branch (`restore/main`) from the last known-good commit | Branch created, `npm run build` passes |
| 2A.2 | Audit recovered code against canonical documents (DOC-000 through DOC-050) + CANONICAL-AMENDMENT-001 | Gap list produced: what the recovered code implements vs. what the amended specs require |
| 2A.3 | Fix any build-blocking issues (missing dependencies, TypeScript errors, broken imports) | `npm run build` passes clean |
| 2A.4 | Verify authentication works (NextAuth + Google OAuth + email whitelist) | Login flow tested end-to-end |
| 2A.5 | Verify CMS read/write works (Sanity connection with new token) | Content CRUD tested for at least one entity type |
| 2A.6 | Isolate and disable CRM features for v1.0 — do not delete. CRM routes must be inaccessible (return 404 or be absent from navigation). Code may remain in the codebase for Phase 2+ reactivation but must not be reachable by any user or operator in the deployed application. | CRM routes return 404 or are absent from sidebar/routing; no CRM screen is reachable via direct URL |
| 2A.7 | Deploy to a staging URL on Netlify (not the live site — per Live Stability Protocol §5.2) | Staging URL loads correctly |
| 2A.8 | Run AUDIT-001 compliance check against the restored application | Updated compliance score documented |
| 2A.9 | Merge `restore/main` to `main` after verification | PR merged, build passes, staging deploys |

**Definition of Done:** A buildable, deployable Next.js application exists on `main` branch with authentication, CMS connectivity, CRM modules disabled, and a documented compliance gap list.

---

### Executive Decision Gate (Required before Phase 2B — see §5.4)

If Path B is triggered, the project owner must complete the Executive Decision Gate evaluation in §5.4 (EDG-2 through EDG-4; EDG-1 is resolved) before Phase 2B work begins. Phase 2B scope is already constrained by CANONICAL-AMENDMENT-001.

---

### Phase 2B — Clean Rebuild (Days 3–14+, if Path B)

**Prerequisite:** Executive Decision Gate (§5.4) completed (EDG-2, EDG-3, EDG-4). Canonical Audit Validation (§5.5) completed. Scope confirmed per CANONICAL-AMENDMENT-001.

**Objective:** Build the system from scratch using canonical documents + CANONICAL-AMENDMENT-001 as the complete specification.

This path follows DOC-060 (Implementation Plan) with the CRM phase replaced by Intake+Triage per owner decision. The canonical documents plus amendment provide sufficient specification for a competent developer or team to implement the system without ambiguity.

| # | Action | Governing Document | Notes (v1.2) |
|---|--------|-------------------|---------------|
| 2B.1 | Data archaeology and content preservation | DOC-060 Phase 0 | Unchanged — always required |
| 2B.2 | Next.js foundation + Sanity schemas + Auth + Data migration | DOC-060 Phase 1 | Sanity schemas per DOC-020 as amended (CRM entities excluded, IntakeSubmission added). Stack may be simplified per EDG-2. |
| 2B.3 | Back Office CMS implementation | DOC-060 Phase 2 | Unchanged — full CMS for all content entity types |
| 2B.4 | **Intake+Triage implementation** | **CANONICAL-AMENDMENT-001 §3** | **Replaces DOC-060 Phase 3 (CRM).** Three submission types, contact status, relevance, type-specific outcomes, audit trail. Intake Inbox in Back Office. |
| 2B.5 | Public website implementation | DOC-060 Phase 4 | Contact form submits to Intake endpoint (not CRM lead intake). Job application and supplier forms submit to respective Intake endpoints. May be prioritized first per EDG-3. |
| 2B.6 | Hardening, security, performance, launch | DOC-060 Phase 5 | Unchanged |

**Estimated Duration:** 2–4 weeks for a competent full-stack developer (reduced from 3–5 weeks — CRM deferral removes significant complexity). Timeline may further decrease if scope is reduced per EDG decisions.

**Definition of Done:** Per DOC-060 phase gates as amended — each phase has a Definition of Done that must be met before the next phase begins. Intake+Triage acceptance criteria (§5.4 IT-AC-1 through IT-AC-7) must pass.

---

### Phase 3 — Repository Governance & Backup (Parallel to Phase 2)

**Objective:** Ensure this class of failure cannot recur and that recovery capability is permanent.

#### 3A. CI/CD Controls

| # | Action | Verification |
|---|--------|-------------|
| 3A.1 | Configure GitHub Actions CI pipeline: build must pass on every PR | Intentionally breaking PR is blocked |
| 3A.2 | Add TypeScript strict check to CI | `tsc --noEmit` runs on every PR |
| 3A.3 | Add secret scanning (GitHub native or `gitleaks`) | `.env` file in a PR triggers failure |
| 3A.4 | Add path protection: CI fails if `.next/`, `node_modules/`, or `.env*` appear in tracked files | Intentionally adding prohibited file triggers failure |
| 3A.5 | Require at least one approval on PRs to `main` | Unapproved PR cannot be merged |
| 3A.6 | Document deployment procedure in `DEPLOY.md` | File exists and is accurate |
| 3A.7 | Set up Netlify deploy previews for PRs | PR generates preview URL |

#### 3B. Backup & Recovery (Added v1.1)

| # | Action | Verification |
|---|--------|-------------|
| 3B.1 | Configure automated GitHub repository backup — full clone (including all branches and tags) to a separate storage location, running on a scheduled basis (minimum weekly) | Backup script runs successfully; restore test performed from backup |
| 3B.2 | Configure Sanity dataset export automation — scheduled export of the full Sanity dataset (ndjson + assets) to offsite storage (minimum weekly) | Export runs successfully; test import to a scratch dataset succeeds |
| 3B.3 | Define Netlify deploy artifact retention policy — retain at minimum the last 10 successful production deploys and all deploys from the last 90 days | Policy documented; oldest retained deploy identified and verified accessible |
| 3B.4 | Establish weekly offsite archive — combined archive of GitHub bundle + Sanity export + Netlify deploy reference, stored outside both GitHub and Netlify (Google Drive, S3, or equivalent) | Archive location documented; weekly archive verified for at least 2 consecutive weeks |
| 3B.5 | Document recovery procedure — step-by-step instructions for restoring the site from backup in the event of repository loss, Sanity data loss, or hosting failure | `RECOVERY.md` exists with tested procedures |

**Definition of Done:** No commit can reach `main` without passing build, type check, and secret scan. Prohibited paths are enforced automatically. Automated backups are running and verified. Recovery procedure is documented and tested.

---

### Phase 4 — Validation & Handoff (After Phase 2 + Phase 3) (Updated v1.2)

**Objective:** Verify the recovered/rebuilt system meets the canonical specification (as amended) and is ready for production.

| # | Action | Verification |
|---|--------|-------------|
| 4.1 | Run compliance check against the deployed system for all CMS invariants from DOC-020 (CRM invariants excluded per CANONICAL-AMENDMENT-001) | All applicable invariants pass |
| 4.2 | Verify all 18 public routes from DOC-000 §9 render correctly | Each route loads with correct content, Hebrew RTL, responsive |
| 4.3 | Verify all Back Office CMS functions per DOC-030 | CMS CRUD for every content entity type |
| 4.4 | **Verify Intake+Triage per acceptance criteria IT-AC-1 through IT-AC-7 (§5.4)** | All 7 acceptance criteria pass |
| 4.5 | **Verify no CRM features are accessible** — no pipeline screen, no client lifecycle, no engagement tracking, no CRM dashboard | Attempt to navigate to CRM routes; all return 404 or are absent from navigation |
| 4.6 | Lighthouse audit on 5 representative pages | ≥ 97 in all four categories |
| 4.7 | Security audit: auth bypass attempts, API without token, XSS vectors | All blocked |
| 4.8 | Data integrity check: all content from legacy site exists in new system | Count comparison per entity type |
| 4.9 | Verify backup & recovery systems are operational | One full restore cycle tested |
| 4.10 | Founder walkthrough and acceptance | Written sign-off |
| 4.11 | Deactivate Live Stability Protocol — re-enable auto-deploy, perform DNS cutover if needed | Production serves new system; founder confirms |

**Definition of Done:** System passes all verification gates. Intake+Triage passes all acceptance criteria. No CRM features are present. Backups are operational. Founder accepts. Production deployment authorized.

---

## 6. What the External Consultant Should Validate

This section is specifically for the independent reviewer. The following questions should be addressed:

### 6.1 Regarding the Incident

1. Is the root cause assessment in §3.3 consistent with the Git evidence?
2. Are there additional contributing factors not identified?
3. Is there evidence of malicious action vs. accidental deletion?
4. Does the forensic investigation scope in §3.4 cover all necessary questions? (Added v1.1)

### 6.2 Regarding the Canonical Documents

5. Are DOC-000 through DOC-070 (as amended by CANONICAL-AMENDMENT-001) internally consistent and implementable?
6. Is the specified architecture (Next.js + Sanity + NextAuth + Netlify) appropriate for the stated business requirements?
7. Are there over-engineered components that add complexity without business value?
8. Is the Intake+Triage scope appropriate and well-bounded? (Updated v1.2)

### 6.3 Regarding the Recovery Plan

9. Is Phase 1 (source archaeology) worth pursuing, or should the project go directly to Path B (clean rebuild)?
10. Is the estimated timeline realistic (now reduced with CRM deferral)?
11. Are the phase gates and verification steps sufficient?
12. Are there missing risks in the remediation plan?
13. Are the Intake+Triage acceptance criteria (§5.4) sufficient? (Updated v1.2)

### 6.4 Regarding Governance

14. Are the proposed CI/CD controls in Phase 3A sufficient to prevent recurrence?
15. Is the backup & recovery plan in Phase 3B adequate? (Added v1.1)
16. Should additional operational controls be implemented (e.g., deployment approval workflow)?
17. Is the current team structure adequate for maintaining this system, or is additional capability needed?

### 6.5 Regarding Cost and Value

18. Given the current state and reduced scope (CRM deferred), what is the realistic cost to reach a production-ready system?
19. Is the remaining scope (CMS + Intake+Triage + Back Office + full SEO) well-calibrated for a company of WDI's size?
20. What is the opportunity cost of continued delay?

---

## 7. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Source code irrecoverable from Git history | Medium | High | Path B (clean rebuild) as fallback; canonical docs provide complete spec |
| Sanity token already exploited before rotation | Low | High | Audit Sanity dataset for unauthorized changes; rotate immediately |
| Legacy static site goes down during recovery | Low | Medium | Live Stability Protocol (§5.2); do not touch live deployment until staging-verified |
| Canonical documents contain specification errors | Low | Medium | External review (this document); Canonical Audit Validation (§5.5); iterative correction during implementation |
| Developer unfamiliar with Hebrew RTL introduces layout bugs | Medium | Medium | RTL testing on every component; DOC-070 provides visual reference |
| Scope creep during rebuild | High | High | Architecture Freeze Clause (§5.3); CRM explicitly prohibited; phase gates enforce scope |
| Budget overrun due to extended rebuild | Medium | High | Executive Decision Gate (§5.4); CRM deferral reduces scope; clear phase boundaries limit open-ended work |
| Canonical over-specification — documents prescribe implementation details that constrain developers without adding business value, increasing build time and rigidity | Medium | Medium | Canonical Audit Validation (§5.5) checks for this; §5.4 EDG-2 evaluates simplified alternatives; permission to treat specs as behavior requirements rather than implementation mandates where appropriate | *(Added v1.1)* |
| Team capability mismatch — the specified stack requires deep full-stack expertise that may not be available at a reasonable cost for a boutique company | Medium | High | §5.4 EDG-2 explicitly evaluates simpler stacks; CRM deferral reduces required complexity; if Path B, hiring brief must match actual stack requirements | *(Updated v1.2)* |
| Executive fatigue — project owner has already invested significant time and money with no working result; risk of abandoning the project entirely or making rushed decisions | Medium | High | Phase 0.0 and Phase 0 are low-effort, high-impact actions that produce visible progress quickly; §5.4 EDG-3 explicitly offers a "public site only for now" option; CRM deferral demonstrates responsive scope management | *(Updated v1.2)* |
| Timeline optimism bias — estimated durations assume smooth execution; integration issues, Hebrew RTL edge cases, Sanity schema complexity, and deployment configuration frequently take 2–3x initial estimates | High | Medium | All phase durations should be treated as optimistic baselines; budget and timeline commitments should use a 1.5x–2x multiplier; §5.4 EDG-4 establishes a budget ceiling | *(Added v1.1)* |
| Intake+Triage scope ambiguity — boundary between Intake+Triage and full CRM may blur during implementation, leading to incremental CRM feature creep | Medium | Medium | Architecture Freeze Clause (§5.3) explicitly defines the boundary; CANONICAL-AMENDMENT-001 §3 provides definitive scope; any feature that exceeds Intake+Triage boundary requires formal change request | *(Added v1.2)* |

---

## 8. Asset Inventory for Recovery

The following assets are available to any developer or team undertaking the recovery:

### 8.1 Canonical Documents (Complete Specification)

| Document | Content | v1.2 Status |
|----------|---------|-------------|
| DOC-000 | System Charter & Product Promise — defines what the system must be | Active — CRM sections subject to CANONICAL-AMENDMENT-001 |
| DOC-010 | Architecture & Responsibility Boundaries — defines component ownership | Active — CRM domain deferred |
| DOC-020 | Canonical Data Model — defines all entities, fields, invariants | Active — CRM entities deferred, IntakeSubmission added per amendment |
| DOC-030 | Back Office & Operational Model — defines every admin screen and behavior | Active — CRM screens deferred, Intake Inbox added per amendment |
| DOC-040 | API Contract & Mutation Semantics — defines every API endpoint | Active — CRM endpoints deferred, Intake endpoints added per amendment |
| DOC-050 | Back Office UX Interaction Contract — defines UI behavior rules | Active — CRM interactions deferred, Intake interactions added per amendment |
| DOC-060 | Implementation Plan — defines phased build sequence with gates | Active — Phase 3 (CRM) replaced by Intake+Triage |
| DOC-070 (HE) | Product Specification in Hebrew — screen-by-screen with screenshots | Active — CRM screens deferred per amendment |
| DOC-070 (EN) | Product Specification in English — translated version | Active — CRM screens deferred per amendment |
| AUDIT-001 | Canonical Compliance Report — gap analysis against specs | Active — CRM gaps no longer applicable for v1.0 |
| CANONICAL-AMENDMENT-001 | CRM Deferred, Intake/Triage Introduced | **New (v1.2)** |

### 8.2 Existing Data (Content to Migrate)

All current website content exists in JSON files under `/data/` in the repository, and in the live static HTML site. This includes team members, projects, services, clients, testimonials, press items, job listings, and content library items.

### 8.3 Design Reference

DOC-070 contains annotated screenshots of every page and screen from the current design, providing a complete visual reference for rebuilding. CRM screens in DOC-070 are marked as deferred per CANONICAL-AMENDMENT-001. Additionally, the live site at wdi.co.il serves as a visual baseline.

---

## 9. Lessons Learned

### 9.1 What Worked

- The documentation-first approach produced a comprehensive, implementable specification
- The canonical documents caught architectural problems before they were built
- The audit methodology (AUDIT-001) provided clear gap identification
- The phased implementation plan (DOC-060) established proper sequencing with gates
- External CTO review identified scope reduction opportunity (CRM deferral) that reduces risk and accelerates delivery (Added v1.2)

### 9.2 What Failed

- No repository governance was in place during development (no CI, no branch protection, no secret scanning)
- Build artifacts and secrets were committed to Git, creating a confusing repository state
- The cleanup operation that triggered the incident was not verified before or after execution
- There was no staging environment to catch failures before they reached the repository
- Excessive focus on documentation before iterative building and testing meant that when the implementation was lost, there was no deployed artifact to fall back to
- No backup or recovery mechanism existed — a single repository was the sole copy of the entire project (Added v1.1)

### 9.3 Structural Observation

The project exhibited a pattern where **documentation quality significantly exceeded implementation governance**. The canonical documents describe a system with strict invariants, fail-closed behavior, and deterministic state management — but the repository itself had none of these properties. The repo accepted any commit, tracked any file, and had no gates to prevent destructive changes.

Going forward, the rigor applied to the specification documents must also be applied to the development process itself.

---

## 10. Binding Nature

This document is a remediation plan, not a canonical specification. It does not supersede or modify DOC-000 through DOC-070 except where CANONICAL-AMENDMENT-001 applies. Those documents remain the authoritative specification for the target system, subject to surgical amendments documented in CANONICAL-AMENDMENT-001 and any adjustments resulting from the Canonical Audit Validation (§5.5) and Executive Decision Gate (§5.4).

This document may be revised as recovery proceeds and new information emerges. Updates will be versioned and timestamped.

---

## 11. Appendix — Key Repository References

| Item | Location |
|------|----------|
| Repository | `github.com/ark-dvd/wdi-ltd-israel` |
| Hosting | Netlify (wdi.co.il) |
| CMS | Sanity CMS (token compromised — rotation required) |
| Canonical Docs | `/docs/` directory in repository |
| Content Data | `/data/` directory in repository |
| Live Site | https://wdi.co.il |
| Forensic Archive | _location to be documented after Phase 0.0_ |

---

*End of document.*
