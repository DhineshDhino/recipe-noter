# Agile Implementation Backlog

This document breaks down the Modular Recipe System into a comprehensive, long-term product roadmap using a strict Agile hierarchy: **Initiative -> Epic -> Feature -> Story -> Task**.

---

# 🚀 INITIATIVE 1: The Core Reader Experience
**Goal:** Deliver a flawless, mathematically sound, and interactive viewing experience for the end-user (the cook).

## Epic 1: Project Setup & Core Foundation
**Goal:** Establish the technical foundation and baseline design system.

### Feature 1.1: Project Foundation
#### Story 1: Initialize Framework & State Management ✅ [COMPLETED]
**Description:** Scaffold the Next.js project with Tailwind CSS configured for the "Modern Chef" theme, and set up Redux Toolkit.
**Tasks:**
- Task 1: Setup Next.js application & routing.
- Task 2: Configure Tailwind CSS for native Dark Mode (`#121212` background, `#FF6D00` accent).
- Task 3: Setup Redux Toolkit store and initialize with `mockRecipe`.

### Feature 1.2: Design System & Base Components
#### Story 2: Implement Typography & Base UI Components ✅ [COMPLETED]
**Description:** Create the core reusable UI components following the design theme.
**Tasks:**
- Task 1: Configure modern sans-serif font (Inter) and tabular fonts.
- Task 2: Build reusable `<BlockCard>` component.
- Task 3: Write component unit tests.

---

## Epic 2: The Dashboard UI Shell
**Goal:** Build the primary user interface separating offline prep from stove-side cooking.

### Feature 2.1: Multi-Column Dashboard
#### Story 3: Responsive Multi-Column Layout ✅ [COMPLETED]
**Description:** Build the main dashboard layout.
**Tasks:**
- Task 1: Implement desktop two-column CSS grid.
- Task 2: Implement mobile vertical stacking layout.

#### Story 4: Render Component Blocks & Atomic Steps ✅ [COMPLETED]
**Description:** Iterate through Redux state to render component blocks into the UI.
**Tasks:**
- Task 1: Render ingredient lists within block accordions.
- Task 2: Render atomic steps sequentially.
- Task 3: Implement warning styles for "Critical" steps.

### Feature 2.2: Dashboard UI Polish
#### Story 4.1: Total Time Header & Phase Split ✅ [COMPLETED]
**Description:** Display the overall total time required, split into phases.
**Tasks:**
- Task 1: Write useMemo math to calculate total time across blocks.
- Task 2: Build the UI header elements.

#### Story 4.2: Ingredient Accordions ✅ [COMPLETED]
**Description:** Add collapsible accordions to manage ingredient display.
**Tasks:**
- Task 1: Build a global accordion for overall phase ingredients.
- Task 2: Build local accordions inside specific blocks.

#### Story 4.3: Human-Readable Time Formatting ✅ [COMPLETED]
**Description:** Convert raw minute values into "Hours and Minutes".
**Tasks:**
- Task 1: Create `formatTime(mins)` pure function utility.
- Task 2: Apply formatting globally.

---

## Epic 3: Relational Ratio Engine
**Goal:** Mathematically sound scaling engine for global yields and specific taste tolerances.

### Feature 3.1: Yield & Scaling Engine
#### Story 5: Global Yield Scaling ✅ [COMPLETED]
**Description:** Scale ingredient quantities globally based on a "Servings" input.
**Tasks:**
- Task 1: Add a global "Yield" input.
- Task 2: Write pure math function `calculateScaledQuantity`.
- Task 3: Add `setTargetYield` Redux action.
- Task 4: Connect scaling math to UI components.

#### Story 6: Strict Ratio Group Validation ✅ [COMPLETED]
**Description:** Enforce independent ratio math defined in the `ratioGroups` registry.
**Tasks:**
- Task 1: Create reducer to flag "Ratio Mismatch" on manual overrides.
- Task 2: Build UI prompt ("Auto-scale Group" vs "Confirm Break").
- Task 3: Implement dispatch actions for auto-scaling sister ingredients.

### Feature 3.2: Taste Profiles
#### Story 7: Tolerance Sliders (Spice/Sweetness) ⏳ [PLANNED]
**Description:** Slider inputs that linearly scale tagged ingredients.
**Tasks:**
- Task 1: Create a "Spice Level" UI slider.
- Task 2: Write logic applying multiplier ONLY to tagged ingredients.

---

## Epic 4: Interactive Workflow & State Tracking
**Goal:** Transform the static recipe into an interactive execution checklist.

### Feature 4.1: Cooking Progress
#### Story 8: Step Checkboxes & Progress Tracking ⏳ [PLANNED]
**Description:** Allow checking off atomic steps.
**Tasks:**
- Task 1: Build checkbox UI and connect to `toggleStepCompletion` Redux action.
- Task 2: Calculate and display block-specific global progress bars.

