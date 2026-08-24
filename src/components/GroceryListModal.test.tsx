import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import GroceryListModal from './GroceryListModal';
import { mockAdaiRecipe } from '@/lib/mockRecipe';

describe('Epic 10: Smart Grocery Planning (Story 23)', () => {
  it('renders aggregated grocery items with category headers', () => {
    render(
      <GroceryListModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
      />
    );

    expect(screen.getByText('Smart Grocery List')).toBeInTheDocument();
    expect(screen.getByText(/Grains & Lentils/i)).toBeInTheDocument();
    expect(screen.getByText(/Spices & Seasonings/i)).toBeInTheDocument();
    expect(screen.getByText(/Fresh Produce & Herbs/i)).toBeInTheDocument();
  });

  it('scales quantities correctly for higher yield', () => {
    render(
      <GroceryListModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={8}
        baseYield={4}
      />
    );

    expect(screen.getByText(/8 Servings/i)).toBeInTheDocument();
  });

  it('allows checking off items as bought', () => {
    render(
      <GroceryListModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    fireEvent.click(checkboxes[0]);
    expect(screen.getByText(/1 of \d+/i)).toBeInTheDocument();
  });

  it('copies checklist formatted text to clipboard with [Critical] and [Optional] tags', () => {
    const writeTextMock = jest.fn().mockImplementation(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <GroceryListModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
      />
    );

    const copyBtn = screen.getByText(/Copy Checklist/i);
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    const copiedText = writeTextMock.mock.calls[0][0];
    expect(copiedText).toContain('[Critical]');
    expect(copiedText).toContain('Raw Rice');
  });

  it('filters grocery items by ⚡ Critical Core and ✨ Optional tabs', () => {
    render(
      <GroceryListModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
      />
    );

    // Initial view: all items
    expect(screen.getByRole('button', { name: /All Items/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Critical Core/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Optional/i })).toBeInTheDocument();

    // Click Critical tab
    const criticalTab = screen.getByRole('button', { name: /Critical Core/i });
    fireEvent.click(criticalTab);
    expect(screen.getAllByText(/⚡ Critical/i).length).toBeGreaterThan(0);

    // Click Optional tab
    const optionalTab = screen.getByRole('button', { name: /Optional/i });
    fireEvent.click(optionalTab);
    expect(screen.getAllByText(/✨ Optional/i).length).toBeGreaterThan(0);
  });
});
