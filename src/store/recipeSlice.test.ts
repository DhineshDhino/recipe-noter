import reducer, {
  setTargetYield,
  setSpiceTolerance,
  setSweetTolerance,
  setIngredientOverride,
  autoScaleGroup,
  confirmBreakRatio,
} from './recipeSlice';
import { mockAdaiRecipe } from '../lib/mockRecipe';

describe('recipeSlice Redux State (Story 1)', () => {
  it('should return the initial state correctly populated with the mock recipe data', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.recipe).toEqual(mockAdaiRecipe);
    expect(state.targetYield).toEqual(4);
    expect(state.spiceToleranceMultiplier).toEqual(1.0);
    expect(state.sweetToleranceMultiplier).toEqual(1.0);
    expect(state.ratioMismatches).toEqual([]);
    expect(state.ingredientOverrides).toEqual({});
  });

  it('should handle setTargetYield properly', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    const actual = reducer(initialState, setTargetYield(8));
    expect(actual.targetYield).toEqual(8);
  });

  it('should clear overrides and mismatches when yield changes', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 999 }));
    state = reducer(state, setTargetYield(8));
    expect(state.ingredientOverrides).toEqual({});
    expect(state.ratioMismatches).toEqual([]);
  });

  it('should handle setSpiceTolerance properly', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    const actual = reducer(initialState, setSpiceTolerance(1.5));
    expect(actual.spiceToleranceMultiplier).toEqual(1.5);
  });

  it('should handle setSweetTolerance properly', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    const actual = reducer(initialState, setSweetTolerance(0.5));
    expect(actual.sweetToleranceMultiplier).toEqual(0.5);
  });
});

describe('Story 6 — Ratio Group Validation', () => {
  it('should store an ingredient override correctly', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    expect(state.ingredientOverrides['ing_raw_rice']).toEqual(200);
  });

  it('should detect a strict ratio mismatch when two members of a group are overridden inconsistently', () => {
    let state = reducer(undefined, { type: 'unknown' });
    // Rice Blend group is 1:1 (raw_rice:boiled_rice)
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 50 })); // should be 200
    const mismatch = state.ratioMismatches.find(m => m.groupId === 'ratio_rice');
    expect(mismatch).toBeDefined();
    expect(mismatch?.groupName).toBe('Rice Blend (1:1)');
  });

  it('should NOT flag a mismatch when ratio is kept consistent', () => {
    let state = reducer(undefined, { type: 'unknown' });
    // Set both rice members to 150g each (1:1 maintained)
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 150 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 150 }));
    expect(state.ratioMismatches).toHaveLength(0);
  });

  it('autoScaleGroup should resolve the mismatch by correcting sibling quantities', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 50 }));
    expect(state.ratioMismatches).toHaveLength(1);

    state = reducer(state, autoScaleGroup({ groupId: 'ratio_rice' }));
    // Mismatch should be cleared
    expect(state.ratioMismatches).toHaveLength(0);
    // boiled_rice should now equal raw_rice (1:1 ratio)
    expect(state.ingredientOverrides['ing_boiled_rice']).toBe(200);
  });

  it('confirmBreakRatio should dismiss the mismatch warning without changing quantities', () => {
    let state = reducer(undefined, { type: 'unknown' });
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_raw_rice', quantity: 200 }));
    state = reducer(state, setIngredientOverride({ ingredientId: 'ing_boiled_rice', quantity: 50 }));
    expect(state.ratioMismatches).toHaveLength(1);

    state = reducer(state, confirmBreakRatio({ groupId: 'ratio_rice' }));
    // Warning dismissed but override values are kept as-is
    expect(state.ratioMismatches).toHaveLength(0);
    expect(state.ingredientOverrides['ing_boiled_rice']).toBe(50);
  });
});
