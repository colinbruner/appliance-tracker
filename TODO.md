# Future Improvements

## v2.0.0 — Home Management Platform

### Design Plan (from /plan-design-review, 2026-03-27)

**Scope:** Expand from appliance tracking to tracking ALL home items — assets (roof, windows, HVAC, appliances), one-time projects (renovations, landscaping, painting), and photo documentation. Recurring task scheduling, calendar integration, and household sharing are deferred to v3.0.0.

**Aesthetic direction:** Warm Utility — like Apple Home or Notion personal workspace. Not SaaS dashboard.

#### Information Architecture

- **Navigation:** Dashboard | Items | [+ Add] (bottom tab bar on mobile)
- **Routes:**
  - `/` — Dashboard (attention-first: stats, needs-attention, timeline, recent activity)
  - `/items` — Item list with category filter sidebar (chip bar on mobile)
  - `/items/[id]` — Item detail (photos, maintenance log, replacement plan)
  - `/items/new` — Add new item (quick-add wizard for first-time users)
  - `/items/[id]/edit` — Edit item
  - `/callback` — Auth (existing)

#### Categories & Types

- **Appliances** (existing, 8 types, 9-16yr lifespans): Refrigerator, Washer, Dryer, Dishwasher, Oven/Range, Microwave, Freezer, Garbage Disposal
- **Structure & Exterior** (9 types, 15-30yr lifespans): Roof, Windows, Siding, Deck/Patio, Driveway, Fencing, Garage Door, Front Door, Gutters
- **Home Systems** (7 types, 11-40yr lifespans): HVAC/AC, Furnace, Heat Pump, Water Heater, Electrical Panel, Plumbing, Septic
- **Projects** (6 types, no lifespan — completion-based): Renovation, Landscaping, Painting, Repair, Improvement, Custom

#### Dashboard Content Hierarchy

1. **Stats row** — Total Items | Needs Attention | Due Within 1yr | Total Invested ($)
2. **Needs Attention** — Overdue/critical items sorted by urgency, click to detail. When all clear: positive reinforcement ("All 12 items are in good shape. Next up: Water Heater — 8 months")
3. **Timeline** — Chart.js horizontal bars for ALL categories with filter chips (All | Appliances | Structure | Systems)
4. **Recent Activity** — Last 10 maintenance log entries across all items

#### Item Detail Page (/items/[id])

Universal layout with adaptive sections:
1. Header (category icon, name, status pill, edit/delete)
2. Photo gallery (thumbnails, expand, upload; projects: before/after tagging)
3. Key details (adaptive: assets get purchase info + lifespan; projects get start/completion date + cost)
4. Lifecycle progress bar (assets only)
5. Maintenance log (chronological entries with date, description, cost, optional photo)
6. Replacement plan (assets only — target brand/model, estimated cost, store URL)
7. Notes

#### Project Lifecycle

- **Active** (default): blue "In Progress" pill, shows start date + estimated cost
- **Completing** (form): completion date, final cost, add "after" photos, notes
- **Completed**: green "Completed" pill with checkmark, before/after photos side by side

#### First-Time User Experience

Guided onboarding flow:
1. Welcome screen: "Let's track your home." + "Start with something big"
2. Quick-add wizard: Pick category → Pick type → When did you get it? → Optional photo
3. Dashboard empty sections show warm CTAs inviting more items

#### Photo System

- Storage: Supabase Storage bucket ("item-photos"), RLS per user
- Compression: Client-side via canvas API, 1200px max dimension, JPEG 80% quality (~200KB/photo)
- Limits: Max 5MB upload, max 20 photos per item
- EXIF strip: all photos run through exifr (or similar) before upload to remove GPS coordinates and device metadata. Privacy requirement, especially for public product.
- UX: Upload progress bar, compression spinner, "Photo saved" toast

#### Responsive Design

- **Mobile (< 640px):** Bottom tab bar nav, horizontal chip filter, single-column cards, horizontal scroll photo strip, full-screen form sheets
- **Tablet (640-1023px):** Horizontal nav, sidebar filter + 2-column cards, single-column detail
- **Desktop (>= 1024px):** Horizontal nav, sidebar filter + 3-column cards, two-column detail (photos left, info right)

#### Accessibility

- Keyboard navigation with visible focus rings (3px offset)
- ARIA landmarks (nav, main, complementary)
- All icon-only buttons have ARIA labels
- 44px minimum touch targets
- WCAG AA color contrast (4.5:1 text, 3:1 large)
- Respect prefers-reduced-motion
- Auto-generated image alt text from item name

#### Database Schema (v2)

