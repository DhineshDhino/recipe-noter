import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../lib/types';
import { mockAdaiRecipe } from '../lib/mockRecipe';

import { SupportedLanguage } from '../lib/conversions';

// Represents a detected inconsistency in a strict ratio group
export interface RatioMismatch {
  groupId: string;
  groupName: string;
  // Map of ingredientId -> the quantity value the user entered
  detectedQuantities: Record<string, number>;
  // Map of ingredientId -> what the quantity should be to stay in ratio
  expectedQuantities: Record<string, number>;
}

export interface RecipeState {
  recipe: Recipe | null;
  targetYield: number;
  spiceToleranceMultiplier: number;
  sweetToleranceMultiplier: number;
  // Story 6: Track active ratio mismatches so the UI can prompt the user
  ratioMismatches: RatioMismatch[];
  // Story 6: Per-ingredient manual overrides (ingredientId -> overridden quantity)
  ingredientOverrides: Record<string, number>;
  // Story 24: Step execution checklist tracking (stepKey -> boolean)
  completedStepIds: Record<string, boolean>;
  // Story 17: Active language selection ('en' | 'ta' | 'hi')
  language: SupportedLanguage;
  // Story 21: Bookmarked favorite recipes (recipe IDs)
  favorites: string[];
  // Story 21: Private cooking notes per recipe (recipeId -> text)
  recipeNotes: Record<string, string>;
  // Story 35: Kitchen pantry inventory (ingredient IDs currently available at home)
  userPantryIngredientIds: string[];
}

const initialState: RecipeState = {
  recipe: mockAdaiRecipe,
  targetYield: mockAdaiRecipe.baseYield,
  spiceToleranceMultiplier: 1.0,
  sweetToleranceMultiplier: 1.0,
  ratioMismatches: [],
  ingredientOverrides: {},
  completedStepIds: {},
  language: 'en',
  favorites: ['recipe_adai_anchor', 'recipe_pbm_002'],
  recipeNotes: {},
  userPantryIngredientIds: [
    'ing_raw_rice',
    'ing_boiled_rice',
    'ing_toor_dal',
    'ing_urad_dal',
    'ing_chana_dal',
    'ing_moong_dal',
    'ing_onions',
    'ing_salt',
    'ing_mustard_seeds',
    'ing_ghee',
    'ing_ginger',
    'ing_green_chilli',
    'ing_curry_leaves',
    'ing_rava',
  ],
};

