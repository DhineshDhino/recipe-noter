import {
  calculateScaledQuantity,
  calculateScaledDuration,
  formatTime,
  formatIngredientName,
  getGlobalIngredients,
  exportEditorToRecipe,
  playTimerChime,
} from './utils';
import { EditorState } from '../store/editorSlice';

// ─────────────────────────────────────────────
// calculateScaledDuration
// ─────────────────────────────────────────────
describe('calculateScaledDuration', () => {
  it('returns base duration unchanged if isYieldDependent is false', () => {
    expect(calculateScaledDuration(10, 4, 8, false)).toBe(10);
    expect(calculateScaledDuration(10, 4, 2, false)).toBe(10);
  });

  it('scales duration linearly with target yield when isYieldDependent is true', () => {
    // 10m for 4 servings -> 20m for 8 servings
    expect(calculateScaledDuration(10, 4, 8, true)).toBe(20);
    // 10m for 4 servings -> 5m for 2 servings
    expect(calculateScaledDuration(10, 4, 2, true)).toBe(5);
  });

  it('rounds scaled duration to nearest integer with minimum 1 min', () => {
    // 5m / 4 * 3 = 3.75 -> 4
    expect(calculateScaledDuration(5, 4, 3, true)).toBe(4);
    // very small ratio never rounds to 0
    expect(calculateScaledDuration(1, 10, 1, true)).toBe(1);
  });

  it('handles edge cases where baseYield or duration is 0', () => {
    expect(calculateScaledDuration(0, 4, 8, true)).toBe(0);
    expect(calculateScaledDuration(10, 0, 8, true)).toBe(0);
  });
});

// ─────────────────────────────────────────────
// calculateScaledQuantity
// ─────────────────────────────────────────────
describe('calculateScaledQuantity', () => {
  describe('standard scaling', () => {
    it('scales up correctly when target yield is doubled', () => {
      expect(calculateScaledQuantity(100, 4, 8)).toBe(200);
    });

    it('scales down correctly when target yield is halved', () => {
      expect(calculateScaledQuantity(100, 4, 2)).toBe(50);
    });

    it('returns the same quantity when target equals base yield', () => {
      expect(calculateScaledQuantity(100, 4, 4)).toBe(100);
    });

    it('handles non-integer yield ratios', () => {
      expect(calculateScaledQuantity(100, 4, 6)).toBe(150);
    });

    it('handles scaling from base yield of 1', () => {
      expect(calculateScaledQuantity(50, 1, 4)).toBe(200);
    });

    it('handles decimal base quantities correctly', () => {
      expect(calculateScaledQuantity(2.5, 2, 4)).toBe(5);
    });
  });

  describe('taste multipliers (Story 26)', () => {
    it('applies 1.5x spice multiplier correctly', () => {
      expect(calculateScaledQuantity(10, 4, 4, false, 1.5)).toBe(15);
    });

    it('applies 0.5x mild multiplier with doubled yield', () => {
      // (10 / 4) * 8 * 0.5 = 10
      expect(calculateScaledQuantity(10, 4, 8, false, 0.5)).toBe(10);
    });

    it('ignores taste multiplier for optional ingredients', () => {
      expect(calculateScaledQuantity(10, 4, 8, true, 2.0)).toBe(10);
    });
  });

  describe('rounding', () => {
    it('rounds to a maximum of 2 decimal places', () => {
      // 100 / 3 * 1 = 33.333... → should be 33.33
      expect(calculateScaledQuantity(100, 3, 1)).toBe(33.33);
    });

    it('does not add unnecessary trailing zeros', () => {
      expect(calculateScaledQuantity(100, 4, 8)).toBe(200);
    });
  });

  describe('edge cases', () => {
    it('returns 0 if baseYield is 0 (prevents divide-by-zero)', () => {
      expect(calculateScaledQuantity(100, 0, 8)).toBe(0);
    });

    it('returns 0 if targetYield is 0', () => {
      expect(calculateScaledQuantity(100, 4, 0)).toBe(0);
    });

    it('returns 0 if baseQuantity is 0', () => {
      expect(calculateScaledQuantity(0, 4, 8)).toBe(0);
    });

    it('handles very large quantities without precision loss', () => {
      expect(calculateScaledQuantity(10000, 4, 8)).toBe(20000);
    });

    it('handles very small quantities', () => {
      expect(calculateScaledQuantity(0.5, 4, 8)).toBe(1);
    });
  });

  describe('optional ingredients', () => {
    it('does NOT scale optional ingredients — returns base quantity unchanged', () => {
      expect(calculateScaledQuantity(50, 4, 8, true)).toBe(50);
    });

    it('returns base quantity for optional even when targetYield is 0', () => {
      expect(calculateScaledQuantity(50, 4, 0, true)).toBe(50);
    });

    it('defaults isOptional to false when not provided', () => {
      expect(calculateScaledQuantity(100, 4, 8)).toBe(200);
    });
  });
});

