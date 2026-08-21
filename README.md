# 🍳 What 2 Cook: Smart Culinary Recommendation & Modular Recipe System

A high-precision, technical web application for culinary execution, smart recipe recommendations, and recipe authoring. **What 2 Cook** strictly separates **Preparation (Prerequisites)** from **Rest/Passive Periods** and **Cooking (Active Execution)**, utilizing a relational ratio engine, circadian recommendation engine, and interactive guided execution to make cooking flawless and enjoyable.

---

## 🚀 Core Features & Capabilities

### 1. 📖 Core Reader Dashboard (`/`)
- **Dynamic Yield Scaling**: Live mathematically scaled ingredient quantities based on target servings.
- **Strict Ratio Group Validation**: Automated ratio mismatch warnings with 1-click **Auto-Scale Group** or **Confirm Break Ratio**.
- **Taste & Tolerance Multipliers**: Granular Spice and Sweetness level sliders.
- **Multilingual Support**: Live ingredient translation between **English**, **தமிழ் (Tamil)**, and **हिंदी (Hindi)**.
- **Step Execution Checklist**: Interactive checkboxes with real-time phase completion badges.
- **Chef Notes & Favorites**: Private recipe notes and one-click bookmarking.

### 2. 📝 Recipe Noter Studio CMS (`/editor`)
- **Phase-Based Authoring**: Structured 4-phase authoring (**Setup → Prep → Rest/Passive → Cook**).
- **Setup Metadata Authoring**: Configure **Meal Slots** (`Breakfast`, `Lunch`, `Tea Time`, `Dinner`, `Late Night`), **Dietary tags** (Vegetarian, Vegan, Gluten-Free, High-Protein, Jain), and **Difficulty** (Easy, Medium, Advanced).
- **Centralized Media Bin**: Batch image pool manager with drag-and-drop dropzones and step image assignment (`While Cooking` vs `After Step Outcome`).
- **Smart Autocomplete Input**: Keyboard-navigable autocomplete for ~100 cooking verbs & techniques and master registered ingredients.
- **Ratio Groups & Component Blocks**: Component block reordering, scoped ingredients, and precision heat/duration metadata.

### 3. 🍽️ "What to Cook" Discovery Hub (`/what-to-cook`)
- **Circadian Meal Slot Engine**: Suggests meals tailored to current local time of day with manual slot override pills.
- **Granular Time Budget Sliders**: Filter by Max Prep, Active Cook, and Rest Time with a **"⚡ No Soaking / 0m Rest"** instant toggle.
- **Pantry Inventory Matcher**: Interactive pantry chip selector categorized by food group.
- **🌟 Hero Ingredient Anchor**: Filter recipes around an ingredient you want to use up (*"Must Use: Paneer"*).
- **"Buy 1-2 Items" Gap Radar**: Computes pantry match % and surfaces *"⚡ Buy 1 item (Curry Leaves) & cook this now!"* opportunities.
- **Scope & Customization**: Toggle between `📚 My Saved Library` and `🌐 Global Recipe Cloud` with dietary & appliance filters.
- **🎲 Surprise Me**: 1-click random recipe decision maker.

### 4. 🎮 Interactive Guided Focus Mode
- **Distraction-Free Step Cards**: High-contrast, large-font stove-side execution view.
- **Live Countdown Timers**: Precision step timers with Web Audio culinary chimes (`playTimerChime`).
- **Hands-Free Voice Control**: Web Speech API navigation (*"Next"*, *"Adutha"*, *"Previous"*, *"Done"*, *"Start Timer"*).
- **Visual Process & Result Photos**: Compare active cooking pan state against expected visual outcomes.

### 5. 🎙️ Tamil Voice Note AI Extractor
- **Audio Recorder & Dropzone Uploader**: Record voice notes or upload `.m4a`, `.mp3`, `.wav` audio files.
- **Dual-Pane Transcripts**: Synchronized Tamil Unicode script and Tanglish phonetic transcripts.
- **Modular AI Recipe Extraction**: Automatically extracts blocks, steps, quantities, and heat levels with AI confidence badges.
- **1-Click Studio Load**: Hydrates extracted recipe into Noter Studio for immediate editing.

### 6. 🛒 Smart Grocery List Aggregator
- **Aisle-Grouped Shopping List**: Scaled ingredient aggregation grouped by `🌾 Grains & Lentils`, `🌶️ Spices & Seasonings`, `🧅 Fresh Produce & Herbs`, `🥛 Dairy & Oils`, `🍯 Pantry Staples`.
- **Interactive Check-offs & Clipboard Export**: 1-click formatted copy for WhatsApp / notes and printable layout.

### 7. 🔌 RESTful API Endpoints
- `GET /api/recipes`: Fetch all catalogue recipes with `?q=` search filter.
- `POST /api/recipes`: Create new modular recipe with schema validation.
- `GET /api/recipes/[id]`: Fetch recipe by ID.
- `PUT /api/recipes/[id]`: Update existing recipe.
- `DELETE /api/recipes/[id]`: Remove recipe.

---

## 💻 Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **UI Library** | React 19 (Server + Client Components) |
| **State Management** | Redux Toolkit (`@reduxjs/toolkit` + `react-redux`) |
| **Styling** | Tailwind CSS v4 ("Modern Chef" Dark Theme `#121212`, `#FF6D00`) |
| **Speech & Audio** | Web Speech API (`SpeechRecognition`) & Web Audio API (`AudioContext`) |
| **Testing** | Jest + React Testing Library (14 test suites, 260+ unit tests) |

---

## 🧪 Test Coverage & Verification

Run the entire test suite:
```bash
npx jest
```

Targeted test execution:
```bash
# Recommendation Engine & What to Cook tests
npx jest src/lib/recommendationEngine.test.ts src/components/WhatToCookModal.test.tsx

# Studio Editor & Autocomplete tests
npx jest src/store/editorSlice.test.ts src/components/StepAutocompleteInput.test.tsx

# Guided Focus Mode & Grocery tests
npx jest src/components/GuidedCookingModal.test.tsx src/components/GroceryListModal.test.tsx
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/dhinesh-work/recipe-noter.git
cd recipe-noter

# Install dependencies
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 🗺️ Product Roadmap & Agile Backlog

Refer to [docs/Implementation_Backlog.md](./docs/Implementation_Backlog.md) for the complete Agile roadmap:

| Initiative | Scope | Status |
| :--- | :--- | :--- |
| **Initiative 1** | 🚀 Core Reader Experience & Math Validation | ✅ `[COMPLETED]` |
| **Initiative 2** | ✍️ Recipe Noter Studio (CMS), Autocomplete & Media Bin | ✅ `[COMPLETED]` |
| **Initiative 3** | 💾 Data Persistence, REST APIs, Profiles & Notes | ✅ `[COMPLETED]` |
| **Initiative 4** | 🌟 Hands-Free Voice Control & Smart Grocery Aggregator | ✅ `[COMPLETED]` |
| **Initiative 5** | 🎮 Interactive Focus Mode, Timers & Taste Profiler | ✅ `[COMPLETED]` |
| **Initiative 6** | 🎙️ Voice-to-Recipe AI Onboarding (Tamil Speech-to-Text) | ✅ `[COMPLETED]` |
| **Initiative 7** | 🍽️ "What to Cook" — Recommendation & Pantry Match Engine | ✅ `[COMPLETED]` |
| **Initiative 8** | 📓 Cooking Try Journal, Google OAuth, Community & 3-Tier Scope | ⏳ `[PLANNED]` |

---

## 📄 License
MIT License. Built for precision cooking enthusiasts and recipe authors worldwide.
