import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RecipeTryModal from './RecipeTryModal';
import recipeReducer from '@/store/recipeSlice';
import editorReducer from '@/store/editorSlice';

const renderWithRedux = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      recipe: recipeReducer,
      editor: editorReducer,
    },
  });
  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

describe('Epic 18: RecipeTryModal Component (Story 40)', () => {
  it('renders modal with star ratings and input fields', () => {
    renderWithRedux(
      <RecipeTryModal
        isOpen={true}
        onClose={jest.fn()}
        recipeId="recipe_adai_001"
        recipeName="Adai"
        baseYield={4}
      />
    );

    expect(screen.getByText('Log Cooking Attempt')).toBeInTheDocument();
    expect(screen.getByText(/What small tweak did you try/i)).toBeInTheDocument();
    expect(screen.getByText(/Sensory Taste & Texture Result/i)).toBeInTheDocument();
  });

  it('submits a cooking attempt and updates Redux state', () => {
    const handleClose = jest.fn();
    const { store } = renderWithRedux(
      <RecipeTryModal
        isOpen={true}
        onClose={handleClose}
        recipeId="recipe_adai_001"
        recipeName="Adai"
        baseYield={4}
      />
    );

    const tweakInput = screen.getByPlaceholderText(/Added \+10g minced ginger/i);
    const tasteInput = screen.getByPlaceholderText(/Extremely crispy honeycomb edges/i);

    fireEvent.change(tweakInput, { target: { value: 'Added curry leaves to the batter' } });
    fireEvent.change(tasteInput, { target: { value: 'Super crispy and aromatic' } });

    const submitBtn = screen.getByText('Save Try to Journal');
    fireEvent.click(submitBtn);

    const tries = store.getState().recipe.recipeTries['recipe_adai_001'];
    expect(tries[0].tweaksSummary).toBe('Added curry leaves to the batter');
    expect(handleClose).toHaveBeenCalled();
  });
});