Three new tables: `items` (replaces `appliances`), `item_photos`, `maintenance_log`. Data migration from existing `appliances` table with `category = 'appliances'`.

#### URL Routing

History API with SPA fallback (clean URLs: /items/abc-123).

#### Naming

Rename from "Appliance Tracker" to a broader name (HomeBase, HomeLog, HomeTrack, etc.). Exact name depends on domain availability. Considering custom domain for public availability.

### v2.0.0 Engineering Decisions (/plan-eng-review, 2026-03-27)

**Architecture:**
- Extract Supabase client to `lib/supabase.js` (shared singleton, all modules import from it)
- Auth guard in `+layout.svelte` (standard SvelteKit pattern, all routes get auth for free)
- Self-contained `PhotoUpload.svelte` with inline compression + upload + progress
- Photo storage paths: `{user_id}/{item_id}/{uuid}.jpg` (unguessable, RLS-protected)
- Load all items once in layout store, share via store across routes (fine for <100 items)
- Lazy load photos on detail page, first-photo-only thumbnail on item cards
- Google Fonts with `display=swap` + `<link rel="preconnect" href="https://fonts.googleapis.com">`
- Projects on timeline: start → completion bar (or start → today with dashed end if active)
- Maintenance log: inline add form on item detail page (collapsible, not a modal)

**Schema:**
- Single `items` table with nullable category-specific columns (replaces `appliances`)
- Keep `replacement_plan` as JSONB on items row (1:1, rarely queried independently)
- Add `updated_at` column with auto-update trigger (needed for dashboard "Recent Activity")
- `item_photos` and `maintenance_log` as separate tables (1:many)
- SQL migration does all data migration atomically (INSERT INTO items SELECT FROM appliances)

**Code quality:**
- Single `itemTypes.js` with category field (flat array, ~30 entries)
- Single `getItemStatus()` function with category-aware branching (assets: lifespan, projects: active/completed)
- `STATUS_META` uses CSS variable names (`--status-good`), not hex values (single source of truth in DESIGN.md)
- Sample data extracted to `lib/data/sampleItems.js` (keep store clean)
- Toast notifications for all Supabase write failures (optimistic UI + user feedback)
- Check token expiry before mutations, attempt silent refresh, fallback to re-login modal

**Testing:**
- Vitest for unit tests. 30 code paths identified. All required at ship time.
- No E2E framework in v2 scope (deferred to v2.5 if needed)

### v2.0.0 TODOs

- [x] **Create DESIGN.md** — /design-consultation completed 2026-03-27. Warm Utility direction, Instrument Serif + DM Sans, sage green primary, earth-tone categories.
- [x] **Run /plan-eng-review** — completed 2026-03-27. Architecture, schema, test coverage, failure modes all reviewed. Eng decisions documented above.
- [x] **Run /plan-ceo-review** — completed 2026-03-28. Selective expansion mode. 3 cherry-picks accepted (bulk quick-add, cost summary, PDF export). 7 items deferred. Outside voice identified auth strategy gap (Pocket ID vs public auth). 5 critical edge case gaps documented.
- [ ] **Upgrade SvelteKit 1 → 2 + Svelte 4 → 5** — building v2 on deprecated framework versions creates compounding tech debt. App is 2500 LOC, upgrade cost is low now. **Must be first step.** Depends on: nothing.
- [ ] **Set up Vitest test infrastructure** — zero tests exist. Add vitest, @testing-library/svelte, jsdom. Create test directory, vitest.config. Write tests for existing v1 utils (getApplianceStatus, formatters). Depends on: SvelteKit upgrade.
- [ ] **Verify Supabase Storage RLS with Pocket ID JWTs** — Storage uses auth.uid() for RLS, current auth uses Pocket ID OIDC tokens via accessToken. Need to verify Storage recognizes these tokens. If not, photo architecture must change. Quick spike: create test bucket, try upload. **Blocks photo system implementation.** Depends on: nothing, can do in parallel.
- [ ] **Add silent token renewal to OIDC auth** — current auth has no refresh mechanism. Token expiry causes silent Supabase failures. Add /silent-renew callback page, configure silent_redirect_uri, enable automaticSilentRenew. Fixes a v1 bug too. Depends on: nothing.
- [ ] **Choose app name + acquire domain** — research domain availability for candidate names, register. Can happen in parallel with development.
- [ ] **Write v2 Supabase migration** — new `items` (with `updated_at` + auto-update trigger), `item_photos`, `maintenance_log` tables + data migration from `appliances` (category='appliances'). Schema finalized in eng review above.
- [ ] **Set up Supabase Storage** — create "item-photos" bucket, RLS policies (user_id folder scoping), max 5MB file size. Depends on: Storage RLS verification above.
- [ ] **Bulk quick-add** — after saving a new item, show "Add another?" with same category and type pre-filled from the item just saved. Reduces friction for power-entry sessions. Ships in R2. Depends on: item form implementation.
- [ ] **Cost summary by category** — per-category cost breakdown (purchase price) on dashboard stats section. Ships in R2. Depends on: items store with category field.
- [ ] **Export to PDF** — one-page home report with items, status, dates, thumbnail photos. Uses pdf-lib (pure JS, no server). Photos embedded as base64 from Supabase Storage signed URLs. Max 1 thumbnail per item. Fallback: photo column omitted if no photos exist. Ships in R4 after maintenance log. Depends on: items store, photo system (R3).

