import reducer, {
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
  addRecipeTry,
  deleteRecipeTry,
  addRecipeComment,
  likeRecipeComment,
  deleteRecipeComment,
  setCurrentUser,
  logoutUser,
  createCollection,
  toggleRecipeInCollection,
} from './recipeSlice';
import { mockAdaiRecipe } from '../lib/mockRecipe';

// ─────────────────────────────────────────────
// Initial State & Basic Actions
// ─────────────────────────────────────────────
describe('recipeSlice — Initial State & Basic Actions (Story 1)', () => {
  it('initializes with mock recipe data', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.recipe).toEqual(mockAdaiRecipe);
    expect(state.targetYield).toEqual(mockAdaiRecipe.baseYield);
    expect(state.spiceToleranceMultiplier).toEqual(1.0);
    expect(state.sweetToleranceMultiplier).toEqual(1.0);
    expect(state.ratioMismatches).toEqual([]);
    expect(state.ingredientOverrides).toEqual({});
  });

  it('does not mutate state on unknown action', () => {
    const before = reducer(undefined, { type: 'unknown' });
    const after = reducer(before, { type: 'another_unknown' });
    expect(after).toEqual(before);
  });

  it('setTargetYield updates targetYield', () => {
    const state = reducer(undefined, setTargetYield(8));
    expect(state.targetYield).toBe(8);
  });

  it('setTargetYield accepts a value of 1 (minimum)', () => {
    const state = reducer(undefined, setTargetYield(1));
    expect(state.targetYield).toBe(1);
  });

  it('setTargetYield accepts a large value', () => {
    const state = reducer(undefined, setTargetYield(100));
    expect(state.targetYield).toBe(100);
  });

  it('setSpiceTolerance updates spiceToleranceMultiplier', () => {
    const state = reducer(undefined, setSpiceTolerance(1.5));
    expect(state.spiceToleranceMultiplier).toBe(1.5);
  });

  it('setSpiceTolerance accepts minimum value (0.5)', () => {
    const state = reducer(undefined, setSpiceTolerance(0.5));
    expect(state.spiceToleranceMultiplier).toBe(0.5);
  });

  it('setSweetTolerance updates sweetToleranceMultiplier', () => {
    const state = reducer(undefined, setSweetTolerance(0.5));
    expect(state.sweetToleranceMultiplier).toBe(0.5);
  });

  it('setTargetYield clears all overrides and mismatches', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 999 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 1 }));
    // Should have a mismatch now
    expect(state.ratioMismatches.length).toBeGreaterThan(0);

    state = reducer(state, setTargetYield(8));
    expect(state.ingredientOverrides).toEqual({});
    expect(state.ratioMismatches).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// Story 6 — Ingredient Overrides
// ─────────────────────────────────────────────
describe('recipeSlice — Story 6: Ingredient Overrides', () => {
  it('stores a single ingredient override', () => {
    const state = reducer(undefined, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    expect(state.ingredientOverrides['ing_raw_rice']).toBe(200);
  });

  it('stores multiple different ingredient overrides independently', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_salt', quantity: 10 }));
    expect(state.ingredientOverrides['ing_raw_rice']).toBe(200);
    expect(state.ingredientOverrides['ing_salt']).toBe(10);
  });

  it('overwrites a previous override for the same ingredient', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 100 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 300 }));
    expect(state.ingredientOverrides['ing_raw_rice']).toBe(300);
  });

  it('handles override of 0 (valid boundary)', () => {
    const state = reducer(undefined, setIngredientOverride({ ingredientId: 'ing_salt', quantity: 0 }));
    expect(state.ingredientOverrides['ing_salt']).toBe(0);
  });
});

