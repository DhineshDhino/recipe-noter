import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe } from '../lib/types';
import { mockAdaiRecipe } from '../lib/mockRecipe';

interface RecipeState {
  recipe: Recipe | null;
  targetYield: number; // The user-defined global yield multiplier
  spiceToleranceMultiplier: number; // 0.5 to 1.5
  sweetToleranceMultiplier: number; // 0.5 to 1.5
}

const initialState: RecipeState = {
  // We initialize with our mock data for development
  recipe: mockAdaiRecipe,
  targetYield: mockAdaiRecipe.baseYield,
  spiceToleranceMultiplier: 1.0,
  sweetToleranceMultiplier: 1.0,
};

export const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setTargetYield: (state, action: PayloadAction<number>) => {
      state.targetYield = action.payload;
    },
    setSpiceTolerance: (state, action: PayloadAction<number>) => {
      state.spiceToleranceMultiplier = action.payload;
    },
    setSweetTolerance: (state, action: PayloadAction<number>) => {
      state.sweetToleranceMultiplier = action.payload;
    },
    // We will expand this later to handle Ratio Engine mismatches and workflow steps
  },
});

export const { setTargetYield, setSpiceTolerance, setSweetTolerance } = recipeSlice.actions;

export default recipeSlice.reducer;