### NOT in scope (v2.0.0)

- **E2E testing (Playwright/Cypress)** — unit tests via Vitest cover code paths. E2E deferred to v2.5 once the app has real users to justify the maintenance cost.
- **Onboarding wizard** — warm empty states with CTAs are enough. A multi-step wizard is scope creep for an app with no users yet. Revisit when user feedback demands it.
- **Thumbnail generation** — compressed photos are already ~200KB. Separate thumbnails add upload complexity for marginal gain.
- **Optimistic update rollback** — toast on failure is sufficient. Full rollback (reverting store state on Supabase error) adds complexity. If this becomes a real problem, fix in a patch.
- **Offline support** — the app requires Supabase. No service worker, no IndexedDB cache. Users need internet.
- **Self-hosted fonts** — Google Fonts CDN with display=swap is fine for current audience. Self-hosting saves ~100ms but adds build complexity.
- **Separate replacement_plans table** — JSONB on items row is sufficient for 1:1 data.
- **Before/after photo tagging for projects** — deferred. Photos upload to the same gallery; manual ordering is enough.
- **HEIC format handling** — iOS Safari converts HEIC to JPEG on canvas draw. If this causes issues, add a conversion library in a patch.
- **Custom item types** — let users add types beyond the 30 built-in ones (solar panels, wine cellar, pool equipment). Schema addition + UI in add-item form. Deferred from CEO review cherry-pick (2026-03-28).
- **Auth migration to public auth provider** — Pocket ID is self-hosted OIDC, works for personal/family use. Public product would need Supabase Auth, Auth0, or Clerk for social login (Google/GitHub). Deferred until domain/public decision is final. Outside voice flagged this as the biggest strategic gap (2026-03-28).

### What already exists (reusable in v2)

| Existing Code | v2 Reuse |
|---|---|
| `appliances.js` store pattern (CRUD, Supabase client, `toRow`/`fromRow`) | Rename to `items.js`, extend with category fields, extract Supabase client to `lib/supabase.js` |
| `applianceUtils.js` (status calculation, formatters) | Rename to `itemUtils.js`, add project lifecycle branching to `getItemStatus()` |
| `applianceTypes.js` (type definitions + lifespans) | Rename to `itemTypes.js`, add 3 categories, same `{ type, category, avgLifespan }` shape |
| `auth.js` (OIDC flow, Pocket ID) | Unchanged except adding silent renew |
| `theme.js` (dark/light toggle with `data-theme`) | Unchanged, just swap CSS variable values in `+layout.svelte` |
| `Timeline.svelte` (Chart.js horizontal bars) | Add category filter chips, update colors to DESIGN.md, add project bar rendering |
| `ApplianceCard.svelte` (card layout with status pill, progress bar) | Evolve into `ItemCard.svelte` with category icon, photo thumbnail, adaptive sections |
| `ApplianceForm.svelte` (modal form with type picker) | Evolve into `ItemForm.svelte` with category picker, photo upload, adaptive fields |
| `+layout.svelte` (CSS variables, theme init) | Update CSS variables per DESIGN.md, add Google Fonts link, add auth guard, add nav |
| `svelte.config.js` (adapter-static with fallback) | Unchanged, SPA fallback already handles client-side routing |

### Worktree parallelization strategy

