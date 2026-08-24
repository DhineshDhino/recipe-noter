import { convertUnitQuantity, getLocalizedIngredientName, formatLocalizedIngredient, ingredientDensities } from './conversions';
import { IngredientRegistry } from './types';

const mockIngredient: IngredientRegistry = {
  id: 'ing_toor_dal',
  defaultName: 'Toor Dal',
  translations: [
    { language: 'Tamil', name: 'துவரம் பருப்பு' },
    { language: 'Hindi', name: 'अरहर दाल' },
  ],
};

describe('Epic 6: Conversions & Translations Engine', () => {
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
