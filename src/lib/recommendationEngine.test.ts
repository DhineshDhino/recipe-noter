import {
  getCurrentMealSlot,
  getMealSlotMeta,
  calculatePhaseTimes,
  calculatePantryMatch,
  filterAndRankRecipes,
} from './recommendationEngine';
import { mockAdaiRecipe } from './mockRecipe';
import { mockPaneerButterMasalaRecipe, mockRavaUpmaRecipe, mockFilterCoffeeRecipe, recipeLibrary } from './mockRecipes';

describe('Epic 14, 15, 16: Recommendation Engine & Pantry Matcher', () => {
  describe('Circadian Meal Slot Analyzer (Story 33)', () => {
    it('detects breakfast between 6 AM and 11 AM', () => {
      const morning = new Date('2026-08-15T08:30:00');
      expect(getCurrentMealSlot(morning)).toBe('breakfast');
    });

    it('detects lunch between 11 AM and 3 PM', () => {
      const noon = new Date('2026-08-15T13:00:00');
      expect(getCurrentMealSlot(noon)).toBe('lunch');
    });

    it('detects snack/tea time between 3 PM and 7 PM', () => {
      const teaTime = new Date('2026-08-15T16:30:00');
      expect(getCurrentMealSlot(teaTime)).toBe('snack');
    });

    it('detects dinner between 7 PM and 11 PM', () => {
      const night = new Date('2026-08-15T20:30:00');
      expect(getCurrentMealSlot(night)).toBe('dinner');
    });

    it('detects late night between 11 PM and 6 AM', () => {
      const midnight = new Date('2026-08-15T01:30:00');
      expect(getCurrentMealSlot(midnight)).toBe('late_night');
    });

    it('returns valid metadata labels for all slots', () => {
      expect(getMealSlotMeta('breakfast').emoji).toBe('🌅');
      expect(getMealSlotMeta('lunch').emoji).toBe('☀️');
      expect(getMealSlotMeta('snack').emoji).toBe('☕');
      expect(getMealSlotMeta('dinner').emoji).toBe('🌙');
      expect(getMealSlotMeta('late_night').emoji).toBe('🌌');
    });
  });

  describe('Phase Time Breakdown (Story 34)', () => {
    it('calculates total minutes and phase breakdown accurately', () => {
      const times = calculatePhaseTimes(mockRavaUpmaRecipe);
      expect(times.prepMinutes).toBe(5);
      expect(times.cookMinutes).toBe(10);
      expect(times.passiveMinutes).toBe(0);
      expect(times.totalMinutes).toBe(15);
    });
  });

  describe('Pantry Match & Missing Item Radar (Story 35 & 36)', () => {
    it('returns 100% match when all required ingredients are in pantry', () => {
      const fullUpmaPantry = [
        'ing_rava',
        'ing_water',
        'ing_onions',
        'ing_green_chilli',
        'ing_ginger',
        'ing_mustard_seeds',
        'ing_curry_leaves',
        'ing_ghee',
        'ing_salt',
      ];
      const match = calculatePantryMatch(mockRavaUpmaRecipe, fullUpmaPantry);

      expect(match.matchPercentage).toBe(100);
      expect(match.missingCount).toBe(0);
      expect(match.canCookImmediately).toBe(true);
    });

    it('identifies missing items and flags 1-2 items quick run opportunity', () => {
      const partialUpmaPantry = [
        'ing_rava',
        'ing_water',
        'ing_onions',
        'ing_green_chilli',
        'ing_mustard_seeds',
        'ing_ghee',
        'ing_salt',
      ];
      const match = calculatePantryMatch(mockRavaUpmaRecipe, partialUpmaPantry);

      expect(match.matchPercentage).toBeLessThan(100);
      expect(match.missingCount).toBeGreaterThan(0);
      expect(match.canCookWithOneOrTwoBuys).toBe(true);
      expect(match.missingIngredientIds).toContain('ing_ginger');
    });
  });

  describe('Filter & Rank Engine (Story 37 & 38)', () => {
    it('filters by mealSlot accurately', () => {
      const results = filterAndRankRecipes(recipeLibrary, { mealSlot: 'lunch' });
      expect(results.every(r => r.recipe.mealSlots?.includes('lunch'))).toBe(true);
    });

    it('filters by zeroRestTime (excludes dishes with soaking/fermentation)', () => {
      const results = filterAndRankRecipes(recipeLibrary, { zeroRestTime: true });
      expect(results.every(r => r.timeBreakdown.passiveMinutes === 0)).toBe(true);
      // Rava Upma has 0 rest time
      expect(results.some(r => r.recipe.id === 'recipe_upma_003')).toBe(true);
    });

    it('filters by heroIngredientId (must contain specific ingredient)', () => {
      const results = filterAndRankRecipes(recipeLibrary, { heroIngredientId: 'ing_paneer' });
      expect(results.every(r => r.requiredIngredientIds.includes('ing_paneer'))).toBe(true);
      expect(results.some(r => r.recipe.id === 'recipe_pbm_002')).toBe(true);
    });

    it('ranks highest pantry match percentage at the top', () => {
      const pantry = ['ing_rava', 'ing_onions', 'ing_mustard_seeds', 'ing_curry_leaves', 'ing_ghee', 'ing_salt'];
      const ranked = filterAndRankRecipes(recipeLibrary, { pantryIngredientIds: pantry });

      expect(ranked[0].matchPercentage).toBeGreaterThanOrEqual(ranked[ranked.length - 1].matchPercentage);
    });

    // --- Story 45: 3-Tier Scope Filtering ---
    it('filters by 3-tier scope (authored, favorites, all)', () => {
      const authored = filterAndRankRecipes(recipeLibrary, {
        scope: 'authored',
        currentAuthorName: 'Chef Ranveer',
      });
      expect(authored.some(r => r.recipe.id === 'recipe_pbm_002')).toBe(true);

      const favorites = filterAndRankRecipes(recipeLibrary, {
        scope: 'favorites',
        userSavedRecipeIds: ['recipe_upma_003'],
      });
      expect(favorites.every(r => r.recipe.id === 'recipe_upma_003')).toBe(true);

      const all = filterAndRankRecipes(recipeLibrary, { scope: 'all' });
      expect(all.length).toBe(recipeLibrary.length);
    });
  });
});
