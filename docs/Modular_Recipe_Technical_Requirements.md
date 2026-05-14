# Technical Requirements Document: Standardized Modular Recipe System (V2)

## 1. System Vision
A high-precision, technical manual for culinary execution. The system strictly separates **Preparation (Prerequisites)** from **Cooking (Active Execution)** and utilizes a **Relational Ratio Engine** for mathematically sound scaling across yield, taste preferences, and multiple independent ingredient relationships.

---

## 2. Core Architectural Principles

### 2.1 Data Normalization
* **Internal Storage:** Continuous ingredients are normalized to base units (Grams for weight, Milliliters for volume). Discrete/countable ingredients (like eggs or bay leaves) retain their specific unit (e.g., "count" or "pieces").
* **Display Layer:** Viewer sees values in precise decimals accompanied by the unit (e.g., "12.55 g" or "3 count").

### 2.2 Multi-Group Relational Ratio Engine
* **Independent Ratio Groups:** A recipe can contain multiple independent mathematical sets (e.g., a "Batter Ratio" and a "Liquid Ratio").
* **Yield Scaling:** A global multiplier affects all ingredients and yield-dependent step durations.
* **Tolerance Sliders:** "Spice" and "Sweetness" inputs. 
    * Mandatory tagging of source ingredients.
    * Linear scaling fallback (Low: 50%, High: 150%).
* **Optional Ingredients:** Fixed quantities that do not scale with yield; a warning is displayed to the viewer if they are included.
* **Substitutions:** Handled via "Tagged Equivalents" (1:1 interchangeability unless adjusted). Substitutions are scoped strictly per-recipe or per-block to ensure exact control.

---

## 3. Data Structure (The "Noter" Experience)

### 3.1 Multi-Block Hierarchy
Recipes are structured into **Component Blocks** (e.g., "The Marinade," "The Tempering").
* **Prep Blocks:** Offline prerequisites.
* **Cook Blocks:** Active stove-side steps.
* **Passive Blocks:** Waiting periods (soaking, marinating, proofing). These act as milestones that distinctly separate active prep from active cooking.

### 3.2 Ingredient & Ratio Management
* **Master Registry:** Every recipe maintains a central Master Ingredient List.
* **Ratio Registry:** A dedicated section where the Noter defines mathematical relationships between specific ingredients from the Master Registry.
* **Scoped Collection:** Within a Component Block, the Noter "collects" ingredients via autocomplete. 
* **Dynamic Sync:** Adding an ingredient inside a block automatically updates the Master Registry.

### 3.3 Atomic Step Entry
* **Granularity:** Every instruction is a discrete object.
* **Time Logic:** Steps can be flagged as "Fixed" or "Yield-Dependent."
* **Heat/Temp:** Hybrid input allowing both Intensity (Medium) and Precision Temperature (180°C).
* **Embedded Tools:** Equipment is mentioned directly within step text and aggregated into a global "Required Equipment" checklist for upfront "Mise en Place".

---

## 4. The Viewer Experience (UI/UX)

### 4.1 Responsive Dashboard Layout
* **Large/Medium Devices:** Two-column Dashboard View (Prep vs. Cook).
* **Mobile Devices:** Single-column vertical stack.
* **Contextual Callouts:** "Important Secrets" or "Critical Processes" are displayed as pro-tips alongside relevant steps.

### 4.2 Interactive Workflow
* **Progress Tracking:** Individual checkboxes for steps and integrated timers.
* **Strict Mode Validation:** If a user manually modifies an ingredient that is part of a **Ratio Group**, the system flags a "Ratio Mismatch" and prompts to either auto-scale the entire group or confirm the break in ratio.

---

## 5. Implementation Schema (Typescript)

```typescript
type Unit = "g" | "ml" | "count" | string;

interface Version {
  versionName: string; // e.g., "Mom's Version", "Grandmom's Authentic"
  author?: string;
  timestamp: Date;
}

interface IngredientTranslation {
  language: string; // e.g., "Tamil", "Hindi"
  name: string;
}

interface IngredientRegistry {
  id: string;
  defaultName: string;
  translations: IngredientTranslation[];
}

interface Recipe {
  id: string;
  name: string;
  baseYield: number; // The anchor serving size (e.g., number of people) defined by the noter
  versionHistory: Version[];
  masterIngredients: IngredientRegistry[];
  requiredEquipment: string[]; // Aggregated checklist of tools needed
  ratioGroups: RatioGroup[]; // Centralized ratio management
  prepBlocks: ComponentBlock[];
  passiveBlocks: ComponentBlock[]; // Waiting periods (e.g., marinating)
  cookBlocks: ComponentBlock[];
  pairings: string[];
}

interface RatioGroup {
  id: string;
  name: string; // e.g., "Batter Consistency", "Liquid-to-Grain"
  members: {
    ingredientId: string;
    parts: number; // The relational unit (e.g., 1 part, 2 parts)
  }[];
  isStrict: boolean; // Triggers the "Mismatch" UI warning
}

interface ComponentBlock {
  name: string;
  totalDurationInMinutes: number; // Mandatory total time for this block
  ingredients: ScopedIngredient[];
  steps: AtomicStep[];
}

interface AtomicStep {
  text: string;
  duration?: {
    value: number;
    isYieldDependent: boolean;
  };
  heat?: {
    intensity: "Low" | "Medium" | "High";
    precisionTemp?: number;
  };
  isCritical: boolean;
}

interface ScopedIngredient {
  ingredientId: string;
  quantity: number; // Base quantity anchored to baseYield
  unit: Unit; // Unit lives locally in the scope
  isOptional: boolean; // If true, fixed quantity + scaling warning
  allowedSubstitutes?: string[]; // Array of ingredient IDs allowed as substitutes for this block
  tags: ("spice" | "sweet")[];
}
```

---

## 6. Technology Stack
* **Framework:** Next.js (Provides a robust foundation for both the frontend dashboard and backend REST API integration via Route Handlers).
* **Database:** MongoDB via Mongoose (For robust schema validation and persistent storage of complex nested recipe objects).
* **Styling:** Tailwind CSS (Enables rapid, highly-customizable styling to match the "Modern Chef" dark mode aesthetic).
* **State Management:** Redux Toolkit (Handles the complex global state of the application, including the relational ratio scaling engine, block progress, and fetching data from the API).