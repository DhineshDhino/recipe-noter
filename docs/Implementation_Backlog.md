# Agile Implementation Backlog

This document breaks down the Modular Recipe System into a comprehensive, long-term product roadmap using a strict Agile hierarchy: **Initiative -> Epic -> Feature -> Story -> Task**.

Every story is rated in terms of **[NECESSARY - MVP]** (critical for a complete, fully usable standalone MVP) versus **[FANCY - POST-MVP]** (enhanced AI/automation, advanced UI aids, or heavy infrastructure).

### 🗺️ Initiatives Overview & Status
| Initiative | Epics | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Initiative 1** | Epics 1, 2, 3 | 🚀 Core Reader Experience & Math Validation | ✅ `[COMPLETED]` (Stories 1–7) |
| **Initiative 2** | Epics 4, 5, 6 | ✍️ Recipe Noter Studio (CMS), Autocomplete & Media Bin | ✅ `[COMPLETED]` (Stories 8–17) |
| **Initiative 3** | Epics 7, 8 | 💾 Data Persistence, REST APIs, Profiles & Notes | ✅ `[COMPLETED]` (Stories 18–21) |
| **Initiative 4** | Epics 9, 10 | 🌟 Hands-Free Voice Control & Smart Grocery Aggregator | ✅ `[COMPLETED]` (Stories 22–23) |
| **Initiative 5** | Epics 11, 12 | 🎮 Interactive Focus Mode, Timers & Taste Profiler | ✅ `[COMPLETED]` (Stories 24–26) |
| **Initiative 6** | Epic 13 | 🎙️ Voice-to-Recipe AI Onboarding (Tamil Speech-to-Text) | ✅ `[COMPLETED]` (Stories 27–32) |
| **Initiative 7** | Epics 14, 15, 16, 17 | 🍽️ **"What to Cook" — Recommendation & Pantry Match Engine** | ✅ `[COMPLETED]` (Stories 33–39) |
| **Initiative 8** | Epics 18, 19, 20, 21 | 📓 **Cooking Try Journal, Google OAuth, Community & 3-Tier Scope** | ✅ `[COMPLETED]` (Stories 40–45) |
| **Initiative 9** | Epics 22, 23 | 🕒 **Universal 'Anytime' Slots, Popover Alignment & Unisex Avatars** | ✅ `[COMPLETED]` (Stories 46–48) |
| **Initiative 10** | Epics 24, 25, 26 | ⚡ **3-Tier Criticality System & Multilingual Localization Engine** | ✅ `[COMPLETED]` (Stories 49–51) |
| **Initiative 11** | Epics 27, 28 | 📌 **Stove-Side Sticky HUD & Collapsible Header System** | ⏳ `[PLANNED]` (Stories 52–54) |
| **Initiative 12** | Epics 29, 30 | 🌐 **Whole-Recipe Multilingual Localization & AI Translation Engine** | ⏳ `[PLANNED]` (Stories 55–58) |

---

# 🚀 INITIATIVE 1: The Core Reader Experience
**Goal:** Deliver a flawless, mathematically sound, and interactive viewing experience for the end-user (the cook).

## Epic 1: Project Setup & Core Foundation
**Goal:** Establish the technical foundation and baseline design system.

### Feature 1.1: Project Foundation
#### Story 1: Initialize Framework & State Management [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Scaffold the Next.js project with Tailwind CSS configured for the "Modern Chef" theme, and set up Redux Toolkit.
**Tasks:**
- Task 1: Setup Next.js application & routing.
- Task 2: Configure Tailwind CSS for native Dark Mode (`#121212` background, `#FF6D00` accent).
- Task 3: Setup Redux Toolkit store and initialize with `mockRecipe`.

### Feature 1.2: Design System & Base Components
#### Story 2: Implement Typography & Base UI Components [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Create the core reusable UI components following the design theme.
**Tasks:**
- Task 1: Configure modern sans-serif font (Inter) and tabular fonts.
- Task 2: Build reusable `<BlockCard>` component.
- Task 3: Write component unit tests.

---

## Epic 2: The Dashboard UI Shell
**Goal:** Build the primary user interface separating offline prep from stove-side cooking.

### Feature 2.1: Multi-Column Dashboard
#### Story 3: Responsive Multi-Column Layout [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Build the main dashboard layout.
**Tasks:**
- Task 1: Implement desktop two-column CSS grid.
- Task 2: Implement mobile vertical stacking layout.

#### Story 4: Render Component Blocks & Atomic Steps [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Iterate through Redux state to render component blocks into the UI.
**Tasks:**
- Task 1: Render ingredient lists within block accordions.
- Task 2: Render atomic steps sequentially.
- Task 3: Implement warning styles for "Critical" steps.

### Feature 2.2: Dashboard UI Polish
#### Story 4.1: Total Time Header & Phase Split [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Display the overall total time required, split into phases.
**Tasks:**
- Task 1: Write useMemo math to calculate total time across blocks.
- Task 2: Build the UI header elements.

#### Story 4.2: Ingredient Accordions [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Add collapsible accordions to manage ingredient display.
**Tasks:**
- Task 1: Build a global accordion for overall phase ingredients.
- Task 2: Build local accordions inside specific blocks.

#### Story 4.3: Human-Readable Time Formatting [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Convert raw minute values into "Hours and Minutes".
**Tasks:**
- Task 1: Create `formatTime(mins)` pure function utility.
- Task 2: Apply formatting globally.

---

## Epic 3: Relational Ratio Engine
**Goal:** Mathematically sound scaling engine for global yields and strict ratio validation.

### Feature 3.1: Yield & Scaling Engine
#### Story 5: Global Yield Scaling [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Scale ingredient quantities globally based on a "Servings" input.
**Tasks:**
- Task 1: Add a global "Yield" input.
- Task 2: Write pure math function `calculateScaledQuantity`.
- Task 3: Add `setTargetYield` Redux action.
- Task 4: Connect scaling math to UI components.

#### Story 6: Strict Ratio Group Validation [NECESSARY - MVP] ✅ [COMPLETED]
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
#### Story 7: Phase Tab Navigation & Step Entry [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Build the core noter interface with three distinct phase tabs (Prep, Rest/Passive, Cooking). The noter selects a phase, then adds steps sequentially within it.
**Tasks:**
- Task 1: Build phase tab bar UI (Prep Phase | Rest/Passive Phase | Cooking Phase) with active state styling.
- Task 2: Build the "Add Step" form — a single-line text input with an "Add" button that appends a new `AtomicStep` to the active phase's step list.
- Task 3: Display the ordered list of steps within each phase as numbered cards.
- Task 4: Allow inline editing of existing steps (click to edit, blur/enter to save).
- Task 5: Allow step deletion with confirmation.