// ─────────────────────────────────────────────
// Story 6 — Ratio Mismatch Detection
// ─────────────────────────────────────────────
describe('recipeSlice — Story 6: Ratio Mismatch Detection', () => {
  it('does NOT flag a mismatch when only one member is overridden', () => {
    // A mismatch requires at least 2 members with values to compare
    const state = reducer(undefined, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    expect(state.ratioMismatches).toHaveLength(0);
  });

  it('flags a strict ratio mismatch when 1:1 group is broken', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 50 }));
    const mismatch = state.ratioMismatches.find(m => m.groupId === 'ratio_rice');
    expect(mismatch).toBeDefined();
    expect(mismatch?.groupName).toBe('Rice Blend (1:1)');
  });

  it('mismatch contains correct expectedQuantities for the reference ingredient', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 50 }));
    const mismatch = state.ratioMismatches.find(m => m.groupId === 'ratio_rice');
    // In a 1:1 ratio, if raw_rice = 200, boiled_rice should also be 200
    expect(mismatch?.expectedQuantities['ing_boiled_rice']).toBe(200);
  });

  it('does NOT flag a mismatch when ratio is maintained', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 150 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 150 }));
    expect(state.ratioMismatches).toHaveLength(0);
  });

  it('does NOT flag mismatches for non-strict ratio groups', () => {
    // ratio_rice_to_dal is isStrict: false — should never trigger a mismatch
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_toor_dal', quantity: 5 })); // wildly off ratio
    const nonStrictMismatch = state.ratioMismatches.find(m => m.groupId === 'ratio_rice_to_dal');
    expect(nonStrictMismatch).toBeUndefined();
  });

  it('can flag multiple simultaneous mismatches across different groups', () => {
    let state = reducer(undefined, { type: 'unknown' });
    // Break Rice Blend (ratio_rice)
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 10 }));
    // Break Dal Blend (ratio_dal)
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_toor_dal', quantity: 100 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_urad_dal', quantity: 5 }));
    expect(state.ratioMismatches.length).toBeGreaterThanOrEqual(2);
  });

  it('clears a mismatch when the user corrects the override to match ratio', () => {
    let state = reducer(undefined, { type: 'unknown' });
    // Create a mismatch
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 50 }));
    expect(state.ratioMismatches).toHaveLength(1);
    // Then correct it
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 200 }));
    const mismatch = state.ratioMismatches.find(m => m.groupId === 'ratio_rice');
    expect(mismatch).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// Story 6 — Resolution Actions
// ─────────────────────────────────────────────
describe('recipeSlice — Story 6: Resolution Actions', () => {
  // Helper to set up a standard mismatch state
  const withRiceMismatch = () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 50 }));
    return state;
  };

  it('autoScaleGroup: clears the mismatch', () => {
    let state = withRiceMismatch();
    state = reducer(state, autoScaleGroup({ groupId: 'ratio_rice' }));
    expect(state.ratioMismatches.find(m => m.groupId === 'ratio_rice')).toBeUndefined();
  });

  it('autoScaleGroup: corrects sibling to match the 1:1 ratio', () => {
    let state = withRiceMismatch();
    state = reducer(state, autoScaleGroup({ groupId: 'ratio_rice' }));
    expect(state.ingredientOverrides['ing_boiled_rice']).toBe(200);
  });

  it('autoScaleGroup: does nothing if groupId is unknown', () => {
    let state = withRiceMismatch();
    const before = JSON.stringify(state);
    state = reducer(state, autoScaleGroup({ groupId: 'ratio_nonexistent' }));
    expect(JSON.stringify(state)).toBe(before);
  });

  it('autoScaleGroup: only resolves the targeted group, leaving other mismatches intact', () => {
    let state = reducer(undefined, { type: 'unknown' });
    // Two mismatches
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 10 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_toor_dal', quantity: 100 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_urad_dal', quantity: 5 }));
    const mismatchesBefore = state.ratioMismatches.length;
    expect(mismatchesBefore).toBeGreaterThanOrEqual(2);

    // Resolve only the rice group
    state = reducer(state, autoScaleGroup({ groupId: 'ratio_rice' }));
    expect(state.ratioMismatches.find(m => m.groupId === 'ratio_rice')).toBeUndefined();
    // Dal mismatch should still exist
    expect(state.ratioMismatches.find(m => m.groupId === 'ratio_dal')).toBeDefined();
  });

  it('confirmBreakRatio: dismisses the mismatch warning', () => {
    let state = withRiceMismatch();
    state = reducer(state, confirmBreakRatio({ groupId: 'ratio_rice' }));
    expect(state.ratioMismatches.find(m => m.groupId === 'ratio_rice')).toBeUndefined();
  });

  it('confirmBreakRatio: preserves the user overrides as-is', () => {
    let state = withRiceMismatch();
    state = reducer(state, confirmBreakRatio({ groupId: 'ratio_rice' }));
    // The broken values should remain unchanged
    expect(state.ingredientOverrides['ing_raw_rice']).toBe(200);
    expect(state.ingredientOverrides['ing_boiled_rice']).toBe(50);
  });

  it('confirmBreakRatio: does nothing if groupId does not exist', () => {
    let state = withRiceMismatch();
    const mismatchCount = state.ratioMismatches.length;
    state = reducer(state, confirmBreakRatio({ groupId: 'ratio_nonexistent' }));
    expect(state.ratioMismatches).toHaveLength(mismatchCount);
  });
});

