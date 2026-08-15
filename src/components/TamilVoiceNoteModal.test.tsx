import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TamilVoiceNoteModal from './TamilVoiceNoteModal';
import editorReducer from '@/store/editorSlice';
import recipeReducer from '@/store/recipeSlice';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
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

describe('Epic 13: Voice-to-Recipe AI Onboarding & Tamil Audio Parsing (Stories 27 to 32)', () => {
  it('renders recording trigger and audio upload button in initial step', () => {
    renderWithRedux(<TamilVoiceNoteModal isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByText('Tamil Voice Note to Recipe AI')).toBeInTheDocument();
    expect(screen.getByText(/Record Tamil Audio Note/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload Audio File/i)).toBeInTheDocument();
  });

  it('progresses to review state with dual-pane transcripts and confidence scoring', () => {
    jest.useFakeTimers();
    renderWithRedux(<TamilVoiceNoteModal isOpen={true} onClose={jest.fn()} />);

    const recordBtn = screen.getByText(/Record Tamil Audio Note/i);
    fireEvent.click(recordBtn);

    // Fast-forward recording timer + transcription spinner
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.getByText(/Editable Spoken Transcript/i)).toBeInTheDocument();
    expect(screen.getByText(/Extracted Modular Recipe/i)).toBeInTheDocument();
    expect(screen.getByText(/98% AI Confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/Ambiguity Detected & Resolved/i)).toBeInTheDocument();
    expect(screen.getByText(/Load Extracted Recipe in Studio/i)).toBeInTheDocument();

    jest.useRealTimers();
  });

  it('hydrates editor state and navigates to /editor on accepting draft', () => {
    jest.useFakeTimers();
    const { store } = renderWithRedux(<TamilVoiceNoteModal isOpen={true} onClose={jest.fn()} />);

    const recordBtn = screen.getByText(/Record Tamil Audio Note/i);
    fireEvent.click(recordBtn);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    const loadBtn = screen.getByText(/Load Extracted Recipe in Studio/i);
    fireEvent.click(loadBtn);

    expect(mockPush).toHaveBeenCalledWith('/editor');
    expect(store.getState().editor.recipeName).toBe('Adai');

    jest.useRealTimers();
  });
});
