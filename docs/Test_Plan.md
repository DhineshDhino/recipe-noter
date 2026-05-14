# Comprehensive Test Plan: Modular Recipe System

This document outlines the detailed manual and automated test cases corresponding to the implementation backlog.

## Epic 1 & 2: Setup and UI Shell
**TC-UI-01: Verify Global Dark Mode**
* **Action:** Launch the application.
* **Expected:** The `body` background is strictly `#121212`. Text is high-contrast light grey.
* **Type:** Integration / Visual

**TC-UI-02: Verify Responsive Layout**
* **Action:** Open dashboard on desktop (1440px width).
* **Expected:** Prep Block column is on the left, Cook Block column is on the right.
* **Action:** Shrink window to 500px.
* **Expected:** Columns collapse; Prep Block is stacked directly on top of Cook Block.
* **Type:** Integration (Cypress)

## Epic 3: Relational Ratio Engine
**TC-RATIO-01: Global Yield Scaling (Integer scaling)**
* **Action:** Set Yield to 8 (Base is 4).
* **Expected:** "Raw Rice" (base 100g) displays as 200g.
* **Type:** Unit / Integration

**TC-RATIO-02: Global Yield Scaling (Float precision)**
* **Action:** Set Yield to 5 (Base is 4).
* **Expected:** "Raw Rice" (base 100g) displays as 125g. "Asafoetida" (base 0.5 tsp) displays as 0.625 tsp (or rounds to 0.63 based on formatting rules).
* **Type:** Unit

**TC-RATIO-03: Optional Ingredients Bypass Scaling**
* **Action:** Set Yield to 8.
* **Expected:** "Moong Dal" (marked `isOptional: true`, base 25g) remains at exactly 25g. A warning icon appears next to it.
* **Type:** Integration

**TC-RATIO-04: Strict Ratio Group Validation (Mismatch Trigger)**
* **Action:** Manually edit the input for "Raw Rice" from 100g to 150g.
* **Expected:** An alert modal appears: "Ratio Mismatch: The Rice Blend requires a 1:1 ratio. Do you want to auto-scale Boiled Rice?".
* **Type:** Integration

**TC-RATIO-05: Strict Ratio Group Validation (Auto-scale Resolution)**
* **Action:** Click "Auto-scale" on the mismatch alert.
* **Expected:** "Boiled Rice" quantity instantly updates to 150g.
* **Type:** Unit / Integration

**TC-RATIO-06: Tolerance Slider Targeting**
* **Action:** Slide "Spice Level" from 100% to 150%.
* **Expected:** "Green Chilli" count increases from 3 to 4.5. "Ginger" increases from 15g to 22.5g. "Salt" (no tag) remains at 10g.
* **Type:** Unit / Integration

## Epic 4: Workflow & State Tracking
**TC-WORKFLOW-01: Progress Bar Calculation**
* **Action:** Check off the first step in "Grinding the Batter" (which has 4 steps total).
* **Expected:** The progress bar for that block fills exactly 25%.
* **Type:** Unit / Integration

**TC-WORKFLOW-02: Timer Initialization and Run**
* **Action:** Click "Start Timer" on the "Batter Fermentation" block.
* **Expected:** Timer begins counting down from 12:00:00. The visual ring begins to deplete.
* **Type:** Integration

**TC-WORKFLOW-03: Timer Pause and Resume**
* **Action:** Click "Pause Timer" after 5 seconds.
* **Expected:** Countdown halts exactly at elapsed time.
* **Action:** Click "Resume Timer".
* **Expected:** Countdown continues from the paused timestamp.
* **Type:** Unit

**TC-WORKFLOW-04: Timer Completion Alert**
* **Action:** Timer reaches 00:00:00.
* **Expected:** Visual ring flashes the Warning/Alert color (`#FF3B30`). An audio chime or browser alert triggers.
* **Type:** Integration

## Epic 5: Backend & Database Integration
**TC-BACKEND-01: Seed and Connect MongoDB**
* **Action:** Run the database connection and seed script.
* **Expected:** Script connects to MongoDB successfully and inserts the `mockAdaiRecipe` without Mongoose validation errors.
* **Type:** Integration

**TC-BACKEND-02: REST API GET Request**
* **Action:** Send a `GET` request to `/api/recipes` via Postman.
* **Expected:** API responds with HTTP 200 and a JSON array containing the recipe data perfectly matching the TypeScript schema.
* **Type:** Integration

**TC-BACKEND-03: Redux Async Thunk Fetch**
* **Action:** Load the dashboard UI.
* **Expected:** Redux automatically fires a `fetchRecipes` thunk. The UI displays a loading skeleton, then updates with the live data fetched from MongoDB.
* **Type:** Integration