#### Story 8: Step Metadata Entry [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow the noter to attach structured metadata to each step (duration, heat, criticality), and control whether the duration scales with recipe servings (yield).
**Tasks:**
- Task 1: Build collapsible "Step Details" panel per step card (duration input, yield-dependent toggle).
- Task 2: Add heat/temperature hybrid input (Intensity dropdown: Low/Medium/High + optional precision °C field).
- Task 3: Add "Mark as Critical" toggle that visually flags the step with a warning style.
- Task 4: Connect yield-dependent duration scaling to the Reader View so step timers and block times scale with servings.

#### Story 8.1: Step Visual Media & Stage Guidance [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Enable recipe authors to attach reference photos to steps and configure whether each photo shows the process in action (**While Cooking 👨‍🍳**) or the finished target outcome (**After Step ✨**). Render visual reference cards stove-side with a lightbox modal.
**Tasks:**
- Task 1: Update `AtomicStep` and `EditableStep` schemas with `StepImage` and `StepImageStage` (`'while_cooking' | 'after_step'`).
- Task 2: Build Redux reducers (`addStepImage`, `removeStepImage`, `updateStepImage`) and export mapper.
- Task 3: Build step image manager in the Editor with URL input, presets, caption, and stage selector.
- Task 4: Build stove-side visual reference cards with stage badges and click-to-zoom Lightbox modal in Reader view.

#### Story 8.2: Centralized Recipe Media Pool & Step Assignment [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow authors to batch upload/dump all recipe cooking photos at once in the **Setup Phase** into a centralized **Media Bin (Photo Pool)**, and seamlessly drag & drop or pick photos from the pool into steps across Prep, Rest, and Cooking phases.
**Tasks:**
- Task 1: Create `PoolPhoto` schema and Redux reducers (`addPhotosToPool`, `removePhotoFromPool`, `updatePoolPhoto`) in `editorSlice`.
- Task 2: Build `MediaPoolManager` component with multi-file dropzone (`FileReader`), batch URL pasting, culinary presets, and usage indicators (`📌 Assigned` vs `⚡ Unassigned`).
- Task 3: Embed draggable quick Media Bin strip in step authoring phases.
- Task 4: Add 1-click "Pick from Media Bin" drawer and HTML5 drop target to `StepCard` and `AddStepForm`.

#### Story 9: Step Reordering Within Phase [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow the noter to reorder steps within a single phase using intuitive HTML5 Drag & Drop handles complemented by ↑ / ↓ arrow controls.
**Tasks:**
- Task 1: Add drag handle `⠿` and HTML5 drag & drop event handlers to step cards.
- Task 2: Add ↑ / ↓ arrow buttons on step cards.
- Task 3: Write Redux actions `reorderSteps`, `moveStepUp`, and `moveStepDown`.

### Feature 4.2: Block Management Within Phases
#### Story 10: Component Block Creation [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Within each phase, the noter can create named Component Blocks (e.g., "The Marinade", "The Tempering") to group related steps.
**Tasks:**
- Task 1: Build "Add Block" button within each phase tab.
- Task 2: Build block naming/renaming inline input.
- Task 3: Steps are added inside a specific block — display block → steps hierarchy.
- Task 4: Allow block deletion (warn if steps exist inside).

#### Story 10.1: Block Ingredient Authoring [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow authors to add, edit, and remove ingredients for each Component Block in the editor (quantity, unit, optional flag, and spice/sweet tags).
**Tasks:**
- Task 1: Build block ingredient form (Select from Master Registry, quantity, unit, optional toggle, tag buttons).
- Task 2: Display ingredient list within each block in the editor.
- Task 3: Write Redux actions `addBlockIngredient`, `updateBlockIngredient`, `removeBlockIngredient`.

#### Story 10.2: Recipe Equipment, Pairings & Version Metadata [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow authors to define required equipment, food pairings, and version metadata in the editor.
**Tasks:**
- Task 1: Build equipment checklist input (add/remove equipment items).
- Task 2: Build food pairings input (add/remove pairings).
- Task 3: Build version details input (Version Name, Author).

#### Story 10.3: Editor Wizard Flow & Metadata Tab [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Improve the editor UI by introducing a "Next" button wizard flow and moving Recipe Metadata (Version, Equipment, Pairings) into its own dedicated setup tab instead of cluttering the header.
**Tasks:**
- Task 1: Add a "Setup" (Metadata) phase to the `PHASES` tabs and Redux state.
- Task 2: Move the `RecipeMetadataForm` into the new Setup tab panel.
- Task 3: Add a "Next Phase" / "Previous Phase" navigation button below the active phase panel to allow stepping through (Setup -> Prep -> Rest -> Cook).

### Feature 4.3: Step ↔ Ingredient Association
#### Story 11: Link Ingredients to Steps [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** When writing a step, the noter can associate specific ingredients from the Master Registry to that step.
**Tasks:**
- Task 1: Build ingredient chip selector within each step's detail panel.
- Task 2: Show associated ingredients as inline chips/tags on the step card.
- Task 3: Redux logic to store `ingredientIds[]` on each `AtomicStep`.

### Feature 4.4: Relational Math Setup
#### Story 12: Ratio Group Builder [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow authors to bind ingredients into mathematical ratio groups.
**Tasks:**
- Task 1: UI to define ratio base (e.g., "1 part Rice : 0.5 part Dal").
- Task 2: Redux logic to generate `ratioGroups` schema arrays.

#### Story 12.1: Live Recipe Preview & Reader Sync [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Provide a "Live Preview" modal in the editor that renders the active edited recipe in the exact Reader View format, and allow syncing edited recipes into the main recipe store.
**Tasks:**
- Task 1: Write `exportEditorToRecipe` mapper utility.
- Task 2: Add "Preview Recipe" toggle/modal in the Editor header.
- Task 3: Allow loading edited recipe directly into the Reader View with instant sync.

---

## Epic 5: Smart Autocomplete Engine
**Goal:** Provide intelligent inline suggestions as the noter types step descriptions, powered by two sources: the recipe's Master Ingredient list and a built-in dictionary of common cooking terms.

