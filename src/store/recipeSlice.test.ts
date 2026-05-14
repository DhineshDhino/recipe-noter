import reducer, { setTargetYield, setSpiceTolerance, setSweetTolerance } from './recipeSlice';
import { mockAdaiRecipe } from '../lib/mockRecipe';

describe('recipeSlice Redux State (Story 1)', () => {
  it('should return the initial state correctly populated with the mock recipe data', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state.recipe).toEqual(mockAdaiRecipe);
    expect(state.targetYield).toEqual(4);
    expect(state.spiceToleranceMultiplier).toEqual(1.0);
    expect(state.sweetToleranceMultiplier).toEqual(1.0);
  });

  it('should handle setTargetYield properly', () => {
    const initialState = reducer(undefined, { type: 'unknown' });
    const actual = reducer(initialState, setTargetYield(8));
    expect(actual.targetYield).toEqual(8);
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
