# Comprehensive Test Plan: Modular Recipe System

This document outlines the automated and manual test cases for the implementation backlog. Each section shows current status, automated coverage, and remaining manual/integration tests.

**Current Test Suite:** `80 tests passing` across 3 suites (as of Story 6 completion).

---

## ✅ Epic 1 & 2: Project Setup & Dashboard UI Shell

### Automated — `src/app/page.test.tsx`
| Test ID | Description | Status |
|---|---|---|
| TC-UI-01 | Renders recipe name from Redux store | ✅ Automated |
| TC-UI-02 | Renders recipe version name | ✅ Automated |
| TC-UI-03 | Renders Servings input with base yield value | ✅ Automated |
| TC-UI-04 | Renders all three section headings (Prep, Passive, Cook) | ✅ Automated |
| TC-UI-05 | Renders total/prep/rest/cook time breakdown header | ✅ Automated |
| TC-UI-06 | Renders Phase Ingredient accordions for Prep and Cook | ✅ Automated |
| TC-UI-07 | Renders a specific block name from mock data (Soaking) | ✅ Automated |
| TC-UI-08 | Renders atomic step text from mock data | ✅ Automated |
| TC-UI-09 | Renders Critical badges for isCritical steps | ✅ Automated |
| TC-UI-10 | Renders Optional badges for isOptional ingredients | ✅ Automated |
| TC-UI-11 | Ingredient override inputs are in the DOM (details is CSS-only) | ✅ Automated |
| TC-UI-12 | No ratio mismatch banner visible in initial state | ✅ Automated |

### Manual / Visual
| Test ID | Description | Type |
|---|---|---|
| TC-UI-M01 | Body background is `#121212`, text is high-contrast light grey | Visual |
| TC-UI-M02 | Desktop: two-column layout (Prep left, Cook right) | Visual |
| TC-UI-M03 | Mobile (≤768px): columns stack vertically | Visual |

---

## ✅ Epic 3 — Feature 3.1: Global Yield Scaling (Story 5)

### Automated — `src/lib/utils.test.ts` & `src/app/page.test.tsx`
| Test ID | Description | Status |
|---|---|---|
| TC-S5-01 | `calculateScaledQuantity`: doubles quantity when yield doubles | ✅ Automated |
| TC-S5-02 | `calculateScaledQuantity`: halves quantity when yield halves | ✅ Automated |
| TC-S5-03 | `calculateScaledQuantity`: no change when target equals base | ✅ Automated |
| TC-S5-04 | `calculateScaledQuantity`: non-integer ratio (4→6 = 1.5×) | ✅ Automated |
| TC-S5-05 | `calculateScaledQuantity`: scales from base yield of 1 | ✅ Automated |
| TC-S5-06 | `calculateScaledQuantity`: decimal base quantities | ✅ Automated |
| TC-S5-07 | `calculateScaledQuantity`: rounds to max 2 decimal places | ✅ Automated |
| TC-S5-08 | `calculateScaledQuantity`: no trailing zeros on whole numbers | ✅ Automated |
| TC-S5-09 | `calculateScaledQuantity`: returns 0 if baseYield is 0 (no divide-by-zero) | ✅ Automated |
| TC-S5-10 | `calculateScaledQuantity`: returns 0 if targetYield is 0 | ✅ Automated |
| TC-S5-11 | `calculateScaledQuantity`: returns 0 if baseQuantity is 0 | ✅ Automated |
| TC-S5-12 | `calculateScaledQuantity`: handles very large quantities | ✅ Automated |
| TC-S5-13 | `calculateScaledQuantity`: handles very small quantities (0.5g) | ✅ Automated |
| TC-S5-14 | `calculateScaledQuantity`: optional ingredients NOT scaled | ✅ Automated |
| TC-S5-15 | `calculateScaledQuantity`: optional ingredient safe even when targetYield=0 | ✅ Automated |
| TC-S5-16 | Yield input: updates value when user types | ✅ Automated |
| TC-S5-17 | Yield input: shows "(base: N)" hint when target ≠ base | ✅ Automated |
| TC-S5-18 | Yield input: no hint shown when target equals base | ✅ Automated |
| TC-S5-19 | Yield input: ignores 0 and invalid values | ✅ Automated |
| TC-S5-20 | Redux: `setTargetYield` updates state correctly | ✅ Automated |
| TC-S5-21 | Redux: `setTargetYield` with value 1 (minimum) | ✅ Automated |
| TC-S5-22 | Redux: `setTargetYield` with large value (100) | ✅ Automated |

---

## ✅ Epic 3 — Feature 3.1: Strict Ratio Group Validation (Story 6)