### Feature 5.1: Ingredient Autocomplete
#### Story 13: Autocomplete from Master Ingredients [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** As the noter types in a step description, an autocomplete dropdown suggests matching ingredients from the Master Ingredient list.
**Tasks:**
- Task 1: Build autocomplete dropdown component (floating, keyboard-navigable, max 5 suggestions).
- Task 2: Implement fuzzy-match search against `masterIngredients[].defaultName` and translations.
- Task 3: On selection, insert the ingredient name into the step text and auto-associate the ingredient ID to the step.
- Task 4: Highlight matched ingredients in the step text with a distinct visual style.

### Feature 5.2: Cooking Term Autocomplete
#### Story 14: Built-in Cooking Terms Dictionary [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Suggest common cooking technique terms (frying, sauté, blanch, temper, fold, julienne, etc.) as the noter types.
**Tasks:**
- Task 1: Create a static dictionary of ~100 common cooking terms, organized by category.
- Task 2: Integrate cooking terms into autocomplete dropdown, visually distinguished from ingredients.
- Task 3: Allow the noter to add custom cooking terms to the dictionary.

### Feature 5.3: Unified Autocomplete UX
#### Story 15: Merged Suggestion Dropdown [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Combine ingredient and cooking term suggestions into a single, prioritized dropdown with clear visual grouping.
**Tasks:**
- Task 1: Design grouped dropdown sections: "🥘 Ingredients" and "🔥 Techniques" with section headers.
- Task 2: Implement trigger logic — autocomplete activates after typing 2+ characters.
- Task 3: Keyboard navigation (↑↓ to move, Enter/Tab to select, Esc to dismiss).
- Task 4: Mobile-friendly touch selection support.

---

## Epic 6: Master Ingredient Registry
**Goal:** A centralized database of ingredients to standardize units and translations, and to power the recipe authoring flow.

### Feature 6.1: Centralized Dictionary & Management
#### Story 16: Ingredient CRUD & Dynamic Management [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Interface to dynamically manage the recipe's master ingredient list (add custom ingredients with Tamil/Hindi translations, edit, delete).
**Tasks:**
- Task 1: Add `masterIngredients` to Editor Redux state with rich default pantry items.
- Task 2: Form to add new ingredients (ID, default name, localized translations like Tamil/Hindi).
- Task 3: List view in Setup tab with edit/delete capabilities and dynamic linking in block ingredients.

#### Story 17: Conversions & Translations Engine [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Store standard volume-to-weight conversions and advanced multi-language translation dictionary.
**Tasks:**
- Task 1: Implement volume-to-weight density ratios (e.g., 1 cup flour = 120g).
- Task 2: Implement dynamic key-value map for localized translations (e.g., Tamil, Hindi).

---

# 💾 INITIATIVE 3: Data Persistence & User Ecosystem
**Goal:** Save data permanently, support user accounts, and serve APIs.

## Epic 7: Backend API & Database
**Goal:** MongoDB schema setup and RESTful endpoints.

### Feature 7.1: Infrastructure & Schemas
#### Story 18: Mongoose Schemas & MongoDB [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Strict backend validation mapping to TypeScript interfaces.
**Tasks:**
- Task 1: Configure MongoDB URI and connection utility.
- Task 2: Build `Recipe`, `Ingredient`, and `User` Mongoose models.

### Feature 7.2: Data Access Layer
#### Story 19: RESTful Next.js Route Handlers [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Standard API for frontend consumption.
**Tasks:**
- Task 1: Build `GET /api/recipes`.
- Task 2: Build `POST /api/recipes`.

## Epic 8: Authentication & Profiles
**Goal:** Secure user accounts and personalized settings.

### Feature 8.1: Auth System
#### Story 20: User Authentication [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** NextAuth integration for login/signup.
**Tasks:**
- Task 1: Setup NextAuth with Google/Email providers.
- Task 2: Protect `/editor` routes with auth middleware.

### Feature 8.2: Personalization
#### Story 21: Favorites & Notes [FANCY - POST-MVP] ✅ [COMPLETED]
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
#### Story 22: Voice Command Navigation [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Use Web Speech API for basic workflow control.
**Tasks:**
- Task 1: Implement SpeechRecognition for "Next Step" command.
- Task 2: Implement "Start Timer" voice trigger.

## Epic 10: Smart Grocery Planning
**Goal:** Convert required recipe yields into shoppable lists.

### Feature 10.1: Dynamic Shopping Lists
#### Story 23: Aggregate Grocery List Generation [FANCY - POST-MVP] ✅ [COMPLETED]
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
#### Story 24: Step Checkboxes & Progress Tracking [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow checking off atomic steps with live block & global progress bars in Redux state.
**Tasks:**
- Task 1: Build checkbox UI and connect to `toggleStepCompleted` Redux action.
- Task 2: Calculate and display block-specific and overall recipe completion progress bars.
- Task 3: Provide a "Reset Progress" action for fresh cooking sessions.

#### Story 24.1: Step-by-Step Focus Cooking Mode [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** An immersive, distraction-free stove-side guided execution view launched via "🎯 Focus Mode". Presents one step at a time with large high-contrast typography, live step countdown timers, exact step ingredients, reference photos with stage tags, flexible navigation (Next without completing, Complete & Next, Mark Done toggle, and keyboard shortcuts `←`, `→`, `Space`, `Esc`), and a celebration completion screen.
**Tasks:**
- Task 1: Build `GuidedCookingModal` flattening all 3 phases (Prep, Passive, Cook) into ordered focus steps.
- Task 2: Implement integrated step countdown timer with dynamic duration yield scaling and audio chimes.
- Task 3: Display exact scaled ingredients for the active step/block.
- Task 4: Display reference photos with stage tags (While Cooking vs Expected Result) and lightbox preview.
- Task 5: Implement independent Next Step (browse without completing) and Complete & Next actions.
- Task 6: Add keyboard shortcuts (`ArrowRight` for Next, `Space`/`Enter` for Complete & Next, `ArrowLeft` for previous, `Escape` to exit).
- Task 7: Add cooking completion celebration screen with pairings and summary.

### Feature 11.2: Built-in Timers
#### Story 25: Step Duration Timers [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Clickable countdown timers for steps with defined durations, with audio and visual feedback.
**Tasks:**
- Task 1: Build interactive Step Timer controls (Start, Pause, Resume, Reset).
- Task 2: Build glowing visual countdown ring and timer display.
- Task 3: Implement Web Audio API chime sound & completion alert.

## Epic 12: Taste Profile Tuning
**Goal:** Let users independently adjust spice and sweetness tolerances without affecting global yield.

