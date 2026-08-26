<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🍳 What 2 Cook — Agent Guidelines & Repository Architecture

Welcome! This file serves as the operational guide and technical documentation for AI agents working in the `What 2 Cook` codebase.

---

## 🚀 1. Project Overview & Vision

`What 2 Cook` is a **Smart Culinary Recommendation & Modular Recipe System** built for precision cooking and recipe authoring. It consists of multiple interconnected experiences:

1. **Core Reader Experience (Cooking Dashboard)** (`/`)
   - Interactive stove-side cooking view with automated yield scaling, ratio group validation, total time breakdown, phase ingredients accordions, step execution checklists, multilingual translations (English / Tamil / Hindi), and recipe notes & bookmarks.
2. **Recipe Noter Studio (CMS)** (`/editor`)
   - Step-by-step authoring organized into phases (**Setup → Prep → Rest/Passive → Cooking**). Authors can configure meal slots, dietary tags, cooking difficulty, centralized media photo pools, master ingredient registries, and keyboard-navigable autocomplete for cooking verbs and ingredients.
3. **Interactive Guided Focus Mode**
   - Step-by-step cooking cards with live countdown timers, Web Audio culinary chimes, voice commands ("Next", "Adutha", "Done", "Start Timer"), and before/after step photography.
4. **"What to Cook" Smart Recommendation Engine** (`/what-to-cook`)
   - Circadian meal slot recommendations (Breakfast, Lunch, Tea/Snack, Dinner, Late Night), granular time budget sliders, "No Soaking / 0m Rest" instant toggle, interactive pantry chip matcher, "Hero Ingredient" anchor, and "Buy 1-2 items" gap radar.
5. **Tamil Voice Note AI Onboarding**
   - Audio recording, dropzone uploader, dual-pane transcripts (Tamil Unicode + Tanglish), modular AI recipe extraction with confidence indicators, and 1-click Studio hydration.
6. **Smart Grocery List Aggregator**
   - Yield-scaled shopping lists grouped by aisle (`Grains & Lentils`, `Spices`, `Fresh Produce`, `Dairy & Oils`, `Pantry Staples`) with interactive check-offs, WhatsApp copy, and printable styling.

---

## 🛠️ 2. Tech Stack & Key Conventions

- **Framework**: Next.js 16 (App Router with Turbopack)
- **UI Library**: React 19 with Client Components (`'use client'`) for interactive views
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
  - `recipeSlice.ts`: Reader view, yield scaling, spice/sweet multipliers, pantry inventory, favorites, bookmarks, notes, language.
  - `editorSlice.ts`: Studio editor, meal slots, dietary tags, difficulty, media pool, blocks, editable steps, step metadata, ratio groups.
- **Styling**: Tailwind CSS v4 using modern theme tokens:
  - Background: `#121212` / dark canvas (`bg-background`, `bg-card-bg`)
  - Accent: `#FF6D00` ("Modern Chef" warm orange / `text-accent`, `border-accent`)
  - Warning/Critical: `#FF3B30` / Amber-Red (`text-warning`, `border-warning`)
- **Testing**: Jest + React Testing Library (`npx jest`) — 14 test suites, 260+ unit tests with 100% pass rate.

---

## 📁 3. File Map & Directory Structure

