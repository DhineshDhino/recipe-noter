# Design Theme & UI Guidelines: Modular Recipe System

## 1. Overall Aesthetic & Vibe
**The "Modern Chef / High-End Kitchen"**
This is a sleek, premium dark mode aesthetic. It uses deep charcoals with a vibrant, energetic accent color (like stove-flame orange) to draw attention to active cooking steps. The design emphasizes precision without feeling overly clinical.

![UI Goal](./UI-Goal.png)

---

## 2. Color Palette
* **Primary Background:** Deep Charcoal and True Black (e.g., `#121212`, `#1E1E1E`). Helps reduce screen glare in bright kitchens.
* **Text Color:** High contrast soft white/light grey (`#E0E0E0`) for primary readability; muted grey (`#9E9E9E`) for secondary data.
* **Accent Color:** "Stove-Flame" Orange (`#FF6D00`). Used strictly to highlight active steps, timers, interactive inputs, and scaled quantity values.
* **Warning/Alert Color:** Vibrant Red (`#FF3B30`) for "Ratio Mismatch" warnings and critical step callouts.
* **Optional/Caution Color:** Amber (`#F59E0B`) for optional ingredient badges and non-blocking warnings.

---

## 3. Typography
* **Headings:** Modern, geometric sans-serif (Inter) for a clean, sharp look.
* **Body Text:** Highly readable sans-serif, optimized for quick scanning from a distance.
* **Numbers & Quantities:** Monospaced / tabular numerals are **mandatory** for all precision metrics (e.g., `12.55 g`, `03:45`). Values must align vertically.

---

## 4. UI Components & Elements

### 4.1 Dashboard Layout
* **Two-column grid** on large screens: Prep/Passive on the left, Active Cooking on the right.
* **Single stacked column** on mobile, ordered: Prep → Passive → Cook.
* The Active Cooking column is `sticky` on desktop so stove-side steps are always visible during scroll.

### 4.2 Cards & Blocks
* Component blocks use rounded dark cards with subtle borders and elevation shadow.
* Active Cook blocks have an accent-colored left-edge `stripe` (1px bar on the left side).

### 4.3 Checkboxes & Steps
* Custom styled to blend with the dark theme. Native bright white browser checkboxes are strictly forbidden.
* Must be sleek dark squares that illuminate with the Accent Color when checked.

### 4.4 Badges & Tags (Inline Rule)
All badges and tags must render **inline** alongside their associated text — never stacked below:

| Badge | Color | Rule |
|---|---|---|
| `Critical` | Red (`#FF3B30`) + glow | Inline after step text |
| `Optional` | Amber border + subtle bg | Inline after ingredient name |
| `⏱ Duration` | Muted border, mono font | Inline after step text |
| `🔥 Heat` | Orange tint + border | Inline after step text |

### 4.5 Ingredient Override Inputs (Story 5 & 6)
* Ingredient quantity values in accordions are **editable number inputs**, not static text.
* Inputs use transparent backgrounds with a subtle border that turns Accent-colored on focus.
* Quantities that differ from the base (due to yield scaling or manual override) display in **Accent color, bold font**.
* When a manual override is active, a small `(overridden)` label appears in amber mono font next to the ingredient name.

### 4.6 Ratio Mismatch Banner (Story 6)
* When a strict ratio group is broken, a full-width `⚠️ Ratio Mismatch` banner appears above the recipe body.
* Banner uses the Warning Red color with a subtle glow (`box-shadow: 0 0 16px rgba(255, 59, 48, 0.15)`).
* Must contain two clear CTAs:
  * **"Auto-scale Group"** — Accent-colored primary button. Restores mathematical consistency.
  * **"Confirm Break"** — Muted secondary button. Dismisses warning and keeps user's values.
* Banner shows the affected group name and the expected quantities for transparency.

### 4.7 Accordions
* Use native HTML `<details>`/`<summary>` with a CSS chevron that rotates 180° when open.
* The summary chevron is Accent-colored.
* Two tiers: **Global Phase accordion** (heavier border/card) and **Local Block accordion** (lighter border).

### 4.8 Yield Input (Story 5)
* Located in the header alongside the recipe name.
* A transparent number input with a "Servings" label.
* When `targetYield !== baseYield`, a small `(base: N)` hint appears in muted mono font.
* Changing yield resets all manual overrides and clears mismatch banners.

### 4.9 Tolerance Sliders (Story 7 — Planned)
* High-visibility gradient sliders (dark → Stove-Flame Orange).
* An illuminated "thumb" that glows when active.

### 4.10 Timers (Story 9 — Planned)
* Neon/glowing circular progress rings.
* "Start Timer" button visible only on steps with a defined duration.

---

## 5. Dark Mode Policy
* **Default:** Dark Mode native only. The application is built specifically for Dark Mode.
* No light mode toggle is planned until the product reaches a public beta.
