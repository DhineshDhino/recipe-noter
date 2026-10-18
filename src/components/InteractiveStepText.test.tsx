import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InteractiveStepText from './InteractiveStepText';
import { IngredientRegistry } from '@/lib/types';

const mockIngredients: IngredientRegistry[] = [
  {
    id: 'ing_mustard',
    defaultName: 'Mustard Seeds',
    translations: [{ language: 'Tamil', name: 'கடுகு' }],
  },
  {
    id: 'ing_oil',
    defaultName: 'Oil',
    translations: [{ language: 'Tamil', name: 'எண்ணெய்' }],
  },
];

describe('InteractiveStepText (Story 72)', () => {
  it('renders plain text when no ingredients are provided', () => {
    render(<InteractiveStepText text="Stir continuously for 2 minutes." />);
    expect(screen.getByText('Stir continuously for 2 minutes.')).toBeInTheDocument();
  });

  it('detects and highlights ingredients as interactive buttons', () => {
    render(
      <InteractiveStepText
        text="Heat 2 tbsp oil in a pan and add mustard seeds."
        masterIngredients={mockIngredients}
      />
    );

    const oilBtn = screen.getByRole('button', { name: /Toggle ingredient oil/i });
    const mustardBtn = screen.getByRole('button', { name: /Toggle ingredient mustard seeds/i });

    expect(oilBtn).toBeInTheDocument();
    expect(mustardBtn).toBeInTheDocument();
  });

  it('strikes through ingredients when clicked and calls callback', () => {
    const handleToggle = jest.fn();
    render(
      <InteractiveStepText
        text="Heat oil in a pan and add mustard seeds."
        masterIngredients={mockIngredients}
        onIngredientToggle={handleToggle}
      />
    );

    const mustardBtn = screen.getByRole('button', { name: /Toggle ingredient mustard seeds/i });
    expect(mustardBtn).not.toHaveClass('line-through');

    fireEvent.click(mustardBtn);
    expect(mustardBtn).toHaveClass('line-through');
    expect(handleToggle).toHaveBeenCalledWith('mustard seeds', true);

    // Click again to un-strike
    fireEvent.click(mustardBtn);
    expect(mustardBtn).not.toHaveClass('line-through');
    expect(handleToggle).toHaveBeenCalledWith('mustard seeds', false);
  });
});
