import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import recipeReducer from '@/store/recipeSlice';
import GroceryListModal from './GroceryListModal';
import { mockAdaiRecipe } from '@/lib/mockRecipe';

const createMockStore = () =>
  configureStore({
    reducer: {
      recipe: recipeReducer,
    },
  });

describe('Epic 10: Smart Grocery Planning (Story 23)', () => {
  it('renders aggregated grocery items with category headers', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GroceryListModal
          isOpen={true}
          onClose={jest.fn()}
          recipe={mockAdaiRecipe}
          targetYield={4}
          baseYield={4}
        />
      </Provider>
    );

    expect(screen.getByText('Smart Grocery List')).toBeInTheDocument();
    expect(screen.getByText(/Grains & Lentils/i)).toBeInTheDocument();
    expect(screen.getByText(/Spices & Seasonings/i)).toBeInTheDocument();
    expect(screen.getByText(/Fresh Produce & Herbs/i)).toBeInTheDocument();
  });

  it('scales quantities correctly for higher yield', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GroceryListModal
          isOpen={true}
          onClose={jest.fn()}
          recipe={mockAdaiRecipe}
          targetYield={8}
          baseYield={4}
        />
      </Provider>
    );

    expect(screen.getByText(/8 Servings/i)).toBeInTheDocument();
  });

  it('allows checking off items as bought', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GroceryListModal
          isOpen={true}
          onClose={jest.fn()}
          recipe={mockAdaiRecipe}
          targetYield={4}
          baseYield={4}
        />
      </Provider>
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);

    const firstCheckbox = checkboxes[0];
    expect(firstCheckbox).not.toBeChecked();

    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
    expect(screen.getByText(/1 of/i)).toBeInTheDocument();
  });

  it('copies checklist formatted text to clipboard with [Critical] and [Optional] tags', () => {
    const store = createMockStore();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    render(
      <Provider store={store}>
        <GroceryListModal
          isOpen={true}
          onClose={jest.fn()}
          recipe={mockAdaiRecipe}
          targetYield={4}
          baseYield={4}
        />
      </Provider>
    );

    const copyBtn = screen.getByText('Copy Checklist');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it('filters grocery items by ⚡ Critical Core and ✨ Optional tabs', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <GroceryListModal
          isOpen={true}
          onClose={jest.fn()}
          recipe={mockAdaiRecipe}
          targetYield={4}
          baseYield={4}
        />
      </Provider>
    );

    // Initial "All Items"
    expect(screen.getByText(/All Items/i)).toBeInTheDocument();

    // Click Critical Core filter
    const criticalTab = screen.getByRole('button', { name: /Critical Core/i });
    fireEvent.click(criticalTab);
    expect(screen.getByText(/⚡ Critical Core/i)).toBeInTheDocument();

    // Click Optional filter
    const optionalTab = screen.getByRole('button', { name: /Optional/i });
    fireEvent.click(optionalTab);
    expect(screen.getAllByText(/✨ Optional/i).length).toBeGreaterThan(0);
  });
});
