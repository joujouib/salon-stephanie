# Salon Stephanie — Full Project Requirements Document
*Version 5.0 — Living document (updated from v4.0 Final)*

> **How to use this document (for AI assistants and humans):**
> Section 0 is the source of truth for what is BUILT vs PLANNED. When building a new
> feature, follow the spec here, but always read the actual code first — the code is
> authoritative for anything already built. Do not "upgrade" built features to match
> this doc unless explicitly asked.

---

## 0. Build Status (as of July 2026)

**Live site:** https://salon-stephanie.vercel.app · **Repo:** github.com/joujouib/salon-stephanie
**Local path:** C:\SalonWeb\salon-stephanie · **Progress:** ~58% of full scope

### ✅ Built and working
| Area | Details |
|---|---|
| Public pages | Home (hero), Services (DB-driven + category filter), Portfolio (before/after sliders, placeholder images), About (team), Colors explorer, Find-Your-Color quiz, Queue status |
| Design system | Brand tokens in Tailwind v4 `@theme`; Cormorant Garamond (display) + DM Sans (body) via `src/app/fonts.js`, applied by `.className` |
| Database | Neon Postgres + Prisma 6. Tables: `Service`, `Staff`, `Client`, `QueueEntry`, `VisitService`, `Color`, `SalonSettings` (7 of 16 planned) |
| Queue system | Admin queue board (mom-friendly), add walk-in modal with client search-as-you-type, duplicate-name detection, services grouped by category, multiple services per entry, adjustable total duration (`durationOverride`), Start/Finished/Remove with confirmation |
| Wait algorithm | `src/lib/waitTime.js` — available_at chair simulation: free chairs → 0 wait; remaining time (not full) for in-progress; reused on public queue page and admin board. Staff count from `SalonSettings.activeStaffCount` (dropdown 1–5 in admin queue header) |
| Auth | Clerk. Middleware protects `/admin(.*)`; endpoint-level checks (401) on every write route + all sensitive reads (clients GET, queue GET, staff GET, settings). Verified in incognito. **One owner account only — no helper accounts yet** |
| Admin editors | Services editor (add/edit/hide, fixed categories Hair/Makeup) and Colors editor (native color picker + friendly "warm/cool" and "needs lightening?" questions mapped to technical fields) |
| Color visuals | Colors shown on a gray hair-strand image (`public/hair-strand.jpg`) tinted per color via CSS blend modes (multiply + soft-light + overlay lift) |
| Robustness | `res.ok` guards on all admin fetches (friendly error instead of crash); `force-dynamic` on all live-data public pages |
| Deploy | Vercel with auto-deploy on push; env vars set (DATABASE_URL, Clerk keys). `build` runs `prisma generate` first; `postinstall` too |

### 🔜 Next up (agreed)
1. **Formula Calculator** — standalone admin tool implementing the 11-rule spec (§7.10). Rule logic in `src/lib/colorFormula.js`, then mom-friendly page `/admin/color-tool`. Optional Claude API explanation layer afterward.
2. Navbar grouping (merge Colors + Find Your Color under one tab)
3. Public queue auto-refresh (30s polling)

