<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🍳 Recipe Noter — Agent Guidelines & Repository Architecture

Welcome! This file serves as the operational guide and technical documentation for AI agents working in the `recipe-noter` codebase.

---

## 🚀 1. Project Overview & Vision

`recipe-noter` is a **Modular Recipe System** built for precision cooking and recipe authoring. It consists of two primary experiences:

1. **Core Reader Experience (Cooking Dashboard)** (`/`)
   - Interactive stove-side cooking view with automated yield scaling, ratio group validation, total time breakdown, phase ingredients accordions, and step execution checklists.
2. **Recipe Noter Editor (CMS)** (`/editor`)
   - Step-by-step authoring interface organized into three cooking phases (**Prep → Rest/Passive → Cooking**). Authors can add/reorder steps, define component blocks, attach metadata (duration, heat, criticality), and manage master ingredients and ratio groups.

---

## 🛠️ 2. Tech Stack & Key Conventions

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 with Client Components (`'use client'`) for interactive views
- **State Management**: Redux Toolkit (`@reduxjs/toolkit` + `react-redux`)
  - `recipeSlice.ts`: State for the Reader View (active recipe, yield, ratio mismatches, overrides).
  - `editorSlice.ts`: State for the Recipe Noter Editor (phases, blocks, editable steps, step metadata).
- **Styling**: Tailwind CSS v4 using modern theme tokens:
  - Background: `#121212` / dark canvas (`bg-background`, `bg-card-bg`)
  - Accent: `#FF6D00` ("Modern Chef" warm orange / `text-accent`, `border-accent`)
  - Warning/Critical: `#FF3B30` / Amber-Red (`text-warning`, `border-warning`)
- **Testing**: Jest + React Testing Library (`npx jest`)

---

## 📁 3. File Map & Directory Structure

```
recipe-noter/
├── AGENTS.md                   # Agent guidelines & project standards (this file)
├── docs/
│   └── Implementation_Backlog.md # Agile source of truth (Initiative -> Epic -> Feature -> Story -> Task)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Reader View (Cooking Dashboard on '/')
│   │   ├── editor/
│   │   │   └── page.tsx        # Recipe Noter Editor (CMS on '/editor')
│   │   ├── layout.tsx          # Root layout wrapped in Redux StoreProvider
│   │   └── globals.css         # Tailwind v4 directives & theme custom colors
│   ├── lib/
│   │   ├── types.ts            # Core TypeScript interfaces (Recipe, ComponentBlock, AtomicStep, etc.)
│   │   ├── utils.ts            # Pure math utilities (calculateScaledQuantity, formatTime, etc.)
│   │   ├── id.ts               # Client-side unique ID generator
│   │   └── mockRecipe.ts       # Anchor Adai recipe mock data
│   └── store/
│       ├── store.ts            # Redux store configuration
│       ├── recipeSlice.ts      # Reader state slice & reducers
│       ├── recipeSlice.test.ts # Reader state unit tests
│       ├── editorSlice.ts      # Editor state slice & reducers
│       ├── editorSlice.test.ts # Editor state unit tests
│       └── StoreProvider.tsx   # React-Redux Provider wrapper component
```

---

## 🧪 4. Testing & Verification Requirements

- **Strict Test Rule**: Never declare success or mark a story completed without running `npx jest` and verifying 100% test pass rate.
- **Run Unit Tests**:
  ```bash
  npx jest
  ```
- **Targeted Test Execution**:
  ```bash
  npx jest src/store/editorSlice.test.ts
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
   - Implement logic in Redux slice + components + unit tests.
   - Run verification via Jest.
   - Update `Implementation_Backlog.md` and generate `walkthrough.md`.

---

## ⚠️ 6. Common Gotchas & Best Practices

- **Redux Serializability**: Do NOT put non-serializable JavaScript `Date` objects inside Redux store state. Store timestamps as ISO 8601 strings (e.g. `"2023-01-01T00:00:00Z"`).
- **Client Components**: Pages using Redux hooks (`useSelector`, `useDispatch`) or React state must include `'use client';` at the top of the file.
- **Pure Math Functions**: Keep scaling, ratio validation, and time formatting pure and decoupled from React render loops inside `src/lib/utils.ts`.
