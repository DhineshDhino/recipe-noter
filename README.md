# Recipe Noter: Standardized Modular Recipe System

A high-precision, technical web application for culinary execution. Recipe Noter is designed to make the recipe *creation* process highly detailed and mathematically sound, ensuring that the *viewing and cooking* experience is effortless, scalable, and flawless.

## 🎯 System Vision
Most recipe apps fail because they treat recipes as simple, static text. Recipe Noter strictly separates **Preparation (Prerequisites)** from **Cooking (Active Execution)** and utilizes a powerful **Relational Ratio Engine** for mathematically sound scaling across yield, taste preferences, and ingredient dependencies.

## ✨ Core Features
* **[COMPLETED] Granular Workflow Dashboard:** A modern, two-column responsive layout separating offline prep and passive waiting time from active stove-side cooking. Features a sleek "Modern Chef" dark mode styling with custom inline badges.
* **[COMPLETED] Precision Step Tracking & UI:** Every atomic step acts as a checklist. Includes global ingredient accordions, dynamic phase time calculations, inline duration/heat modifiers, and critical/optional warnings.
* **[UP NEXT] Relational Ratio Engine:** Ingredients are bound in mathematical sets (e.g., 1:1 Rice to Water). Scaling one ingredient strictly auto-scales the group.
* **[PLANNED] Tolerance Sliders:** Built-in sliders for custom user preferences like "Spice" and "Sweetness", which dynamically adjust tagged ingredients without affecting global yield.
* **[PLANNED] MongoDB & REST API Backend:** Persistent database storage using Mongoose with traditional Next.js Route Handlers (`GET`, `POST`).

## 💻 Technology Stack
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS (Native "Modern Chef" Dark Mode Aesthetic)
* **State Management:** Redux Toolkit
* **Database:** MongoDB (via Mongoose)
* **API:** Traditional RESTful API (Next.js Route Handlers)

## 📚 Project Documentation
For a deep dive into the architecture, design, and implementation roadmap, please refer to our core documentation files:
1. [Technical Requirements & TypeScript Schema](./docs/Modular_Recipe_Technical_Requirements.md)
2. [Design Theme Guidelines](./docs/Design_Theme_Requirements.md)
3. [Implementation Backlog & Agile Stories](./docs/Implementation_Backlog.md)
4. [Comprehensive Test Plan](./docs/Test_Plan.md)
5. [Mock Recipe Data](./src/lib/mockRecipe.ts)

## 🚀 Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