### 📋 Planned (not started)
Transactions/POS + two-step finalize + tips + reconciliation · Client profiles + hair profile + per-client formula history · Portfolio image uploads (Cloudinary) · AI try-on (admin consultation tool, Replicate) · Dashboard (today's stats) · Audit logs · Soft-delete middleware · Roles/permissions enforcement + `clerkId` on Staff (before helper accounts) · i18n EN/AR/ES · Tests + CI test pipeline · Chatbot (optional — may be replaced by static FAQ) · Contact page

### ❌ Explicitly descoped / changed from v4
- **Public AI try-on → admin-only consultation tool** (mom's iPad, behind Clerk). Public teasers instead: color explorer + quiz. No public rate-limiting apparatus needed.
- **Input selfies are never stored** (processed in memory; only results kept) — privacy by absence.
- **No Express/FastAPI backend, no Railway** — Next.js API routes on Vercel only.
- **JavaScript, not TypeScript** (deliberate learning choice).
- **Prisma 6** (v7 caused breakage; pinned).
- **Money in integers** (Int) not DECIMAL — per security audit.
- **Categories fixed: Hair, Makeup only.** Nails is a separate person's business — out of scope.
- **No patch-test notice** (owner's practice; can add later).
- **Docker deferred** to later.
- **Nickname/`client_name_override`** not yet implemented (duplicate handling via search + warning instead).

---

## 1. Project Overview

A full-stack web application for Salon Stephanie, a women's hair and makeup salon in Beirut, Lebanon. Two audiences: clients (public site, accountless) and staff (private admin panel).

**Goals:**
- Professional online presence
- Replace the paper queue with a live digital system
- Let clients explore colors (public teasers) and see AI previews in-salon (admin tool)
- Replace the manual transaction book with a digital POS
- Store client history, color formulas, and hair profiles permanently
- Give the owner a professional formula calculator using the colorist level system

**Owner:** Stephanie (hairdresser, salon owner) — older, moderate tech comfort, **limited eyesight**. Primary admin device: **iPad** (sometimes phone).
**Staff:** Stephanie + 2 helpers (interns/washers not tracked).
**Walk-in only:** No appointments — first come first served. **No client accounts, ever** (re-addable later if wanted).
**Languages:** English, Arabic, Spanish (i18n pending).

### Mom-Friendly Admin Standard (applies to ALL admin UI)
- Large text (`text-xl` / `text-2xl`+), full-strength high-contrast colors (no faded grays for readable text)
- Big touch targets (`py-4`+ buttons), generous spacing, `rounded-xl/2xl`
- Plain language ("Being served", "Finished" — never `in_progress`)
- One clear primary action per screen; forms open in modals
- Confirmations (`window.confirm`) before anything destructive
- Forgiving: hide instead of delete

---

## 2. Tech Stack (current)

| Layer | Technology |
|---|---|
| Framework | Next.js App Router (JavaScript) — frontend + API routes together |
| Styling | Tailwind CSS v4 (`@theme` tokens in `globals.css`) |
| Database | PostgreSQL on Neon (eu-central-1) |
| ORM | Prisma 6 (pinned; not v7) |
| Auth | Clerk (admin only, no public signup) |
| Image storage | Cloudinary (planned, not set up) |
| AI try-on | Replicate — FLUX.1 Kontext class model, descriptive prompts not hex (planned, admin-only) |
| AI explanations/chatbot | Anthropic Claude API (planned) |
| Deployment | Vercel only (auto-deploy on push) |
| Monitoring | Sentry / PostHog / UptimeRobot (planned) |
| i18n | next-i18next EN/AR/ES (planned) |
| CI/CD | Vercel auto-deploy live; GitHub Actions test pipeline planned |
| Containerization | Docker (deferred) |

Key file locations: Prisma client singleton `src/lib/prisma.js` · wait algorithm `src/lib/waitTime.js` · fonts `src/app/fonts.js` · middleware `src/middleware.js` · project rules `CLAUDE.md` · this doc `docs/requirements.md`.

---

## 3. Design System

**Palette (from logo):**

| Name | Hex | Tailwind token | Usage |
|---|---|---|---|
| Deep Black | `#0D0D0D` | `ink` | Page background, nav, footer |
| Deep Gold | `#C9A84C` | `gold` | Primary accent, headings, buttons |
| Warm Cream | `#F5EFE6` | `cream` | Text on dark, cards (`cream/5` etc.) |
| Mocha Brown | `#3D2B1F` | `mocha` | Secondary accents |
| Soft Gold Light | `#E8D5A3` | `gold-light` | Hover states |

**Typography:** Cormorant Garamond (display, via `displayFont.className`) · DM Sans (body, on `<body>`) · Noto Naskh Arabic (when i18n lands).

**Principles:** dark luxury theme, always dark (no light-mode switching — default template theme CSS was removed). Thin gold dividers. Mobile-first public site; iPad-first admin.

**Color swatch rendering:** every catalog color renders on the shared hair-strand image (`public/hair-strand.jpg`) with layered CSS blend modes (multiply tint + soft-light shine + 30% gray overlay to preserve strand texture on dark shades). Very dark hexes are tuned slightly lighter (charcoal ≈ `#2A2A2A`) so texture stays visible — accepted display tradeoff.

---

## 4. Sitemap

### Public (no login)
| Route | Status | Description |
|---|---|---|
| `/` | ✅ | Hero, brand |
| `/services` | ✅ | DB-driven, category filter, active only |
| `/portfolio` | ✅ (placeholder images) | Before/after sliders (react-compare-slider), filters |
| `/colors` | ✅ | Color explorer — tinted strand swatches, lightening notes |
| `/find-your-color` | ✅ | Recommendation quiz (undertone + natural hair → scored suggestions) |
| `/queue` | ✅ | Count + estimated wait only. No names. (Polling pending) |
| `/about` | ✅ | Story + team |
| `/contact` | 📋 | Maps, WhatsApp, Instagram, hours |
| `/try-on` | ❌ descoped | Public try-on removed — see §7.3 |

Navbar pending change: group Colors + Find Your Color under one tab.

### Admin (Clerk-protected)
| Route | Status | Description |
|---|---|---|
| `/admin/queue` | ✅ | Queue manager (mom-friendly), staff-count dropdown |
| `/admin/services` | ✅ | Services editor |
| `/admin/colors` | ✅ | Colors editor |
| `/admin/color-tool` | 🔜 | Formula calculator (§7.10) |
| `/admin` | 📋 | Dashboard (today's stats) |
| `/admin/clients` | 📋 | Client list + profiles + formula history |
| `/admin/transactions` | 📋 | POS / finalize |
| `/admin/reconciliation` | 📋 | End of day |
| `/admin/portfolio` | 📋 | Image management (Cloudinary) |
| `/admin/try-on` | 📋 | AI consultation tool |
| `/admin/audit`, `/admin/settings` | 📋 | Owner only |

---

## 5. Authentication & Login

Handled by Clerk. No public signup anywhere; accounts created manually in the Clerk dashboard.

**Current state:** ONE account exists (George/owner). Helper accounts deliberately not created yet. Phone+SMS login can be enabled for mom later.

**Protection layers (current):**
1. `src/middleware.js` — `clerkMiddleware` + `createRouteMatcher(["/admin(.*)"])` → `auth.protect()`
2. Endpoint checks — every write route and every sensitive read (`/api/clients` GET+POST, `/api/queue` GET+POST+PATCH, `/api/staff`, `/api/settings`, `/api/services` POST/PATCH + `/all`, `/api/colors` POST/PATCH + `/all`) starts with `const { userId } = await auth(); if (!userId) return 401`.
3. (Planned, before helper accounts) `admin/layout.js` role gate + `requireOwner()` data-layer helper.

Public reads stay open: `/api/services` GET (active only), `/api/colors` GET (active only). Public queue page queries Prisma directly (no client data exposed).

---

## 6. Role Permissions

**Not yet enforced — single owner account.** Becomes mandatory before helper accounts are created.

Plan unchanged from v4: permission constants in code (`constants/permissions.js`), `ROLE_PERMISSIONS` map (owner = all; helper = queue view/edit, client view/edit, transaction create only), **role derived in code from `staff.role` — single source of truth, not DB JSON**. Add `clerkId` to `Staff` to link Clerk accounts to staff records. Permission table from v4 still applies (helpers never see financials; two-step transaction close separates operational from financial).

---

## 7. Features

### 7.1 Today's Stats Dashboard — 📋 planned
Landing page after login. Clients served / waiting / in progress (all staff); revenue + tips (owner only). Open/Close salon toggle. Derived from existing tables.

### 7.2 Live Queue System — ✅ built (differences from v4 noted)
- Admin-only management; clients never join themselves
- Client **search-as-you-type** (top 5 matches, tap to choose, "change" to reselect); typing an unmatched name creates the client on Add; near-duplicate warning (trim/lowercase/space-collapsed compare)
- Multiple services per entry via `VisitService` join rows; services grouped by category in the picker
- **Adjustable total duration**: modal shows auto-summed minutes, editable; stored as `durationOverride` only when changed
- Statuses (current): `waiting → in_progress → done`, plus `cancelled` / `no_show`. **`pending_payment` arrives with the transactions feature** (two-step close: helper marks complete → owner finalizes — still planned as in v4)
- Timestamps auto-stamped: `startedAt` on Start, `finishedAt` on Finished/Remove
- Remove requires confirmation

**Wait time (built):** available_at simulation in `src/lib/waitTime.js` — chairs array sized by `SalonSettings.activeStaffCount`; in-progress entries push their chair out by REMAINING minutes (`duration − elapsed since startedAt`); waiting entries seated into soonest chair; newcomer wait = min(chairs); free chair ⇒ 0 ("No wait!"). Entry duration = `durationOverride` if set, else sum of its services' durations.

**v4's base vs display duration split (staff active time vs client-present time) is NOT implemented** — single `duration` per service + per-entry override. Revisit if estimates prove off in practice.

**Public /queue shows:** count + estimated wait only. Auto-refresh via 30s polling pending (deliberate choice: honest snapshot, never a ticking countdown).

### 7.3 AI Hair Color Try-On — 📋 planned, **rescoped: admin-only consultation tool**
The v4 public self-serve try-on is replaced by an in-salon tool mom uses on her iPad (behind Clerk):
1. Mom photographs/uploads client's photo → picks a catalog color → Generate → shows client
2. **Descriptive prompts, not computed hex** ("change hair to honey blonde, realistic for dark starting hair") — the model's training handles color realism
3. **Input photo never persisted** — processed in memory (validate magic bytes, strip EXIF/GPS via sharp re-encode), sent to Replicate, garbage-collected. Only results stored (Cloudinary), `is_saved` or 30-day expiry via nightly cron
4. Key `REPLICATE_API_TOKEN` server-only (never `NEXT_PUBLIC_`); browser only ever calls our API
5. Cost: ~$0.04–0.08/generation; hard monthly cap in Replicate dashboard; no public rate-limiting needed (admin-only)
6. Disclaimer stays: *"AI-generated preview for inspiration only. Actual results depend on your hair and Stephanie's professional assessment."*

**Public teasers instead (✅ built):** the color explorer and the find-your-color quiz, both funneling to "come in and Stephanie will show you with our AI try-on."

### 7.4 AI Chatbot — 📋 optional
Audit recommends a static FAQ instead. If built: Claude API, RAG over services DB, EN/AR/ES, no booking. Decision deferred.

### 7.5 Color Formula Tracking (per client) — 📋 planned
As v4 (§`client_formulas`): post-transaction prompt, all fields optional, filterable history, last formula pre-fills. Formula-photo → portfolio shortcut with client consent. Will use the professional level system (§7.10). The standalone calculator ships first and integrates here later.

### 7.6 End of Day Reconciliation — 📋 planned
As v4: expected vs actual cash, tips per staff, overnight queue cleanup (day can't close with unresolved entries), lock on close.

### 7.7 Client Profiles — 📋 planned
As v4: name, nickname, phone, language; hair profile (optional, gradual); dynamic visit count/last visit; search results show last visit + service to disambiguate duplicates.

### 7.8 Audit Logs — 📋 planned
As v4: diff-only JSON, owner view, auto-logged on significant actions.

### 7.9 Soft Delete — partially applied
`isActive` hide/show built for services and colors (safer than delete; avoids FK breakage). Full v4 soft-delete (`is_deleted` + global Prisma filter + restore + logging) planned with the transactions/audit phase.

### 7.10 Formula Calculator — 🔜 NEXT BUILD (new since v4)
**Standalone admin tool** (`/admin/color-tool`) implementing the professional colorist system mom actually uses (level 1–10 before the dot, tone reflect after: e.g. 7.3 = medium golden blonde).

**Architecture:** pure rule logic in `src/lib/colorFormula.js` (deterministic, testable, reusable — same pattern as `waitTime.js`), mom-friendly page on top. Optional Claude API natural-language explanation layer added after the rules work. **Describe honestly as a rule-based expert system; the LLM layer is the "AI" part.**

**The 11 rules (owner-approved spec, encode faithfully):**
1. **Inputs:** current level (1–10), target level (1–10), hair status (virgin | previously colored), hair condition (healthy | dry | damaged | very damaged), desired tone (natural/ash/pearl/violet/beige/golden/copper/red/chocolate/mahogany/…). Gray % — **dropped for v1** (don't collect unused input; add with a coverage rule later).
2. **Lift:** `liftNeeded = target − current`.
3. **Lightening possible?** lift ≤ 0 → deposit only. Previously colored + lift > 0 → permanent color CANNOT lift artificial pigment → recommend bleach or color remover, never permanent color alone.
4. **Method (virgin):** 0 → deposit · 1–2 → permanent color · 3 → prefer bleach (high-lift acceptable only on healthy virgin hair) · 4+ → bleach required. (Previously colored: any lift → bleach/remover.)
5. **Developer:** deposit → 10 vol · lift 1 → 20 · lift 2 → 30 · high-lift → 40. Bleach developer by condition: healthy → 30, dry → 20, damaged → 20 max, very damaged → recommend against bleaching (multiple sessions).
6. **Exposed pigment when lifting to:** L5 red-orange · L6 orange · L7 orange-yellow · L8 yellow · L9 pale yellow · L10 very pale yellow.
7. **Neutralizing tone** (complementary, based on level reached): red-orange → blue-green/ash · orange → blue (ash) · orange-yellow → blue-violet · yellow/pale yellow → violet · very pale → pearl/violet.
8. **Mix ratios:** permanent 1:1 · high-lift 1:2 · bleach 1:2 (brand-specific ratios possible later).
9. **Safety:** damaged → warning; very damaged → "Lightening is not recommended. Consider multiple sessions or restorative treatments before bleaching." Never recommend aggressive lifting on compromised hair.
10. **Output:** current/target levels, lift, status, method, developer, expected underlying pigment, neutralizing tone, mix ratio, warnings.
11. **Principles:** color does not lift color · toner does not lighten · condition beats target · if unsafe in one session, recommend multiple sessions.

---

## 8. Database Schema

### 8a. CURRENT schema (as built — Prisma, authoritative source: `prisma/schema.prisma`)
```
Service:       id, name, category ("Hair"|"Makeup"), priceMin Int, priceMax Int,
               duration Int, isActive, createdAt, visitServices[]
Staff:         id, name, role ("owner"|"helper"), isActive, createdAt, queueEntries[]
Client:        id, name, phone?, language (default "ar"), createdAt, queueEntries[]
QueueEntry:    id, status (default "waiting"), notes?, joinedAt, startedAt?, finishedAt?,
               durationOverride Int?, clientId→Client, staffId?→Staff,
               visitServices[], createdAt
VisitService:  id, priceCharged Int?, queueEntryId→QueueEntry (onDelete: Cascade),
               serviceId→Service, createdAt
Color:         id, name, hex, category ("Blonde"|"Brown"|"Red"|"Black"),
               undertone ("warm"|"cool"|"neutral"), lighteningLevel ("none"|"mild"|"heavy"),
               suitableFor (comma string "light,medium,dark"), isActive, createdAt
SalonSettings: id, activeStaffCount Int (default 3)   -- singleton
```
Conventions: UUID PKs, money as **Int**, seed = `prisma/seed.js` (deletes children before parents: queueEntry first).

### 8b. TARGET schema additions (v4 plan, adapted — build as features land)
- `Staff` += `clerkId`, `permissions` derived from role in code, soft-delete fields
- `Service` += optional split of duration into base (staff-active) vs display — only if real usage shows estimates off
- `Client` += `nickname`, soft-delete fields · `ClientHairProfile` (1:1, all optional)
- `QueueEntry` += `pending_payment` status, `cancellationReason`
- `Transaction` (subtotal, discount type/value/reason, total, payment method, `isLocked` default true, lockedBy/At) · `Tip` + `TipSplit`
- `DailyReconciliation` (expected vs actual cash, lock, closedBy)
- `ClientFormula` (per-client: brand, code = level.tone, developer volume, mix ratio, processing time, notes, rating, photo, shared_to_portfolio)
- `Portfolio` (before/after URLs, category, tags, source_formula link)
- `AiGeneration` (session, chosen color, **result URL only — no input image column**, is_admin, is_saved, expires_at)
- `AuditLog` (staff, action, table, record, changed_fields diff JSON)
- `SalonSettings` += is_open, open/close times, AI budget/limits, default language

All financial writes wrapped in `prisma.$transaction([...])`. Full 16-table inventory and fill-responsibility table as in v4 (§9–10 of v4 apply unchanged as the target).

---

## 9. Security

- Secrets in `.env` (gitignored); Vercel env vars for production; never `NEXT_PUBLIC_` on secrets; rotate if leaked
- **Defense in depth:** middleware is UX, endpoint/data-layer checks are the security (middleware-bypass CVEs exist) — every sensitive route re-checks auth
- Public API surface minimal: active services + active colors only; queue GET is auth-only; client data never public
- Server is the source of truth: client sends facts (IDs), never money math; validation on every endpoint (Zod adoption planned)
- Prisma parameterized queries; no raw SQL
- Uploads (when built): 3 layers — frontend UX check, backend magic-bytes + size (5MB) validation, Cloudinary preset; sharp re-encode strips EXIF/GPS
- AI: key server-only; admin-only generation; hard monthly spend cap; input photos never stored
- Transactions locked on finalize; owner-only unlock; all unlocks audited (when built)
- Hide over delete everywhere in UI

---

## 10. Testing — 📋 planned
Unit (Jest): `waitTime` (free chairs=0, remaining time, override), `colorFormula` (all 11 rules — excellent unit-test target), discount/tip math, permission checks. Integration (Supertest): endpoint auth, helper blocked from financials, locked transactions immutable. E2E (Playwright): walk-in → complete → finalize flow; day close with cleanup. **CV/letter claim tests only after they exist.**

## 11. CI/CD
Current: Vercel auto-deploy on push (build = `prisma generate && next build`). Planned: GitHub Actions running tests, blocking deploy on failure.

## 12. Monitoring & Backups — 📋 planned
Sentry, PostHog, UptimeRobot (free tiers). Neon automatic daily backups (verify restore); Cloudinary weekly export once images land. Nightly cron deletes unsaved AI results past 30 days (results only — inputs never existed).

## 13. Cost (monthly, current → full)
Now: $0. Full build: Replicate ~$1–3 (admin-only usage), Claude API ~$1–2, domain ~$1 → **~$3–6/mo**, all hard-capped.

---

## 14. Build Order (remaining)
1. **Formula calculator** — `src/lib/colorFormula.js` (11 rules) → `/admin/color-tool` page → (optional) Claude API explanation layer
2. Navbar grouping; public queue 30s polling
3. Client profiles (`/admin/clients`): list + search → profile page → hair profile → per-client formula history (integrate calculator)
4. Transactions/POS: `pending_payment` status, two-step close, transaction lock, tips + splits — all in `prisma.$transaction`
5. Dashboard (today's stats) + reconciliation + overnight cleanup
6. Roles: `clerkId` on Staff, permission constants, `requireOwner()` data-layer checks, admin layout gate — **then** create helper + mom accounts (phone/SMS login for mom)
7. Cloudinary + portfolio management (mom uploads, 3-layer validation)
8. AI try-on (admin consultation tool) + nightly expiry cron
9. Audit logs + full soft-delete middleware
10. i18n EN/AR/ES (RTL) · static FAQ or chatbot decision
11. Tests (start with `colorFormula` + `waitTime` units) → GitHub Actions pipeline
12. Monitoring, domain, backup-restore drill

---

## 15. Working Agreements
- One feature per session, from a clean git commit; plan approved before code; diff reviewed and tested by George before committing
- Read actual files before editing — never assume contents (multiple bugs were caused/found this way)
- Newest ≠ best: pin stable versions (Prisma 6 lesson)
- Build simple end-to-end first, then upgrade (queue → real algorithm pattern)
- Mom-friendly standard on every admin surface, no exceptions
- CV/letter claims: past tense only for what exists; "designing/architected/in development" for the rest

---
*Version 5.0 — July 2026. Supersedes v4.0 (May 2026). §8b and v4 §§9–21 remain the target spec where not contradicted above.*