### Automated — `src/store/recipeSlice.test.ts` & `src/app/page.test.tsx`
| Test ID | Description | Status |
|---|---|---|
| TC-S6-01 | Redux: stores single ingredient override correctly | ✅ Automated |
| TC-S6-02 | Redux: stores multiple overrides independently | ✅ Automated |
| TC-S6-03 | Redux: overwrites previous override for same ingredient | ✅ Automated |
| TC-S6-04 | Redux: override of 0 is valid boundary | ✅ Automated |
| TC-S6-05 | Redux: no mismatch when only one group member is overridden | ✅ Automated |
| TC-S6-06 | Redux: flags mismatch for 1:1 strict group when broken | ✅ Automated |
| TC-S6-07 | Redux: mismatch contains correct expectedQuantities | ✅ Automated |
| TC-S6-08 | Redux: no mismatch when ratio is maintained | ✅ Automated |
| TC-S6-09 | Redux: non-strict groups never trigger mismatch | ✅ Automated |
| TC-S6-10 | Redux: can flag multiple mismatches simultaneously (multi-group) | ✅ Automated |
| TC-S6-11 | Redux: mismatch self-clears when user corrects override | ✅ Automated |
| TC-S6-12 | Redux: `autoScaleGroup` clears the mismatch | ✅ Automated |
| TC-S6-13 | Redux: `autoScaleGroup` corrects sibling quantity to maintain ratio | ✅ Automated |
| TC-S6-14 | Redux: `autoScaleGroup` with unknown groupId is a no-op | ✅ Automated |
| TC-S6-15 | Redux: `autoScaleGroup` only resolves targeted group, leaves others | ✅ Automated |
| TC-S6-16 | Redux: `confirmBreakRatio` dismisses the mismatch | ✅ Automated |
| TC-S6-17 | Redux: `confirmBreakRatio` preserves user override values | ✅ Automated |
| TC-S6-18 | Redux: `confirmBreakRatio` with unknown groupId is a no-op | ✅ Automated |
| TC-S6-19 | Redux: changing yield clears all overrides and mismatches | ✅ Automated |
| TC-S6-20 | UI: mismatch banner appears when strict ratio is broken | ✅ Automated |
| TC-S6-21 | UI: banner shows the affected group name | ✅ Automated |
| TC-S6-22 | UI: "Auto-scale Group" button is present | ✅ Automated |
| TC-S6-23 | UI: "Confirm Break" button is present | ✅ Automated |
| TC-S6-24 | UI: clicking "Auto-scale Group" dismisses the banner | ✅ Automated |
| TC-S6-25 | UI: clicking "Confirm Break" dismisses the banner | ✅ Automated |
| TC-S6-26 | UI: changing yield after a mismatch dismisses the banner | ✅ Automated |

---

## ✅ Utilities — `src/lib/utils.test.ts`

| Test ID | Description | Status |
|---|---|---|
| TC-UTIL-01 | `formatTime(0)` returns "0m" | ✅ Automated |
| TC-UTIL-02 | `formatTime` returns minutes only for values < 60 | ✅ Automated |
| TC-UTIL-03 | `formatTime` returns hours only for exact multiples of 60 | ✅ Automated |
| TC-UTIL-04 | `formatTime` returns hours + minutes for mixed values | ✅ Automated |
| TC-UTIL-05 | `formatIngredientName` strips `ing_` prefix | ✅ Automated |
| TC-UTIL-06 | `formatIngredientName` replaces underscores with spaces | ✅ Automated |
| TC-UTIL-07 | `formatIngredientName` title-cases every word | ✅ Automated |
| TC-UTIL-08 | `formatIngredientName` handles IDs without `ing_` prefix | ✅ Automated |
| TC-UTIL-09 | `getGlobalIngredients` returns empty array for empty blocks | ✅ Automated |
| TC-UTIL-10 | `getGlobalIngredients` aggregates same ingredient across blocks | ✅ Automated |
| TC-UTIL-11 | `getGlobalIngredients` keeps different units separate (no cross-unit math) | ✅ Automated |
| TC-UTIL-12 | `getGlobalIngredients` preserves `isOptional` flag | ✅ Automated |
| TC-UTIL-13 | `getGlobalIngredients` handles multiple blocks with multiple ingredients | ✅ Automated |

---

## ⏳ Epic 3 — Feature 3.2: Tolerance Sliders (Story 7)
| Test ID | Description | Type |
|---|---|---|
| TC-S7-01 | `setSpiceTolerance`: updates multiplier in Redux | ⏳ Partial (reducer tested, no UI) |
| TC-S7-02 | Slider at 150% scales only "spice" tagged ingredients | ⏳ Planned |
| TC-S7-03 | Standard ingredients unchanged when spice slider moves | ⏳ Planned |

---

## ⏳ Epic 4: Interactive Workflow & State Tracking (Stories 8–9)
| Test ID | Description | Type |
|---|---|---|
| TC-WF-01 | Checking a step updates the step's done state | ⏳ Planned |
| TC-WF-02 | Block progress bar shows correct percentage (1/4 = 25%) | ⏳ Planned |
| TC-WF-03 | `useTimer` hook: starts, pauses, resumes, resets correctly | ⏳ Planned |
| TC-WF-04 | Timer completion triggers alert/animation | ⏳ Planned |

---

## ⏳ Epic 5: Backend & Database Integration (Stories 15–16)
| Test ID | Description | Type |
|---|---|---|
| TC-BE-01 | MongoDB seed script connects and inserts without validation errors | ⏳ Planned |
| TC-BE-02 | `GET /api/recipes` returns HTTP 200 + valid JSON array | ⏳ Planned |
| TC-BE-03 | `POST /api/recipes` creates and persists a new recipe | ⏳ Planned |
| TC-BE-04 | Redux async thunk fetches live data and replaces mock state | ⏳ Planned |
