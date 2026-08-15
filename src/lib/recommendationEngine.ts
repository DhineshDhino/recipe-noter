import { Recipe, MealSlot, DietaryCategory, RecipeDifficulty } from './types';

export interface PhaseTimeBreakdown {
  prepMinutes: number;
  passiveMinutes: number;
  cookMinutes: number;
  totalMinutes: number;
}

export interface PantryMatchResult {
  recipe: Recipe;
  requiredIngredientIds: string[];
  matchedIngredientIds: string[];
  missingIngredientIds: string[];
  matchPercentage: number;
  missingCount: number;
  missingCornerStoreBasics: string[];
  missingSpecialty: string[];
  canCookImmediately: boolean;
  canCookWithOneOrTwoBuys: boolean;
  timeBreakdown: PhaseTimeBreakdown;
}

export interface FilterOptions {
  mealSlot?: MealSlot | 'all';
  maxTotalTime?: number | null;
  maxActiveTime?: number | null;
  maxPassiveTime?: number | null;
  zeroRestTime?: boolean;
  heroIngredientId?: string | null;
  dietary?: DietaryCategory[];
  difficulty?: RecipeDifficulty | 'all';
  searchQuery?: string;
  pantryIngredientIds?: string[];
  scope?: 'library' | 'global';
  userSavedRecipeIds?: string[];
}

// Common pantry corner-store staples that are easily buyable or usually on hand
export const cornerStoreStaples = [
  'ing_milk',
  'ing_sugar',
  'ing_salt',
  'ing_curry_leaves',
  'ing_coriander',
  'ing_ginger',
  'ing_garlic',
  'ing_onion',
  'ing_onions',
  'ing_tomato',
  'ing_tomatoes',
  'ing_green_chilli',
  'ing_mustard_seeds',
  'ing_ghee',
  'ing_cooking_oil',
  'ing_water',
];

/**
 * Calculates current circadian meal slot based on local time.
 */
export const getCurrentMealSlot = (date: Date = new Date()): MealSlot => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 19) return 'snack';
  if (hour >= 19 && hour < 23) return 'dinner';
  return 'late_night';
};

/**
 * Friendly label and emoji metadata for meal slots.
 */
export const getMealSlotMeta = (slot: MealSlot): { label: string; emoji: string; timeRange: string } => {
  switch (slot) {
    case 'breakfast':
      return { label: 'Breakfast / Morning Tiffin', emoji: '🌅', timeRange: '6 AM – 11 AM' };
    case 'lunch':
      return { label: 'Lunch / Main Meal', emoji: '☀️', timeRange: '11 AM – 3 PM' };
    case 'snack':
      return { label: 'Evening Snack / Tea Time', emoji: '☕', timeRange: '3 PM – 7 PM' };
    case 'dinner':
      return { label: 'Dinner / Night Tiffin', emoji: '🌙', timeRange: '7 PM – 11 PM' };
    case 'late_night':
      return { label: 'Late Night Quick Bite', emoji: '🌌', timeRange: '11 PM – 6 AM' };
  }
};

/**
 * Calculates exact phase breakdown in minutes for a recipe.
 */
export const calculatePhaseTimes = (recipe: Recipe): PhaseTimeBreakdown => {
  const sumBlocks = (blocks: any[] = []) =>
    blocks.reduce((sum, b) => {
      if (b.totalDurationInMinutes) return sum + b.totalDurationInMinutes;
      const stepSum = (b.steps || []).reduce((sSum: number, s: any) => sSum + (s.duration?.value || 0), 0);
      return sum + stepSum;
    }, 0);

  const prepMinutes = sumBlocks(recipe.prepBlocks);
  const passiveMinutes = sumBlocks(recipe.passiveBlocks);
  const cookMinutes = sumBlocks(recipe.cookBlocks);
  const totalMinutes = prepMinutes + passiveMinutes + cookMinutes;

  return { prepMinutes, passiveMinutes, cookMinutes, totalMinutes };
};

/**
 * Calculates pantry match score and missing ingredient gaps for a recipe.
 */