// ─────────────────────────────────────────────
// Story 12.1 — loadRecipe
// ─────────────────────────────────────────────
describe('recipeSlice — Story 12.1: loadRecipe', () => {
  it('loads a custom recipe into active reader state and resets progress and overrides', () => {
    let state = reducer(undefined, { type: 'unknown' });
    // Add overrides and checked step
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 999 }));
    state = reducer(state, toggleStepCompleted({ stepKey: 'prep-0-0' }));
    expect(state.completedStepIds['prep-0-0']).toBe(true);

    const customRecipe = {
      ...mockAdaiRecipe,
      id: 'custom_biryani_01',
      name: 'Hyderabadi Dum Biryani',
      baseYield: 6,
    };

    state = reducer(state, loadRecipe(customRecipe));
    expect(state.recipe?.id).toBe('custom_biryani_01');
    expect(state.recipe?.name).toBe('Hyderabadi Dum Biryani');
    expect(state.targetYield).toBe(6);
    expect(state.ingredientOverrides).toEqual({});
    expect(state.completedStepIds).toEqual({});
    expect(state.ratioMismatches).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// Story 24 — Step Progress Checklist
// ─────────────────────────────────────────────
describe('recipeSlice — Story 24: Step Execution Checklist', () => {
  it('toggles a step completion state from false to true and back', () => {
    let state = reducer(undefined, { type: 'unknown' });
    expect(state.completedStepIds['prep-0-0']).toBeFalsy();

    state = reducer(state, toggleStepCompleted({ stepKey: 'prep-0-0' }));
    expect(state.completedStepIds['prep-0-0']).toBe(true);

    state = reducer(state, toggleStepCompleted({ stepKey: 'prep-0-0' }));
    expect(state.completedStepIds['prep-0-0']).toBe(false);
  });

  it('resets all step progress', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, toggleStepCompleted({ stepKey: 'prep-0-0' }));
    state = reducer(state, toggleStepCompleted({ stepKey: 'cook-0-1' }));
    expect(Object.keys(state.completedStepIds).length).toBe(2);

    state = reducer(state, resetStepProgress());
    expect(state.completedStepIds).toEqual({});
  });

  it('bulk sets step completion states', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(
      state,
      setAllStepsCompleted({ stepKeys: ['prep-0-0', 'prep-0-1'], completed: true })
    );
    expect(state.completedStepIds['prep-0-0']).toBe(true);
    expect(state.completedStepIds['prep-0-1']).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Story 26 — Taste Profile Multipliers
// ─────────────────────────────────────────────
describe('recipeSlice — Story 26: Taste Profile Multipliers', () => {
  it('updates spice tolerance multiplier', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setSpiceTolerance(1.5));
    expect(state.spiceToleranceMultiplier).toBe(1.5);
  });

  it('updates sweet tolerance multiplier', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setSweetTolerance(0.5));
    expect(state.sweetToleranceMultiplier).toBe(0.5);
  });
});

