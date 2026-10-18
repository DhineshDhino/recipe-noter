import { IngredientRegistry } from './types';

export type SupportedLanguage = 'en' | 'ta' | 'hi';
export type UnitSystem = 'metric' | 'us_customary';

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
export const volumeToMl: Record<string, number> = {
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
export const weightToGrams: Record<string, number> = {
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
 * Formats a numeric culinary quantity into natural kitchen vulgar fractions (e.g., ½, ¾, 1 ⅓).
 */
export const formatCulinaryFraction = (quantity: number, unit?: string): string => {
  if (isNaN(quantity) || quantity <= 0) return '0';

  const cleanUnit = (unit || '').toLowerCase().trim();

  // For metric gram / ml / count measurements, keep integer or clean 1-decimal format
  if (['g', 'gram', 'grams', 'ml', 'count', 'piece', 'pieces', 'clove', 'cloves'].includes(cleanUnit)) {
    if (Math.abs(quantity - Math.round(quantity)) < 0.01) {
      return Math.round(quantity).toString();
    }
    return (Math.round(quantity * 10) / 10).toString();
  }

  const integerPart = Math.floor(quantity);
  const fractionalPart = quantity - integerPart;

  const fractionThreshold = 0.04;
  let fractionSymbol = '';

  if (Math.abs(fractionalPart - 0.125) <= fractionThreshold) fractionSymbol = '⅛';
  else if (Math.abs(fractionalPart - 0.25) <= fractionThreshold) fractionSymbol = '¼';
  else if (Math.abs(fractionalPart - 0.333) <= fractionThreshold || Math.abs(fractionalPart - 0.33) <= fractionThreshold) fractionSymbol = '⅓';
  else if (Math.abs(fractionalPart - 0.5) <= fractionThreshold) fractionSymbol = '½';
  else if (Math.abs(fractionalPart - 0.666) <= fractionThreshold || Math.abs(fractionalPart - 0.67) <= fractionThreshold) fractionSymbol = '⅔';
  else if (Math.abs(fractionalPart - 0.75) <= fractionThreshold) fractionSymbol = '¾';
  else if (Math.abs(fractionalPart - 0.875) <= fractionThreshold) fractionSymbol = '⅞';
  else if (fractionalPart >= 0.96) {
    return (integerPart + 1).toString();
  } else if (fractionalPart <= 0.04) {
    return integerPart > 0 ? integerPart.toString() : '0';
  } else {
    // If not a standard fraction, return clean 2-decimal number
    return (Math.round(quantity * 100) / 100).toString();
  }

  if (integerPart > 0) {
    return fractionSymbol ? `${integerPart} ${fractionSymbol}` : integerPart.toString();
  }
  return fractionSymbol || (Math.round(quantity * 100) / 100).toString();
};

/**
 * Returns converted quantity and unit string according to user's selected UnitSystem ('metric' | 'us_customary').
 */
export const getConvertedIngredientDisplay = (
  rawQuantity: number,
  rawUnit: string,
  ingredientId?: string,
  unitSystem: UnitSystem = 'metric'
): { formattedQuantity: string; unit: string; displayString: string } => {
  const normUnit = rawUnit.toLowerCase().trim();

  // If US Customary requested and current unit is Metric (g / ml)
  if (unitSystem === 'us_customary') {
    if (['g', 'gram', 'grams'].includes(normUnit)) {
      if (rawQuantity >= 30) {
        // Convert to cups
        const res = convertUnitQuantity(rawQuantity, 'g', 'cup', ingredientId);
        const formatted = formatCulinaryFraction(res.quantity, 'cup');
        const unitLabel = res.quantity > 1.1 ? 'cups' : 'cup';
        return { formattedQuantity: formatted, unit: unitLabel, displayString: `${formatted} ${unitLabel}` };
      } else if (rawQuantity >= 12) {
        // Convert to tbsp
        const res = convertUnitQuantity(rawQuantity, 'g', 'tbsp', ingredientId);
        const formatted = formatCulinaryFraction(res.quantity, 'tbsp');
        return { formattedQuantity: formatted, unit: 'tbsp', displayString: `${formatted} tbsp` };
      } else {
        // Convert to tsp
        const res = convertUnitQuantity(rawQuantity, 'g', 'tsp', ingredientId);
        const formatted = formatCulinaryFraction(res.quantity, 'tsp');
        return { formattedQuantity: formatted, unit: 'tsp', displayString: `${formatted} tsp` };
      }
    } else if (['ml', 'milliliter'].includes(normUnit)) {
      if (rawQuantity >= 60) {
        const res = convertUnitQuantity(rawQuantity, 'ml', 'cup', ingredientId);
        const formatted = formatCulinaryFraction(res.quantity, 'cup');
        const unitLabel = res.quantity > 1.1 ? 'cups' : 'cup';
        return { formattedQuantity: formatted, unit: unitLabel, displayString: `${formatted} ${unitLabel}` };
      } else if (rawQuantity >= 15) {
        const res = convertUnitQuantity(rawQuantity, 'ml', 'tbsp', ingredientId);
        const formatted = formatCulinaryFraction(res.quantity, 'tbsp');
        return { formattedQuantity: formatted, unit: 'tbsp', displayString: `${formatted} tbsp` };
      } else {
        const res = convertUnitQuantity(rawQuantity, 'ml', 'tsp', ingredientId);
        const formatted = formatCulinaryFraction(res.quantity, 'tsp');
        return { formattedQuantity: formatted, unit: 'tsp', displayString: `${formatted} tsp` };
      }
    }
  }

  // If Metric requested and current unit is US Customary (cup / tbsp / tsp)
  if (unitSystem === 'metric') {
    if (['cup', 'cups'].includes(normUnit)) {
      const res = convertUnitQuantity(rawQuantity, 'cup', 'g', ingredientId);
      const formatted = formatCulinaryFraction(res.quantity, 'g');
      return { formattedQuantity: formatted, unit: 'g', displayString: `${formatted}g` };
    } else if (['tbsp', 'tablespoon'].includes(normUnit)) {
      const res = convertUnitQuantity(rawQuantity, 'tbsp', 'g', ingredientId);
      const formatted = formatCulinaryFraction(res.quantity, 'g');
      return { formattedQuantity: formatted, unit: 'g', displayString: `${formatted}g` };
    } else if (['tsp', 'teaspoon'].includes(normUnit)) {
      const res = convertUnitQuantity(rawQuantity, 'tsp', 'g', ingredientId);
      const formatted = formatCulinaryFraction(res.quantity, 'g');
      return { formattedQuantity: formatted, unit: 'g', displayString: `${formatted}g` };
    }
  }

  // Default display
  const formatted = formatCulinaryFraction(rawQuantity, rawUnit);
  const displayString = `${formatted} ${rawUnit}`.trim();
  return { formattedQuantity: formatted, unit: rawUnit, displayString };
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

/**
 * Returns formatted localized ingredient label with primary native name + subtle English subtitle if non-English.
 * e.g., "துவரம் பருப்பு (Toor Dal)" or "तूर दाल (Toor Dal)"
 */
export const formatLocalizedIngredient = (
  ingredientId: string,
  lang: SupportedLanguage = 'en',
  masterIngredients?: IngredientRegistry[]
): { primary: string; secondary?: string; fullText: string } => {
  const master = masterIngredients?.find(m => m.id === ingredientId);
  const fallbackEnglish = ingredientId.replace(/^ing_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (!master) {
    return { primary: fallbackEnglish, fullText: fallbackEnglish };
  }

  if (lang === 'en') {
    return { primary: master.defaultName, fullText: master.defaultName };
  }

  const targetLangName = lang === 'ta' ? 'Tamil' : 'Hindi';
  const translation = master.translations?.find(
    t => t.language.toLowerCase() === targetLangName.toLowerCase()
  );

  if (translation && translation.name && translation.name !== master.defaultName) {
    return {
      primary: translation.name,
      secondary: master.defaultName,
      fullText: `${translation.name} (${master.defaultName})`,
    };
  }

  return { primary: master.defaultName, fullText: master.defaultName };
};