export const calculatePantryMatch = (
  recipe: Recipe,
  pantryIngredientIds: string[] = []
): PantryMatchResult => {
  const requiredSet = new Set<string>();

  const extractIngredients = (blocks: any[] = []) => {
    blocks.forEach(b => {
      (b.ingredients || []).forEach((i: any) => {
        if (i.ingredientId && i.ingredientId !== 'ing_water') {
          requiredSet.add(i.ingredientId);
        }
      });
    });
  };

  extractIngredients(recipe.prepBlocks);
  extractIngredients(recipe.passiveBlocks);
  extractIngredients(recipe.cookBlocks);

  const requiredIngredientIds = Array.from(requiredSet);
  const pantrySet = new Set(pantryIngredientIds);

  const matchedIngredientIds = requiredIngredientIds.filter(id => pantrySet.has(id));
  const missingIngredientIds = requiredIngredientIds.filter(id => !pantrySet.has(id));

  const totalRequired = requiredIngredientIds.length;
  const matchPercentage =
    totalRequired === 0
      ? 100
      : Math.round((matchedIngredientIds.length / totalRequired) * 100);

  const missingCornerStoreBasics = missingIngredientIds.filter(id =>
    cornerStoreStaples.includes(id)
  );
  const missingSpecialty = missingIngredientIds.filter(
    id => !cornerStoreStaples.includes(id)
  );

  const canCookImmediately = missingIngredientIds.length === 0;
  const canCookWithOneOrTwoBuys =
    missingIngredientIds.length > 0 && missingIngredientIds.length <= 2;

  const timeBreakdown = calculatePhaseTimes(recipe);

  return {
    recipe,
    requiredIngredientIds,
    matchedIngredientIds,
    missingIngredientIds,
    matchPercentage,
    missingCount: missingIngredientIds.length,
    missingCornerStoreBasics,
    missingSpecialty,
    canCookImmediately,
    canCookWithOneOrTwoBuys,
    timeBreakdown,
  };
};

/**
 * Filters and ranks recipes according to user context, meal slot, time budget, and pantry matches.
 */
export const filterAndRankRecipes = (
  recipes: Recipe[],
  filters: FilterOptions = {}
): PantryMatchResult[] => {
  const {
    mealSlot = 'all',
    maxTotalTime = null,
    maxActiveTime = null,
    maxPassiveTime = null,
    zeroRestTime = false,
    heroIngredientId = null,
    dietary = [],
    difficulty = 'all',
    searchQuery = '',
    pantryIngredientIds = [],
    scope = 'global',
    userSavedRecipeIds = [],
  } = filters;

  const q = searchQuery.toLowerCase().trim();

  // 1. Calculate pantry matches
  let results = recipes.map(r => calculatePantryMatch(r, pantryIngredientIds));

  // 2. Scope Filter (My Saved Library vs Global Catalogue)
  if (scope === 'library' && userSavedRecipeIds.length > 0) {
    results = results.filter(r => userSavedRecipeIds.includes(r.recipe.id));
  }

  // 3. Search Query Filter
  if (q) {
    results = results.filter(
      r =>
        r.recipe.name.toLowerCase().includes(q) ||
        r.recipe.masterIngredients?.some(i => i.defaultName.toLowerCase().includes(q)) ||
        r.recipe.pairings?.some(p => p.toLowerCase().includes(q))
    );
  }

  // 4. Meal Slot Filter
  if (mealSlot && mealSlot !== 'all') {
    results = results.filter(
      r => r.recipe.mealSlots && r.recipe.mealSlots.includes(mealSlot)
    );
  }

  // 5. Hero Ingredient Filter
  if (heroIngredientId) {
    results = results.filter(r => r.requiredIngredientIds.includes(heroIngredientId));
  }

  // 6. Time Budget Filters
  if (zeroRestTime) {
    results = results.filter(r => r.timeBreakdown.passiveMinutes === 0);
  }

  if (maxTotalTime !== null && maxTotalTime > 0) {
    results = results.filter(r => r.timeBreakdown.totalMinutes <= maxTotalTime);
  }

  if (maxActiveTime !== null && maxActiveTime > 0) {
    results = results.filter(
      r => r.timeBreakdown.prepMinutes + r.timeBreakdown.cookMinutes <= maxActiveTime
    );
  }

  if (maxPassiveTime !== null && maxPassiveTime >= 0) {
    results = results.filter(r => r.timeBreakdown.passiveMinutes <= maxPassiveTime);
  }

  // 7. Dietary Filters (All selected dietary categories must be met)
  if (dietary.length > 0) {
    results = results.filter(r => {
      const recipeDiets = r.recipe.dietary || [];
      return dietary.every(d => recipeDiets.includes(d));
    });
  }

  // 8. Difficulty Filter
  if (difficulty && difficulty !== 'all') {
    results = results.filter(r => (r.recipe.difficulty || 'medium') === difficulty);
  }

  // 9. Sort / Rank
  // Priority:
  // 1) Highest Pantry Match Percentage
  // 2) Can cook with 1-2 buys
  // 3) Fastest total time
  return results.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    if (a.missingCount !== b.missingCount) {
      return a.missingCount - b.missingCount;
    }
    return a.timeBreakdown.totalMinutes - b.timeBreakdown.totalMinutes;
  });
};
