import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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
  return render(<Provider store={store}>{component}</Provider>);
};

describe('Dashboard UI Shell (Stories 3 & 4)', () => {
  it('renders the recipe name and base yield dynamically from the Redux store', () => {
    renderWithRedux(<Home />);
    
    // Verifies the store is connected
    expect(screen.getByText('Adai')).toBeInTheDocument();
    expect(screen.getByText(/4 Servings/i)).toBeInTheDocument();
  });

  it('renders the three major layout sections correctly', () => {
    renderWithRedux(<Home />);
    
    // Verifies the UI Shell sections exist
    expect(screen.getByText('Preparation')).toBeInTheDocument();
    expect(screen.getByText('Passive / Resting')).toBeInTheDocument();
    expect(screen.getByText('Active Cooking')).toBeInTheDocument();
  });

  it('iterates through Redux state and renders Component Blocks and Atomic Steps accurately', () => {
    renderWithRedux(<Home />);
    
    // Look for a specific rendered Block Name
    expect(screen.getByText(/Soaking/i)).toBeInTheDocument();
    
    // Look for a specific Atomic Step text
    expect(screen.getByText(/Wash all ingredients thoroughly/i)).toBeInTheDocument();
    
    // Verify that conditional CSS and tags are rendering for Critical steps
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
  });
});
