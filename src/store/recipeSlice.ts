import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../lib/types';
import { mockAdaiRecipe } from '../lib/mockRecipe';

// Represents a detected inconsistency in a strict ratio group
export interface RatioMismatch {
  groupId: string;
  groupName: string;
  // Map of ingredientId -> the quantity value the user entered
  detectedQuantities: Record<string, number>;
  // Map of ingredientId -> what the quantity should be to stay in ratio
  expectedQuantities: Record<string, number>;
}

interface RecipeState {
  recipe: Recipe | null;
  targetYield: number;
  spiceToleranceMultiplier: number;
  sweetToleranceMultiplier: number;
  // Story 6: Track active ratio mismatches so the UI can prompt the user
  ratioMismatches: RatioMismatch[];
  // Story 6: Per-ingredient manual overrides (ingredientId -> overridden quantity)
  ingredientOverrides: Record<string, number>;
}

const initialState: RecipeState = {
  recipe: mockAdaiRecipe,
  targetYield: mockAdaiRecipe.baseYield,
  spiceToleranceMultiplier: 1.0,
  sweetToleranceMultiplier: 1.0,
  ratioMismatches: [],
  ingredientOverrides: {},
};

export const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setTargetYield: (state, action: PayloadAction<number>) => {
      state.targetYield = action.payload;
      // Clear all manual overrides when the global yield changes
      state.ingredientOverrides = {};
      state.ratioMismatches = [];
    },

    setSpiceTolerance: (state, action: PayloadAction<number>) => {
      state.spiceToleranceMultiplier = action.payload;
    },

    setSweetTolerance: (state, action: PayloadAction<number>) => {
      state.sweetToleranceMultiplier = action.payload;
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
  },
});

export const {
  setTargetYield,
  setSpiceTolerance,
  setSweetTolerance,
  setIngredientOverride,
  autoScaleGroup,
  confirmBreakRatio,
} = recipeSlice.actions;

export default recipeSlice.reducer;
