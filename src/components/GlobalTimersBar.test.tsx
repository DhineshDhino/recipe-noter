import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import recipeReducer, { startGlobalTimer } from '@/store/recipeSlice';
import GlobalTimersBar from './GlobalTimersBar';

// Mock Web Audio chime
jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  playTimerChime: jest.fn(),
}));

describe('GlobalTimersBar', () => {
  let store: any;

  beforeEach(() => {
    jest.useFakeTimers();
    store = configureStore({
      reducer: {
        recipe: recipeReducer,
      },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <GlobalTimersBar />
      </Provider>
    );
  };

  it('renders nothing when there are no active timers', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeNull();
  });

  it('renders active timer cards when a timer is started', () => {
    act(() => {
      store.dispatch(
        startGlobalTimer({
          id: 'timer-soaking-1',
          label: 'Soak Dals & Rice',
          durationSeconds: 120,
          stepKey: 'prep-0-0',
          blockName: 'Soaking Phase',
          phase: 'prep',
        })
      );
    });

    renderComponent();

    expect(screen.getByText('Active Kitchen Timers')).toBeInTheDocument();
    expect(screen.getByText('Soak Dals & Rice')).toBeInTheDocument();
    expect(screen.getByText('Soaking Phase')).toBeInTheDocument();
    expect(screen.getByText('02:00')).toBeInTheDocument();
    expect(screen.getByText('⏸️ Pause')).toBeInTheDocument();
  });

  it('ticks active timers down every second', () => {
    act(() => {
      store.dispatch(
        startGlobalTimer({
          id: 'timer-1',
          label: 'Boil Water',
          durationSeconds: 10,
          stepKey: 'cook-0-0',
        })
      );
    });

    renderComponent();
    expect(screen.getByText('00:10')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText('00:07')).toBeInTheDocument();
  });

  it('pauses and resumes timers when control buttons are clicked', () => {
    act(() => {
      store.dispatch(
        startGlobalTimer({
          id: 'timer-1',
          label: 'Simmer Sauce',
          durationSeconds: 30,
          stepKey: 'cook-0-1',
        })
      );
    });

    renderComponent();

    const pauseBtn = screen.getByText('⏸️ Pause');
    fireEvent.click(pauseBtn);

    expect(screen.getByText('▶️ Start')).toBeInTheDocument();

    // Advance time while paused
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Time should remain at 30
    expect(screen.getByText('00:30')).toBeInTheDocument();

    // Resume
    const startBtn = screen.getByText('▶️ Start');
    fireEvent.click(startBtn);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText('00:28')).toBeInTheDocument();
  });

  it('dismisses timer when dismiss (X) is clicked', () => {
    act(() => {
      store.dispatch(
        startGlobalTimer({
          id: 'timer-to-dismiss',
          label: 'Toast Spices',
          durationSeconds: 15,
          stepKey: 'prep-0-2',
        })
      );
    });

    renderComponent();
    expect(screen.getByText('Toast Spices')).toBeInTheDocument();

    const dismissBtn = screen.getByTitle('Dismiss timer');
    fireEvent.click(dismissBtn);

    expect(screen.queryByText('Toast Spices')).not.toBeInTheDocument();
  });
});
