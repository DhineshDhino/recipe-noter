export const formatIngredientName = (id: string) => {
  return id.replace('ing_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatTime = (mins: number) => {
  if (mins === 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};

// Group by ingredient AND unit to prevent math bugs when mixing units
export const getGlobalIngredients = (blocks: any[]) => {
  const all: Record<string, { id: string, amount: number, unit: string, isOptional?: boolean }> = {};
  blocks.forEach(b => b.ingredients.forEach((i: any) => {
    const key = `${i.ingredientId}_${i.unit}`;
    if (all[key]) {
      all[key].amount += i.quantity;
    } else {
      all[key] = { id: i.ingredientId, amount: i.quantity, unit: i.unit, isOptional: i.isOptional };
    }
  }));
  return Object.values(all);
};

/**
 * Calculates a scaled ingredient quantity based on the target yield.
 * Returns the original quantity unchanged for optional ingredients.
 *
 * @param baseQuantity  - The original quantity at baseYield
 * @param baseYield     - The recipe's original serving count
 * @param targetYield   - The user's desired serving count
 * @param isOptional    - If true, quantity is not scaled (returns base as-is)
 * @returns             - The scaled quantity, rounded to 2 decimal places
 */
export const calculateScaledQuantity = (
  baseQuantity: number,
  baseYield: number,
  targetYield: number,
  isOptional: boolean = false,
): number => {
  if (isOptional) return baseQuantity;
  if (baseYield === 0) return 0;
  return Math.round((baseQuantity / baseYield) * targetYield * 100) / 100;
};