// ─────────────────────────────────────────────
// formatTime
// ─────────────────────────────────────────────
describe('formatTime', () => {
  it('returns "0m" for 0 minutes', () => {
    expect(formatTime(0)).toBe('0m');
  });

  it('returns minutes only for values under 60', () => {
    expect(formatTime(1)).toBe('1m');
    expect(formatTime(45)).toBe('45m');
    expect(formatTime(59)).toBe('59m');
  });

  it('returns hours only (no minutes) for exact multiples of 60', () => {
    expect(formatTime(60)).toBe('1h');
    expect(formatTime(120)).toBe('2h');
    expect(formatTime(240)).toBe('4h');
  });

  it('returns hours and minutes for mixed values', () => {
    expect(formatTime(61)).toBe('1h 1m');
    expect(formatTime(90)).toBe('1h 30m');
    expect(formatTime(125)).toBe('2h 5m');
    expect(formatTime(997)).toBe('16h 37m');
  });
});

// ─────────────────────────────────────────────
// formatIngredientName
// ─────────────────────────────────────────────
describe('formatIngredientName', () => {
  it('strips the ing_ prefix', () => {
    expect(formatIngredientName('ing_salt')).toBe('Salt');
  });

  it('replaces underscores with spaces', () => {
    expect(formatIngredientName('ing_raw_rice')).toBe('Raw Rice');
  });

  it('title-cases every word', () => {
    expect(formatIngredientName('ing_dry_red_chilli')).toBe('Dry Red Chilli');
  });

  it('handles single word after prefix', () => {
    expect(formatIngredientName('ing_onion')).toBe('Onion');
  });

  it('handles IDs without the ing_ prefix gracefully', () => {
    expect(formatIngredientName('raw_rice')).toBe('Raw Rice');
  });

  it('looks up name from master ingredients list when provided', () => {
    const registry = [
      { id: 'ing_custom_1', defaultName: 'Organic Kashmiri Saffron', translations: [] },
    ];
    expect(formatIngredientName('ing_custom_1', registry)).toBe('Organic Kashmiri Saffron');
  });
});

// ─────────────────────────────────────────────
// getGlobalIngredients
// ─────────────────────────────────────────────
describe('getGlobalIngredients', () => {
  const makeBlock = (ingredients: any[]) => ({
    name: 'Block',
    totalDurationInMinutes: 10,
    steps: [],
    ingredients,
  });

  it('returns an empty array for empty blocks', () => {
    expect(getGlobalIngredients([])).toEqual([]);
    expect(getGlobalIngredients([makeBlock([])])).toEqual([]);
  });

  it('aggregates quantities of the same ingredient across blocks', () => {
    const blocks = [
      makeBlock([{ ingredientId: 'ing_salt', quantity: 5, unit: 'g', isOptional: false, tags: [] }]),
      makeBlock([{ ingredientId: 'ing_salt', quantity: 3, unit: 'g', isOptional: false, tags: [] }]),
    ];
    const result = getGlobalIngredients(blocks);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(8);
  });

  it('preserves and merges tags across blocks', () => {
    const blocks = [
      makeBlock([{ ingredientId: 'ing_pepper', quantity: 5, unit: 'g', isOptional: false, tags: ['spice'] }]),
      makeBlock([{ ingredientId: 'ing_sugar', quantity: 10, unit: 'g', isOptional: false, tags: ['sweet'] }]),
    ];
    const result = getGlobalIngredients(blocks);
    expect(result.find(r => r.id === 'ing_pepper')?.tags).toContain('spice');
    expect(result.find(r => r.id === 'ing_sugar')?.tags).toContain('sweet');
  });
});

