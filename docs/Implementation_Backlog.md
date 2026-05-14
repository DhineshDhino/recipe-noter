# Project Backlog & Implementation Stories

This document breaks down the Modular Recipe System into executable, testable Agile stories. Each story focuses on an isolated piece of functionality required to achieve the technical and design requirements.

---

## Epic 1: Project Setup & Core Foundation

### Story 1: Initialize Framework & State Management ✅ [COMPLETED]
**Description:** Scaffold the Next.js project with Tailwind CSS configured for the "Modern Chef" theme, and set up Redux Toolkit loaded with the `mockRecipe.ts` data.
**Acceptance Criteria:**
* Next.js application runs without errors.
* Tailwind CSS is configured for native Dark Mode (Primary Background: `#121212`, Accent: `#FF6D00`).
* Redux Toolkit store is configured and successfully initializes with the `mockRecipe` state.
**Testing Requirements:**
* **Unit Testing:** Write Jest tests to verify the Redux store initializes correctly with the mock state and that basic selectors return the expected data.
* **Integration Testing:** Use Cypress or Playwright to verify the app boots up and the root layout applies the correct global Tailwind classes.

### Story 2: Implement Typography & Base UI Components ✅ [COMPLETED]
**Description:** Create the core reusable UI components (Cards, Typography, Buttons) following the design theme.
**Acceptance Criteria:**
* Base text uses a modern sans-serif font (e.g., Inter).
* All numeric displays (metrics, quantities) use tabular/monospaced fonts.
* Create a reusable `<BlockCard>` component for Prep/Cook sections.
**Testing Requirements:**
* **Unit Testing:** Use React Testing Library to unit test the `<BlockCard>` and button components to ensure they accept and render children and props correctly.
* **Integration Testing:** Use Storybook (or visual regression testing) to confirm that the monospaced numerals and background shadow tokens render as expected across different viewports.

---

## Epic 2: The Dashboard UI Shell

### Story 3: Responsive Multi-Column Layout ✅ [COMPLETED]
**Description:** Build the main dashboard layout that separates Prep, Passive, and Cook phases.
**Acceptance Criteria:**
* On large screens (desktop), the layout is split into two columns: Prep/Passive on the left, Active Cooking on the right.
* On mobile screens, the layout stacks vertically in order: Prep -> Passive -> Cook.
**Testing Requirements:**
* **Unit Testing:** Test the layout container logic to ensure it passes the correct section data to the child columns.
* **Integration Testing:** Write Cypress tests that resize the viewport and assert that the CSS Grid/Flexbox layout switches from row-based to column-based correctly.

### Story 4: Render Component Blocks & Atomic Steps ✅ [COMPLETED]
**Description:** Iterate through the Redux state to render `prepBlocks`, `passiveBlocks`, and `cookBlocks` into the UI.
**Acceptance Criteria:**
* Each block renders its `ingredients` list at the top.
* Each block renders its `steps` sequentially.
* "Critical" steps highlight with a Contextual Callout or red warning color.
**Testing Requirements:**
* **Unit Testing:** Write tests to verify that `AtomicStep` components conditionally apply the "critical" CSS classes when `isCritical` is true.
* **Integration Testing:** Mount the full Dashboard with the `mockRecipe` and assert that the correct number of blocks and steps are rendered into the DOM.

### Story 4.1: Total Time Header & Phase Split
**Description:** At the top of the dashboard alongside the recipe name, display the overall total time required, split into Prep, Passive, and Active phases if present.
**Acceptance Criteria:**
* Header dynamically calculates and displays total time across all blocks.
* Shows a breakdown (e.g., "Prep: 15m | Passive: 4h | Active: 20m").
**Testing Requirements:**
* **Unit Testing:** Write a test for the selector that calculates these totals from the Redux state.

### Story 4.2: Ingredient Accordions
**Description:** Add collapsible accordions to manage the display of ingredients.
**Acceptance Criteria:**
* Add a global accordion above the Prep and Active columns to show *all* ingredients required for that phase.
* Inside each component block, encapsulate its specific ingredients list within an accordion to save vertical space.
**Testing Requirements:**
* **Integration Testing:** Assert that clicking the accordion toggle hides and shows the ingredient list in the DOM.

### Story 4.3: Human-Readable Time Formatting
**Description:** Convert all raw minute values into easily readable "Hours and Minutes" formats.
**Acceptance Criteria:**
* Build a utility function (e.g., `formatTime(mins)`) that converts `240 mins` into `4h 0m` or `4 hours`.
* Apply this formatting to all headers, block titles, and step durations across the UI.
**Testing Requirements:**
* **Unit Testing:** Write robust tests for the `formatTime` helper covering edge cases like 0, 59, 60, and 125 minutes.

---

## Epic 3: Relational Ratio Engine