### Feature 12.1: Taste Profiles
#### Story 26: Tolerance Sliders (Spice/Sweetness) [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Interactive slider inputs that scale ingredients tagged with "spice" or "sweet" in real-time.
**Tasks:**
- Task 1: Create "Spice Level" and "Sweetness Level" UI sliders (50% to 200%).
- Task 2: Apply tolerance multipliers to tagged ingredients in scaling calculations.
- Task 3: Display visual taste badges (🌶️ / 🍯) next to scaled ingredients.

---

# 🎙️ INITIATIVE 6: Voice-to-Recipe AI Onboarding & Tamil Audio Parsing (Fancy)
**Goal:** Allow users to record or upload Tamil/Tanglish voice cooking notes and automatically convert them into structured modular recipes with human-in-the-loop validation and one-click editor population.

## Epic 13: Tamil Voice Note Ingestion & Assisted Recipe Extraction
**Goal:** End-to-end pipeline from Tamil voice recording to pre-filled Recipe Noter Editor form.

### Feature 13.1: Audio Ingestion & Capture
#### Story 27: Tamil Audio Upload & Microphone Recorder [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** In-app audio recorder and file uploader supporting Tamil voice notes (e.g. WhatsApp audio notes, `.m4a`, `.mp3`, `.wav`).
**Tasks:**
- Task 1: Build audio recording component with microphone permission handling, recording timer, and pause/stop controls.
- Task 2: Build audio file drag-and-drop uploader supporting common mobile voice memo formats.
- Task 3: Build compact audio player with waveform preview for playback during review.

#### Story 28: Tamil Speech-to-Text (STT) & Phonetic Transliteration Pipeline [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Transcribe Tamil speech into text with both Tamil Unicode script and English/Tanglish phonetic transliteration.
**Tasks:**
- Task 1: Connect to Whisper / Tamil Speech Recognition API service handler.
- Task 2: Generate dual-pane transcript (Original Tamil script + Romanized Tanglish).
- Task 3: Allow user to edit transcription text directly before sending to AI parser.

### Feature 13.2: AI Parsing & Modular Recipe Extraction
#### Story 29: AI Recipe Structure Extraction (Tamil/Tanglish -> Modular Recipe Schema) [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** LLM prompt pipeline that extracts recipe name, yield, equipment, ingredient amounts, phases (Prep, Rest, Cook), blocks, and atomic steps with duration/heat/criticality metadata.
**Tasks:**
- Task 1: Design structured JSON extraction schema prompt tailored to South Indian and Tamil culinary expressions (e.g., "தாளிப்பு" -> Tempering block, "ஊற வைக்கவும்" -> Rest/Soaking step, "வறுக்கவும்" -> Roast step).
- Task 2: Map Tamil ingredient names to Master Ingredient Registry (e.g. "பச்சை மிளகாய்" -> `ing_green_chilli`, "கடுகு" -> `ing_mustard_seeds`).
- Task 3: Extract implicit heat levels (e.g., "மிதமான தீ" -> Medium heat, "அதிக தீ" -> High heat) and step durations.

#### Story 30: Confidence Scoring & Ambiguity Highlighting [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Detect uncertain quantities, ambiguous time estimates, or untranslated ingredients, highlighting them for the human reviewer.
**Tasks:**
- Task 1: Highlight low-confidence parsed items in amber/yellow badges (e.g., "தேவையான அளவு உப்பு" -> "Salt to taste (as needed)").
- Task 2: Provide inline suggestion pills for ambiguous terms.

### Feature 13.3: Human-in-the-Loop Review & Editor Population
#### Story 31: Side-by-Side Audio & Transcript Review Interface [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Interactive human-in-the-loop review interface displaying original audio, synchronized transcript, and the extracted recipe draft side-by-side.
**Tasks:**
- Task 1: Build dual-column review modal: Left column shows audio player + transcript; Right column shows extracted recipe preview.
- Task 2: Allow the reviewer to edit, delete, or re-assign steps, blocks, and ingredients before accepting.
- Task 3: Provide "Accept Draft", "Re-parse Section", and "Cancel" buttons.

#### Story 32: Populate Editor Form & Final Review Confirmation [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Push the approved extracted recipe directly into the Recipe Noter Editor (`editorSlice`), populating all Setup, Prep, Rest, and Cook fields.
**Tasks:**
- Task 1: Write state hydrator dispatching `loadRecipeIntoEditor` with extracted data.
- Task 2: Seamlessly redirect the reviewer to `/editor` with their new recipe ready for final touches.
- Task 3: Display a success banner with option to test-cook immediately in the Reader View.

---

# 🍽️ INITIATIVE 7: "What to Cook" — Smart Culinary Recommendation & Pantry Match Engine
**Goal:** Answer the daily question *"What should I cook right now?"* by analyzing the time of day, active/passive time budgets, available pantry ingredients, "buy 1-2 missing items" gap calculations, hero ingredient filtering, and customizable scope (My Library vs Global Catalogue).

## Epic 14: Context & Time-Aware Meal Suggestions
**Goal:** Suggest recipes dynamically tailored to current time of day, circadian meal slots, and preparation/cooking time constraints.

### Feature 14.1: Time-of-Day & Meal Slot Intelligence
#### Story 33: Circadian Meal Slot Recommendation Engine [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Detect current local time and automatically suggest suitable recipes across meal slots (Breakfast, Lunch, Evening Snack/Tiffin, Dinner, Late Night), with manual slot override pills.
**Tasks:**
- Task 1: Build local time analyzer mapping hours to meal slots (`🌅 Breakfast [6-11 AM]`, `☀️ Lunch [11 AM-3 PM]`, `☕ Tea/Snack [3-7 PM]`, `🌙 Dinner [7-11 PM]`, `🌌 Late Night [11 PM-6 AM]`).
- Task 2: Tag recipes in registry with compatible meal slots (`mealSlots: ['breakfast', 'dinner']`).
- Task 3: Create one-click meal slot filter pill bar with live active slot highlighting.

### Feature 14.2: Time Budget & Phase Constraint Filtering
#### Story 34: Granular Phase Time Budget Sliders [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Filter recipes based on exact time constraints broken down into Active Prep, Passive Rest/Soaking, and Active Cooking.
**Tasks:**
- Task 1: Build dual slider / range input for Max Total Time, Max Active Cook Time, and Max Passive Rest Time.
- Task 2: Implement "Zero Rest Time" toggle (instantly filters out recipes requiring hours of soaking/fermenting like Idli/Adai when cooking on short notice).
- Task 3: Add quick-budget presets: `⚡ Under 15 Mins`, `⏱️ 30-Min Weeknight`, `🧘 Slow Weekend Project`.

