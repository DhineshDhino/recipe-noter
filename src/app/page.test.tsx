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
    expect(screen.getByRole('heading', { level: 1, name: 'Adai' })).toBeInTheDocument();
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
    expect(screen.getAllByText(/Preparation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rest/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cooking/i).length).toBeGreaterThan(0);
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
    const accordions = screen.getAllByText(/Ingredients/i);
    expect(accordions.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a specific block name from mock data', () => {
    renderWithRedux(<Home />);
    expect(screen.getAllByText(/Soaking/i).length).toBeGreaterThan(0);
  });

  it('renders atomic step text from mock data', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText(/Wash all ingredients thoroughly/i)).toBeInTheDocument();
  });

  it('renders Critical badges for steps marked isCritical', () => {
    renderWithRedux(<Home />);
    expect(screen.getAllByText(/Critical/i).length).toBeGreaterThan(0);
  });

  it('renders Optional badges for ingredients marked isOptional', () => {
    renderWithRedux(<Home />);
    expect(screen.getAllByText(/Optional/i).length).toBeGreaterThan(0);
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

// ─────────────────────────────────────────────
// Story 24 — Cooking Progress & Checklists
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Story 24: Cooking Progress & Checklists', () => {
  it('renders overall steps progress counter (0/X Steps Done)', () => {
    renderWithRedux(<Home />);
    expect(screen.getByText(/0\//)).toBeInTheDocument();
    expect(screen.getByText(/Steps Done/i)).toBeInTheDocument();
  });

  it('checking a step increments the progress counter', () => {
    const { container } = renderWithRedux(<Home />);
    const firstCheckbox = container.querySelector('#checkbox-prep-0-0') as HTMLInputElement;
    expect(firstCheckbox).toBeInTheDocument();
    expect(firstCheckbox.checked).toBe(false);

    fireEvent.click(firstCheckbox);
    expect(screen.getByText(/1\//)).toBeInTheDocument();
  });

  it('renders "Reset" progress button when steps are checked and resets on click', () => {
    const { container } = renderWithRedux(<Home />);
    const firstCheckbox = container.querySelector('#checkbox-prep-0-0') as HTMLInputElement;
    fireEvent.click(firstCheckbox);

    const resetBtn = screen.getByText('Reset');
    expect(resetBtn).toBeInTheDocument();

    fireEvent.click(resetBtn);
    expect(screen.getByText(/0\//)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Story 25 — Step Duration Timers
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Story 25: Step Duration Timers', () => {
  it('renders clickable timer button for steps with defined duration', () => {
    renderWithRedux(<Home />);
    const timerButtons = screen.getAllByText(/Start Timer/i);
    expect(timerButtons.length).toBeGreaterThan(0);
  });

  it('clicking start timer reveals countdown timer interface with Pause/Reset controls', () => {
    renderWithRedux(<Home />);
    const timerButton = screen.getAllByText(/Start Timer/i)[0];
    fireEvent.click(timerButton);

    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByTitle('Reset timer')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Story 26 — Taste Profile Tuning
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Story 26: Taste Profile Tuning', () => {
  it('toggles the Taste Profile panel when clicking Taste Tuning button', () => {
    renderWithRedux(<Home />);
    const toggleBtn = screen.getByText(/Taste Tuning/i);
    expect(screen.queryByText(/Taste Profile Tolerance Adjusters/i)).not.toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/Taste Profile Tolerance Adjusters/i)).toBeInTheDocument();
    expect(screen.getByText(/Spice Tolerance/i)).toBeInTheDocument();
    expect(screen.getByText(/Sweetness Tolerance/i)).toBeInTheDocument();
  });

  it('adjusts spice tolerance level when clicking a preset (e.g. Spicy 150%)', () => {
    renderWithRedux(<Home />);
    fireEvent.click(screen.getByText(/Taste Tuning/i));

    const spicyPreset = screen.getByText('Spicy (150%)');
    fireEvent.click(spicyPreset);

    expect(screen.getAllByText(/150%/).length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// Story 8 / Yield Scaling — Step Duration Scaling
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Step Duration Scaling with Yield', () => {
  it('dynamically scales duration and badges for yield-dependent steps when servings change', () => {
    renderWithRedux(<Home />);
    const yieldInput = screen.getByRole('spinbutton', { name: /servings/i });
    
    // Scale servings from 4 to 8 (doubled)
    fireEvent.change(yieldInput, { target: { value: '8' } });

    // Yield-dependent steps like wash step and dal grinding step (5m for 4 servings) should scale to 10m
    expect(screen.getAllByText(/scaled from 5m/i).length).toBeGreaterThan(0);
    // Yield-dependent steps like grind step (10m for 4 servings) should scale to 20m
    expect(screen.getAllByText(/scaled from 10m/i).length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// Story 8.1 — Step Visual Media & Guidance
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Story 8.1: Step Visual Media Guidance', () => {
  it('renders step image guidance buttons with stage tags (While Cooking & Expected Result)', () => {
    renderWithRedux(<Home />);
    expect(screen.getAllByText(/👨‍🍳 While Cooking/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/✨ Expected Result/i).length).toBeGreaterThan(0);
  });

  it('opens Image Lightbox Modal when clicking a step reference photo and allows closing', () => {
    renderWithRedux(<Home />);
    const photoBtns = screen.getAllByTitle('Click to view full photo');
    expect(photoBtns.length).toBeGreaterThan(0);

    fireEvent.click(photoBtns[0]);

    // Lightbox modal should display full-size photo, stage badge, and caption
    expect(screen.getAllByText(/Semi-coarse batter texture with visible crushed dal flecks/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/👨‍🍳 While Cooking \(In-Progress Process\)/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByTitle('Close preview');
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/👨‍🍳 While Cooking \(In-Progress Process\)/i)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Story 24.1 — Focus Mode
// ─────────────────────────────────────────────
describe('Dashboard UI Shell — Story 24.1: Step-by-Step Focus Mode', () => {
  it('opens Focus Mode when clicking Focus Mode button and can exit', () => {
    renderWithRedux(<Home />);
    const focusModeBtn = screen.getByRole('button', { name: /Focus Mode/i });
    expect(focusModeBtn).toBeInTheDocument();

    fireEvent.click(focusModeBtn);
    expect(screen.getAllByText(/Focus Mode/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Complete & Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next/i })).toBeInTheDocument();

    const exitBtn = screen.getByTitle(/Exit Focus Mode/i);
    fireEvent.click(exitBtn);
    expect(screen.queryByText(/Step 1 of/i)).not.toBeInTheDocument();
  });
});