// ─────────────────────────────────────────────
// Story 12.1: exportEditorToRecipe
// ─────────────────────────────────────────────
describe('exportEditorToRecipe (Story 12.1)', () => {
  it('converts editor state into a valid Recipe structure', () => {
    const mockEditorState: EditorState = {
      recipeName: 'Paneer Butter Masala',
      baseYield: 3,
      versionName: 'Restaurant Style',
      author: 'Chef Ranveer',
      activePhase: 'prep',
      requiredEquipment: ['Pan', 'Blender'],
      pairings: ['Naan', 'Jeera Rice'],
      ratioGroups: [],
      masterIngredients: [
        { id: 'ing_paneer', defaultName: 'Paneer', translations: [] },
      ],
      prepBlocks: [
        {
          id: 'b1',
          name: 'Cubing Paneer',
          ingredients: [
            { id: 'i1', ingredientId: 'ing_paneer', quantity: 200, unit: 'g', isOptional: false, tags: [] },
          ],
          steps: [
            {
              id: 's1',
              text: 'Cut paneer into cubes.',
              duration: { value: 5, isYieldDependent: false },
              isCritical: false,
              images: [
                {
                  id: 'img1',
                  url: 'https://example.com/paneer.jpg',
                  stage: 'while_cooking',
                  caption: 'Neat cubes',
                },
              ],
            },
          ],
        },
      ],
      passiveBlocks: [],
      cookBlocks: [
        {
          id: 'b2',
          name: 'Gravy Simmering',
          ingredients: [],
          steps: [
            { id: 's2', text: 'Simmer gravy on low heat.', duration: { value: 15, isYieldDependent: false }, heat: { intensity: 'Low' }, isCritical: true },
          ],
        },
      ],
      editingStepId: null,
    };

    const recipe = exportEditorToRecipe(mockEditorState);

    expect(recipe.name).toBe('Paneer Butter Masala');
    expect(recipe.baseYield).toBe(3);
    expect(recipe.versionHistory[0].versionName).toBe('Restaurant Style');
    expect(recipe.versionHistory[0].author).toBe('Chef Ranveer');
    expect(recipe.prepBlocks).toHaveLength(1);
    expect(recipe.prepBlocks[0].totalDurationInMinutes).toBe(5);
    expect(recipe.prepBlocks[0].steps[0].images).toHaveLength(1);
    expect(recipe.prepBlocks[0].steps[0].images![0].stage).toBe('while_cooking');
    expect(recipe.cookBlocks).toHaveLength(1);
    expect(recipe.cookBlocks[0].totalDurationInMinutes).toBe(15);
    expect(recipe.cookBlocks[0].steps[0].isCritical).toBe(true);
    expect(recipe.masterIngredients).toHaveLength(1);
  });

  it('handles empty editor fields with sensible fallbacks', () => {
    const emptyState: EditorState = {
      recipeName: '',
      baseYield: 0,
      versionName: '',
      author: '',
      activePhase: 'setup',
      requiredEquipment: [],
      pairings: [],
      ratioGroups: [],
      masterIngredients: [],
      prepBlocks: [],
      passiveBlocks: [],
      cookBlocks: [],
      editingStepId: null,
    };

    const recipe = exportEditorToRecipe(emptyState);
    expect(recipe.name).toBe('Untitled Recipe');
    expect(recipe.baseYield).toBe(4);
    expect(recipe.versionHistory[0].author).toBe('Chef');
  });
});

// ─────────────────────────────────────────────
// Story 25: playTimerChime
// ─────────────────────────────────────────────
describe('playTimerChime (Story 25)', () => {
  it('does not throw errors in a non-browser environment', () => {
    expect(() => playTimerChime()).not.toThrow();
  });
});
