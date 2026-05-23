import { calculateScaledQuantity, formatTime, formatIngredientName, getGlobalIngredients } from './utils';

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

  describe('rounding', () => {
    it('rounds to a maximum of 2 decimal places', () => {
      // 100 / 3 * 1 = 33.333... → should be 33.33
      expect(calculateScaledQuantity(100, 3, 1)).toBe(33.33);
    });

    it('does not add unnecessary trailing zeros', () => {
      // 100 / 4 * 8 = 200 exactly, not 200.00
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
      // Should scale normally
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
    expect(formatTime(997)).toBe('16h 37m'); // Total Adai recipe time
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
    // Should still replace underscores and title-case
    expect(formatIngredientName('raw_rice')).toBe('Raw Rice');
  });
});

// ─────────────────────────────────────────────
// getGlobalIngredients
// ─────────────────────────────────────────────
describe('getGlobalIngredients', () => {
  const makeBlock = (ingredients: any[]) => ({ ingredients });

  it('returns an empty array for empty blocks', () => {
    expect(getGlobalIngredients([])).toEqual([]);
    expect(getGlobalIngredients([makeBlock([])])).toEqual([]);
  });

  it('aggregates quantities of the same ingredient across blocks', () => {
    const blocks = [
      makeBlock([{ ingredientId: 'ing_salt', quantity: 5, unit: 'g', isOptional: false }]),
      makeBlock([{ ingredientId: 'ing_salt', quantity: 3, unit: 'g', isOptional: false }]),
    ];
    const result = getGlobalIngredients(blocks);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(8);
  });

  it('keeps ingredients with different units separate (no cross-unit addition)', () => {
    const blocks = [
      makeBlock([{ ingredientId: 'ing_water', quantity: 100, unit: 'ml', isOptional: false }]),
      makeBlock([{ ingredientId: 'ing_water', quantity: 1, unit: 'count', isOptional: false }]),
    ];
    const result = getGlobalIngredients(blocks);
    // Must produce 2 separate entries — one per unit
    expect(result).toHaveLength(2);
  });

  it('preserves the isOptional flag from the first occurrence', () => {
    const blocks = [
      makeBlock([{ ingredientId: 'ing_ginger', quantity: 10, unit: 'g', isOptional: true }]),
    ];
    const result = getGlobalIngredients(blocks);
    expect(result[0].isOptional).toBe(true);
  });

  it('collects ingredients from multiple different blocks correctly', () => {
    const blocks = [
      makeBlock([
        { ingredientId: 'ing_rice', quantity: 100, unit: 'g', isOptional: false },
        { ingredientId: 'ing_salt', quantity: 5, unit: 'g', isOptional: false },
      ]),
      makeBlock([
        { ingredientId: 'ing_rice', quantity: 50, unit: 'g', isOptional: false },
      ]),
    ];
    const result = getGlobalIngredients(blocks);
    const rice = result.find(r => r.id === 'ing_rice');
    const salt = result.find(r => r.id === 'ing_salt');
    expect(rice?.amount).toBe(150);
    expect(salt?.amount).toBe(5);
  });
});
