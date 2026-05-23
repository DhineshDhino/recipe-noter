import reducer, {
  setTargetYield,
  setSpiceTolerance,
  setSweetTolerance,
  setIngredientOverride,
  autoScaleGroup,
  confirmBreakRatio,
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