---

## Epic 15: Pantry & Inventory Matcher ("Cook with What You Have")
**Goal:** Match available kitchen ingredients against recipe requirements, identify missing gaps, and surface "buy 1 or 2 items" opportunities.

### Feature 15.1: Pantry Inventory & Hero Ingredient Focus
#### Story 35: Pantry Multi-Select & "Hero Ingredient" Anchor [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow cooks to select the ingredients they currently have at home, or anchor recommendations around a primary "Hero Ingredient" they want to use up.
**Tasks:**
- Task 1: Build interactive Pantry Chip Selector with quick categories (Grains/Lentils, Vegetables, Dairy, Spices) and search.
- Task 2: Implement "Hero Ingredient" filter (e.g. "I want to cook with Paneer" or "Use up Raw Rice").
- Task 3: Save user's pantry state in local storage / Redux for zero-friction repeat visits.

### Feature 15.2: "Almost Ready / Buy 1-2 Items" Intelligence
#### Story 36: Missing Ingredient Gap & Quick-Buy Opportunity Radar [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Calculate pantry match percentage and highlight recipes where buying only 1 or 2 easily accessible ingredients unlocks the entire dish.
**Tasks:**
- Task 1: Compute match score: `(Available Ingredients / Total Required Ingredients) * 100`.
- Task 2: Classify missing ingredients into "Corner-Store Basics" (milk, eggs, curry leaves, coriander, ginger) vs "Specialty Ingredients".
- Task 3: Render prominent actionable cards: `"⚡ Buy 1 item (Curry Leaves) & cook this now!"` with 1-click "Add Missing Items to Grocery List" action.

---

## Epic 16: Scope & Deep Customization Filtering
**Goal:** Provide custom control over recipe sources (user library vs generic global catalogue), dietary preferences, and kitchen equipment.

### Feature 16.1: Discovery Source Toggle
#### Story 37: "My Cookbook Library" vs "Global Catalogue" Scope Switcher [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow cooks to toggle between searching only within their personal saved/authored recipes or exploring the broader global culinary catalogue.
**Tasks:**
- Task 1: Build Scope Switcher toggle: `📚 My Saved Library Only` vs `🌐 Global Recipe Catalogue`.
- Task 2: Filter recipe library state dynamically based on user auth/local recipe collection.
- Task 3: Provide a "Save to My Library" quick action on any global recipe match.

### Feature 16.2: Dietary, Equipment & Skill Tuning
#### Story 38: Deep Customization Matrix (Dietary, Equipment & Skill) [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Multi-dimensional filtering across dietary restrictions, available kitchen appliances, and cooking skill levels.
**Tasks:**
- Task 1: Add Dietary Filters (Vegetarian, Vegan, Gluten-Free, Jain / No Onion-Garlic, High-Protein).
- Task 2: Add Kitchen Equipment / Appliance Filters (Griddle/Tawa, Pressure Cooker, Instant Pot, Air Fryer, Mixer/Blender, Kadai/Wok).
- Task 3: Add Difficulty filter (Beginner, Intermediate, Master Chef).

---

## Epic 17: Interactive "What to Cook" Discovery Hub UI
**Goal:** Deliver a visually stunning, responsive discovery interface with real-time ranking and 1-click cooking launch.

### Feature 17.1: Discovery Portal & Interactive Decision Matrix
#### Story 39: "What 2 Cook" Portal UI (`/what-to-cook`) [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** A dedicated discovery view and interactive modal with visual criteria controls, real-time match rankings, missing ingredients pills, and instant launch into Focus Mode or Noter Studio.
**Tasks:**
- Task 1: Build `/what-to-cook` responsive route and modal accessible from top navigation bar.
- Task 2: Render ranked recommendation cards sorted by match percentage and contextual relevance.
- Task 3: Provide 1-click **"🎯 Start Cooking (Focus Mode)"** and **"📝 View in Noter"** action buttons.
- Task 4: Add "🎲 Surprise Me / Randomizer" button for indecisive moments.

---

# 📓 INITIATIVE 8: Cooking Try Journal, Google OAuth, Community & 3-Tier Scope
**Goal:** Empower cooks to record individual cooking iterations ("Tries & Tweaks") to track recipe evolution and taste outcomes, authenticate with Google/Gmail, participate in community recipe discussions, favorite community dishes, and search across a granular 3-tier scope (`My Authored`, `My Favorites`, `All Recipes`).

## Epic 18: Recipe Try Journal & Iterative Taste Enhancements ("Tries & Tweaks")
**Goal:** Provide an iterative cooking experiment log where cooks can record each attempt, the micro-tweaks made, and the resulting taste outcome.

### Feature 18.1: Cooking Attempt Logger & Sensory Feedback
#### Story 40: Cooking Try & Tweak Logger [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Enable cooks to log a new "Try" for a recipe, documenting specific ingredient/cooking tweaks, final photos, and sensory taste ratings.
**Tasks:**
- Task 1: Define `RecipeTry` interface (`id`, `recipeId`, `timestamp`, `yieldCooked`, `tweaksSummary`, `tasteNotes`, `rating`, `photos`, `authorId`).
- Task 2: Build `<RecipeTryModal>` to log a new attempt with micro-tweak diffs (e.g. `+10g Ginger`, `Reduced flame`, `Extra crispy`).
- Task 3: Render an expandable "Cooking Journey / Past Tries" timeline on the Recipe Reader View.

#### Story 41: Version Iteration Comparison & Taste Evolution [FANCY - POST-MVP] ✅ [COMPLETED]
**Description:** Side-by-side comparison of different cooking attempts to visualize how slight variations influenced the flavor profile.
**Tasks:**
- Task 1: Build comparative diff viewer highlighting changes in ingredient ratios vs taste scores across tries.
- Task 2: Allow 1-click promotion of a successful "Try" into a new official recipe version or overwrite active baseline.

---

## Epic 19: User Identity & Gmail / Google OAuth Authentication
**Goal:** Secure user identity and notebook data via Google/Gmail OAuth integration.

### Feature 19.1: Google Authentication & User Profile
#### Story 42: Google / Gmail OAuth Login & Profile State [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Seamless single-sign-on using Google OAuth for cloud recipe sync, personalized cooking notes, and author attribution.
**Tasks:**
- Task 1: Configure OAuth provider handler (NextAuth / Google OAuth 2.0).
- Task 2: Build `<AuthButton>` and `<UserProfileModal>` in the top navigation bar.
- Task 3: Sync user authored recipes, favorite bookmarks, and pantry inventory to user account in Redux and database.