```
recipe-noter/
├── AGENTS.md                         # Agent guidelines & technical standards (this file)
├── README.md                         # Developer documentation & setup instructions
├── docs/
│   └── Implementation_Backlog.md     # Agile source of truth (Initiatives 1–8, Epics 1–21, Stories 1–45)
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Reader View (Cooking Dashboard on '/')
│   │   ├── editor/
│   │   │   └── page.tsx              # Recipe Noter Studio (CMS on '/editor')
│   │   ├── what-to-cook/
│   │   │   └── page.tsx              # "What to Cook" Discovery Portal on '/what-to-cook'
│   │   ├── api/
│   │   │   └── recipes/
│   │   │       ├── route.ts          # REST API: GET catalogue (with ?q=), POST recipe
│   │   │       └── [id]/route.ts     # REST API: GET, PUT, DELETE single recipe
│   │   ├── layout.tsx                # Root layout wrapped in Redux StoreProvider & AppNavbar
│   │   └── globals.css               # Tailwind v4 directives & theme custom colors
│   ├── components/
│   │   ├── AppNavbar.tsx             # Global sticky navigation, recipe switcher & modal triggers
│   │   ├── GuidedCookingModal.tsx    # Focus Mode step cards, timers, audio chimes & voice navigation
│   │   ├── WhatToCookModal.tsx       # Circadian meal slots, pantry chip selector & time budget sliders
│   │   ├── TamilVoiceNoteModal.tsx   # Voice-to-recipe AI recording, dual transcripts & Studio load
│   │   ├── StepAutocompleteInput.tsx # Keyboard-navigable autocomplete for master ingredients & cooking verbs
│   │   ├── MediaPoolManager.tsx      # Centralized photography bin & pool photo manager
│   │   ├── GroceryListModal.tsx      # Scaled shopping list grouped by aisle with WhatsApp copy
│   │   └── RecipeLibraryModal.tsx    # Recipe catalogue modal with search, tags & 1-click switch
│   ├── lib/
│   │   ├── types.ts                  # Core TypeScript interfaces (Recipe, MealSlot, RatioGroup, etc.)
│   │   ├── utils.ts                  # Pure math utilities, scaling, exportEditorToRecipe, playTimerChime
│   │   ├── recommendationEngine.ts   # Circadian time analyzer, pantry match % & ranking algorithms
│   │   ├── cookingTerms.ts           # Master culinary dictionary (~100 terms) & fuzzy search
│   │   ├── conversions.ts            # Density table, volume-to-weight math, multilingual translations
│   │   ├── useVoiceNavigation.ts     # Web Speech API hands-free voice command recognition hook
│   │   ├── id.ts                     # Client-side unique ID generator
│   │   ├── mockRecipe.ts             # Anchor Adai recipe mock data
│   │   └── mockRecipes.ts            # Multi-recipe library (Adai, Paneer Butter Masala, Filter Coffee, Upma)
│   └── store/
│       ├── store.ts                  # Redux store configuration
│       ├── recipeSlice.ts            # Reader state slice, pantry items, favorites, notes
│       ├── recipeSlice.test.ts       # Reader state unit tests
│       ├── editorSlice.ts            # Editor state slice, meal slots, dietary, media pool, blocks
│       ├── editorSlice.test.ts       # Editor state unit tests
│       └── StoreProvider.tsx         # React-Redux Provider wrapper component
```

---

## 🧪 4. Testing & Verification Requirements

- **Strict Test Rule**: Never declare success or mark a story completed without running `npx jest` and verifying a 100% test pass rate across all suites.
- **Run All Unit Tests**:
  ```bash
  npx jest
  ```
- **Targeted Test Execution**:
  ```bash
  npx jest src/lib/recommendationEngine.test.ts
  npx jest src/components/WhatToCookModal.test.tsx
  ```
- **Run Production Build Verification**:
  ```bash
  npm run build
  ```
- **Development Server**:
  ```bash
  npm run dev
  ```

---

## 📋 5. Agile Backlog & Workflow Rules

1. **Backlog Document**: `docs/Implementation_Backlog.md` is the project source of truth.
2. **Status Tracking**:
   - `⏳ [PLANNED]` -> `⏳ [IN PROGRESS]` -> `✅ [COMPLETED]`
3. **Planning & Execution Workflow**:
   - For non-trivial stories: Create an `implementation_plan.md` artifact, request user feedback, and create `task.md`.
   - Implement logic in Redux slices + components + unit tests.
   - Run verification via `npx jest` and `npm run build`.
   - Update `Implementation_Backlog.md` and generate `walkthrough.md`.
4. **Git Commit Confirmation Rule**:
   - **ALWAYS ask the user for confirmation before committing or pushing changes to git.**
   - Show the summary of changes and the proposed commit message, and wait for explicit user approval before running `git commit` or `git push`.

---

## ⚠️ 6. Common Gotchas & Best Practices

- **Redux Serializability**: Do NOT put non-serializable JavaScript `Date` objects inside Redux store state. Store timestamps as ISO 8601 strings (e.g. `"2023-01-01T00:00:00Z"`).
- **Client Components**: Pages and components using Redux hooks (`useSelector`, `useDispatch`) or React state must include `'use client';` at the top of the file.
- **React Hooks Order**: Always declare all hooks at the top level of components before any conditional early returns (`if (!isOpen) return null;`) to avoid hook mismatch errors during re-renders.
- **Pure Math Functions**: Keep scaling, ratio validation, time formatting, and recommendation math pure and decoupled from React render loops inside `src/lib/utils.ts` and `src/lib/recommendationEngine.ts`.
- **Node vs Browser API Compatibility in Tests**:
  - Web Audio (`AudioContext`), Web Speech (`webkitSpeechRecognition`), and MediaDevices should be guarded with `typeof window !== 'undefined'` or mock fallbacks so unit tests run cleanly in Jest JSDOM environments.

---

## 🤖 7. Custom Skills & Agile Business Analyst Role

- **Business Analyst Skill (`.agents/skills/business-analyst/SKILL.md`)**:
  - Automatically activates whenever a new feature, bug report, or product requirement is proposed.
  - Formulates structured **Functional & Technical Questions** in a single combined prompt.
  - Translates aligned requirements into standard Agile user stories with Gherkin acceptance criteria.
  - Updates `docs/Implementation_Backlog.md` and roadmap tables with appropriate priority tags (`[MVP]`, `[POLISH]`, `[PERFORMANCE]`, `[POST-MVP]`).
