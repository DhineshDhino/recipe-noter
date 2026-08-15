import { IngredientRegistry } from './types';

export type SupportedLanguage = 'en' | 'ta' | 'hi';

export interface UnitDensity {
  gramsPerCup: number;
  mlPerCup: number;
}

// Density lookup (grams per US cup ~ 240ml) for common Indian & Global staples
export const ingredientDensities: Record<string, number> = {
  // Grains & Rice
  ing_raw_rice: 185,
  ing_parboiled_rice: 190,
  ing_idli_rice: 185,
  ing_basmati_rice: 180,
  ing_wheat_flour: 120,
  ing_all_purpose_flour: 125,
  ing_rice_flour: 130,

  // Lentils & Pulses
  ing_toor_dal: 200,
  ing_chana_dal: 200,
  ing_urad_dal: 200,
  ing_moong_dal: 210,

  // Liquids & Fats
  ing_water: 240,
  ing_milk: 245,
  ing_coconut_milk: 240,
  ing_cooking_oil: 218,
  ing_ghee: 220,
  ing_sesame_oil: 218,

  // Sweeteners & Spices
  ing_jaggery: 220,
  ing_sugar: 200,
  ing_salt: 280,
  ing_grated_coconut: 80,
  ing_paneer: 150,
};

// Base volume conversions to milliliters (ml)
const volumeToMl: Record<string, number> = {
  ml: 1,
  l: 1000,
  liter: 1000,
  cup: 240,
  cups: 240,
  tbsp: 15,
  tablespoon: 15,
  tsp: 5,
  teaspoon: 5,
  pinch: 0.35,
};

// Base weight conversions to grams (g)
const weightToGrams: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  oz: 28.35,
  ounce: 28.35,
  lb: 453.59,
  pound: 453.59,
};

/**
 * Converts a quantity from one culinary unit to another, using density table for volume-to-weight conversions.
 */
export const convertUnitQuantity = (
  quantity: number,
  fromUnit: string,
  toUnit: string,
  ingredientId?: string
): { quantity: number; unit: string; isConverted: boolean } => {
  const from = fromUnit.toLowerCase().trim();
  const to = toUnit.toLowerCase().trim();

  if (!from || !to || from === to) {
    return { quantity, unit: fromUnit, isConverted: false };
  }

  // 1. Weight to Weight
  if (weightToGrams[from] && weightToGrams[to]) {
    const grams = quantity * weightToGrams[from];
    const converted = grams / weightToGrams[to];
    return { quantity: Math.round(converted * 100) / 100, unit: toUnit, isConverted: true };
  }

  // 2. Volume to Volume
  if (volumeToMl[from] && volumeToMl[to]) {
    const ml = quantity * volumeToMl[from];
    const converted = ml / volumeToMl[to];
    return { quantity: Math.round(converted * 100) / 100, unit: toUnit, isConverted: true };
  }

  // 3. Volume to Weight (e.g. cup -> grams)
  if (volumeToMl[from] && weightToGrams[to]) {
    const ml = quantity * volumeToMl[from];
    const cups = ml / 240;
    const density = (ingredientId && ingredientDensities[ingredientId]) || 200; // default density 200g/cup
    const grams = cups * density;
    const converted = grams / weightToGrams[to];
    return { quantity: Math.round(converted * 100) / 100, unit: toUnit, isConverted: true };
  }

  // 4. Weight to Volume (e.g. grams -> cup)
  if (weightToGrams[from] && volumeToMl[to]) {
    const grams = quantity * weightToGrams[from];
    const density = (ingredientId && ingredientDensities[ingredientId]) || 200;
    const cups = grams / density;
    const ml = cups * 240;
    const converted = ml / volumeToMl[to];
    return { quantity: Math.round(converted * 100) / 100, unit: toUnit, isConverted: true };
  }

  return { quantity, unit: fromUnit, isConverted: false };
};

/**
 * Returns localized name for an ingredient according to the active language.
 */
export const getLocalizedIngredientName = (
  ingredient: IngredientRegistry | undefined,
  lang: SupportedLanguage
): string => {
  if (!ingredient) return 'Unknown Ingredient';
  if (lang === 'en') return ingredient.defaultName;

  const targetLangName = lang === 'ta' ? 'Tamil' : 'Hindi';
  const found = ingredient.translations?.find(
    t => t.language.toLowerCase() === targetLangName.toLowerCase()
  );

  return found?.name || ingredient.defaultName;
};
