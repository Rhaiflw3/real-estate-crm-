# BUG LEDGER — Real Estate CRM

> **Date Created:** 2026-05-14
> **Source:** Architecture Audit based on `PROJECT_PROGRESS.md` and codebase verification.

This document serves as the master ledger for tracking active bugs, configuration errors, and missing critical architecture in the current prototype.

---

## 1. Active Bugs & Configuration Errors

| ID | Issue | Location | Severity | Root Cause |
|---|---|---|---|---|
| **B-001** | `components.json` Alias Misconfiguration | `components.json` | High | Paths are defined with the prefix `asr@/` (e.g., `"components": "asr@/components"`) instead of the standard `@/`. This blocks the `shadcn` CLI from scaffolding new UI components correctly. |
| **B-002** | Navigation 404s (Properties/Calendar) | `src/lib/constants/navigation.ts` | Moderate | The navigation items map to `/dashboard/properties` and `/dashboard/calendar`, but those page files do not exist in the `src/app` directory. |
| **B-003** | Inconsistent UX Feedback in AddLeadDialog | `src/components/leads/AddLeadDialog.tsx` | Low | Form submission uses browser-native `alert()` instead of leveraging the already-implemented custom `useToast` hook. |
| **B-004** | AI Input Local State Not Updating | `src/app/dashboard/leads/page.tsx` | Moderate | The `simulateAIInput` handler pushes the new lead to the API but does not update the local state array, forcing a hard refresh to see the new lead. |
| **B-005** | Hardcoded Phone Number in Drawer | `src/components/layout/LeadDetailDrawer.tsx` | Low | The phone field displays a hardcoded string instead of utilizing the `lead.phone` property. |

---

## 2. Missing Critical Architecture

| ID | Component | Status / Root Cause | Priority |
|---|---|---|---|
| **A-001** | **Database Persistence Layer** | `prisma` and `@supabase/supabase-js` are completely missing from dependencies. Operations rely purely on mock in-memory stores that reset on server restart. | Critical |
| **A-002** | **Authentication System** | No user sessions, login pages, or route protection. NextAuth/Supabase Auth is missing. | Critical |
| **A-003** | **Full CRUD API** | `/api/leads/route.ts` only supports `GET` and `POST`. Missing endpoints for `PUT`/`PATCH` (edit) and `DELETE`. | High |
| **A-004** | **Dashboard Analytics Data** | The `recharts` package is installed but unused. Dashboard metric cards display static, hardcoded numbers instead of real API data. | Medium |
| **A-005** | **Properties & Calendar Views** | Routes defined in navigation but completely unbuilt. | Medium |

---

## 3. Priority Action Plan

### Tier 1: System Blockers & Architecture
- [ ] **Fix B-001**: Update `components.json` aliases (`asr@/` → `@/`) to unblock UI development.
- [ ] **Resolve A-001**: Install DB dependencies (`@supabase/supabase-js`, `prisma`, `@prisma/client`), configure `.env`, push schema, and replace mock logic in `src/lib`.

### Tier 2: UX & Application Flow
- [ ] **Fix B-002**: Comment out "Properties" and "Calendar" entries in navigation, or scaffold temporary placeholder pages to prevent 404 crashes.
- [ ] **Resolve A-003**: Extend `/api/leads/route.ts` with `PUT` and `DELETE` methods.
- [ ] **Fix B-004**: Update `simulateAIInput` in leads page to append the API response to the local `leads` state.

### Tier 3: Polish & Technical Debt
- [ ] **Fix B-003**: Refactor `AddLeadDialog.tsx` to replace `alert()` with `useToast()`.
- [ ] **Fix B-005**: Display dynamic `lead.phone` inside `LeadDetailDrawer.tsx`.
- [ ] **Resolve A-004**: Connect Dashboard metric cards to real API data and optionally implement `recharts` visuals.