### Story 5: Global Yield Scaling
**Description:** Implement the logic to scale ingredient quantities globally based on a "Servings" input.
**Acceptance Criteria:**
* A global "Yield" input exists (defaulting to the recipe's `baseYield`).
* Continuous ingredients (`unit: "g"` or `"ml"`) scale mathematically.
* `isOptional: true` ingredients do *not* scale, but trigger a UI warning.
**Testing Requirements:**
* **Unit Testing:** Write pure function tests for the math logic: `calculateScaledQuantity(baseYield, targetYield, baseQuantity)`. Test edge cases like floats and zero.
* **Integration Testing:** Write React Testing Library tests that fire a change event on the Yield input and assert that the DOM updates the ingredient quantities correctly, and optional ingredients display the warning icon.

### Story 6: Strict Ratio Group Validation
**Description:** Enforce the independent ratio math defined in the `ratioGroups` registry.
**Acceptance Criteria:**
* If a user manually overrides an ingredient that belongs to a strict ratio group, the system flags a "Ratio Mismatch".
* The user is prompted to either "Auto-scale Group" or "Confirm Break".
**Testing Requirements:**
* **Unit Testing:** Create robust unit tests for the Redux reducer that handles manual ingredient updates. It must correctly identify if the ingredient belongs to a `ratioGroup` and set a `mismatch` flag in state.
* **Integration Testing:** Simulate a user typing a new value into an ingredient input. Assert that the "Ratio Mismatch" modal appears, and clicking "Auto-scale" dispatches the correct actions to update sister ingredients.

### Story 7: Tolerance Sliders (Spice/Sweetness)
**Description:** Implement slider inputs that linearly scale ingredients tagged with "spice" or "sweet".
**Acceptance Criteria:**
* A "Spice Level" slider exists (Low: 50%, High: 150%).
* Moving the slider scales *only* ingredients tagged with "spice" independently of the global yield.
**Testing Requirements:**
* **Unit Testing:** Test the Redux selector that calculates final displayed quantity. It must combine `globalYieldMultiplier` * `spiceToleranceMultiplier` only for tagged ingredients.
* **Integration Testing:** Move the slider in the UI and assert that standard ingredients do not change, but "spice" tagged ingredients update in real-time.

---

## Epic 4: Interactive Workflow & State Tracking

### Story 8: Step Checkboxes & Progress Tracking
**Description:** Allow the user to check off atomic steps as they cook.
**Acceptance Criteria:**
* Each step has a checkbox.
* Checking a step updates a global progress bar for that specific block (e.g., "Prep: 50% Complete").
**Testing Requirements:**
* **Unit Testing:** Test the Redux reducers for `toggleStepCompletion` and the selector for `calculateBlockProgress`. Ensure it handles 0 steps gracefully (avoid divide-by-zero).
* **Integration Testing:** Click multiple checkboxes via Cypress and verify the progress bar width/percentage updates accurately in the DOM.

### Story 9: Step Duration Timers
**Description:** Implement clickable timers for steps that have a defined duration.
**Acceptance Criteria:**
* Steps with a `totalDurationInMinutes` or step-level `duration` display a "Start Timer" button.
* Timer uses a neon/glowing visual progress ring.
* Triggers an alert when time hits 00:00.
**Testing Requirements:**
* **Unit Testing:** Use Jest fake timers (`jest.useFakeTimers()`) to test the custom `useTimer` hook. Ensure pause, resume, and reset functions work flawlessly.
* **Integration Testing:** Click "Start" on a timer. Fast-forward the time or wait, and assert that the visual ring depletes and the completion alert is triggered in the DOM.

---

## Epic 5: Backend & Database Integration

### Story 10: MongoDB Setup & Mongoose Schemas
**Description:** Configure the MongoDB connection and define Mongoose schemas that mirror our TypeScript recipe structure.
**Acceptance Criteria:**
* MongoDB URI is securely configured via environment variables.
* A robust Mongoose schema is built to perfectly validate and store the complex `Recipe` object.
**Testing Requirements:**
* **Integration Testing:** Write a seed script to successfully connect to a local/test MongoDB database and inject the `mockAdaiRecipe` document.

### Story 11: Traditional REST API Endpoints
**Description:** Build standard Next.js Route Handlers (`src/app/api/...`) to serve frontend requests.
**Acceptance Criteria:**
* `GET /api/recipes` returns a list of recipes.
* `GET /api/recipes/[id]` fetches the full nested recipe structure.
* `POST /api/recipes` securely saves a new recipe to MongoDB.
**Testing Requirements:**
* **Integration Testing:** Use Postman or automated API tests to verify endpoints return standard HTTP 200/201 statuses and correct JSON payloads.

### Story 12: Wire Redux to the REST API
**Description:** Replace the hardcoded mock data in the frontend by making standard `fetch` calls to our new API.
**Acceptance Criteria:**
* Redux uses `createAsyncThunk` (or RTK Query) to fetch data from `/api/recipes` on page load.
* The frontend properly displays a Loading State or Error State during network requests.
**Testing Requirements:**
* **Integration Testing:** Mount the app, intercept the API call, and assert that the UI properly transitions from "Loading" to the fully populated dashboard.
