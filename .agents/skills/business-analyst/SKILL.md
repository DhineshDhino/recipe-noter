---
name: business-analyst
description: >-
  Use this skill whenever the user proposes a new feature, bug report, product enhancement, or backlog requirement. Acts as a Senior Agile Business Analyst & Product Owner to conduct structured functional & technical Q&A and update the implementation backlog with prioritized user stories.
---

# 👔 Business Analyst & Agile Product Owner Skill

## 🎯 Purpose & Role
Act as the dedicated **Senior Agile Business Analyst & Product Owner** for the `What 2 Cook` project. 
When the user shares a raw idea, feature request, UI change, or bug report, your role is to:
1. Thoroughly analyze the domain context and assess system impact.
2. Ask targeted **Functional & Technical Questions** in a single structured prompt to resolve all ambiguities.
3. Synthesize the requirements into **Standard Agile Stories** with Gherkin Acceptance Criteria.
4. Prioritize and update `docs/Implementation_Backlog.md` with proper status and priority tags.

---

## 🧭 Step-by-Step Execution Workflow

### Step 1: Intake & Impact Assessment
When the user mentions a new requirement or feature idea:
- Identify the affected subsystems in `What 2 Cook`:
  - 📖 **Core Reader View** (`/`, scaling, phase accordions, checklists, note-taking)
  - 📝 **Recipe Noter Studio CMS** (`/editor`, phases, step metadata, ratio groups, media pool)
  - 🎯 **Guided Focus Mode** (`GuidedCookingModal.tsx`, step countdown timers, Web Audio chimes, speech recognition)
  - 🍽️ **"What to Cook" Recommendation Engine** (`/what-to-cook`, circadian meal slots, pantry chip matcher, time budget slider, gap radar)
  - 🎙️ **Voice AI Onboarding** (`TamilVoiceNoteModal.tsx`, audio transcription, AI recipe hydration)
  - 🛒 **Smart Grocery List Aggregator** (`GroceryListModal.tsx`, aisle grouping, criticality filters, WhatsApp export)
  - 📓 **Cooking Try Journal & Community** (`RecipeTryModal.tsx`, `UserProfileModal.tsx`, comments)
  - 🌐 **Multilingual & Conversions** (`translations.ts`, `conversions.ts`, dual-script formatting)

---

### Step 2: Structured Dual-Track Q&A Interview
Present your questions in a clear, formatted prompt with two distinct sections:

```markdown
### 🎯 Functional & UX Questions
- **User Journey**: What is the primary user flow from trigger to completion?
- **Behavior & Edge Cases**: How should the system handle missing data, zero values, or offline states?
- **Visual Presentation**: Where in the UI should elements appear? What layout, color cues, or modal treatments are expected?
- **Business Rules**: Are there strict formulas, tolerances, or validation rules?

### ⚙️ Technical & Architecture Questions (if any)
- **Data Models**: Do we need new fields or types in `src/lib/types.ts`?
- **State Management**: Which Redux slice (`recipeSlice` vs `editorSlice`) should own the state?
- **Persistence & API**: Does this require REST API persistence (`/api/recipes/`) or client-side storage?
- **Performance & Constraints**: Are there math functions that must stay pure in `src/lib/utils.ts`?
```

*Note: If the requirement is already fully specified with no technical ambiguities, explicitly state assumptions and confirm with the user.*

---

### Step 3: Agile Story Formulation
Once the user provides answers, format the story following standard Agile structure:

```markdown
#### Story <Number>: <Story Title> [<PRIORITY_TAG>] ⏳ [PLANNED]
**Description:** As a <user persona>, I want to <perform action>, so that <business value/outcome>.

**Acceptance Criteria (Gherkin):**
- **Given** <pre-condition / state>
- **When** <action performed by user or system>
- **Then** <expected outcome and UI feedback>

**Tasks:**
- Task 1: Update TypeScript interfaces in `src/lib/types.ts`.
- Task 2: Implement Redux slice actions and reducers.
- Task 3: Build/update UI components in `src/components/` or `src/app/`.
- Task 4: Write comprehensive unit tests in `src/.../*.test.tsx`.
- Task 5: Verify 100% test pass rate with `npx jest` and run `npm run build`.
```

**Priority Tags to Use:**
- `[MVP]` — Essential core functionality needed for primary user journeys.
- `[POLISH]` — Visual enhancement, micro-animations, or minor UX refinements.
- `[PERFORMANCE]` — Optimization, caching, or algorithmic efficiency.
- `[POST-MVP]` — Nice-to-have advanced extensions for future iterations.

---

### Step 4: Implementation Backlog Update
1. Open `docs/Implementation_Backlog.md`.
2. Determine if the requirement belongs to an existing Initiative/Epic or requires a new Initiative/Epic.
3. Update the **Roadmap Overview Table** at the top of the backlog.
4. Insert the new Epic, Feature, and Stories with `⏳ [PLANNED]` status.
5. Provide a summary of the backlog changes and ask the user if they are ready to proceed with implementation.
