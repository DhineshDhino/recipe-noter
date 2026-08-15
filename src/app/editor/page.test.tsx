import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EditorPage from './page';
import editorReducer, { loadRecipeIntoEditor } from '../../store/editorSlice';
import recipeReducer from '../../store/recipeSlice';
import { mockAdaiRecipe } from '../../lib/mockRecipe';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const renderWithRedux = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      editor: editorReducer,
      recipe: recipeReducer,
    },
  });
  return { ...render(<Provider store={store}>{component}</Provider>), store };
};

describe('Editor Page — Story 12.1 & 16', () => {
  it('renders the Recipe Editor header with Live Preview and Publish buttons', () => {
    renderWithRedux(<EditorPage />);
    expect(screen.getByRole('heading', { name: /Recipe Editor/i })).toBeInTheDocument();
    expect(screen.getByText(/Live Preview/i)).toBeInTheDocument();
    expect(screen.getByText(/Publish & Cook/i)).toBeInTheDocument();
  });

  it('renders all four phase tabs: Setup, Prep Phase, Rest / Passive, Cooking Phase', () => {
    renderWithRedux(<EditorPage />);
    expect(screen.getByRole('tab', { name: /Setup/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Prep Phase/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Rest \/ Passive/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Cooking Phase/i })).toBeInTheDocument();
  });

  it('allows switching active phase tab', () => {
    renderWithRedux(<EditorPage />);
    const cookTab = screen.getByRole('tab', { name: /Cooking Phase/i });
    fireEvent.click(cookTab);

    expect(cookTab).toHaveAttribute('aria-selected', 'true');
  });

  // Story 16: Master Ingredient Registry UI
  describe('Story 16: Master Ingredient Registry Manager in Setup Tab', () => {
    it('displays Master Ingredient Registry section in the Setup phase tab', () => {
      renderWithRedux(<EditorPage />);
      expect(screen.getByText(/Master Ingredient Registry/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ingredient Name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\+ Add to Registry/i })).toBeInTheDocument();
    });

    it('adds a new ingredient into the master registry via the form', () => {
      renderWithRedux(<EditorPage />);
      const defaultInput = screen.getByPlaceholderText(/Ingredient Name/i);
      const tamilInput = screen.getByPlaceholderText(/Tamil Name/i);
      const addBtn = screen.getByRole('button', { name: /\+ Add to Registry/i });

      fireEvent.change(defaultInput, { target: { value: 'Saffron Threads' } });
      fireEvent.change(tamilInput, { target: { value: 'Kungumapoo' } });
      fireEvent.click(addBtn);

      expect(screen.getByText('Saffron Threads')).toBeInTheDocument();
      expect(screen.getByText('(Kungumapoo)')).toBeInTheDocument();
    });
  });

  // Story 12.1: Live Preview Modal & Publish Action
  describe('Story 12.1: Live Preview Modal & Publish Action', () => {
    it('opens and closes the Live Preview modal when clicking Live Preview button', () => {
      renderWithRedux(<EditorPage />);
      const previewBtn = screen.getByText(/Live Preview/i);
      fireEvent.click(previewBtn);

      expect(screen.getByText(/Save & Open in Reader/i)).toBeInTheDocument();
      expect(screen.getByText(/Back to Editing/i)).toBeInTheDocument();

      const backBtn = screen.getByText(/Back to Editing/i);
      fireEvent.click(backBtn);

      expect(screen.queryByText(/Back to Editing/i)).not.toBeInTheDocument();
    });

    it('syncs editor state to reader recipe store on Publish', () => {
      const { store } = renderWithRedux(<EditorPage />);
      const recipeNameInput = screen.getByPlaceholderText(/e.g., Adai/i);
      fireEvent.change(recipeNameInput, { target: { value: 'Crispy Dosa' } });

      const publishBtn = screen.getByText(/Publish & Cook/i);
      fireEvent.click(publishBtn);

      expect(store.getState().recipe.recipe?.name).toBe('Crispy Dosa');
    });
  });

  // Story 8: Step Duration Scaling Option
  describe('Story 8: Step Duration Scaling Option in Editor', () => {
    it('shows the "Scales with servings (yield)" option when expanding step details', () => {
      const { store } = renderWithRedux(<EditorPage />);
      act(() => {
        store.dispatch(loadRecipeIntoEditor(mockAdaiRecipe));
      });

      // Switch to Prep Phase tab
      const prepTab = screen.getByRole('tab', { name: /Prep Phase/i });
      fireEvent.click(prepTab);

      // Look for the step details gear button ⚙️
      const detailsButtons = screen.getAllByTitle(/Step details/i);
      expect(detailsButtons.length).toBeGreaterThan(0);

      // Open first step details
      fireEvent.click(detailsButtons[0]);

      // Check that the "⚡ Scales with servings (yield)" checkbox exists
      expect(screen.getByText(/Scales with servings \(yield\)/i)).toBeInTheDocument();
    });
  });

  // Story 8.1: Step Visual Media & Stage Configuration in Editor
  describe('Story 8.1: Step Visual Media & Stage Guidance in Editor', () => {
    it('displays Step Photos section with stage selector (While Cooking vs After Step) in details drawer', () => {
      const { store } = renderWithRedux(<EditorPage />);
      act(() => {
        store.dispatch(loadRecipeIntoEditor(mockAdaiRecipe));
      });

      // Switch to Prep Phase tab
      const prepTab = screen.getByRole('tab', { name: /Prep Phase/i });
      fireEvent.click(prepTab);

      // Open first step details
      const detailsButtons = screen.getAllByTitle(/Step details/i);
      fireEvent.click(detailsButtons[0]);

      // Check that image input and stage options are visible
      expect(screen.getByText(/Step Photos & Visual Guidance/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Paste Image URL/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\+ Add Photo/i })).toBeInTheDocument();
      expect(screen.getAllByText(/👨‍🍳 While Cooking/i).length).toBeGreaterThan(0);
    });
  });

  // Story 8.2: Centralized Recipe Media Pool (Photo Dump & Assignment)
  describe('Story 8.2: Centralized Recipe Media Pool in Editor', () => {
    it('displays Media Bin & Photo Pool in the Setup tab with action buttons', () => {
      renderWithRedux(<EditorPage />);
      expect(screen.getByText(/Recipe Media Bin & Photo Pool/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload Photos/i)).toBeInTheDocument();
      expect(screen.getByText(/Paste URLs/i)).toBeInTheDocument();
      expect(screen.getByText(/Sample Presets/i)).toBeInTheDocument();
    });

    it('loads sample photography presets into the pool', () => {
      renderWithRedux(<EditorPage />);
      const presetsBtn = screen.getByText(/Sample Presets/i);
      fireEvent.click(presetsBtn);

      expect(screen.getByDisplayValue(/Soaked mixed dals & rice in bowl/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/Traditional frothy filter coffee crown/i)).toBeInTheDocument();
    });

    it('shows Media Bin quick picker in step details when photos are in pool', () => {
      const { store } = renderWithRedux(<EditorPage />);
      act(() => {
        store.dispatch(loadRecipeIntoEditor(mockAdaiRecipe));
      });

      // Add a sample photo to pool
      const presetsBtn = screen.getByText(/Sample Presets/i);
      fireEvent.click(presetsBtn);

      // Switch to Prep Phase tab
      const prepTab = screen.getByRole('tab', { name: /Prep Phase/i });
      fireEvent.click(prepTab);

      // Quick Media Bin docked bar should be visible
      expect(screen.getByText(/Media Bin \(5 photos ready\)/i)).toBeInTheDocument();

      // Open step details
      const detailsButtons = screen.getAllByTitle(/Step details/i);
      fireEvent.click(detailsButtons[0]);

      // Pick from Media Bin button should exist
      const pickBtn = screen.getByText(/Pick from Media Bin \(5 available\)/i);
      expect(pickBtn).toBeInTheDocument();

      // Open picker
      fireEvent.click(pickBtn);
      expect(screen.getByText(/Click a Photo to Attach:/i)).toBeInTheDocument();
    });
  });
});