---

## Epic 20: Community Discussions & Recipe Comments
**Goal:** Facilitate social learning where cooks can ask questions, share tips, and leave feedback on recipes.

### Feature 20.1: Recipe Comments & Cooking Discussions
#### Story 43: Community Comments & Cooking Tips Thread [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Dedicated discussion thread under each recipe for cooking questions, feedback, and substitute suggestions.
**Tasks:**
- Task 1: Define `RecipeComment` schema (`id`, `recipeId`, `authorName`, `authorAvatar`, `text`, `timestamp`, `likes`, `parentCommentId`).
- Task 2: Build `<RecipeDiscussionSection>` with comment authoring, replies, and helpfulness upvotes.
- Task 3: Integrate REST API handlers for `GET` and `POST /api/recipes/[id]/comments`.

#### Story 44: Universal Recipe Favoriting & Personal Collections [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Bookmark any recipe in the global catalogue into the user's personal favorites and curated collections.
**Tasks:**
- Task 1: Extend favorites system to differentiate between authored recipes and bookmarked community recipes.
- Task 2: Add one-click ❤️ favorite button across all recipe cards and reader headers.
- Task 3: Support custom tags/folders (e.g. "Sunday Brunch", "Quick 15-min Weeknights").

---

## Epic 21: Granular 3-Tier Search Scope for "What to Cook"
**Goal:** Refine the "What to Cook" recommendation engine to offer a 3-tier search scope.

### Feature 21.1: 3-Tier Search Scope Architecture
#### Story 45: 3-Tier Recommendation Scope (My Authored, My Favorites, All Recipes) [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Update the "What to Cook" matcher to support 3 distinct discovery tiers: 1) My Authored Recipes, 2) My Favorites (authored + bookmarked community recipes), and 3) All Recipes in the App.
**Tasks:**
- Task 1: Update `recommendationEngine.ts` `FilterOptions` with `scope: 'authored' | 'favorites' | 'all'`.
- Task 2: Update `<WhatToCookModal>` scope segmented pill bar with 3 tabs: `📚 My Authored`, `❤️ My Favorites`, and `🌐 All Recipes`.
- Task 3: Write comprehensive unit tests verifying 3-tier recommendation filtering.

---

# 🕒 INITIATIVE 9: Universal Time Slots, Popover Ergonomics & Unisex Identity
**Goal:** Add universal 'Anytime' meal classification, fix New Recipe popup alignment, and standardize on modern unisex chef avatars.

## Epic 22: Universal Time Slots & Meal Classification ("Anytime / All Day")
**Goal:** Enable all-day recipes and anytime snacks to be categorized and discovered flexibly.

### Feature 22.1: Anytime Meal Slot Integration
#### Story 46: Universal 'Anytime' Time Budget & Meal Slot Support [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Support `'anytime'` across types, recommendation engine, WhatToCookModal, editor Setup phase, and mock recipes.
**Tasks:**
- Task 1: Add `'anytime'` to `MealSlot` type union and metadata descriptions (`🕒 Anytime / All Day`).
- Task 2: Update `recommendationEngine.ts` to surface anytime recipes in both specific circadian slots and the dedicated Anytime filter tab.
- Task 3: Update `<WhatToCookModal>` and `/what-to-cook` page with the `🕒 Anytime` tab.
- Task 4: Add `anytime` pill to the Setup phase authoring tab in `/editor`.

---

## Epic 23: UI Alignment, Popover Polish & Unisex Identity
**Goal:** Perfect navbar popovers and ensure inclusive, modern unisex chef identity.

### Feature 23.1: Popover Alignment & Backdrop Overlay
#### Story 47: New Recipe Popover Alignment & Backdrop Overlay [BUGFIX / POLISH - MVP] ✅ [COMPLETED]
**Description:** Fix popup alignment, responsive positioning, and click-outside backdrop for New Recipe / Switcher dropdown.
**Tasks:**
- Task 1: Add click-outside backdrop overlay to `<AppNavbar>` recipe switcher popover so clicking outside smoothly dismisses it.
- Task 2: Fix dropdown positioning with responsive bounds (`right-0 mt-2 w-72 max-w-[calc(100vw-2rem)]`) to prevent off-screen shifting.
- Task 3: Enhance "➕ Blank Recipe Draft" button styling and visual alignment within the popup.

### Feature 23.2: Inclusive Unisex Avatar System
#### Story 48: Unisex Chef Identity & Neutral Avatar System [POLISH - MVP] ✅ [COMPLETED]
**Description:** Replace gender-specific stock avatars with modern, stylish unisex chef avatars across auth, journal, comments, and profile modal.
**Tasks:**
- Task 1: Replace all stock user/comment avatars in `recipeSlice.ts`, `UserProfileModal.tsx`, `RecipeDiscussionSection.tsx`, and API mock store with modern unisex chef avatars.
- Task 2: Update default fallback avatars to neutral chef iconography with high aesthetic polish.

---

# ⚡ INITIATIVE 10: 3-Tier Ingredient Criticality & Multilingual Localization Engine
**Goal:** Deliver 3-tier ingredient criticality (Critical Core ⚡, Standard Regular, Optional Garnish ✨) across Studio, Reader & Grocery Checklist, plus dynamic English/Tamil/Hindi localization.

## Epic 24: 3-Tier Ingredient Criticality System
**Goal:** Empower authors and cooks to distinguish non-negotiable structural ingredients from optional garnishes.

### Feature 24.1: Studio Criticality Authoring & State Management
#### Story 49: 3-Tier Criticality in Recipe Noter Studio & Reader View [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Enable 3-tier criticality selection in Noter Studio (`/editor`) and render distinct color-coded badges (`⚡ Critical` and `✨ Optional`) across Reader View (`/`) and Focus Mode (`GuidedCookingModal`).
**Tasks:**
- Task 1: Add `isCritical?: boolean` to `ScopedIngredient` and `EditableScopedIngredient`.
- Task 2: Add `setIngredientCriticality` action to `editorSlice.ts` supporting `'critical' | 'standard' | 'optional'` tiers.
- Task 3: Update `AddIngredientForm` and block ingredient chips in `/editor` with 3-tier selector pills and instant tier cycling.
- Task 4: Render `⚡ Critical` and `✨ Optional` badges across Reader ingredient accordions and Focus Mode step ingredient cards.

