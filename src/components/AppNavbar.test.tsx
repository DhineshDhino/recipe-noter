import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AppNavbar from './AppNavbar';
import editorReducer from '@/store/editorSlice';
import recipeReducer from '@/store/recipeSlice';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
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

describe('AppNavbar Component — Wholesome App Flow', () => {
  it('renders app branding and name "What 2 Cook"', () => {
    renderWithRedux(<AppNavbar />);
    expect(screen.getByText('What 2 Cook')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('renders primary navigation tabs: Cook Mode, Noter Studio, Library, Tamil AI', () => {
    renderWithRedux(<AppNavbar />);
    expect(screen.getByText('Cook Mode')).toBeInTheDocument();
    expect(screen.getByText('Noter Studio')).toBeInTheDocument();
    expect(screen.getByText('Library')).toBeInTheDocument();
    expect(screen.getByText('Tamil AI')).toBeInTheDocument();
  });

  it('opens Recipe Library modal when clicking Library tab', () => {
    renderWithRedux(<AppNavbar />);
    const libraryBtn = screen.getByText('Library');
    fireEvent.click(libraryBtn);

    expect(screen.getByText('Recipe Library & Catalogue')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search recipes, ingredients/i)).toBeInTheDocument();
  });

  it('opens Tamil Voice Note AI modal when clicking Tamil AI tab', () => {
    renderWithRedux(<AppNavbar />);
    const voiceBtn = screen.getByText('Tamil AI');
    fireEvent.click(voiceBtn);

    expect(screen.getByText('Tamil Voice Note to Recipe AI')).toBeInTheDocument();
    expect(screen.getByText(/Speak or Upload Cooking Voice Note/i)).toBeInTheDocument();
  });

  it('toggles quick recipe switcher dropdown and shows Blank Recipe Draft option', () => {
    renderWithRedux(<AppNavbar />);
    const switcherTrigger = screen.getByTitle('Switch Active Recipe');
    expect(screen.queryByText('Select Active Recipe')).not.toBeInTheDocument();

    fireEvent.click(switcherTrigger);
    expect(screen.getByText('Select Active Recipe')).toBeInTheDocument();
    expect(screen.getByText('➕ Blank Recipe Draft')).toBeInTheDocument();
    expect(screen.getByText('Create from scratch')).toBeInTheDocument();
  });

  it('opens What to Cook modal when clicking What to Cook tab', () => {
    renderWithRedux(<AppNavbar />);
    const whatToCookBtn = screen.getByText('What to Cook');
    fireEvent.click(whatToCookBtn);

    expect(screen.getByText('Circadian Matcher')).toBeInTheDocument();
  });
});
