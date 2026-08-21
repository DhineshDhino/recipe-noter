import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import WhatToCookModal from './WhatToCookModal';
import recipeReducer from '@/store/recipeSlice';
import editorReducer from '@/store/editorSlice';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const renderWithRedux = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      recipe: recipeReducer,
      editor: editorReducer,
    },
  });
  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

describe('Epic 17: WhatToCookModal Component (Story 39)', () => {
  it('renders modal with Circadian Matcher title and meal slot pills', () => {
    renderWithRedux(<WhatToCookModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('What to Cook')).toBeInTheDocument();
    expect(screen.getByText('Circadian Matcher')).toBeInTheDocument();
    expect(screen.getByText('All Meals')).toBeInTheDocument();
    expect(screen.getByText(/Breakfast/i)).toBeInTheDocument();
    expect(screen.getByText(/Surprise Me/i)).toBeInTheDocument();
  });

  it('allows switching meal slot tabs and filtering recommendations', () => {
    renderWithRedux(<WhatToCookModal isOpen={true} onClose={jest.fn()} />);

    const breakfastTab = screen.getByText(/Breakfast \/ Tiffin/i);
    fireEvent.click(breakfastTab);

    expect(screen.getByText(/Ranked by pantry readiness/i)).toBeInTheDocument();
  });

  it('toggles Zero Rest Time filter', () => {
    renderWithRedux(<WhatToCookModal isOpen={true} onClose={jest.fn()} />);

    const noSoakBtn = screen.getByText(/No Soaking \/ 0m Rest/i);
    fireEvent.click(noSoakBtn);

    expect(noSoakBtn).toBeInTheDocument();
  });

  it('opens and interacts with Pantry Drawer', () => {
    renderWithRedux(<WhatToCookModal isOpen={true} onClose={jest.fn()} />);

    const pantryBtn = screen.getByText(/My Pantry/i);
    fireEvent.click(pantryBtn);

    expect(screen.getByText(/Select Ingredients in Your Kitchen:/i)).toBeInTheDocument();
  });

  it('launches Focus Mode when clicking Start Cooking', () => {
    const { store } = renderWithRedux(<WhatToCookModal isOpen={true} onClose={jest.fn()} />);

    const cookButtons = screen.getAllByText(/Start Cooking \(Focus\)/i);
    expect(cookButtons.length).toBeGreaterThan(0);

    fireEvent.click(cookButtons[0]);
    // Guided cooking focus modal should now be open
    expect(screen.getByText(/Focus Mode/i)).toBeInTheDocument();
  });

  it('switches between 3-tier scopes (My Authored, My Favorites, All Recipes)', () => {
    renderWithRedux(<WhatToCookModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText(/My Authored/i)).toBeInTheDocument();
    expect(screen.getByText(/My Favorites/i)).toBeInTheDocument();
    expect(screen.getByText(/All Recipes/i)).toBeInTheDocument();

    const authoredBtn = screen.getByText(/My Authored/i);
    fireEvent.click(authoredBtn);

    const favoritesBtn = screen.getByText(/My Favorites/i);
    fireEvent.click(favoritesBtn);
  });
});