```
DEPENDENCY TABLE
═══════════════════════════════════════════════════════════
Step                        | Modules touched        | Depends on
----------------------------|------------------------|------------------
1. SvelteKit/Svelte upgrade | all config, all src/   | —
2. Vitest setup + v1 tests  | test/, package.json    | Step 1
3. Storage RLS spike        | (Supabase console)     | —
4. Silent token renewal     | auth.js, callback/     | —
5. DB migration SQL         | supabase/migrations/   | —
6. Design system CSS swap   | +layout.svelte         | Step 1
7. Core: items store + types| lib/stores/, lib/data/ | Step 1
8. Core: routing + pages    | src/routes/            | Step 7
9. Photo system             | components/, store     | Steps 3, 7, 8
10. Maintenance log         | components/, store     | Steps 7, 8
═══════════════════════════════════════════════════════════

PARALLEL LANES
═══════════════════════════════════════════════════════════
Lane A (foundation): Step 1 → Step 2 → Step 6 → Step 7 → Step 8
Lane B (auth/infra):  Step 3 + Step 4 + Step 5 (all independent)
Lane C (features):    Step 9 + Step 10 (after Lane A completes)
═══════════════════════════════════════════════════════════

EXECUTION ORDER:
- Launch Lane A + Lane B in parallel
- Lane B is quick spikes (30min total), Lane A is the main track
- After Lane A step 8 completes, launch Lane C
- Steps 9 and 10 can run in parallel worktrees (no shared modules)
```

### Failure modes summary

| Codepath | Failure | Covered by test? | Error handling? | User sees |
|---|---|---|---|---|
| Items store → Supabase insert | Network timeout | Will be tested | Toast notification | Toast: "Failed to save" |
| Items store → Supabase update | RLS violation | Will be tested | Toast notification | Toast: "Failed to save" |
| Photo upload → Storage | File too large | Will be tested | Validation before upload | "File exceeds 5MB limit" |
| Photo upload → Storage | Auth expired | Will be tested | Token refresh + retry | Transparent or re-login modal |
| Photo compression → canvas | iOS memory limit | Will be tested | try/catch + toast | Toast: "Photo too large to process" |
| SPA routing → unknown path | User types /foo | Not tested | adapter-static fallback | Redirects to dashboard |
| Data migration SQL | Schema mismatch | Manual verification | Supabase CLI rollback | Migration fails safely |
| Token expiry mid-session | OIDC token expired | Will be tested | Silent refresh attempt | Transparent or re-login modal |

**Critical gaps addressed:** canvas compression try/catch (added to plan), token refresh infrastructure (added as TODO).

**CEO review edge cases (2026-03-28):**
- Double-click submit prevention: disable form submit button after first click, re-enable on response
- 0-byte file upload check: validate `file.size > 0` before compression
- Maintenance log future date: validate `date <= today`
- Delete item cascades Storage photos: when deleting an item, also delete its photos from Supabase Storage bucket
- PDF generation memory cap: cap at 50 items per page, try/catch around pdf-lib generation with toast fallback
- Storage bucket missing: catch StorageError specifically, toast "Photo upload unavailable"
- Silent renew iframe blocked: configure popup fallback for browsers that block third-party iframes

### v2.5+ Candidates (from CEO review, 2026-03-28)

- **Custom item types** — let users create item types beyond the 30 built-in ones with name + optional lifespan. Turns HomeBase from "our categories" into "your home."
- **Sentry error reporting** — free tier covers 5K errors/month. Add when custom domain ships and real users arrive.
- **Import from receipt/photo** — when adding an item, snap a photo of the receipt/label. Auto-attach photo, pre-fill purchase date with today. 30min win.
- **URL preview for replacement plan links** — fetch page title from store URL and show as a link label instead of raw URL. Small polish, feels premium.
- **Seasonal awareness on dashboard** — "Needs Attention" section notes seasonality: "Furnace filter, fall is coming." Requires `season_relevance` field on item types.
- **Auth migration for public product** — if going public, migrate from Pocket ID (self-hosted OIDC) to Supabase Auth or similar for social login support. Strategic decision that determines user model.

## v3.0.0+ (Deferred)

- **Recurring task scheduling** — "mow lawn every 2 weeks", "change HVAC filter every 3 months" (different UX pattern, calendar, not timeline)
- **Email alerts** — proactive notifications when items enter "replace soon" or "overdue" windows
- **Household sharing** — multiple users, shared item lists, permission model
- **Calendar/reminder integration** — push notifications, calendar sync
- **Export/import** — CSV, JSON bulk operations
- **E2E testing** — Playwright or Cypress once app has real users

## Infrastructure

- **Terraform** — codify Supabase project provisioning and Pocket ID third-party auth configuration

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | CLEAR | 4 proposals, 3 accepted, 1 deferred. Mode: SELECTIVE EXPANSION. 5 critical edge case gaps documented. |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | CLEAR (PLAN) | 15 issues, 0 critical gaps. Architecture, schema, tests, performance reviewed. |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | ISSUES (FULL) | score: ?/10 -> 8/10, 12 decisions made. |

- **UNRESOLVED:** 0 across all reviews
- **VERDICT:** CEO + ENG CLEARED — ready to implement. Design review may be stale (1 commit since review).