export const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    /**
     * Story 12.1: Load a new active recipe into Reader View
     */
    loadRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipe = action.payload;
      state.targetYield = action.payload.baseYield || 4;
      state.ingredientOverrides = {};
      state.ratioMismatches = [];
      state.completedStepIds = {};
      state.spiceToleranceMultiplier = 1.0;
      state.sweetToleranceMultiplier = 1.0;
    },

    setTargetYield: (state, action: PayloadAction<number>) => {
      state.targetYield = action.payload;
      // Clear all manual overrides when the global yield changes
      state.ingredientOverrides = {};
      state.ratioMismatches = [];
    },

    /**
     * Story 26: Adjust spice tolerance multiplier (e.g. 0.5 for Mild, 1.5 for Spicy)
     */
    setSpiceTolerance: (state, action: PayloadAction<number>) => {
      state.spiceToleranceMultiplier = action.payload;
    },

    /**
     * Story 26: Adjust sweetness tolerance multiplier (e.g. 0.5 for Low, 1.5 for Sweet)
     */
    setSweetTolerance: (state, action: PayloadAction<number>) => {
      state.sweetToleranceMultiplier = action.payload;
    },

    /**
     * Story 24: Toggle single step completion status
     */
    toggleStepCompleted: (state, action: PayloadAction<{ stepKey: string }>) => {
      const { stepKey } = action.payload;
      state.completedStepIds[stepKey] = !state.completedStepIds[stepKey];
    },

    /**
     * Story 24: Reset all step progress
     */
    resetStepProgress: (state) => {
      state.completedStepIds = {};
    },

    /**
     * Story 24: Bulk set completion state
     */
    setAllStepsCompleted: (state, action: PayloadAction<{ stepKeys: string[]; completed: boolean }>) => {
      const { stepKeys, completed } = action.payload;
      stepKeys.forEach(k => {
        state.completedStepIds[k] = completed;
      });
    },

    /**
     * Story 6 - Task 1: Override a single ingredient quantity manually.
     * After updating, checks all strict ratio groups for mismatches.
     */
    setIngredientOverride: (
      state,
      action: PayloadAction<{ ingredientId: string; quantity: number }>
    ) => {
      const { ingredientId, quantity } = action.payload;
      state.ingredientOverrides[ingredientId] = quantity;

      if (!state.recipe) return;

      // Check all STRICT ratio groups for mismatches
      const newMismatches: RatioMismatch[] = [];
      for (const group of state.recipe.ratioGroups) {
        if (!group.isStrict) continue;

        // Find the first member with a known quantity to use as the reference
        const referenceIngredient = group.members.find(
          m => state.ingredientOverrides[m.ingredientId] !== undefined
        );
        if (!referenceIngredient) continue;

        const referenceQty = state.ingredientOverrides[referenceIngredient.ingredientId];
        const referenceRatio = referenceQty / referenceIngredient.parts;

        // Calculate what every other member's qty SHOULD be based on this reference
        const expectedQuantities: Record<string, number> = {};
        const detectedQuantities: Record<string, number> = {};
        let hasMismatch = false;

        for (const member of group.members) {
          const expectedQty = Math.round(referenceRatio * member.parts * 100) / 100;
          expectedQuantities[member.ingredientId] = expectedQty;

          const actualQty = state.ingredientOverrides[member.ingredientId];
          if (actualQty !== undefined) {
            detectedQuantities[member.ingredientId] = actualQty;
            if (Math.abs(actualQty - expectedQty) > 0.01) {
              hasMismatch = true;
            }
          }
        }

        if (hasMismatch) {
          newMismatches.push({
            groupId: group.id,
            groupName: group.name,
            detectedQuantities,
            expectedQuantities,
          });
        }
      }
      state.ratioMismatches = newMismatches;
    },

    /**
     * Story 6 - Task 3: Auto-scale all siblings in a ratio group
     * to match the reference ingredient the user typed.
     */
    autoScaleGroup: (state, action: PayloadAction<{ groupId: string }>) => {
      if (!state.recipe) return;
      const { groupId } = action.payload;
      const mismatch = state.ratioMismatches.find(m => m.groupId === groupId);
      if (!mismatch) return;

      // Apply expected quantities as overrides
      for (const [ingId, qty] of Object.entries(mismatch.expectedQuantities)) {
        state.ingredientOverrides[ingId] = qty;
      }
      // Clear this specific mismatch
      state.ratioMismatches = state.ratioMismatches.filter(m => m.groupId !== groupId);
    },

    /**
     * Story 6 - Task 3: User intentionally breaks the ratio — dismiss the warning.
     */
    confirmBreakRatio: (state, action: PayloadAction<{ groupId: string }>) => {
      state.ratioMismatches = state.ratioMismatches.filter(
        m => m.groupId !== action.payload.groupId
      );
    },

    /**
     * Story 17: Set active display language (English / Tamil / Hindi)
     */
    setLanguage: (state, action: PayloadAction<SupportedLanguage>) => {
      state.language = action.payload;
    },

    /**
     * Story 21: Toggle favorite bookmark status for a recipe
     */
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter(f => f !== id);
      } else {
        state.favorites.push(id);
      }
    },

    /**
     * Story 21: Save private chef note for a recipe
     */
    setRecipeNote: (state, action: PayloadAction<{ recipeId: string; note: string }>) => {
      state.recipeNotes[action.payload.recipeId] = action.payload.note;
    },

    /**
     * Story 35: Toggle ingredient in user's pantry inventory
     */
    togglePantryIngredient: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.userPantryIngredientIds.includes(id)) {
        state.userPantryIngredientIds = state.userPantryIngredientIds.filter(i => i !== id);
      } else {
        state.userPantryIngredientIds.push(id);
      }
    },

    /**
     * Story 35: Set entire pantry inventory array
     */
    setPantryIngredients: (state, action: PayloadAction<string[]>) => {
      state.userPantryIngredientIds = [...action.payload];
    },

    /**
     * Story 35: Clear all pantry ingredients
     */
    clearPantry: (state) => {
      state.userPantryIngredientIds = [];
    },
  },
});

export const {
  loadRecipe,
  setTargetYield,
  setSpiceTolerance,
  setSweetTolerance,
  toggleStepCompleted,
  resetStepProgress,
  setAllStepsCompleted,
  setIngredientOverride,
  autoScaleGroup,
  confirmBreakRatio,
  setLanguage,
  toggleFavorite,
  setRecipeNote,
  togglePantryIngredient,
  setPantryIngredients,
  clearPantry,
} = recipeSlice.actions;

export default recipeSlice.reducer;
