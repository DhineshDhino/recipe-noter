import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, RecipeTry, RecipeComment, UserProfile } from '../lib/types';
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
  // Story 40: Logged cooking attempts and micro-tweaks per recipe
  recipeTries: Record<string, RecipeTry[]>;
  // Story 43: Community recipe comments & cooking questions
  recipeComments: Record<string, RecipeComment[]>;
  // Story 42: Google user authentication identity state
  currentUser: UserProfile;
  // Story 44: Custom user collections (e.g., "Sunday Brunch" -> [recipe IDs])
  customCollections: Record<string, string[]>;
}

const defaultUser: UserProfile = {
  id: 'user_chef_dhinesh',
  name: 'Chef Dhinesh',
  email: 'dhinesh@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  isLoggedIn: true,
};

const initialState: RecipeState = {
  recipe: mockAdaiRecipe,
  targetYield: mockAdaiRecipe.baseYield,
  spiceToleranceMultiplier: 1.0,
  sweetToleranceMultiplier: 1.0,
  ratioMismatches: [],
  ingredientOverrides: {},
  completedStepIds: {},
  language: 'en',
  favorites: ['recipe_adai_001', 'recipe_pbm_002'],
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
  recipeTries: {
    recipe_adai_001: [
      {
        id: 'try_adai_1',
        recipeId: 'recipe_adai_001',
        timestamp: '2026-08-10T09:00:00Z',
        yieldCooked: 4,
        tweaksSummary: 'Added +10g fresh ginger and 5 curry leaves directly into coarse batter grind.',
        tasteNotes: 'Extra aromatic, fantastic crunch on the cast iron tawa with sesame oil.',
        rating: 5,
        photos: ['https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'],
        authorName: 'Chef Dhinesh',
      },
    ],
  },
  recipeComments: {
    recipe_adai_001: [
      {
        id: 'comm_1',
        recipeId: 'recipe_adai_001',
        authorId: 'user_ananya',
        authorName: 'Ananya Ramesh',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
        text: 'Adding a handful of drumstick leaves (murungai keerai) at the end takes this to a whole new level!',
        timestamp: '2026-08-12T14:30:00Z',
        likes: 12,
      },
    ],
  },
  currentUser: defaultUser,
  customCollections: {
    'Sunday Brunch': ['recipe_adai_001', 'recipe_upma_003'],
    'Royal Dinner': ['recipe_pbm_002'],
  },
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

    /**
     * Story 40: Log a new Cooking Try / Tweak attempt
     */
    addRecipeTry: (state, action: PayloadAction<RecipeTry>) => {
      const tryItem = action.payload;
      if (!state.recipeTries[tryItem.recipeId]) {
        state.recipeTries[tryItem.recipeId] = [];
      }
      state.recipeTries[tryItem.recipeId].unshift(tryItem);
    },

    /**
     * Story 40: Delete a Cooking Try attempt
     */
    deleteRecipeTry: (state, action: PayloadAction<{ recipeId: string; tryId: string }>) => {
      const { recipeId, tryId } = action.payload;
      if (state.recipeTries[recipeId]) {
        state.recipeTries[recipeId] = state.recipeTries[recipeId].filter(t => t.id !== tryId);
      }
    },

    /**
     * Story 43: Add a Community Comment to a recipe
     */
    addRecipeComment: (state, action: PayloadAction<RecipeComment>) => {
      const comment = action.payload;
      if (!state.recipeComments[comment.recipeId]) {
        state.recipeComments[comment.recipeId] = [];
      }
      state.recipeComments[comment.recipeId].unshift(comment);
    },

    /**
     * Story 43: Like / upvote a community comment
     */
    likeRecipeComment: (state, action: PayloadAction<{ recipeId: string; commentId: string }>) => {
      const { recipeId, commentId } = action.payload;
      const comment = state.recipeComments[recipeId]?.find(c => c.id === commentId);
      if (comment) {
        comment.likes += 1;
      }
    },

    /**
     * Story 43: Delete a comment
     */
    deleteRecipeComment: (state, action: PayloadAction<{ recipeId: string; commentId: string }>) => {
      const { recipeId, commentId } = action.payload;
      if (state.recipeComments[recipeId]) {
        state.recipeComments[recipeId] = state.recipeComments[recipeId].filter(c => c.id !== commentId);
      }
    },

    /**
     * Story 42: Set active Google / authenticated user
     */
    setCurrentUser: (state, action: PayloadAction<UserProfile>) => {
      state.currentUser = { ...action.payload };
    },

    /**
     * Story 42: Log out to guest mode
     */
    logoutUser: (state) => {
      state.currentUser = {
        id: 'guest',
        name: 'Guest Cook',
        email: '',
        isLoggedIn: false,
      };
    },

    /**
     * Story 44: Create custom collection
     */
    createCollection: (state, action: PayloadAction<{ name: string; recipeIds?: string[] }>) => {
      state.customCollections[action.payload.name] = action.payload.recipeIds || [];
    },

    /**
     * Story 44: Toggle recipe membership in custom collection
     */
    toggleRecipeInCollection: (state, action: PayloadAction<{ collectionName: string; recipeId: string }>) => {
      const { collectionName, recipeId } = action.payload;
      if (!state.customCollections[collectionName]) {
        state.customCollections[collectionName] = [];
      }
      const col = state.customCollections[collectionName];
      if (col.includes(recipeId)) {
        state.customCollections[collectionName] = col.filter(id => id !== recipeId);
      } else {
        state.customCollections[collectionName].push(recipeId);
      }
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
  addRecipeTry,
  deleteRecipeTry,
  addRecipeComment,
  likeRecipeComment,
  deleteRecipeComment,
  setCurrentUser,
  logoutUser,
  createCollection,
  toggleRecipeInCollection,
} = recipeSlice.actions;

export default recipeSlice.reducer;