---

## Epic 25: Critical vs. Optional Smart Grocery Planning
**Goal:** Supercharge grocery checklist planning with criticality filtering and tagged exports.

### Feature 25.1: Filterable Grocery Checklist & Tagged Exports
#### Story 50: Grocery Checklist Criticality Filtering & Tagged WhatsApp Copy [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Allow cooks to filter shopping lists by `All Items`, `⚡ Critical Core`, and `✨ Optional Garnishes`, and export tagged checklists.
**Tasks:**
- Task 1: Add filter tabs (`All Items`, `⚡ Critical Core`, `✨ Optional`) to `GroceryListModal.tsx`.
- Task 2: Display `⚡ Critical` and `✨ Optional` pill badges on each aisle item.
- Task 3: Format WhatsApp/Clipboard copy with `[Critical]` and `[Optional]` tags.

---

## Epic 26: Reactive Multilingual Localization Engine
**Goal:** Provide instant, seamless UI and ingredient localization across English, Tamil (தமிழ்), and Hindi (हिंदी).

### Feature 26.1: Dual-Script Ingredient Names & UI Translation Dictionary
#### Story 51: Dynamic English, Tamil & Hindi Localization Engine [NECESSARY - MVP] ✅ [COMPLETED]
**Description:** Localize ingredient names (with primary native script + secondary English in brackets) and UI headings/buttons in real-time when switching languages.
**Tasks:**
- Task 1: Create `src/lib/translations.ts` with comprehensive UI dictionary for EN, தமிழ், and हिंदी.
- Task 2: Build `formatLocalizedIngredient` helper with dual-script fallback formatting (e.g. `துவரம் பருப்பு (Toor Dal)` / `तूर दाल (Toor Dal)`).
- Task 3: Enrich mock recipes with rich Tamil and Hindi translations.
- Task 4: Bind active language state to Reader View dashboard, phase headings, time metrics, and buttons.

---

# 📌 INITIATIVE 11: Stove-Side Sticky HUD & Collapsible Header System
**Goal:** Optimize stove-side viewport real estate with a sticky floating HUD on scroll and a manual collapsible header mode.

## Epic 27: Sticky Stove-Side Heads-Up Display (HUD)
**Goal:** Keep essential recipe controls, progress, and focus actions pinned when scrolling deep into preparation and cooking blocks.

### Feature 27.1: Reader View Sticky Floating Action HUD
#### Story 52: Sticky Stove-Side HUD on Scroll [MVP] ⏳ [PLANNED]
**Description:** When scrolling down past the main recipe header on Reader View (`/`), smoothly slide down a glassmorphism floating HUD pinning essential cooking controls.
**Acceptance Criteria (Gherkin):**
- **Given** the user is viewing a recipe on Reader View (`/`)
- **When** the user scrolls past the main recipe header (scroll offset > 240px)
- **Then** a sticky floating top HUD slides into view with backdrop blur (`backdrop-blur-md bg-card-bg/90 border-b border-border-subtle shadow-xl`).
- **And** the sticky HUD displays:
  - Recipe Name & Version badge
  - Servings scaler with quick `[-]` and `[+]` controls
  - Real-time cooking progress counter (`X/Y Steps Done`) with mini progress bar
  - `🎯 Focus Mode` quick action trigger
  - `▲ Top / Expand` scroll-to-top button
- **When** the user scrolls back to the top of the page
- **Then** the sticky HUD smoothly animates out of view without content layout shift.

**Tasks:**
- Task 1: Create `<StickyCookingHud>` component with responsive mobile/desktop layout.
- Task 2: Add scroll offset detection listener with cleanup and performance optimization.
- Task 3: Integrate with Redux state for `targetYield`, `completedStepIds`, and Focus Mode modal triggers.
- Task 4: Add responsive mobile styling to streamline icons on smaller screens (<640px).
- Task 5: Write unit tests in `src/components/StickyCookingHud.test.tsx`.

---

## Epic 28: Collapsible Header & Studio Navigation
**Goal:** Empower cooks to manually minimize top metadata for zero-distraction cooking and provide sticky phase navigation in Noter Studio.

### Feature 28.1: Reader Manual Header Collapse
#### Story 53: Collapsible Recipe Header & Compact Mode Toggle [POLISH - MVP] ⏳ [PLANNED]
**Description:** Allow users to collapse the recipe header metadata (description, author, version, taste tuning) into a compact bar with 1-click.
**Acceptance Criteria (Gherkin):**
- **Given** the user is on Reader View (`/`)
- **When** the user clicks the "▲ Minimize Header" button
- **Then** the header collapses into a sleek single-line summary with recipe name, servings, and "▼ Expand Header" toggle.
- **And** the preference is saved in Redux (`state.recipe.isHeaderCollapsed`) and persisted in `localStorage`.
- **When** the user clicks "▼ Expand Header"
- **Then** the full header with taste tuning and metadata expands smoothly with CSS transition.

**Tasks:**
- Task 1: Add `isHeaderCollapsed: boolean` state and `toggleHeaderCollapsed` reducer in `recipeSlice.ts`.
- Task 2: Update Reader View header in `src/app/page.tsx` with smooth collapse/expand animation and toggle button.
- Task 3: Add unit tests in `recipeSlice.test.ts` and `page.test.tsx`.

### Feature 28.2: Studio Editor Sticky Action Bar
#### Story 54: Studio Sticky Action & Phase Navigation HUD [POLISH] ⏳ [PLANNED]
**Description:** Provide a compact sticky top bar in Recipe Noter Studio (`/editor`) when editing long recipe phases.
**Acceptance Criteria (Gherkin):**
- **Given** the author is editing a recipe in Noter Studio (`/editor`)
- **When** the user scrolls down through multiple block steps
- **Then** a sticky bar remains pinned with `[Recipe Title]`, `[Phase Switcher Tabs]`, `[👁️ Live Preview]`, and `[💾 Save & Publish]`.

**Tasks:**
- Task 1: Add sticky top navigation container to `src/app/editor/page.tsx`.
- Task 2: Verify responsive layout on mobile/tablet viewports.
- Task 3: Add unit tests in `src/app/editor/page.test.tsx`.

---

# 🌐 INITIATIVE 12: Whole-Recipe Multilingual Localization & AI Translation Engine
**Goal:** Deliver scalable, multi-locale recipe storage and AI-powered on-the-fly translation so entire recipes (titles, steps, blocks, equipment, notes) translate seamlessly across English, Tamil, and Hindi.

