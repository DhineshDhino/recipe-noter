import { Middleware } from '@reduxjs/toolkit';
import { initialRecipeState } from './recipeSlice';
import { initialEditorState } from './editorSlice';

export const STORAGE_KEY = 'what2cook_redux_state_v1';

/**
 * Safely loads persisted Redux state from browser localStorage and merges with default slice states.
 * Returns undefined if running on server (SSR) or if storage is empty/invalid.
 */
export const loadPersistedState = (): any => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return undefined;
    }
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;

    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== 'object') return undefined;

    return {
      recipe: {
        ...initialRecipeState,
        ...(parsed.recipe || {}),
        activeTimers: parsed.recipe?.activeTimers || {},
        completedStepIds: parsed.recipe?.completedStepIds || {},
        ingredientOverrides: parsed.recipe?.ingredientOverrides || {},
        recipeNotes: parsed.recipe?.recipeNotes || {},
        favorites: parsed.recipe?.favorites || initialRecipeState.favorites,
        userPantryIngredientIds:
          parsed.recipe?.userPantryIngredientIds || initialRecipeState.userPantryIngredientIds,
        recipeTries: parsed.recipe?.recipeTries || initialRecipeState.recipeTries,
        recipeComments: parsed.recipe?.recipeComments || initialRecipeState.recipeComments,
        currentUser: parsed.recipe?.currentUser || initialRecipeState.currentUser,
        customCollections: parsed.recipe?.customCollections || initialRecipeState.customCollections,
        recipe: parsed.recipe?.recipe || initialRecipeState.recipe,
        targetYield: parsed.recipe?.targetYield || initialRecipeState.targetYield,
      },
      editor: {
        ...initialEditorState,
        ...(parsed.editor || {}),
        prepBlocks: parsed.editor?.prepBlocks?.length
          ? parsed.editor.prepBlocks
          : initialEditorState.prepBlocks,
        passiveBlocks: parsed.editor?.passiveBlocks?.length
          ? parsed.editor.passiveBlocks
          : initialEditorState.passiveBlocks,
        cookBlocks: parsed.editor?.cookBlocks?.length
          ? parsed.editor.cookBlocks
          : initialEditorState.cookBlocks,
        masterIngredients: parsed.editor?.masterIngredients?.length
          ? parsed.editor.masterIngredients
          : initialEditorState.masterIngredients,
      },
    };
  } catch (err) {
    console.warn('Failed to load persisted state from localStorage:', err);
    return undefined;
  }
};

/**
 * Safely writes Redux state to browser localStorage.
 */
export const savePersistedState = (state: any): void => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    // Only persist essential slices (recipe, editor)
    const toPersist = {
      recipe: {
        userPantryIngredientIds: state.recipe?.userPantryIngredientIds,
        favorites: state.recipe?.favorites,
        recipeNotes: state.recipe?.recipeNotes,
        unitSystem: state.recipe?.unitSystem,
        language: state.recipe?.language,
        recipeTries: state.recipe?.recipeTries,
        customCollections: state.recipe?.customCollections,
      },
      editor: {
        recipeName: state.editor?.recipeName,
        baseYield: state.editor?.baseYield,
        prepBlocks: state.editor?.prepBlocks,
        passiveBlocks: state.editor?.passiveBlocks,
        cookBlocks: state.editor?.cookBlocks,
        ratioGroups: state.editor?.ratioGroups,
        masterIngredients: state.editor?.masterIngredients,
        requiredEquipment: state.editor?.requiredEquipment,
        mealSlots: state.editor?.mealSlots,
        dietary: state.editor?.dietary,
        difficulty: state.editor?.difficulty,
      },
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
};

/**
 * Redux middleware that automatically synchronizes state changes to localStorage.
 */
export const persistenceMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action);
  const state = storeAPI.getState();
  savePersistedState(state);
  return result;
};