// ─────────────────────────────────────────────
// Story 17 & 21 — Localization, Favorites & Notes
// ─────────────────────────────────────────────
describe('recipeSlice — Story 17 & 21: Localization, Favorites & Notes', () => {
  it('updates active language via setLanguage', () => {
    let state = reducer(undefined, { type: 'unknown' });
    expect(state.language).toBe('en');

    state = reducer(state, setLanguage('ta'));
    expect(state.language).toBe('ta');

    state = reducer(state, setLanguage('hi'));
    expect(state.language).toBe('hi');
  });

  it('toggles favorites bookmark via toggleFavorite', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, toggleFavorite('recipe_pbm_123'));
    expect(state.favorites).toContain('recipe_pbm_123');

    state = reducer(state, toggleFavorite('recipe_pbm_123'));
    expect(state.favorites).not.toContain('recipe_pbm_123');
  });

  it('sets private chef note via setRecipeNote', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(
      state,
      setRecipeNote({ recipeId: 'recipe_adai_anchor', note: 'Use gingelly oil for best crispy edges!' })
    );
    expect(state.recipeNotes['recipe_adai_anchor']).toBe('Use gingelly oil for best crispy edges!');
  });

  // --- Story 40: Cooking Try Journal & Tweak Logger ---
  it('logs a new cooking try via addRecipeTry and deletes via deleteRecipeTry', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(
      state,
      addRecipeTry({
        id: 'try-test-1',
        recipeId: 'recipe_adai_001',
        timestamp: '2026-08-15T12:00:00Z',
        yieldCooked: 4,
        tweaksSummary: 'Added +10g ginger and cooked on cast iron',
        tasteNotes: 'Crunchy edges and great ginger kick',
        rating: 5,
      })
    );

    expect(state.recipeTries['recipe_adai_001']).toBeDefined();
    expect(state.recipeTries['recipe_adai_001'][0].tweaksSummary).toContain('+10g ginger');

    state = reducer(state, deleteRecipeTry({ recipeId: 'recipe_adai_001', tryId: 'try-test-1' }));
    expect(state.recipeTries['recipe_adai_001'].find(t => t.id === 'try-test-1')).toBeUndefined();
  });

  // --- Story 43: Community Comments & Discussion ---
  it('posts a comment via addRecipeComment, likes it via likeRecipeComment, and deletes it', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(
      state,
      addRecipeComment({
        id: 'comm-test-1',
        recipeId: 'recipe_adai_001',
        authorId: 'user-1',
        authorName: 'Chef Rahul',
        text: 'Can I replace toor dal with moong dal?',
        timestamp: '2026-08-15T12:00:00Z',
        likes: 0,
      })
    );

    expect(state.recipeComments['recipe_adai_001'][0].text).toContain('replace toor dal');

    state = reducer(state, likeRecipeComment({ recipeId: 'recipe_adai_001', commentId: 'comm-test-1' }));
    expect(state.recipeComments['recipe_adai_001'][0].likes).toBe(1);

    state = reducer(state, deleteRecipeComment({ recipeId: 'recipe_adai_001', commentId: 'comm-test-1' }));
    expect(state.recipeComments['recipe_adai_001'].find(c => c.id === 'comm-test-1')).toBeUndefined();
  });

  // --- Story 42 & 44: User Auth & Custom Collections ---
  it('manages user profile state and custom recipe collections', () => {
    let state = reducer(undefined, { type: 'unknown' });
    expect(state.currentUser.isLoggedIn).toBe(true);

    state = reducer(
      state,
      setCurrentUser({
        id: 'user-custom',
        name: 'Custom Chef',
        email: 'custom@test.com',
        isLoggedIn: true,
      })
    );
    expect(state.currentUser.name).toBe('Custom Chef');

    state = reducer(state, logoutUser());
    expect(state.currentUser.isLoggedIn).toBe(false);

    state = reducer(state, createCollection({ name: 'Weekend Feasts', recipeIds: ['recipe_adai_001'] }));
    expect(state.customCollections['Weekend Feasts']).toEqual(['recipe_adai_001']);

    state = reducer(state, toggleRecipeInCollection({ collectionName: 'Weekend Feasts', recipeId: 'recipe_pbm_002' }));
    expect(state.customCollections['Weekend Feasts']).toContain('recipe_pbm_002');
  });
});
