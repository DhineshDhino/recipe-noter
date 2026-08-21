import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import UserProfileModal from './UserProfileModal';
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

describe('Epic 19: UserProfileModal Component (Story 42 & 44)', () => {
  it('renders signed in chef profile with email and statistics', () => {
    renderWithRedux(<UserProfileModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Chef Profile & Account')).toBeInTheDocument();
    expect(screen.getByText('Chef Dhinesh')).toBeInTheDocument();
    expect(screen.getByText('dhinesh@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Google Verified')).toBeInTheDocument();
    expect(screen.getByText(/Bookmarked Favorites/i)).toBeInTheDocument();
  });

  it('creates a new custom recipe collection', () => {
    const { store } = renderWithRedux(<UserProfileModal isOpen={true} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText(/New Collection Name/i);
    fireEvent.change(input, { target: { value: 'Festival Specials' } });

    const addBtn = screen.getByText('+ Add');
    fireEvent.click(addBtn);

    expect(screen.getByText(/Festival Specials/i)).toBeInTheDocument();
    expect(store.getState().recipe.customCollections['Festival Specials']).toBeDefined();
  });
});
