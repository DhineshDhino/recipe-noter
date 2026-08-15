import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GuidedCookingModal from './GuidedCookingModal';
import recipeReducer from '../store/recipeSlice';
import editorReducer from '../store/editorSlice';
import { mockAdaiRecipe } from '../lib/mockRecipe';

const renderWithStore = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      recipe: recipeReducer,
      editor: editorReducer,
    },
  });
  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

describe('GuidedCookingModal (Story 24.1 Focus Mode)', () => {
  it('does not render when isOpen is false', () => {
    renderWithStore(
      <GuidedCookingModal
        isOpen={false}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );
    expect(screen.queryByText(/Focus Mode/i)).not.toBeInTheDocument();
  });

  it('renders correctly with recipe name, focus mode badge, and step 1 details when isOpen is true', () => {
    renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );
    expect(screen.getAllByText('Adai').length).toBeGreaterThan(0);
    expect(screen.getByText(/Focus Mode/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Step 1 of/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Preparation Phase/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete & Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mark Done/i })).toBeInTheDocument();
  });

  it('moves to next step WITHOUT marking as complete when clicking Next button', () => {
    const { store } = renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );

    expect(screen.getAllByText(/Step 1 of/i).length).toBeGreaterThan(0);
    const nextBtn = screen.getByRole('button', { name: /^Next/i });
    fireEvent.click(nextBtn);

    // Should now be on Step 2
    expect(screen.getAllByText(/Step 2 of/i).length).toBeGreaterThan(0);
    // Step 1 key prep-0-0 should NOT be marked completed
    expect(store.getState().recipe.completedStepIds['prep-0-0']).toBeFalsy();
  });

  it('advances to next step AND dispatches completion on Complete & Next click', () => {
    const { store } = renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );

    expect(screen.getAllByText(/Step 1 of/i).length).toBeGreaterThan(0);
    const completeNextBtn = screen.getByRole('button', { name: /Complete & Next/i });
    fireEvent.click(completeNextBtn);

    // Should now be on Step 2
    expect(screen.getAllByText(/Step 2 of/i).length).toBeGreaterThan(0);
    // Step 1 key prep-0-0 SHOULD be marked completed in store
    expect(store.getState().recipe.completedStepIds['prep-0-0']).toBe(true);
  });

  it('toggles completion status on current step via inline Mark Done button without advancing', () => {
    const { store } = renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );

    const markDoneBtn = screen.getByRole('button', { name: /Mark Done/i });
    fireEvent.click(markDoneBtn);

    // Step 1 key prep-0-0 marked completed
    expect(store.getState().recipe.completedStepIds['prep-0-0']).toBe(true);
    // Still on Step 1
    expect(screen.getAllByText(/Step 1 of/i).length).toBeGreaterThan(0);
    // Button text updates to Done
    expect(screen.getByRole('button', { name: /✓ Done/i })).toBeInTheDocument();
  });

  it('allows navigating back to previous step', () => {
    renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );

    const nextBtn = screen.getByRole('button', { name: /^Next/i });
    fireEvent.click(nextBtn);
    expect(screen.getAllByText(/Step 2 of/i).length).toBeGreaterThan(0);

    const prevBtn = screen.getByRole('button', { name: /Previous/i });
    fireEvent.click(prevBtn);
    expect(screen.getAllByText(/Step 1 of/i).length).toBeGreaterThan(0);
  });

  it('displays step countdown timer and allows starting timer', () => {
    renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );

    // Step 1 in mockAdaiRecipe has 5m duration
    expect(screen.getByText(/Step Countdown Timer/i)).toBeInTheDocument();
    const startTimerBtn = screen.getByRole('button', { name: /▶ Start Timer/i });
    expect(startTimerBtn).toBeInTheDocument();

    fireEvent.click(startTimerBtn);
    expect(screen.getByRole('button', { name: /⏸ Pause Timer/i })).toBeInTheDocument();
  });

  it('jumps directly to a step via the bottom mini carousel strip', () => {
    renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={jest.fn()}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );

    const step3Btn = screen.getByRole('button', { name: /3/i });
    fireEvent.click(step3Btn);

    expect(screen.getAllByText(/Step 3 of/i).length).toBeGreaterThan(0);
  });

  it('calls onClose when clicking Exit Focus button', () => {
    const handleClose = jest.fn();
    renderWithStore(
      <GuidedCookingModal
        isOpen={true}
        onClose={handleClose}
        recipe={mockAdaiRecipe}
        targetYield={4}
        baseYield={4}
        spiceMultiplier={1}
        sweetMultiplier={1}
      />
    );

    const exitBtn = screen.getByTitle(/Exit Focus Mode/i);
    fireEvent.click(exitBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