## Epic 29: Whole-Recipe Multi-Locale Schema & Reactive Reader Localization
**Goal:** Expand recipe data structures to support rich language dictionaries and render full recipe translations in Reader & Focus Mode.

### Feature 29.1: Multi-Locale Schema & Localized Reader Hydration
#### Story 55: Multi-Locale Recipe Schema & Full Reader/Focus Mode Localization [MVP] ⏳ [PLANNED]
**Description:** Extend the `Recipe` schema with a `locales` dictionary (supporting `ta`, `hi`, and future languages) and wire Reader View (`/`) and Focus Mode (`GuidedCookingModal`) to reactively display translated Recipe Title, Version, Block Names, Step Instructions, and Equipment.
**Acceptance Criteria (Gherkin):**
- **Given** a recipe contains multi-locale definitions for `ta` (Tamil) or `hi` (Hindi) in `recipe.locales`
- **When** the user switches active language to `ta` or `hi` via the top navigation or reader toggle
- **Then** the Recipe Title, Version, Phase Block Titles, Step Instructions, Equipment, and Image captions dynamically update to the localized script in real-time.
- **And** if a specific step or block translation is missing in that language, the system gracefully falls back to the default language (English) without breaking.
- **And** Focus Mode (`GuidedCookingModal`) displays the localized step instructions with dual-script subtitle options.

**Tasks:**
- Task 1: Update `Recipe` and `ComponentBlock` TypeScript interfaces in `src/lib/types.ts` with `locales?: Record<string, RecipeLocaleData>`.
- Task 2: Enrich mock recipes (`Adai`, `Paneer Butter Masala`, `Filter Coffee`, `Upma`) with complete Tamil and Hindi translations in `locales`.
- Task 3: Update `RecipeStep` and `src/app/page.tsx` to resolve localized step texts and block names via helper `getLocalizedRecipeContent(recipe, language)`.
- Task 4: Update `GuidedCookingModal.tsx` to render localized step text in Focus Mode.
- Task 5: Write unit tests in `src/lib/translations.test.ts` and `src/app/page.test.tsx`.

---

## Epic 30: Studio AI Translation Assistant & On-Demand Engine
**Goal:** Empower authors to auto-translate recipes during authoring and provide dynamic translation for community recipes.

### Feature 30.1: Studio 1-Click AI Translation Assistant
#### Story 56: Studio 1-Click AI Recipe Translation & Multi-Language Review [POLISH - MVP] ⏳ [PLANNED]
**Description:** Add a "✨ Auto-Translate Recipe" feature in Recipe Noter Studio (`/editor`) allowing authors to generate, review, and edit Tamil and Hindi translations before publishing.
**Acceptance Criteria (Gherkin):**
- **Given** an author is authoring or editing a recipe in Noter Studio (`/editor`)
- **When** the author clicks "🌐 Auto-Translate (Tamil / Hindi)" in the Setup or Review tab
- **Then** the system automatically translates all block names, step texts, and equipment into the target language.
- **And** the author can toggle between language review tabs (`EN`, `தமிழ்`, `हिंदी`) to fine-tune and proofread the generated text.
- **And** clicking "Publish" saves the complete multi-locale payload into the recipe store.

**Tasks:**
- Task 1: Add `locales` state management and translation reducers to `editorSlice.ts`.
- Task 2: Build `RecipeTranslationReviewDrawer` component in `/editor`.
- Task 3: Integrate with translation utility to generate localized blocks and steps.
- Task 4: Write unit tests in `src/store/editorSlice.test.ts` and `src/app/editor/page.test.tsx`.

### Feature 30.2: Zero-Cost Local LLaMA Batch Translation Pipeline
#### Story 57: Zero-Cost Local LLaMA / Ollama Batch Translation Pipeline [TOOLING / PERFORMANCE - MVP] ⏳ [PLANNED]
**Description:** Build an offline batch translation CLI script (`npm run translate:recipes`) that connects to a local LLaMA instance (via Ollama on Apple Silicon / local GPU) to translate all recipes into Tamil (`ta`) and Hindi (`hi`) at $0 cost and save pre-computed strings directly into recipe JSON for 0ms runtime switching.
**Acceptance Criteria (Gherkin):**
- **Given** one or more recipes in `src/lib/mockRecipes.ts` or storage lack `locales.ta` or `locales.hi` translations
- **When** the developer runs `npm run translate:recipes` (or `npx ts-node scripts/translate-recipes.ts`)
- **Then** the script connects to the local Ollama API (`http://localhost:11434/api/generate` with model `llama3.2` / `qwen2.5` / `gemma2`)
- **And** sends structured culinary translation prompts preserving cooking measurements, timers, and step clarity.
- **And** writes the translated JSON schema (`name`, `versionName`, `prepBlocks`, `cookBlocks`, `requiredEquipment`) directly into the recipe's `locales` dictionary.
- **And** incurs exactly $0.00 in cloud API fees, providing 100% offline-ready 0ms client-side switching.

**Tasks:**
- Task 1: Create `scripts/translate-recipes.ts` batch runner script with Ollama integration and rate/error handling.
- Task 2: Add culinary system prompt template ensuring accurate Tamil & Hindi cooking terms.
- Task 3: Add `npm run translate:recipes` script to `package.json`.
- Task 4: Add unit/mock tests for the batch translation pipeline in `scripts/translate-recipes.test.ts`.

### Feature 30.3: Dynamic On-Demand Translation API
#### Story 58: Dynamic On-Demand Translation API & Local Cache [POST-MVP] ⏳ [PLANNED]
**Description:** Provide optional fallback on-the-fly translation for live user-generated recipes lacking pre-authored locales, caching results in `localStorage` to eliminate repeat requests.
**Acceptance Criteria (Gherkin):**
- **Given** a user views a custom recipe on Reader View (`/`) that lacks a `ta` or `hi` locale
- **When** the user switches language to `ta` or `hi`
- **Then** the app calls the `/api/recipes/[id]/translate` endpoint to translate the recipe text on-the-fly.
- **And** the translated result is cached in `localStorage` / client state for instant subsequent loads.

**Tasks:**
- Task 1: Create Next.js API route `/api/recipes/[id]/translate`.
- Task 2: Implement client-side translation caching layer in `recipeSlice.ts`.
- Task 3: Add loading skeleton states during dynamic translation.
- Task 4: Write unit tests in `src/app/api/recipes/[id]/translate/route.test.ts`.

