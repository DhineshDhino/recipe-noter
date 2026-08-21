import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RecipeDiscussionSection from './RecipeDiscussionSection';
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

describe('Epic 20: RecipeDiscussionSection Component (Story 43)', () => {
  it('renders existing community comments and authoring form', () => {
    renderWithRedux(
      <RecipeDiscussionSection recipeId="recipe_adai_001" recipeName="Adai" />
    );

    expect(screen.getByText('Community Discussion & Tips')).toBeInTheDocument();
    expect(screen.getByText(/Adding a handful of drumstick leaves/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask a question or share your cooking experience/i)).toBeInTheDocument();
  });

  it('posts a new comment and adds to comment list', () => {
    const { store } = renderWithRedux(
      <RecipeDiscussionSection recipeId="recipe_adai_001" recipeName="Adai" />
    );

    const input = screen.getByPlaceholderText(/Ask a question or share your cooking experience/i);
    fireEvent.change(input, { target: { value: 'How fine should I grind the dal?' } });

    const postBtn = screen.getByText('Post Comment');
    fireEvent.click(postBtn);

    expect(screen.getByText('How fine should I grind the dal?')).toBeInTheDocument();
    expect(store.getState().recipe.recipeComments['recipe_adai_001'][0].text).toBe('How fine should I grind the dal?');
  });

  it('likes a comment and increments like counter', () => {
    renderWithRedux(
      <RecipeDiscussionSection recipeId="recipe_adai_001" recipeName="Adai" />
    );

    const upvoteBtn = screen.getByTitle('Mark as helpful');
    fireEvent.click(upvoteBtn);

    expect(screen.getByText('13')).toBeInTheDocument();
  });
});