### Feature 4.2: Built-in Timers
#### Story 9: Step Duration Timers ⏳ [PLANNED]
**Description:** Clickable timers for steps with defined durations.
**Tasks:**
- Task 1: Create a `useTimer` custom hook.
- Task 2: Build glowing visual progress ring UI.
- Task 3: Implement browser/audio alert on completion.

---

# 🏗 INITIATIVE 2: Recipe Authoring & Content Management (CMS)
**Goal:** Provide a robust interface for chefs to input, structure, and edit complex modular recipes.

## Epic 5: Recipe Builder Workspace
**Goal:** A drag-and-drop UI to create recipes.

### Feature 5.1: Workflow Node Editor
#### Story 10: Component Block Management ⏳ [PLANNED]
**Description:** Interface to add, name, and order Prep/Passive/Cook blocks.
**Tasks:**
- Task 1: Build block creation UI.
- Task 2: Implement drag-and-drop reordering logic.

#### Story 11: Step & Ingredient Association ⏳ [PLANNED]
**Description:** Interface to add atomic steps and link specific ingredients.
**Tasks:**
- Task 1: Build text editor for step descriptions.
- Task 2: Implement dropdown to select ingredients from Master Registry.

### Feature 5.2: Relational Math Setup
#### Story 12: Ratio Group Builder ⏳ [PLANNED]
**Description:** Allow authors to bind ingredients into mathematical groups.
**Tasks:**
- Task 1: UI to define ratio base (e.g., "1 part Rice : 0.5 part Dal").
- Task 2: Redux logic to generate `ratioGroups` schema arrays.

---

## Epic 6: Master Ingredient Registry
**Goal:** A centralized database of ingredients to standardize units and translations.

### Feature 6.1: Centralized Dictionary
#### Story 13: Ingredient CRUD ⏳ [PLANNED]
**Description:** Administrative interface to manage the master ingredient list.
**Tasks:**
- Task 1: Form to add new ingredients (ID, default name).
- Task 2: List view with edit/delete capabilities.

#### Story 14: Conversions & Translations ⏳ [PLANNED]
**Description:** Store standard volume-to-weight conversions and multi-language support.
**Tasks:**
- Task 1: Implement volume-to-weight density ratios (e.g., 1 cup flour = 120g).
- Task 2: Implement key-value map for localized translations (e.g., Tamil, Hindi).

---

# 💾 INITIATIVE 3: Data Persistence & User Ecosystem
**Goal:** Save data permanently, support user accounts, and serve APIs.

## Epic 7: Backend API & Database
**Goal:** MongoDB schema setup and RESTful endpoints.

### Feature 7.1: Infrastructure & Schemas
#### Story 15: Mongoose Schemas & MongoDB ⏳ [PLANNED]
**Description:** Strict backend validation mapping to TypeScript interfaces.
**Tasks:**
- Task 1: Configure MongoDB URI and connection utility.
- Task 2: Build `Recipe`, `Ingredient`, and `User` Mongoose models.

### Feature 7.2: Data Access Layer
#### Story 16: RESTful Next.js Route Handlers ⏳ [PLANNED]
**Description:** Standard API for frontend consumption.
**Tasks:**
- Task 1: Build `GET /api/recipes`.
- Task 2: Build `POST /api/recipes`.

## Epic 8: Authentication & Profiles
**Goal:** Secure user accounts and personalized settings.

### Feature 8.1: Auth System
#### Story 17: User Authentication ⏳ [PLANNED]
**Description:** NextAuth integration for login/signup.
**Tasks:**
- Task 1: Setup NextAuth with Google/Email providers.
- Task 2: Protect `/editor` routes with auth middleware.

### Feature 8.2: Personalization
#### Story 18: Favorites & Notes ⏳ [PLANNED]
**Description:** Let users save recipes and add private cooking notes.
**Tasks:**
- Task 1: Build "Add to Favorites" toggle.
- Task 2: Build private note text area per recipe.

---

# 🌟 INITIATIVE 4: Advanced Culinary Features
**Goal:** Push the boundaries of traditional recipe applications with smart tech.

## Epic 9: Hands-Free Kitchen Mode
**Goal:** Allow users to cook without touching their devices with dirty hands.

### Feature 9.1: Voice Control
#### Story 19: Voice Command Navigation ⏳ [PLANNED]
**Description:** Use Web Speech API for basic workflow control.
**Tasks:**
- Task 1: Implement SpeechRecognition for "Next Step" command.
- Task 2: Implement "Start Timer" voice trigger.

## Epic 10: Smart Grocery Planning
**Goal:** Convert required recipe yields into shoppable lists.

### Feature 10.1: Dynamic Shopping Lists
#### Story 20: Aggregate Grocery List Generation ⏳ [PLANNED]
**Description:** Auto-generate a grocery list based on the active target yield.
**Tasks:**
- Task 1: Write logic to aggregate identical ingredients across blocks.
- Task 2: Build "Export to PDF/Notes" functionality.
