import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Home from './page';
import recipeReducer from '../store/recipeSlice';

const renderWithRedux = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      recipe: recipeReducer,
    },
  });
  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

describe('Dashboard UI Shell (Stories 3 & 4)', () => {
  it('renders the recipe name and yield input from the Redux store', () => {
    renderWithRedux(<Home />);

    expect(screen.getByText('Adai')).toBeInTheDocument();
    // Yield is now a number input
    expect(screen.getByRole('spinbutton', { name: /servings/i })).toHaveValue(4);
  });

  it('renders the three major layout sections correctly', () => {
    renderWithRedux(<Home />);

    expect(screen.getByText('Preparation')).toBeInTheDocument();
    expect(screen.getByText('Passive / Resting')).toBeInTheDocument();
    expect(screen.getByText('Active Cooking')).toBeInTheDocument();
  });

  it('iterates through Redux state and renders Component Blocks and Atomic Steps accurately', () => {
    renderWithRedux(<Home />);

    expect(screen.getByText(/Soaking/i)).toBeInTheDocument();
    expect(screen.getByText(/Wash all ingredients thoroughly/i)).toBeInTheDocument();
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
  });

  it('Story 5: updates yield input and reflects the new value', () => {
    renderWithRedux(<Home />);

    const yieldInput = screen.getByRole('spinbutton', { name: /servings/i });
    expect(yieldInput).toHaveValue(4);

    fireEvent.change(yieldInput, { target: { value: '8' } });
    expect(yieldInput).toHaveValue(8);
  });

  it('Story 6: ratio mismatch banner appears when an ingredient override breaks a strict ratio', () => {
    const { container } = renderWithRedux(<Home />);

    // Use specific input IDs — they are always in the DOM (details is a CSS toggle, not React conditional)
    const rawRiceInput = container.querySelector('#override-ing_raw_rice') as HTMLInputElement;
    const boiledRiceInput = container.querySelector('#override-ing_boiled_rice') as HTMLInputElement;

    expect(rawRiceInput).toBeTruthy();
    expect(boiledRiceInput).toBeTruthy();

    // Override raw_rice to 200
    fireEvent.change(rawRiceInput, { target: { value: '200' } });
    // Override boiled_rice to an inconsistent 50 (correct 1:1 would be 200)
    fireEvent.change(boiledRiceInput, { target: { value: '50' } });

    // The mismatch banner should now appear
    expect(screen.getByText(/Ratio Mismatch/i)).toBeInTheDocument();
    expect(screen.getByText(/Rice Blend/i)).toBeInTheDocument();
  });
});
