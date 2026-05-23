# Recipe Noter: Standardized Modular Recipe System

A high-precision, technical web application for culinary execution. Recipe Noter is designed to make the recipe *creation* process highly detailed and mathematically sound, ensuring that the *viewing and cooking* experience is effortless, scalable, and flawless.

## 🎯 System Vision
Most recipe apps fail because they treat recipes as simple, static text. Recipe Noter strictly separates **Preparation (Prerequisites)** from **Cooking (Active Execution)** and utilizes a powerful **Relational Ratio Engine** for mathematically sound scaling across yield, taste preferences, and ingredient dependencies.

## ✨ Feature Status

| Feature | Status |
|---|---|
| Granular Workflow Dashboard (dark mode, two-column, responsive) | ✅ Completed |
| Precision Step Tracking (inline badges, Critical/Optional, Time/Heat) | ✅ Completed |
| Ingredient Accordions (global + per-block, collapsible) | ✅ Completed |
| Total Time Header (phase split: Prep, Rest, Cook) | ✅ Completed |
| Human-Readable Time Formatting (`formatTime` utility) | ✅ Completed |
| Global Yield Scaling (servings input → live-scaled ingredient quantities) | ✅ Completed |
| Strict Ratio Group Validation (mismatch detection → Auto-scale / Confirm Break) | ✅ Completed |
| Per-ingredient Manual Overrides with ratio-aware validation | ✅ Completed |
| Tolerance Sliders (Spice / Sweetness) | ⏳ Planned |
| Step Checkboxes & Block Progress Tracking | ⏳ Planned |
| Built-in Step Duration Timers | ⏳ Planned |
| MongoDB & Mongoose Backend | ⏳ Planned |
| REST API (GET/POST /api/recipes) | ⏳ Planned |
| Authentication (NextAuth) | ⏳ Planned |
| Recipe Builder CMS (drag-and-drop node editor) | ⏳ Planned |

## 🧪 Test Coverage

| Test Suite | Tests | Status |
|---|---|---|
| `src/lib/utils.test.ts` | 44 | ✅ All passing |
| `src/store/recipeSlice.test.ts` | 27 | ✅ All passing |
| `src/app/page.test.tsx` | 22 | ✅ All passing |
| **Total** | **80** | **✅ 80 / 80 passing** |

## 💻 Technology Stack
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS (Native "Modern Chef" Dark Mode Aesthetic)
* **State Management:** Redux Toolkit
* **Database:** MongoDB (via Mongoose) — Planned
* **API:** Traditional RESTful API (Next.js Route Handlers) — Planned

## 📚 Project Documentation
For a deep dive into the architecture, design, and implementation roadmap, please refer to our core documentation files:
1. [Technical Requirements & TypeScript Schema](./docs/Modular_Recipe_Technical_Requirements.md)
2. [Design Theme Guidelines](./docs/Design_Theme_Requirements.md)
3. [Implementation Backlog & Agile Stories](./docs/Implementation_Backlog.md)
4. [Comprehensive Test Plan](./docs/Test_Plan.md)
5. [Mock Recipe Data](./src/lib/mockRecipe.ts)

## 🚀 Getting Started

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```

Run all tests:
```bash
npx jest
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🌿 Git Workflow
Every story is developed on its own feature branch and merged into `main` via a Pull Request.

| Branch | Story | Status |
|---|---|---|
| `feature/story-5-global-yield-scaling` | S5: Global Yield Scaling | PR ready |
| `feature/story-6-ratio-group-validation` | S6: Strict Ratio Group Validation | PR ready |
