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
**Goal:** Mathematically sound scaling engine for global yields and strict ratio validation.

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

---

# 🏗 INITIATIVE 2: Recipe Authoring & Content Management (CMS)
**Goal:** Provide a sequential, step-by-step noter interface for chefs to input, structure, and edit modular recipes organized into three distinct phases: **Prep → Rest/Passive → Cooking**.

## Epic 4: Step-by-Step Recipe Noter
**Goal:** A sequential step entry UI organized into three cooking phases — no drag-and-drop; the noter adds steps in order, one at a time, within the correct phase.

### Feature 4.1: Three-Phase Recipe Structure
#### Story 7: Phase Tab Navigation & Step Entry ✅ [COMPLETED]
**Description:** Build the core noter interface with three distinct phase tabs (Prep, Rest/Passive, Cooking). The noter selects a phase, then adds steps sequentially within it.
**Tasks:**
- Task 1: Build phase tab bar UI (Prep Phase | Rest/Passive Phase | Cooking Phase) with active state styling.
- Task 2: Build the "Add Step" form — a single-line text input with an "Add" button that appends a new `AtomicStep` to the active phase's step list.
- Task 3: Display the ordered list of steps within each phase as numbered cards.
- Task 4: Allow inline editing of existing steps (click to edit, blur/enter to save).
- Task 5: Allow step deletion with confirmation.

#### Story 8: Step Metadata Entry ✅ [COMPLETED]
**Description:** Allow the noter to attach structured metadata to each step (duration, heat, criticality).
**Tasks:**
- Task 1: Build collapsible "Step Details" panel per step card (duration input, yield-dependent toggle).
- Task 2: Add heat/temperature hybrid input (Intensity dropdown: Low/Medium/High + optional precision °C field).
- Task 3: Add "Mark as Critical" toggle that visually flags the step with a warning style.

#### Story 9: Step Reordering Within Phase ✅ [COMPLETED]
**Description:** Allow the noter to reorder steps within a single phase using intuitive HTML5 Drag & Drop handles complemented by ↑ / ↓ arrow controls.
**Tasks:**
- Task 1: Add drag handle `⠿` and HTML5 drag & drop event handlers to step cards.
- Task 2: Add ↑ / ↓ arrow buttons on step cards.
- Task 3: Write Redux actions `reorderSteps`, `moveStepUp`, and `moveStepDown`.

### Feature 4.2: Block Management Within Phases
#### Story 10: Component Block Creation ✅ [COMPLETED]
**Description:** Within each phase, the noter can create named Component Blocks (e.g., "The Marinade", "The Tempering") to group related steps.
**Tasks:**
- Task 1: Build "Add Block" button within each phase tab.
- Task 2: Build block naming/renaming inline input.
- Task 3: Steps are added inside a specific block — display block → steps hierarchy.
- Task 4: Allow block deletion (warn if steps exist inside).

#### Story 10.1: Block Ingredient Authoring ⏳ [PLANNED]
**Description:** Allow authors to add, edit, and remove ingredients for each Component Block in the editor (quantity, unit, optional flag, and spice/sweet tags).
**Tasks:**
- Task 1: Build block ingredient form (Select from Master Registry, quantity, unit, optional toggle, tag buttons).
- Task 2: Display ingredient list within each block in the editor.
- Task 3: Write Redux actions `addBlockIngredient`, `updateBlockIngredient`, `removeBlockIngredient`.

#### Story 10.2: Recipe Equipment, Pairings & Version Metadata ⏳ [PLANNED]
**Description:** Allow authors to define required equipment, food pairings, and version metadata in the editor.
**Tasks:**
- Task 1: Build equipment checklist input (add/remove equipment items).
- Task 2: Build food pairings input (add/remove pairings).
- Task 3: Build version details input (Version Name, Author).

### Feature 4.3: Step ↔ Ingredient Association
#### Story 11: Link Ingredients to Steps ⏳ [PLANNED]
**Description:** When writing a step, the noter can associate specific ingredients from the Master Registry to that step.
**Tasks:**
- Task 1: Build ingredient chip selector within each step's detail panel.
- Task 2: Show associated ingredients as inline chips/tags on the step card.
- Task 3: Redux logic to store `ingredientIds[]` on each `AtomicStep`.

### Feature 4.4: Relational Math Setup
#### Story 12: Ratio Group Builder ⏳ [PLANNED]
**Description:** Allow authors to bind ingredients into mathematical ratio groups.
**Tasks:**
- Task 1: UI to define ratio base (e.g., "1 part Rice : 0.5 part Dal").
- Task 2: Redux logic to generate `ratioGroups` schema arrays.

#### Story 12.1: Live Recipe Preview & Reader Sync ⏳ [PLANNED]
**Description:** Provide a "Live Preview" toggle in the editor that renders the active edited recipe in the exact Reader View format, and allow syncing edited recipes into the main recipe store.
**Tasks:**
- Task 1: Write `exportEditorToRecipe` mapper utility.
- Task 2: Add "Preview Recipe" toggle/modal in the Editor header.
- Task 3: Allow loading edited recipe directly into the Reader View.

---

## Epic 5: Smart Autocomplete Engine
**Goal:** Provide intelligent inline suggestions as the noter types step descriptions, powered by two sources: the recipe's Master Ingredient list and a built-in dictionary of common cooking terms.

