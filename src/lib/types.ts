export type Unit = "g" | "ml" | "count" | string;

export interface Version {
  versionName: string; // e.g., "Mom's Version", "Grandmom's Authentic"
  author?: string;
  timestamp: string; // ISO 8601 string — Date objects are non-serializable in Redux
}

export interface IngredientTranslation {
  language: string; // e.g., "Tamil", "Hindi"
  name: string;
}

export interface IngredientRegistry {
  id: string;
  defaultName: string;
  translations: IngredientTranslation[];
}

export interface Recipe {
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

export interface RatioGroup {
  id: string;
  name: string; // e.g., "Batter Consistency", "Liquid-to-Grain"
  members: {
    ingredientId: string;
    parts: number; // The relational unit (e.g., 1 part, 2 parts)
  }[];
  isStrict: boolean; // Triggers the "Mismatch" UI warning
}

export interface ComponentBlock {
  name: string;
  totalDurationInMinutes: number; // Mandatory total time for this block
  ingredients: ScopedIngredient[];
  steps: AtomicStep[];
}

export interface AtomicStep {
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

export interface ScopedIngredient {
  ingredientId: string;
  quantity: number; // Base quantity anchored to baseYield
  unit: Unit; // Unit lives locally in the scope
  isOptional: boolean; // If true, fixed quantity + scaling warning
  allowedSubstitutes?: string[]; // Array of ingredient IDs allowed as substitutes for this block
  tags: ("spice" | "sweet")[];
}
