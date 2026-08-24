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

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'late_night' | 'anytime';
export type DietaryCategory = 'vegetarian' | 'vegan' | 'gluten_free' | 'jain' | 'high_protein';
export type RecipeDifficulty = 'easy' | 'medium' | 'advanced';

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
  photoPool?: PoolPhoto[];
  mealSlots?: MealSlot[];
  dietary?: DietaryCategory[];
  difficulty?: RecipeDifficulty;
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

export type StepImageStage = 'while_cooking' | 'after_step';

export interface StepImage {
  id?: string;
  url: string;
  caption?: string;
  stage: StepImageStage; // 'while_cooking' (During step execution) vs 'after_step' (Expected visual outcome)
}

export interface PoolPhoto {
  id: string;
  url: string;
  caption?: string;
  defaultStage?: StepImageStage;
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
  images?: StepImage[];
}

export interface ScopedIngredient {
  ingredientId: string;
  quantity: number; // Base quantity anchored to baseYield
  unit: Unit; // Unit lives locally in the scope
  isOptional: boolean; // If true, fixed quantity + scaling warning
  isCritical?: boolean; // If true, non-negotiable structural core ingredient (⚡)
  allowedSubstitutes?: string[]; // Array of ingredient IDs allowed as substitutes for this block
  tags: ("spice" | "sweet")[];
}

export interface RecipeTry {
  id: string;
  recipeId: string;
  timestamp: string; // ISO 8601 string
  yieldCooked: number;
  tweaksSummary: string; // e.g., "Added +10g ginger, reduced chilli, cooked 2m longer"
  tasteNotes: string; // e.g., "Very crispy edges, aromatic ginger finish"
  rating: number; // 1 to 5 stars
  photos?: string[];
  authorId?: string;
  authorName?: string;
}

export interface RecipeComment {
  id: string;
  recipeId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
  likes: number;
  parentCommentId?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isLoggedIn: boolean;
}
