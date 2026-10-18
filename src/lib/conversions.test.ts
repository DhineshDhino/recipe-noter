import {
  convertUnitQuantity,
  getLocalizedIngredientName,
  formatLocalizedIngredient,
  formatCulinaryFraction,
  getConvertedIngredientDisplay,
  ingredientDensities,
} from './conversions';
import { IngredientRegistry } from './types';

const mockIngredient: IngredientRegistry = {
  id: 'ing_toor_dal',
  defaultName: 'Toor Dal',
  translations: [
    { language: 'Tamil', name: 'துவரம் பருப்பு' },
    { language: 'Hindi', name: 'अरहर दाल' },
  ],
};

describe('Epic 6 & Epic 37: Conversions, Vulgar Fractions & Translations Engine', () => {
  describe('Unit Conversions', () => {
    it('converts weight to weight (e.g. kg to g)', () => {
      const result = convertUnitQuantity(1.5, 'kg', 'g');
      expect(result.quantity).toBe(1500);
      expect(result.unit).toBe('g');
      expect(result.isConverted).toBe(true);
    });

    it('converts volume to volume (e.g. cup to ml)', () => {
      const result = convertUnitQuantity(2, 'cup', 'ml');
      expect(result.quantity).toBe(480);
      expect(result.unit).toBe('ml');
      expect(result.isConverted).toBe(true);
    });

    it('converts volume to weight using ingredient density (e.g. 1 cup toor dal to grams)', () => {
      const result = convertUnitQuantity(1, 'cup', 'g', 'ing_toor_dal');
      expect(result.quantity).toBe(200);
      expect(result.unit).toBe('g');
      expect(result.isConverted).toBe(true);
    });

    it('returns unchanged if units are identical', () => {
      const result = convertUnitQuantity(100, 'g', 'g');
      expect(result.quantity).toBe(100);
      expect(result.isConverted).toBe(false);
    });
  });

  describe('Story 71: Vulgar Fractions Formatter', () => {
    it('formats pure fractions correctly', () => {
      expect(formatCulinaryFraction(0.5, 'cup')).toBe('½');
      expect(formatCulinaryFraction(0.25, 'cup')).toBe('¼');
      expect(formatCulinaryFraction(0.33, 'cup')).toBe('⅓');
      expect(formatCulinaryFraction(0.66, 'cup')).toBe('⅔');
      expect(formatCulinaryFraction(0.75, 'tbsp')).toBe('¾');
      expect(formatCulinaryFraction(0.125, 'tsp')).toBe('⅛');
    });

    it('formats mixed fractions correctly', () => {
      expect(formatCulinaryFraction(1.5, 'cup')).toBe('1 ½');
      expect(formatCulinaryFraction(2.25, 'cup')).toBe('2 ¼');
      expect(formatCulinaryFraction(1.33, 'cup')).toBe('1 ⅓');
      expect(formatCulinaryFraction(3.75, 'tbsp')).toBe('3 ¾');
    });

    it('formats integer and metric values cleanly', () => {
      expect(formatCulinaryFraction(250, 'g')).toBe('250');
      expect(formatCulinaryFraction(12.5, 'g')).toBe('12.5');
      expect(formatCulinaryFraction(2, 'count')).toBe('2');
    });
  });

  describe('Story 70: Metric vs US Customary Ingredient Display', () => {
    it('converts grams to cups/tbsp/tsp when US Customary is requested', () => {
      // 200g Toor Dal -> 1 cup
      const cupDisplay = getConvertedIngredientDisplay(200, 'g', 'ing_toor_dal', 'us_customary');
      expect(cupDisplay.formattedQuantity).toBe('1');
      expect(cupDisplay.unit).toBe('cup');

      // 10g Salt -> ~2 tsp
      const tspDisplay = getConvertedIngredientDisplay(10, 'g', 'ing_salt', 'us_customary');
      expect(tspDisplay.unit).toBe('tsp');
    });

    it('converts cups to grams when Metric is requested', () => {
      const metricDisplay = getConvertedIngredientDisplay(1, 'cup', 'ing_toor_dal', 'metric');
      expect(metricDisplay.formattedQuantity).toBe('200');
      expect(metricDisplay.unit).toBe('g');
    });
  });

  describe('Multi-Language Localization', () => {
    it('returns English default name', () => {
      expect(getLocalizedIngredientName(mockIngredient, 'en')).toBe('Toor Dal');
    });

    it('returns Tamil localized name', () => {
      expect(getLocalizedIngredientName(mockIngredient, 'ta')).toBe('துவரம் பருப்பு');
    });

    it('returns Hindi localized name', () => {
      expect(getLocalizedIngredientName(mockIngredient, 'hi')).toBe('अरहर दाल');
    });

    it('falls back to default name if language translation is missing', () => {
      const ingWithoutHindi: IngredientRegistry = {
        id: 'ing_custom',
        defaultName: 'Custom Herb',
        translations: [],
      };
      expect(getLocalizedIngredientName(ingWithoutHindi, 'hi')).toBe('Custom Herb');
    });

    it('formats dual-script localized ingredient names (Tamil + English subtitle)', () => {
      const formattedTa = formatLocalizedIngredient('ing_toor_dal', 'ta', [mockIngredient]);
      expect(formattedTa.primary).toBe('துவரம் பருப்பு');
      expect(formattedTa.secondary).toBe('Toor Dal');
      expect(formattedTa.fullText).toBe('துவரம் பருப்பு (Toor Dal)');

      const formattedEn = formatLocalizedIngredient('ing_toor_dal', 'en', [mockIngredient]);
      expect(formattedEn.primary).toBe('Toor Dal');
      expect(formattedEn.secondary).toBeUndefined();
    });
  });
});