### Feature 5.1: Ingredient Autocomplete
#### Story 13: Autocomplete from Master Ingredients ⏳ [PLANNED]
**Description:** As the noter types inside a step text input, suggest matching ingredient names from the recipe's Master Ingredient Registry.
**Tasks:**
- Task 1: Build autocomplete dropdown component (floating, keyboard-navigable, max 5 suggestions).
- Task 2: Implement fuzzy-match search against `masterIngredients[].defaultName` and translations.
- Task 3: On selection, insert the ingredient name into the step text and auto-associate the ingredient ID to the step.
- Task 4: Highlight matched ingredients in the step text with a distinct visual style (e.g., colored chip/underline).

### Feature 5.2: Cooking Term Autocomplete
#### Story 14: Built-in Cooking Terms Dictionary ⏳ [PLANNED]
**Description:** Suggest common cooking technique terms (frying, sauté, blanch, temper, fold, julienne, etc.) as the noter types.
**Tasks:**
- Task 1: Create a static dictionary of ~100 common cooking terms, organized by category (heat techniques, cutting techniques, mixing techniques, etc.).
- Task 2: Integrate cooking terms into the same autocomplete dropdown, visually distinguished from ingredient suggestions (e.g., different icon or label).
- Task 3: Allow the noter to add custom cooking terms to the dictionary.

### Feature 5.3: Unified Autocomplete UX
#### Story 15: Merged Suggestion Dropdown ⏳ [PLANNED]
**Description:** Combine ingredient and cooking term suggestions into a single, prioritized dropdown with clear visual grouping.
**Tasks:**
- Task 1: Design grouped dropdown sections: "🥘 Ingredients" and "🔥 Techniques" with section headers.
- Task 2: Implement trigger logic — autocomplete activates after typing 2+ characters.
- Task 3: Keyboard navigation (↑↓ to move, Enter/Tab to select, Esc to dismiss).
- Task 4: Mobile-friendly touch selection support.

---

## Epic 6: Master Ingredient Registry
**Goal:** A centralized database of ingredients to standardize units and translations, and to power the autocomplete engine.

### Feature 6.1: Centralized Dictionary
#### Story 16: Ingredient CRUD ⏳ [PLANNED]
**Description:** Administrative interface to manage the master ingredient list.
**Tasks:**
- Task 1: Form to add new ingredients (ID, default name).
- Task 2: List view with edit/delete capabilities.

#### Story 17: Conversions & Translations ⏳ [PLANNED]
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
#### Story 18: Mongoose Schemas & MongoDB ⏳ [PLANNED]
**Description:** Strict backend validation mapping to TypeScript interfaces.
**Tasks:**
- Task 1: Configure MongoDB URI and connection utility.
- Task 2: Build `Recipe`, `Ingredient`, and `User` Mongoose models.

### Feature 7.2: Data Access Layer
#### Story 19: RESTful Next.js Route Handlers ⏳ [PLANNED]
**Description:** Standard API for frontend consumption.
**Tasks:**
- Task 1: Build `GET /api/recipes`.
- Task 2: Build `POST /api/recipes`.

## Epic 8: Authentication & Profiles
**Goal:** Secure user accounts and personalized settings.

### Feature 8.1: Auth System
#### Story 20: User Authentication ⏳ [PLANNED]
**Description:** NextAuth integration for login/signup.
**Tasks:**
- Task 1: Setup NextAuth with Google/Email providers.
- Task 2: Protect `/editor` routes with auth middleware.

### Feature 8.2: Personalization
#### Story 21: Favorites & Notes ⏳ [PLANNED]
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
#### Story 22: Voice Command Navigation ⏳ [PLANNED]
**Description:** Use Web Speech API for basic workflow control.
**Tasks:**
- Task 1: Implement SpeechRecognition for "Next Step" command.
- Task 2: Implement "Start Timer" voice trigger.

## Epic 10: Smart Grocery Planning
**Goal:** Convert required recipe yields into shoppable lists.

### Feature 10.1: Dynamic Shopping Lists
#### Story 23: Aggregate Grocery List Generation ⏳ [PLANNED]
**Description:** Auto-generate a grocery list based on the active target yield.
**Tasks:**
- Task 1: Write logic to aggregate identical ingredients across blocks.
- Task 2: Build "Export to PDF/Notes" functionality.

---

# 🎮 INITIATIVE 5: Interactive Cooking Experience
**Goal:** Transform the static recipe into a live, gamified execution checklist with real-time feedback.

## Epic 11: Interactive Workflow & State Tracking
**Goal:** Let the cook check off steps and track block-level progress in real time.

### Feature 11.1: Cooking Progress
#### Story 24: Step Checkboxes & Progress Tracking ⏳ [PLANNED]
**Description:** Allow checking off atomic steps with live block progress bars.
**Tasks:**
- Task 1: Build checkbox UI and connect to `toggleStepCompletion` Redux action.
- Task 2: Calculate and display block-specific global progress bars.

### Feature 11.2: Built-in Timers
#### Story 25: Step Duration Timers ⏳ [PLANNED]
**Description:** Clickable timers for steps with defined durations.
**Tasks:**
- Task 1: Create a `useTimer` custom hook.
- Task 2: Build glowing visual progress ring UI.
- Task 3: Implement browser/audio alert on completion.

## Epic 12: Taste Profile Tuning
**Goal:** Let users independently adjust spice and sweetness tolerances without affecting global yield.

### Feature 12.1: Taste Profiles
#### Story 26: Tolerance Sliders (Spice/Sweetness) ⏳ [PLANNED]
**Description:** Slider inputs that linearly scale ingredients tagged with "spice" or "sweet".
**Tasks:**
- Task 1: Create a "Spice Level" UI slider (Low: 50%, High: 150%).
- Task 2: Write logic applying multiplier ONLY to tagged ingredients.

