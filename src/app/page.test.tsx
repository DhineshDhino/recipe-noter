import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Home from './page';
import recipeReducer from '../store/recipeSlice';

const renderWithRedux = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: { recipe: recipeReducer },
  });
  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

// ─────────────────────────────────────────────
// Dashboard Shell Rendering
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Rendering (Stories 3 & 4)', () => {
  it('renders the recipe name from the Redux store', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText('Adai')).toBeInTheDocument();
  });

  it('renders the recipe version name', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText("Amma's Soft Version")).toBeInTheDocument();
  });

  it('renders the Servings input with the base yield value', () => {
    renderWithRedux(<Home />);
    const yieldInput = screen.getByRole('spinbutton', { name: /servings/i });
    expect(yieldInput).toHaveValue(4);
  });

  it('renders all three layout section headings', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText('Preparation')).toBeInTheDocument();
    expect(screen.getByText('Passive / Resting')).toBeInTheDocument();
    expect(screen.getByText('Active Cooking')).toBeInTheDocument();
  });

  it('renders the time breakdown header with Total, Prep, Rest, Cook', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText(/Total:/i)).toBeInTheDocument();
    expect(screen.getByText(/Prep:/i)).toBeInTheDocument();
    expect(screen.getByText(/Rest:/i)).toBeInTheDocument();
    expect(screen.getByText(/Cook:/i)).toBeInTheDocument();
  });

  it('renders Phase Ingredient accordions for both Prep and Cook sections', () => {
    renderWithRedux(<Home />);
    const accordions = screen.getAllByText('Phase Ingredients');
    // One for Prep, one for Cook
    expect(accordions.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a specific block name from mock data', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText(/Soaking/i)).toBeInTheDocument();
  });

  it('renders atomic step text from mock data', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText(/Wash all ingredients thoroughly/i)).toBeInTheDocument();
  });

  it('renders Critical badges for steps marked isCritical', () => {
    renderWithRedux(<Home />);
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
  });

  it('renders Optional badges for ingredients marked isOptional', () => {
    renderWithRedux(<Home />);
    expect(screen.getAllByText('Optional').length).toBeGreaterThan(0);
  });

  it('renders ingredient override inputs in the DOM (even when accordion is collapsed)', () => {
    const { container } = renderWithRedux(<Home />);
    // Inputs are always in the DOM; details element is just CSS-toggled
    const rawRiceInput = container.querySelector('#override-ing_raw_rice');
    expect(rawRiceInput).toBeTruthy();
  });

  it('does not render a ratio mismatch banner in the initial state', () => {
    renderWithRedux(<Home />);
    expect(screen.queryByText(/Ratio Mismatch/i)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Story 5 — Yield Input
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Story 5: Yield Input', () => {
  it('updates the yield input when the user types a new value', () => {
    renderWithRedux(<Home />);
    const yieldInput = screen.getByRole('spinbutton', { name: /servings/i });
    fireEvent.change(yieldInput, { target: { value: '8' } });
    expect(yieldInput).toHaveValue(8);
  });

  it('shows the base yield hint when target differs from base', () => {
    renderWithRedux(<Home />);
    const yieldInput = screen.getByRole('spinbutton', { name: /servings/i });
    fireEvent.change(yieldInput, { target: { value: '8' } });
    // Should show "(base: 4)" hint
    expect(screen.getByText(/base: 4/i)).toBeInTheDocument();
  });

  it('does not show the base yield hint when target equals base', () => {
    renderWithRedux(<Home />);
    // Default state has targetYield === baseYield
    expect(screen.queryByText(/base:/i)).not.toBeInTheDocument();
  });

  it('ignores non-numeric and zero values gracefully', () => {
    renderWithRedux(<Home />);
    const yieldInput = screen.getByRole('spinbutton', { name: /servings/i });
    // Should remain 4 (initial value) since 0 is not a valid yield
    fireEvent.change(yieldInput, { target: { value: '0' } });
    expect(yieldInput).toHaveValue(4);
  });
});

// ─────────────────────────────────────────────
// Story 6 — Ratio Mismatch UI
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Story 6: Ratio Mismatch UI', () => {
  const setupMismatch = () => {
    const result = renderWithRedux(<Home />);
    const rawRiceInput = result.container.querySelector('#override-ing_raw_rice') as HTMLInputElement;
    const boiledRiceInput = result.container.querySelector('#override-ing_boiled_rice') as HTMLInputElement;
    fireEvent.change(rawRiceInput, { target: { value: '200' } });
    fireEvent.change(boiledRiceInput, { target: { value: '50' } });
    return result;
  };

  it('shows the mismatch banner when a strict ratio is broken', () => {
    setupMismatch();
    expect(screen.getByText(/Ratio Mismatch/i)).toBeInTheDocument();
  });

  it('shows the affected group name in the mismatch banner', () => {
    setupMismatch();
    expect(screen.getByText(/Rice Blend/i)).toBeInTheDocument();
  });

  it('shows the "Auto-scale Group" button in the mismatch banner', () => {
    setupMismatch();
    expect(screen.getByText(/Auto-scale Group/i)).toBeInTheDocument();
  });

  it('shows the "Confirm Break" button in the mismatch banner', () => {
    setupMismatch();
    expect(screen.getByText(/Confirm Break/i)).toBeInTheDocument();
  });

  it('"Auto-scale Group" dismisses the banner', () => {
    setupMismatch();
    fireEvent.click(screen.getByText(/Auto-scale Group/i));
    expect(screen.queryByText(/Ratio Mismatch/i)).not.toBeInTheDocument();
  });

  it('"Confirm Break" dismisses the banner', () => {
    setupMismatch();
    fireEvent.click(screen.getByText(/Confirm Break/i));
    expect(screen.queryByText(/Ratio Mismatch/i)).not.toBeInTheDocument();
  });

  it('changing yield after a mismatch clears the banner', () => {
    setupMismatch();
    expect(screen.getByText(/Ratio Mismatch/i)).toBeInTheDocument();

    const yieldInput = screen.getByRole('spinbutton', { name: /servings/i });
    fireEvent.change(yieldInput, { target: { value: '8' } });
    expect(screen.queryByText(/Ratio Mismatch/i)).not.toBeInTheDocument();
  });
});
