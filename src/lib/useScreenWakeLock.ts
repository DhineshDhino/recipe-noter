'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseScreenWakeLockOptions {
  autoRequest?: boolean;
}

export interface UseScreenWakeLockReturn {
  isLocked: boolean;
  isSupported: boolean;
  error: string | null;
  requestWakeLock: () => Promise<boolean>;
  releaseWakeLock: () => Promise<boolean>;
  toggleWakeLock: () => Promise<boolean>;
}

export function useScreenWakeLock(options: UseScreenWakeLockOptions = {}): UseScreenWakeLockReturn {
  const { autoRequest = false } = options;

  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const desiredLockedRef = useRef<boolean>(autoRequest);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const requestWakeLock = useCallback(async (): Promise<boolean> => {
    desiredLockedRef.current = true;
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      setIsSupported(false);
      setError('WakeLock API is not supported in this browser.');
      return false;
    }

    try {
      if (sentinelRef.current && !sentinelRef.current.released) {
        setIsLocked(true);
        return true;
      }

      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsLocked(true);
      setError(null);

      sentinel.addEventListener('release', () => {
        sentinelRef.current = null;
        setIsLocked(false);
      });

      return true;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : 'Failed to acquire Screen Wake Lock';
      setError(errMessage);
      setIsLocked(false);
      sentinelRef.current = null;
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async (): Promise<boolean> => {
    desiredLockedRef.current = false;
    if (sentinelRef.current && !sentinelRef.current.released) {
      try {
        await sentinelRef.current.release();
        sentinelRef.current = null;
        setIsLocked(false);
        setError(null);
        return true;
      } catch (err: unknown) {
        const errMessage = err instanceof Error ? err.message : 'Failed to release Screen Wake Lock';
        setError(errMessage);
        return false;
      }
    }
    setIsLocked(false);
    return true;
  }, []);

  const toggleWakeLock = useCallback(async (): Promise<boolean> => {
    if (isLocked) {
      return releaseWakeLock();
    } else {
      return requestWakeLock();
    }
  }, [isLocked, releaseWakeLock, requestWakeLock]);

  // Handle visibility change to re-acquire wake lock when tab returns to foreground
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && desiredLockedRef.current && !sentinelRef.current) {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock]);

  // Auto-request on mount if enabled
  useEffect(() => {
    if (autoRequest) {
      requestWakeLock();
    }

    return () => {
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
    };
  }, [autoRequest, requestWakeLock]);

  return {
    isLocked,
    isSupported,
    error,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock,
  };
}
