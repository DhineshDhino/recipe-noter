'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceNavigationProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onComplete?: () => void;
  onStartTimer?: () => void;
  onPauseTimer?: () => void;
  enabled?: boolean;
}

export function useVoiceNavigation({
  onNext,
  onPrevious,
  onComplete,
  onStartTimer,
  onPauseTimer,
  enabled = true,
}: VoiceNavigationProps) {
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const lastIndex = event.results.length - 1;
        const transcript = event.results[lastIndex][0].transcript.toLowerCase().trim();
        setLastCommand(transcript);

        if (
          transcript.includes('next') ||
          transcript.includes('forward') ||
          transcript.includes('continue') ||
          transcript.includes('adutha')
        ) {
          onNext?.();
        } else if (
          transcript.includes('previous') ||
          transcript.includes('back') ||
          transcript.includes('munnadi')
        ) {
          onPrevious?.();
        } else if (
          transcript.includes('complete') ||
          transcript.includes('done') ||
          transcript.includes('mudithu') ||
          transcript.includes('finished')
        ) {
          onComplete?.();
        } else if (
          transcript.includes('start timer') ||
          transcript.includes('play timer') ||
          transcript.includes('timer start')
        ) {
          onStartTimer?.();
        } else if (
          transcript.includes('pause timer') ||
          transcript.includes('stop timer') ||
          transcript.includes('pause')
        ) {
          onPauseTimer?.();
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [onNext, onPrevious, onComplete, onStartTimer, onPauseTimer]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('SpeechRecognition start failed', err);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    try {
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (err) {
      console.warn('SpeechRecognition stop failed', err);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    lastCommand,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
