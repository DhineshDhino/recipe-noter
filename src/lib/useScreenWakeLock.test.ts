import { renderHook, act } from '@testing-library/react';
import { useScreenWakeLock } from './useScreenWakeLock';

describe('useScreenWakeLock', () => {
  let mockSentinel: {
    released: boolean;
    release: jest.Mock;
    addEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockSentinel = {
      released: false,
      release: jest.fn().mockImplementation(async () => {
        mockSentinel.released = true;
      }),
      addEventListener: jest.fn(),
    };

    Object.defineProperty(navigator, 'wakeLock', {
      value: {
        request: jest.fn().mockImplementation(async () => mockSentinel),
      },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('detects wakeLock support in navigator', () => {
    const { result } = renderHook(() => useScreenWakeLock());
    expect(result.current.isSupported).toBe(true);
    expect(result.current.isLocked).toBe(false);
  });

  it('requests wake lock successfully', async () => {
    const { result } = renderHook(() => useScreenWakeLock());

    let success: boolean = false;
    await act(async () => {
      success = await result.current.requestWakeLock();
    });

    expect(success).toBe(true);
    expect(result.current.isLocked).toBe(true);
    expect(navigator.wakeLock.request).toHaveBeenCalledWith('screen');
  });

  it('releases wake lock successfully', async () => {
    const { result } = renderHook(() => useScreenWakeLock({ autoRequest: true }));

    await act(async () => {
      await result.current.requestWakeLock();
    });
    expect(result.current.isLocked).toBe(true);

    await act(async () => {
      await result.current.releaseWakeLock();
    });

    expect(result.current.isLocked).toBe(false);
    expect(mockSentinel.release).toHaveBeenCalled();
  });

  it('toggles wake lock on and off', async () => {
    const { result } = renderHook(() => useScreenWakeLock());

    await act(async () => {
      await result.current.toggleWakeLock();
    });
    expect(result.current.isLocked).toBe(true);

    await act(async () => {
      await result.current.toggleWakeLock();
    });
    expect(result.current.isLocked).toBe(false);
  });

  it('handles wake lock request failure gracefully', async () => {
    (navigator.wakeLock.request as jest.Mock).mockRejectedValueOnce(new Error('Permission denied'));

    const { result } = renderHook(() => useScreenWakeLock());

    let success: boolean = false;
    await act(async () => {
      success = await result.current.requestWakeLock();
    });

    expect(success).toBe(false);
    expect(result.current.isLocked).toBe(false);
    expect(result.current.error).toBe('Permission denied');
  });
});
