import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import StepAutocompleteInput from './StepAutocompleteInput';
import { IngredientRegistry } from '@/lib/types';
import { searchCookingTerms, masterCookingTerms } from '@/lib/cookingTerms';

const mockIngredients: IngredientRegistry[] = [
  { id: 'ing_toor_dal', defaultName: 'Toor Dal', translations: [{ language: 'Tamil', name: 'Thuvaram Paruppu' }] },
  { id: 'ing_chana_dal', defaultName: 'Chana Dal', translations: [{ language: 'Tamil', name: 'Kadalai Paruppu' }] },
  { id: 'ing_cumin_seeds', defaultName: 'Cumin Seeds', translations: [{ language: 'Tamil', name: 'Seeragam' }] },
];

describe('Epic 5: Master Cooking Terms & Step Autocomplete Engine', () => {
  describe('cookingTerms dictionary', () => {
    it('contains over 40 categorized cooking terms with definitions', () => {
      expect(masterCookingTerms.length).toBeGreaterThan(40);
      expect(masterCookingTerms.some(t => t.term.includes('Tempering'))).toBe(true);
      expect(masterCookingTerms.some(t => t.term.includes('Roasting'))).toBe(true);
    });

    it('searches cooking terms with fuzzy match', () => {
      const results = searchCookingTerms('roast');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.term.toLowerCase().includes('roast'))).toBe(true);
    });
  });

  describe('StepAutocompleteInput Component', () => {
    it('renders input with given placeholder', () => {
      render(
        <StepAutocompleteInput
          value=""
          onChange={jest.fn()}
          placeholder="Type a step..."
          masterIngredients={mockIngredients}
        />
      );
      expect(screen.getByPlaceholderText('Type a step...')).toBeInTheDocument();
    });

    it('shows floating suggestions when typing 2+ characters matching an ingredient', () => {
      const { rerender } = render(
        <StepAutocompleteInput
          value="Add to"
          onChange={jest.fn()}
          masterIngredients={mockIngredients}
        />
      );

      // Simulate typing 'to'
      const input = screen.getByDisplayValue('Add to');
      fireEvent.click(input);
      fireEvent.keyUp(input);

      expect(screen.getByText('Master Ingredients (Auto-links ID)')).toBeInTheDocument();
      expect(screen.getByText('Toor Dal')).toBeInTheDocument();
    });

    it('shows cooking verbs suggestions when typing a technique word', () => {
      render(
        <StepAutocompleteInput
          value="Start saute"
          onChange={jest.fn()}
          masterIngredients={mockIngredients}
        />
      );

      const input = screen.getByDisplayValue('Start saute');
      fireEvent.click(input);
      fireEvent.keyUp(input);

      expect(screen.getByText('Cooking Verbs & Techniques')).toBeInTheDocument();
      expect(screen.getAllByText(/Sauté/i).length).toBeGreaterThan(0);
    });

    it('selects ingredient and calls onSelectIngredient callback', () => {
      const onSelect = jest.fn();
      const onChange = jest.fn();

      render(
        <StepAutocompleteInput
          value="Soak to"
          onChange={onChange}
          onSelectIngredient={onSelect}
          masterIngredients={mockIngredients}
        />
      );

      const input = screen.getByDisplayValue('Soak to');
      fireEvent.click(input);
      fireEvent.keyUp(input);

      const toorOption = screen.getByText('Toor Dal');
      fireEvent.mouseDown(toorOption);

      expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'ing_toor_dal' }));
      expect(onChange).toHaveBeenCalledWith(expect.stringContaining('Toor Dal'));
    });
  });
});
