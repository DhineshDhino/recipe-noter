'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Recipe, AtomicStep, ScopedIngredient } from '@/lib/types';
import { RootState } from '@/store/store';
import { toggleStepCompleted } from '@/store/recipeSlice';
import { formatTime, calculateScaledQuantity, calculateScaledDuration, formatIngredientName, playTimerChime } from '@/lib/utils';
import { useVoiceNavigation } from '@/lib/useVoiceNavigation';

interface GuidedCookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  targetYield: number;
  baseYield: number;
  spiceMultiplier: number;
  sweetMultiplier: number;
}

interface FlattenedStep {
  phase: 'prep' | 'passive' | 'cook';
  phaseName: string;
  blockName: string;
  blockIndex: number;
  stepIndex: number;
  stepKey: string;
  step: AtomicStep;
  ingredients: ScopedIngredient[];
}

export default function GuidedCookingModal({
  isOpen,
  onClose,
  recipe,
  targetYield,
  baseYield,
  spiceMultiplier,
  sweetMultiplier,
}: GuidedCookingModalProps) {
  const dispatch = useDispatch();
  const completedStepIds = useSelector((state: RootState) => state.recipe.completedStepIds);

  // Flatten all steps across prep, passive, and cook blocks
  const allSteps: FlattenedStep[] = useMemo(() => {
    const list: FlattenedStep[] = [];

    recipe.prepBlocks?.forEach((block, bIdx) => {
      block.steps?.forEach((step, sIdx) => {
        list.push({
          phase: 'prep',
          phaseName: 'Preparation Phase',
          blockName: block.name,
          blockIndex: bIdx,
          stepIndex: sIdx,
          stepKey: `prep-${bIdx}-${sIdx}`,
          step,
          ingredients: block.ingredients || [],
        });
      });
    });

    recipe.passiveBlocks?.forEach((block, bIdx) => {
      block.steps?.forEach((step, sIdx) => {
        list.push({
          phase: 'passive',
          phaseName: 'Passive / Resting',
          blockName: block.name,
          blockIndex: bIdx,
          stepIndex: sIdx,
          stepKey: `passive-${bIdx}-${sIdx}`,
          step,
          ingredients: block.ingredients || [],
        });
      });
    });

    recipe.cookBlocks?.forEach((block, bIdx) => {
      block.steps?.forEach((step, sIdx) => {
        list.push({
          phase: 'cook',
          phaseName: 'Active Cooking',
          blockName: block.name,
          blockIndex: bIdx,
          stepIndex: sIdx,
          stepKey: `cook-${bIdx}-${sIdx}`,
          step,
          ingredients: block.ingredients || [],
        });
      });
    });

    return list;
  }, [recipe]);

  // Find first uncompleted step or start at 0
  const initialIndex = useMemo(() => {
    const firstUnfinished = allSteps.findIndex(s => !completedStepIds[s.stepKey]);
    return firstUnfinished !== -1 ? firstUnfinished : 0;
  }, [allSteps, completedStepIds]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isCelebration, setIsCelebration] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<{ url: string; caption?: string; stage: string } | null>(null);

  // Step Timer state for current step
  const currentStep = allSteps[currentIndex];
  const scaledDuration = currentStep?.step.duration?.value
    ? calculateScaledDuration(
        currentStep.step.duration.value,
        baseYield,
        targetYield,
        currentStep.step.duration.isYieldDependent
      )
    : undefined;

  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Reset timer when step changes
  useEffect(() => {
    if (scaledDuration) {
      setTimerSecondsLeft(scaledDuration * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsLeft(null);
      setIsTimerRunning(false);
    }
  }, [currentIndex, scaledDuration]);

  // Timer interval
  useEffect(() => {
    if (!isTimerRunning || timerSecondsLeft === null || timerSecondsLeft <= 0) return;

    const interval = setInterval(() => {
      setTimerSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          playTimerChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const handleNext = (autoComplete = false) => {
    if (autoComplete && currentStep && !completedStepIds[currentStep.stepKey]) {
      dispatch(toggleStepCompleted({ stepKey: currentStep.stepKey }));
    }
    if (currentIndex < allSteps.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCelebration(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsCelebration(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxUrl) {
          setLightboxUrl(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' && !lightboxUrl) {
        handleNext(false);
      } else if ((e.key === ' ' || e.key === 'Enter') && !lightboxUrl && (e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handleNext(true);
      } else if (e.key === 'ArrowLeft' && !lightboxUrl) {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, allSteps.length, lightboxUrl, currentStep]);

  // Hands-free Voice Navigation Hook (Story 22)
  const voiceNav = useVoiceNavigation({
    onNext: () => handleNext(false),
    onPrevious: () => handlePrevious(),
    onComplete: () => handleNext(true),
    onStartTimer: () => setIsTimerRunning(true),
    onPauseTimer: () => setIsTimerRunning(false),
    enabled: isOpen,
  });

  if (!isOpen || allSteps.length === 0) return null;

  const totalSteps = allSteps.length;
  const completedCount = allSteps.filter(s => completedStepIds[s.stepKey]).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const handleJumpToStep = (index: number) => {
    setCurrentIndex(index);
    setIsCelebration(false);
  };

  const handleToggleCurrentStep = () => {
    dispatch(toggleStepCompleted({ stepKey: currentStep.stepKey }));
  };

  const formatTimerDisplay = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0F0F0F] text-foreground animate-[fadeIn_150ms_ease-out]">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-border-subtle bg-[#161616]/90 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent text-background flex items-center justify-center font-bold text-lg shadow-md">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-foreground truncate max-w-[280px] sm:max-w-md">
                {recipe.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent uppercase tracking-wider">
                Focus Mode
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Step {currentIndex + 1} of {totalSteps} • {progressPercent}% complete
            </p>
          </div>
        </div>

        {/* Global Progress Bar in Header */}
        <div className="hidden md:flex flex-1 max-w-xs items-center gap-2">
          <div className="flex-1 bg-border-subtle h-2 rounded-full overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-text-muted">{progressPercent}%</span>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Hands-Free Voice Control Toggle (Story 22) */}
          <button
            type="button"
            onClick={voiceNav.toggleListening}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              voiceNav.isListening
                ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-card-bg border-border-subtle text-text-muted hover:text-foreground hover:border-accent/40'
            }`}
            title="Hands-free kitchen voice control (Say: Next, Previous, Done, Start Timer)"
          >
            <span>{voiceNav.isListening ? '🎙️ Listening...' : '🎙️ Voice Control'}</span>
            {voiceNav.isListening && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </button>

          {/* Close / Exit Focus Mode */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card-bg border border-border-subtle hover:border-accent/40 text-foreground text-xs font-semibold hover:bg-card-bg/80 transition-all cursor-pointer"
            title="Exit Focus Mode (Esc)"
          >
            <span>✕</span>
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Main Focus Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between max-w-5xl mx-auto w-full">
        {isCelebration ? (
          /* Celebration View when finished */
          <div className="my-auto text-center space-y-6 max-w-xl mx-auto py-12 animate-[fadeIn_200ms_ease-out]">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-accent to-amber-400 flex items-center justify-center text-5xl shadow-[0_0_40px_rgba(255,109,0,0.4)] animate-bounce">
              🎉
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-foreground">Cooking Complete!</h2>
              <p className="text-sm text-text-muted leading-relaxed">
                All {totalSteps} steps for <span className="text-accent font-semibold">{recipe.name}</span> have been flawlessly executed.
              </p>
            </div>

            {recipe.pairings && recipe.pairings.length > 0 && (
              <div className="p-4 rounded-2xl bg-card-bg border border-border-subtle space-y-2 text-left">
                <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                  🍽️ Suggested Serving Pairings
                </span>
                <div className="flex flex-wrap gap-2">
                  {recipe.pairings.map((p, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-background border border-border-subtle text-xs font-medium text-foreground"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => {
                  setIsCelebration(false);
                  setCurrentIndex(0);
                }}
                className="px-5 py-2.5 rounded-xl bg-card-bg border border-border-subtle hover:border-accent/40 text-foreground text-xs font-semibold transition-all"
              >
                ↺ Review All Steps
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/80 transition-all shadow-lg cursor-pointer"
              >
                Return to Dashboard 🍳
              </button>
            </div>
          </div>
        ) : (
          /* Step Card Container */
          <div className="my-auto space-y-6 animate-[fadeIn_150ms_ease-out]">
            {/* Phase & Block Header Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    currentStep.phase === 'prep'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : currentStep.phase === 'passive'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      : 'bg-accent/15 text-accent border-accent/30'
                  }`}
                >
                  {currentStep.phaseName}
                </span>
                <span className="text-xs text-text-muted">➔</span>
                <span className="text-xs font-semibold text-foreground bg-card-bg px-3 py-1 rounded-full border border-border-subtle">
                  {currentStep.blockName}
                </span>
              </div>

              <span className="text-xs font-mono font-bold text-text-muted">
                STEP {currentIndex + 1} OF {totalSteps}
              </span>
            </div>

            {/* Main Interactive Focused Step Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden shadow-2xl ${
                completedStepIds[currentStep.stepKey]
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]'
                  : currentStep.step.isCritical
                  ? 'bg-[#1C1515] border-warning/50 shadow-[0_0_30px_rgba(255,59,48,0.15)]'
                  : 'bg-card-bg border-border-subtle'
              }`}
            >
              {/* Critical Alert Ribbon */}
              {currentStep.step.isCritical && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-warning/20 border border-warning/40 text-warning text-xs font-bold uppercase tracking-wider animate-pulse">
                  <span>⚠️</span>
                  <span>Critical Execution Step</span>
                </div>
              )}

              {/* Step Text (Large Stove-side Typography) */}
              <div className="space-y-4">
                <p className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground leading-snug">
                  {currentStep.step.text}
                </p>

                {/* Badges Bar (Heat, Duration) */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {currentStep.step.heat && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-accent/15 text-accent border border-accent/30">
                      🔥 {currentStep.step.heat.intensity} Heat
                      {currentStep.step.heat.precisionTemp && ` (${currentStep.step.heat.precisionTemp}°C)`}
                    </span>
                  )}
                  {scaledDuration && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-background border border-border-subtle text-foreground">
                      ⏱ {formatTime(scaledDuration)}
                      {currentStep.step.duration?.isYieldDependent && (
                        <span className="text-[10px] text-accent font-sans">⚡ (Scaled for {targetYield} servings)</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              {/* Step Ingredients List (Exact quantities needed right now) */}
              {currentStep.ingredients && currentStep.ingredients.length > 0 && (
                <div className="mt-6 pt-5 border-t border-border-subtle/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      🥘 Block Ingredients (Ready to use)
                    </span>
                    <span className="text-[11px] text-accent">Scaled for {targetYield} servings</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {currentStep.ingredients.map(ing => {
                      const masterName = formatIngredientName(ing.ingredientId, recipe.masterIngredients);
                      let qty = calculateScaledQuantity(ing.quantity, baseYield, targetYield, ing.isOptional);
                      if (ing.tags?.includes('spice') && spiceMultiplier !== 1) qty *= spiceMultiplier;
                      if (ing.tags?.includes('sweet') && sweetMultiplier !== 1) qty *= sweetMultiplier;
                      const displayQty = Math.round(qty * 10) / 10;

                      return (
                        <div
                          key={ing.ingredientId}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-background/80 border border-border-subtle text-xs"
                        >
                          <span className="font-semibold text-foreground">{masterName}</span>
                          <span className="font-mono font-bold text-accent">
                            {displayQty} {ing.unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Integrated Step Countdown Timer */}
              {scaledDuration && (
                <div className="mt-6 pt-5 border-t border-border-subtle/60 flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-background/90 border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-bold text-lg shadow-inner ${
                        timerSecondsLeft === 0
                          ? 'bg-warning text-white animate-bounce'
                          : isTimerRunning
                          ? 'bg-accent text-background animate-pulse'
                          : 'bg-card-bg border border-border-subtle text-foreground'
                      }`}
                    >
                      ⏱
                    </div>
                    <div>
                      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
                        {isTimerRunning ? 'Timer Counting Down' : timerSecondsLeft === 0 ? 'Timer Finished!' : 'Step Countdown Timer'}
                      </div>
                      <div className="text-2xl font-black font-mono tracking-wider text-accent">
                        {timerSecondsLeft !== null ? formatTimerDisplay(timerSecondsLeft) : formatTime(scaledDuration)}
                      </div>
                    </div>
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsTimerRunning(!isTimerRunning)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${
                        isTimerRunning
                          ? 'bg-warning/20 text-warning border border-warning/40 hover:bg-warning/30'
                          : 'bg-accent text-background hover:bg-accent/80'
                      }`}
                    >
                      {isTimerRunning ? '⏸ Pause Timer' : timerSecondsLeft === 0 ? '↺ Restart Timer' : '▶ Start Timer'}
                    </button>
                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSecondsLeft(scaledDuration * 60);
                      }}
                      className="px-3 py-2 rounded-xl bg-card-bg border border-border-subtle text-text-muted hover:text-foreground text-xs font-semibold"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {/* Step Reference Photos (While Cooking vs Expected Result) */}
              {currentStep.step.images && currentStep.step.images.length > 0 && (
                <div className="mt-6 pt-5 border-t border-border-subtle/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                      🖼️ Visual Guidance Reference
                    </span>
                    <span className="text-[11px] text-text-muted">Click photo to zoom</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStep.step.images.map((img, imgIdx) => (
                      <div
                        key={img.id || imgIdx}
                        onClick={() => setLightboxUrl(img)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer hover:scale-[1.01] ${
                          img.stage === 'while_cooking'
                            ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60'
                            : 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.caption || 'Visual reference'}
                          className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-border-subtle"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <span
                            className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              img.stage === 'while_cooking'
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                            }`}
                          >
                            {img.stage === 'while_cooking' ? '👨‍🍳 While Cooking' : '✨ Expected Result'}
                          </span>
                          <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                            {img.caption || 'Tap photo to see enlarged view'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation Toolbar */}
        {!isCelebration && (
          <div className="pt-6 space-y-4">
            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="px-4 sm:px-5 py-3 rounded-2xl bg-card-bg border border-border-subtle hover:border-accent/40 text-foreground font-semibold text-xs sm:text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                title="Go to previous step (Left Arrow)"
              >
                <span>⬅</span>
                <span>Previous</span>
              </button>

              {/* Checkbox toggle status */}
              <button
                onClick={handleToggleCurrentStep}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  completedStepIds[currentStep.stepKey]
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                    : 'bg-card-bg text-text-muted border-border-subtle hover:text-foreground hover:border-accent/40'
                }`}
                title="Toggle done status for this step"
              >
                <span>{completedStepIds[currentStep.stepKey] ? '✓ Done' : '○ Mark Done'}</span>
              </button>

              {/* Next without completing & Complete & Next */}
              <div className="flex items-center gap-2">
                {currentIndex < totalSteps - 1 && (
                  <button
                    onClick={() => handleNext(false)}
                    className="px-4 py-3 rounded-2xl bg-card-bg border border-border-subtle hover:border-accent/40 text-foreground font-semibold text-xs sm:text-sm hover:text-accent transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Move to next step without completing (Right Arrow)"
                  >
                    <span>Next</span>
                    <span>➡</span>
                  </button>
                )}

                <button
                  onClick={() => handleNext(true)}
                  className="px-5 sm:px-7 py-3 rounded-2xl bg-accent text-background font-black text-xs sm:text-sm hover:bg-accent/85 transition-all shadow-[0_0_20px_rgba(255,109,0,0.3)] flex items-center gap-2 cursor-pointer"
                  title="Mark as done and advance to next step (Space / Enter)"
                >
                  <span>{currentIndex === totalSteps - 1 ? '🎉 Finish Cooking' : '✓ Complete & Next'}</span>
                  <span>➡</span>
                </button>
              </div>
            </div>

            {/* Jump-to-step Mini Carousel Strip */}
            <div className="p-2 rounded-2xl bg-card-bg/60 border border-border-subtle flex items-center gap-1.5 overflow-x-auto">
              {allSteps.map((s, idx) => {
                const isCurrent = idx === currentIndex;
                const isDone = completedStepIds[s.stepKey];

                return (
                  <button
                    key={s.stepKey}
                    onClick={() => handleJumpToStep(idx)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-accent text-background shadow-sm ring-2 ring-accent'
                        : isDone
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                        : 'bg-background text-text-muted hover:text-foreground border border-border-subtle'
                    }`}
                    title={`${s.phaseName} - ${s.blockName}`}
                  >
                    <span>{isDone ? '✓' : idx + 1}</span>
                    <span className="hidden md:inline font-sans font-normal truncate max-w-[80px]">
                      {s.blockName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_150ms_ease-out]"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-[#181818] border border-border-subtle rounded-2xl overflow-hidden shadow-2xl space-y-3"
          >
            <div className="relative max-h-[60vh] bg-black flex items-center justify-center">
              <img
                src={lightboxUrl.url}
                alt={lightboxUrl.caption || 'Reference'}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-2 bg-card-bg">
              <span
                className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${
                  lightboxUrl.stage === 'while_cooking'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                }`}
              >
                {lightboxUrl.stage === 'while_cooking' ? '👨‍🍳 While Cooking (Process)' : '✨ Expected Result (Target)'}
              </span>
              {lightboxUrl.caption && (
                <p className="text-sm font-medium text-foreground">{lightboxUrl.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
