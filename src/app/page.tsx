'use client';

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { RootState } from '@/store/store';
import {
  setTargetYield,
  setSpiceTolerance,
  setSweetTolerance,
  toggleStepCompleted,
  resetStepProgress,
  setIngredientOverride,
  autoScaleGroup,
  confirmBreakRatio,
  loadRecipe,
} from '@/store/recipeSlice';
import { loadRecipeIntoEditor } from '@/store/editorSlice';
import {
  formatIngredientName,
  formatTime,
  getGlobalIngredients,
  calculateScaledQuantity,
  calculateScaledDuration,
  playTimerChime,
} from '@/lib/utils';
import { mockAdaiRecipe } from '@/lib/mockRecipe';
import GuidedCookingModal from '@/components/GuidedCookingModal';
import GroceryListModal from '@/components/GroceryListModal';
import RecipeJourneyTimeline from '@/components/RecipeJourneyTimeline';
import RecipeDiscussionSection from '@/components/RecipeDiscussionSection';
import { SupportedLanguage, formatLocalizedIngredient } from '@/lib/conversions';
import { getUiString } from '@/lib/translations';
import { IngredientRegistry } from '@/lib/types';
import { setLanguage, toggleFavorite, setRecipeNote } from '@/store/recipeSlice';

// --- SUB-COMPONENTS ---

const Badge = ({
  children,
  variant,
  className = '',
}: {
  children: React.ReactNode;
  variant: 'critical' | 'optional' | 'duration' | 'heat' | 'spice' | 'sweet';
  className?: string;
}) => {
  const base =
    'inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider relative -top-[1px]';
  const variants = {
    critical: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs',
    optional: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
    duration: 'bg-border-subtle text-foreground font-mono tabular-nums border border-border-subtle font-semibold tracking-wide',
    heat: 'bg-accent/10 text-accent border border-accent/20',
    spice: 'bg-red-500/20 text-red-400 border border-red-500/30',
    sweet: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
};

// Story 25: Interactive Step Countdown Timer
const StepTimer = ({
  durationMinutes,
  stepText,
}: {
  durationMinutes: number;
  stepText: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initial duration if prop changes
  useEffect(() => {
    if (status === 'idle') {
      setTimeLeft(durationMinutes * 60);
    }
  }, [durationMinutes, status]);

  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setStatus('finished');
            playTimerChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
    setStatus('running');
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('paused');
  };

  const handleResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('running');
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('idle');
    setTimeLeft(durationMinutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (!isOpen && status === 'idle') {
    return (
      <button
        type="button"
        onClick={handleStart}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-colors text-xs font-semibold"
        title={`Start ${formatTime(durationMinutes)} countdown timer`}
      >
        <span>⏱</span>
        <span>Start Timer ({formatTime(durationMinutes)})</span>
      </button>
    );
  }

  return (
    <div
      onClick={e => e.stopPropagation()}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
        status === 'finished'
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 animate-pulse'
          : status === 'running'
          ? 'bg-accent/15 border-accent text-accent shadow-[0_0_12px_rgba(255,109,0,0.25)]'
          : 'bg-card-bg border-border-subtle text-foreground'
      }`}
    >
      <span className="text-sm">⏱</span>
      <span className="font-bold tabular-nums text-sm">
        {status === 'finished' ? "Time's Up! 🔔" : formattedCountdown}
      </span>

      <div className="flex items-center gap-1 ml-1">
        {status === 'running' && (
          <button
            type="button"
            onClick={handlePause}
            className="px-2 py-0.5 bg-background border border-border-subtle rounded hover:border-accent text-foreground text-[11px]"
          >
            Pause
          </button>
        )}
        {status === 'paused' && (
          <button
            type="button"
            onClick={handleResume}
            className="px-2 py-0.5 bg-accent text-background font-bold rounded text-[11px]"
          >
            Resume
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="px-1.5 py-0.5 text-text-muted hover:text-foreground text-[11px]"
          title="Reset timer"
        >
          ↺
        </button>
      </div>
    </div>
  );
};

// Story 6: Ratio Mismatch Warning Banner
const RatioMismatchBanner = ({
  mismatch,
  onAutoScale,
  onConfirmBreak,
}: {
  mismatch: { groupId: string; groupName: string; expectedQuantities: Record<string, number> };
  onAutoScale: () => void;
  onConfirmBreak: () => void;
}) => (
  <div className="mb-4 p-4 rounded-xl border-2 border-warning/60 bg-warning/5 shadow-[0_0_16px_rgba(255,59,48,0.15)] animate-pulse-subtle">
    <div className="flex items-start gap-3">
      <span className="text-warning text-xl leading-none mt-0.5">⚠️</span>
      <div className="flex-1">
        <p className="text-warning font-bold text-sm">Ratio Mismatch: {mismatch.groupName}</p>
        <p className="text-text-muted text-xs mt-1">
          These ingredients are in a strict ratio group. Your override breaks the mathematical relationship.
        </p>
        <p className="text-text-muted text-xs mt-1 font-mono">
          Expected:{' '}
          {Object.entries(mismatch.expectedQuantities)
            .map(([id, qty]) => `${formatIngredientName(id)}: ${qty}g`)
            .join(' | ')}
        </p>
      </div>
    </div>
    <div className="flex gap-2 mt-3">
      <button
        id={`auto-scale-${mismatch.groupId}`}
        onClick={onAutoScale}
        className="text-xs px-3 py-1.5 rounded-lg bg-accent text-background font-bold hover:bg-accent/80 transition-colors"
      >
        Auto-scale Group
      </button>
      <button
        id={`confirm-break-${mismatch.groupId}`}
        onClick={onConfirmBreak}
        className="text-xs px-3 py-1.5 rounded-lg bg-border-subtle text-foreground font-medium hover:bg-border-subtle/80 transition-colors border border-border-subtle"
      >
        Confirm Break
      </button>
    </div>
  </div>
);

const PhaseIngredientsAccordion = ({
  ingredients,
  title = 'Phase Ingredients',
  isGlobal = true,
  baseYield,
  targetYield,
  spiceMultiplier = 1.0,
  sweetMultiplier = 1.0,
  ingredientOverrides,
  onOverride,
  language = 'en',
  masterIngredients,
  onLanguageChange,
}: {
  ingredients: any[];
  title?: string;
  isGlobal?: boolean;
  baseYield: number;
  targetYield: number;
  spiceMultiplier?: number;
  sweetMultiplier?: number;
  ingredientOverrides: Record<string, number>;
  onOverride?: (ingredientId: string, qty: number) => void;
  language?: SupportedLanguage;
  masterIngredients?: IngredientRegistry[];
  onLanguageChange?: (lang: SupportedLanguage) => void;
}) => {
  if (!ingredients || ingredients.length === 0) return null;
  const containerClass = isGlobal
    ? 'group mb-6 border-2 border-border-subtle rounded-xl bg-card-bg overflow-hidden shadow-sm'
    : 'group mb-4 bg-background/50 border border-border-subtle rounded-lg overflow-hidden';
  const summaryClass = isGlobal
    ? 'cursor-pointer p-4 font-semibold text-sm text-text-muted uppercase tracking-wider flex justify-between items-center outline-none select-none hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden'
    : 'cursor-pointer p-3 font-semibold text-sm text-text-muted uppercase tracking-wider flex justify-between items-center outline-none select-none hover:text-foreground transition-colors list-none [&::-webkit-details-marker]:hidden';
  const contentClass = isGlobal
    ? 'p-4 pt-0 border-t border-border-subtle/50 mt-2'
    : 'p-3 pt-0 border-t border-border-subtle mt-1';
  const ingId = (ing: any) => ing.id || ing.ingredientId;

  return (
    <details className={containerClass} open={isGlobal}>
      <summary className={summaryClass}>
        <div className="flex items-center gap-3 flex-wrap">
          <span>{title}</span>
          {isGlobal && onLanguageChange && (
            <div
              className="flex items-center bg-background border border-border-subtle rounded-lg p-0.5 text-xs normal-case tracking-normal"
              onClick={e => e.stopPropagation()}
            >
              <span className="text-[10px] text-text-muted px-1.5 font-medium">Script:</span>
              {(['en', 'ta', 'hi'] as SupportedLanguage[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onLanguageChange(l);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    language === l
                      ? 'bg-accent text-background shadow-xs'
                      : 'text-text-muted hover:text-foreground'
                  }`}
                  title={`Show ingredients in ${l === 'en' ? 'English' : l === 'ta' ? 'Tamil' : 'Hindi'}`}
                >
                  {l === 'en' ? 'EN' : l === 'ta' ? 'தமிழ்' : 'हिंदी'}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="transition-transform group-open:rotate-180 text-lg leading-none text-accent">
          ▾
        </span>
      </summary>
      <div className={contentClass}>
        <ul className="space-y-1.5">
          {ingredients.map((ing, i) => {
            const id = ingId(ing);
            const rawQty = ing.amount ?? ing.quantity;

            // Story 26: Compute taste multiplier for tagged ingredients
            let tasteMultiplier = 1.0;
            const isSpice = ing.tags?.includes('spice');
            const isSweet = ing.tags?.includes('sweet');
            if (isSpice) tasteMultiplier = spiceMultiplier;
            if (isSweet) tasteMultiplier = sweetMultiplier;

            const scaledQty = calculateScaledQuantity(
              rawQty,
              baseYield,
              targetYield,
              ing.isOptional,
              tasteMultiplier
            );
            const overriddenQty = ingredientOverrides[id];
            const displayQty = overriddenQty ?? scaledQty;
            const isOverridden = overriddenQty !== undefined;
            const loc = formatLocalizedIngredient(id, language, masterIngredients);

            return (
              <li
                key={i}
                className="text-foreground text-sm flex justify-between items-center border-b border-border-subtle/30 pb-1.5 gap-2"
              >
                <span className="flex-1 flex flex-wrap items-center gap-1.5">
                  <span className="font-medium">{loc.primary}</span>
                  {loc.secondary && (
                    <span className="text-[11px] text-text-muted">({loc.secondary})</span>
                  )}
                  {ing.isCritical && (
                    <Badge variant="critical">⚡ Critical</Badge>
                  )}
                  {ing.isOptional && <Badge variant="optional">✨ Optional</Badge>}
                  {isSpice && spiceMultiplier !== 1.0 && (
                    <Badge variant="spice">🌶️ {Math.round(spiceMultiplier * 100)}%</Badge>
                  )}
                  {isSweet && sweetMultiplier !== 1.0 && (
                    <Badge variant="sweet">🍯 {Math.round(sweetMultiplier * 100)}%</Badge>
                  )}
                  {isOverridden && (
                    <span className="text-[10px] text-amber-400 font-mono">(overridden)</span>
                  )}
                </span>
                <div className="flex items-center gap-1.5">
                  {onOverride ? (
                    <input
                      id={`override-${id}`}
                      type="number"
                      min={0}
                      step={0.5}
                      value={displayQty}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0) onOverride(id, val);
                      }}
                      className="w-16 bg-background border border-border-subtle rounded px-2 py-0.5 text-accent font-mono text-right text-sm outline-none focus:border-accent transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  ) : (
                    <span className="tabular-nums font-mono text-accent">{displayQty}</span>
                  )}
                  <span className="text-text-muted text-xs w-6">{ing.unit}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
};

/** Image Lightbox Modal for Stove-side Visual Guidance */
const ImageLightboxModal = ({
  image,
  onClose,
}: {
  image: { url: string; caption?: string; stage: 'while_cooking' | 'after_step'; stepText?: string } | null;
  onClose: () => void;
}) => {
  if (!image) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_150ms_ease-out]"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative max-w-2xl w-full bg-[#181818] border border-border-subtle rounded-2xl overflow-hidden shadow-2xl space-y-3"
      >
        <div className="relative max-h-[60vh] bg-black flex items-center justify-center overflow-hidden">
          <img
            src={image.url}
            alt={image.caption || 'Step Visual Guidance'}
            className="w-full h-auto max-h-[60vh] object-contain"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            title="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-2 bg-card-bg">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${
                image.stage === 'while_cooking'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
              }`}
            >
              <span>{image.stage === 'while_cooking' ? '👨‍🍳 While Cooking (In-Progress Process)' : '✨ After Step (Expected Result Target)'}</span>
            </span>
          </div>

          {image.caption && (
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {image.caption}
            </p>
          )}

          {image.stepText && (
            <p className="text-xs text-text-muted italic border-t border-border-subtle/50 pt-2">
              &quot;{image.stepText}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Story 24: Interactive Step with Checklist state and Timer + Step Visual Guidance
const RecipeStep = ({
  step,
  stepKey,
  isCompleted,
  baseYield,
  targetYield,
  onToggle,
  onImageClick,
  textSize = 'text-sm',
  padding = 'p-3',
}: {
  step: any;
  stepKey: string;
  isCompleted: boolean;
  baseYield: number;
  targetYield: number;
  onToggle: () => void;
  onImageClick?: (img: any, stepText: string) => void;
  textSize?: string;
  padding?: string;
}) => {
  const scaledDuration = step.duration?.value
    ? calculateScaledDuration(
        step.duration.value,
        baseYield,
        targetYield,
        step.duration.isYieldDependent
      )
    : undefined;
  const isYieldScaled = step.duration?.isYieldDependent && targetYield !== baseYield;

  return (
    <div
      className={`flex items-start gap-4 ${padding} rounded-xl border transition-all select-none group ${
        isCompleted
          ? 'bg-emerald-950/15 border-emerald-500/40 opacity-75'
          : 'bg-background border-border-subtle hover:border-accent/50'
      }`}
    >
      <input
        type="checkbox"
        id={`checkbox-${stepKey}`}
        checked={isCompleted}
        onChange={onToggle}
        className="mt-1 w-5 h-5 appearance-none border-2 border-border-subtle rounded-md bg-card-bg checked:bg-emerald-500 checked:border-emerald-500 flex-shrink-0 cursor-pointer transition-all relative checked:after:content-['✓'] checked:after:absolute checked:after:text-background checked:after:font-bold checked:after:text-sm checked:after:left-[3px] checked:after:-top-[1px]"
      />
      <div className="flex-1 space-y-2 min-w-0">
        <label
          htmlFor={`checkbox-${stepKey}`}
          className="cursor-pointer block"
        >
          <p
            className={`text-foreground ${textSize} leading-relaxed transition-colors ${
              isCompleted ? 'line-through text-text-muted' : 'group-hover:text-foreground'
            }`}
          >
            {step.text}
            <span className="inline-flex flex-wrap items-center gap-2 ml-2">
              {step.isCritical && <Badge variant="critical">Critical</Badge>}
              {step.duration && !isCompleted && (
                <Badge variant="duration">
                  ⏱ {formatTime(scaledDuration ?? step.duration.value)}
                  {step.duration.isYieldDependent && (
                    <span className="text-[9px] text-accent ml-1 font-sans">
                      {isYieldScaled ? `(scaled from ${formatTime(step.duration.value)})` : '(scales)'}
                    </span>
                  )}
                </Badge>
              )}
              {step.heat && <Badge variant="heat">🔥 {step.heat.intensity} Heat</Badge>}
            </span>
          </p>
        </label>

        {/* Visual Guidance Images (While Cooking vs After Step) */}
        {step.images && step.images.length > 0 && !isCompleted && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {step.images.map((img: any, imgIdx: number) => (
              <button
                key={img.id || imgIdx}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onImageClick?.(img, step.text);
                }}
                className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-lg border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                  img.stage === 'while_cooking'
                    ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60'
                    : 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/60'
                }`}
                title="Click to view full photo"
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Step visual guide'}
                  className="w-10 h-10 object-cover rounded-md flex-shrink-0 border border-border-subtle"
                />
                <div className="flex flex-col min-w-0">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      img.stage === 'while_cooking' ? 'text-amber-300' : 'text-emerald-400'
                    }`}
                  >
                    {img.stage === 'while_cooking' ? '👨‍🍳 While Cooking' : '✨ Expected Result'}
                  </span>
                  <span className="text-[11px] text-text-muted truncate max-w-[160px]">
                    {img.caption || 'Tap to enlarge'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Story 25: Interactive Step Countdown Timer with dynamically scaled duration */}
        {scaledDuration && !isCompleted && (
          <div className="pt-1">
            <StepTimer durationMinutes={scaledDuration} stepText={step.text} />
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const dispatch = useDispatch();
  const {
    recipe,
    targetYield,
    ratioMismatches,
    ingredientOverrides,
    completedStepIds,
    spiceToleranceMultiplier,
    sweetToleranceMultiplier,
    language = 'en',
    favorites = [],
    recipeNotes = {},
  } = useSelector((state: RootState) => state.recipe);

  const [showTasteControls, setShowTasteControls] = useState(false);
  const [isGuidedModeOpen, setIsGuidedModeOpen] = useState(false);
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false);
  const [showChefNotes, setShowChefNotes] = useState(false);
  const [currentNoteText, setCurrentNoteText] = useState(recipeNotes[recipe?.id || ''] || '');
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption?: string;
    stage: 'while_cooking' | 'after_step';
    stepText?: string;
  } | null>(null);

  const isFavorite = Boolean(recipe && favorites.includes(recipe.id));

  const handleYieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val > 0) dispatch(setTargetYield(val));
    },
    [dispatch]
  );

  const handleOverride = useCallback(
    (ingredientId: string, quantity: number) => {
      dispatch(setIngredientOverride({ ingredientId, quantity }));
    },
    [dispatch]
  );

  const calculateBlockDuration = useCallback(
    (block: any) => {
      if (!block.steps || block.steps.length === 0) return block.totalDurationInMinutes || 0;
      const stepsSum = (block.steps as any[]).reduce((sum, s) => {
        if (!s.duration?.value) return sum;
        return (
          sum +
          calculateScaledDuration(
            s.duration.value,
            recipe?.baseYield || 4,
            targetYield,
            s.duration.isYieldDependent
          )
        );
      }, 0);
      return stepsSum > 0 ? stepsSum : block.totalDurationInMinutes || 0;
    },
    [recipe, targetYield]
  );

  const { totalPrepTime, totalPassiveTime, totalCookTime, totalTime } = useMemo(() => {
    if (!recipe) return { totalPrepTime: 0, totalPassiveTime: 0, totalCookTime: 0, totalTime: 0 };
    const prep = (recipe.prepBlocks || []).reduce(
      (acc, block) => acc + calculateBlockDuration(block),
      0
    );
    const passive = (recipe.passiveBlocks || []).reduce(
      (acc, block) => acc + calculateBlockDuration(block),
      0
    );
    const cook = (recipe.cookBlocks || []).reduce(
      (acc, block) => acc + calculateBlockDuration(block),
      0
    );
    return {
      totalPrepTime: prep,
      totalPassiveTime: passive,
      totalCookTime: cook,
      totalTime: prep + passive + cook,
    };
  }, [recipe, calculateBlockDuration]);

  const prepIngredients = useMemo(
    () => (recipe?.prepBlocks ? getGlobalIngredients(recipe.prepBlocks) : []),
    [recipe]
  );
  const cookIngredients = useMemo(
    () => (recipe?.cookBlocks ? getGlobalIngredients(recipe.cookBlocks) : []),
    [recipe]
  );

  // Story 24: Calculate total steps and completed count
  const allStepKeys = useMemo(() => {
    if (!recipe) return [];
    const keys: string[] = [];
    recipe.prepBlocks?.forEach((b, bIdx) => {
      b.steps?.forEach((_, sIdx) => keys.push(`prep-${bIdx}-${sIdx}`));
    });
    recipe.passiveBlocks?.forEach((b, bIdx) => {
      b.steps?.forEach((_, sIdx) => keys.push(`passive-${bIdx}-${sIdx}`));
    });
    recipe.cookBlocks?.forEach((b, bIdx) => {
      b.steps?.forEach((_, sIdx) => keys.push(`cook-${bIdx}-${sIdx}`));
    });
    return keys;
  }, [recipe]);

  const totalStepsCount = allStepKeys.length;
  const completedStepsCount = useMemo(() => {
    return allStepKeys.filter(k => completedStepIds[k]).length;
  }, [allStepKeys, completedStepIds]);

  const progressPercentage =
    totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0;

  const handleEditInNoter = () => {
    if (recipe) {
      dispatch(loadRecipeIntoEditor(recipe));
    }
  };

  const handleLoadDemoAdai = () => {
    dispatch(loadRecipe(mockAdaiRecipe));
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center text-foreground">
        Loading Recipe...
      </div>
    );
  }

  const baseYield = recipe.baseYield || 4;
  const accordionProps = {
    baseYield,
    targetYield,
    spiceMultiplier: spiceToleranceMultiplier,
    sweetMultiplier: sweetToleranceMultiplier,
    ingredientOverrides,
    onOverride: handleOverride,
    language,
    masterIngredients: recipe.masterIngredients,
    onLanguageChange: (l: SupportedLanguage) => dispatch(setLanguage(l)),
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="space-y-4 border-b border-border-subtle pb-6">
        {/* Breadcrumbs & Status */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span>🍳 What 2 Cook</span>
            <span>/</span>
            <span className="text-accent font-semibold">📖 Cook Mode</span>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{recipe.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono text-[11px] font-semibold">Stove-side Active</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
                {recipe.name}
              </h1>
              <button
                type="button"
                onClick={() => dispatch(toggleFavorite(recipe.id))}
                className={`text-xl p-1 rounded-lg transition-transform hover:scale-125 cursor-pointer ${
                  isFavorite ? 'text-red-500' : 'text-text-muted hover:text-red-400'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
              {recipe.id !== 'recipe_adai_001' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/30">
                  Custom Recipe
                </span>
              )}
            </div>
            <p className="text-text-muted text-xs sm:text-sm mt-1">
              Version:{' '}
              <span className="text-foreground font-medium">
                {recipe.versionHistory?.[0]?.versionName || 'Original'}
              </span>
              {recipe.versionHistory?.[0]?.author && (
                <> • By <span className="text-foreground">{recipe.versionHistory[0].author}</span></>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Smart Grocery List Button (Story 23) */}
            <button
              type="button"
              onClick={() => setIsGroceryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card-bg border border-border-subtle hover:border-accent/40 text-foreground text-xs font-semibold transition-all cursor-pointer"
              title="Open smart grocery list for this recipe"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">{getUiString('groceryList', language)}</span>
            </button>

            <button
              id="focus-mode-btn"
              onClick={() => setIsGuidedModeOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-background font-black text-xs hover:bg-accent/85 transition-all shadow-[0_0_15px_rgba(255,109,0,0.35)] hover:scale-105 active:scale-95 cursor-pointer"
              title="Open Step-by-Step Focus Mode"
            >
              <span>🎯</span>
              <span>{getUiString('focusMode', language)}</span>
            </button>
            <Link
              href="/editor"
              onClick={handleEditInNoter}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/15 text-accent border border-accent/40 hover:bg-accent/25 text-xs font-bold transition-all shadow-sm"
            >
              <span>📝</span>
              <span>Edit in Noter</span>
            </Link>
          </div>
        </div>

        {/* Global Recipe Controls */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Servings input */}
            <div className="flex items-center gap-2 bg-card-bg border border-border-subtle rounded-lg px-3 py-1.5 focus-within:border-accent transition-colors">
              <label htmlFor="yield-input" className="text-text-muted text-sm font-medium whitespace-nowrap">
                Servings
              </label>
              <input
                id="yield-input"
                type="number"
                min={1}
                value={targetYield}
                onChange={handleYieldChange}
                className="w-14 bg-transparent text-accent font-bold text-lg text-center outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {targetYield !== baseYield && (
                <span className="text-[10px] text-text-muted font-mono">(base: {baseYield})</span>
              )}
            </div>

            {/* Total time breakdown */}
            <div className="flex items-center gap-2 bg-card-bg border border-border-subtle rounded-lg px-3 py-1.5 text-xs sm:text-sm">
              <span className="text-foreground font-semibold">Total: {formatTime(totalTime)}</span>
              <span className="text-text-muted">|</span>
              <span className="text-text-muted">
                Prep: <span className="text-foreground">{formatTime(totalPrepTime)}</span>
              </span>
              {totalPassiveTime > 0 && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-text-muted">
                    Rest: <span className="text-foreground">{formatTime(totalPassiveTime)}</span>
                  </span>
                </>
              )}
              <span className="text-text-muted">•</span>
              <span className="text-text-muted">
                Cook: <span className="text-foreground">{formatTime(totalCookTime)}</span>
              </span>
            </div>

            {/* Taste Profile Toggle */}
            <button
              id="taste-profile-toggle"
              onClick={() => setShowTasteControls(!showTasteControls)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showTasteControls || spiceToleranceMultiplier !== 1.0 || sweetToleranceMultiplier !== 1.0
                  ? 'bg-accent/15 border-accent text-accent'
                  : 'bg-card-bg border-border-subtle text-text-muted hover:text-foreground'
              }`}
            >
              <span>🌶️ / 🍯</span>
              <span>Taste Tuning</span>
              {(spiceToleranceMultiplier !== 1.0 || sweetToleranceMultiplier !== 1.0) && (
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              )}
            </button>
          </div>

          {/* Story 24: Cooking Progress Summary */}
          {totalStepsCount > 0 && (
            <div className="flex items-center gap-3 bg-card-bg border border-border-subtle px-4 py-2 rounded-xl">
              <div className="text-xs">
                <span className="font-bold text-foreground">
                  {completedStepsCount}/{totalStepsCount}
                </span>{' '}
                <span className="text-text-muted">Steps Done ({progressPercentage}%)</span>
              </div>
              <div className="w-24 bg-background border border-border-subtle h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {completedStepsCount > 0 && (
                <button
                  id="reset-progress-btn"
                  onClick={() => dispatch(resetStepProgress())}
                  className="text-[11px] text-text-muted hover:text-warning transition-colors font-medium ml-1"
                  title="Reset all checked steps"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>

        {/* Story 26: Taste Profile Adjustment Bar */}
        {showTasteControls && (
          <div className="p-4 rounded-xl bg-card-bg border border-accent/30 space-y-4 animate-[fadeIn_200ms_ease-out]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent">
                Taste Profile Tolerance Adjusters
              </h3>
              <button
                onClick={() => {
                  dispatch(setSpiceTolerance(1.0));
                  dispatch(setSweetTolerance(1.0));
                }}
                className="text-xs text-text-muted hover:text-foreground underline"
              >
                Reset to Standard (100%)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Spice level */}
              <div className="p-3 bg-background rounded-lg border border-border-subtle space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    🌶️ Spice Tolerance
                  </span>
                  <span className="font-mono font-bold text-red-400">
                    {Math.round(spiceToleranceMultiplier * 100)}%
                  </span>
                </div>
                <div className="flex gap-1">
                  {[
                    { label: 'Mild (50%)', val: 0.5 },
                    { label: 'Normal (100%)', val: 1.0 },
                    { label: 'Spicy (150%)', val: 1.5 },
                    { label: 'Extra (200%)', val: 2.0 },
                  ].map(lvl => (
                    <button
                      key={lvl.val}
                      onClick={() => dispatch(setSpiceTolerance(lvl.val))}
                      className={`flex-1 py-1 text-[11px] rounded font-medium border transition-colors ${
                        spiceToleranceMultiplier === lvl.val
                          ? 'bg-red-500 text-white border-red-500 font-bold'
                          : 'bg-card-bg text-text-muted border-border-subtle hover:text-foreground'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweetness level */}
              <div className="p-3 bg-background rounded-lg border border-border-subtle space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    🍯 Sweetness Tolerance
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {Math.round(sweetToleranceMultiplier * 100)}%
                  </span>
                </div>
                <div className="flex gap-1">
                  {[
                    { label: 'Low (50%)', val: 0.5 },
                    { label: 'Normal (100%)', val: 1.0 },
                    { label: 'Sweet (150%)', val: 1.5 },
                    { label: 'Rich (200%)', val: 2.0 },
                  ].map(lvl => (
                    <button
                      key={lvl.val}
                      onClick={() => dispatch(setSweetTolerance(lvl.val))}
                      className={`flex-1 py-1 text-[11px] rounded font-medium border transition-colors ${
                        sweetToleranceMultiplier === lvl.val
                          ? 'bg-amber-500 text-white border-amber-500 font-bold'
                          : 'bg-card-bg text-text-muted border-border-subtle hover:text-foreground'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Story 6: Global Ratio Mismatch Banners */}
      {ratioMismatches.length > 0 && (
        <div id="ratio-mismatch-alerts" className="space-y-3">
          {ratioMismatches.map(mismatch => (
            <RatioMismatchBanner
              key={mismatch.groupId}
              mismatch={mismatch}
              onAutoScale={() => dispatch(autoScaleGroup({ groupId: mismatch.groupId }))}
              onConfirmBreak={() => dispatch(confirmBreakRatio({ groupId: mismatch.groupId }))}
            />
          ))}
        </div>
      )}

      {/* Main Two-Column Layout */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Prep & Passive */}
        <div className="flex flex-col gap-8">
          {/* Prep Phase */}
          {recipe.prepBlocks && recipe.prepBlocks.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{getUiString('prepPhase', language)}</h2>
              <PhaseIngredientsAccordion
                ingredients={prepIngredients}
                title={`${getUiString('prepPhase', language)} ${getUiString('ingredients', language)}`}
                isGlobal={true}
                {...accordionProps}
              />
              <div className="space-y-6">
                {recipe.prepBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl"
                  >
                    <h3 className="text-xl font-medium text-accent mb-4">
                      {block.name}{' '}
                      <span className="text-sm text-text-muted ml-2">
                        ({formatTime(calculateBlockDuration(block))})
                      </span>
                    </h3>
                    <PhaseIngredientsAccordion
                      ingredients={block.ingredients}
                      title="Ingredients"
                      isGlobal={false}
                      {...accordionProps}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Steps
                      </h4>
                      <div className="space-y-3">
                        {block.steps?.map((step, sIdx) => {
                          const stepKey = `prep-${idx}-${sIdx}`;
                          return (
                            <RecipeStep
                              key={stepKey}
                              step={step}
                              stepKey={stepKey}
                              baseYield={baseYield}
                              targetYield={targetYield}
                              isCompleted={Boolean(completedStepIds[stepKey])}
                              onToggle={() => dispatch(toggleStepCompleted({ stepKey }))}
                              onImageClick={(img, stepText) => setLightboxImage({ ...img, stepText })}
                              textSize="text-sm"
                              padding="p-3"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Passive Phase */}
          {recipe.passiveBlocks && recipe.passiveBlocks.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">{getUiString('restPhase', language)}</h2>
              <div className="space-y-6">
                {recipe.passiveBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <h3 className="text-xl font-medium text-foreground mb-4">
                      {block.name}{' '}
                      <span className="text-sm text-text-muted ml-2">
                        ({formatTime(calculateBlockDuration(block))})
                      </span>
                    </h3>
                    <PhaseIngredientsAccordion
                      ingredients={block.ingredients}
                      title="Ingredients"
                      isGlobal={false}
                      {...accordionProps}
                    />
                    <div className="space-y-3">
                      {block.steps?.map((step, sIdx) => {
                        const stepKey = `passive-${idx}-${sIdx}`;
                        return (
                          <RecipeStep
                            key={stepKey}
                            step={step}
                            stepKey={stepKey}
                            baseYield={baseYield}
                            targetYield={targetYield}
                            isCompleted={Boolean(completedStepIds[stepKey])}
                            onToggle={() => dispatch(toggleStepCompleted({ stepKey }))}
                            onImageClick={(img, stepText) => setLightboxImage({ ...img, stepText })}
                            textSize="text-sm"
                            padding="p-3"
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Active Cooking */}
        {recipe.cookBlocks && recipe.cookBlocks.length > 0 && (
          <div className="flex flex-col gap-8">
            <section className="lg:sticky lg:top-8">
              <h2 className="text-2xl font-semibold text-accent mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                {getUiString('cookPhase', language)}
              </h2>
              <PhaseIngredientsAccordion
                ingredients={cookIngredients}
                title={`${getUiString('cookPhase', language)} ${getUiString('ingredients', language)}`}
                isGlobal={true}
                {...accordionProps}
              />
              <div className="space-y-6">
                {recipe.cookBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="bg-card-bg border-2 border-border-subtle rounded-xl p-6 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                    <h3 className="text-xl font-medium text-accent mb-4">
                      {block.name}{' '}
                      <span className="text-sm text-text-muted ml-2">
                        ({formatTime(calculateBlockDuration(block))})
                      </span>
                    </h3>
                    <PhaseIngredientsAccordion
                      ingredients={block.ingredients}
                      title="Mise en place"
                      isGlobal={false}
                      {...accordionProps}
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Execution
                      </h4>
                      <div className="space-y-3">
                        {block.steps?.map((step, sIdx) => {
                          const stepKey = `cook-${idx}-${sIdx}`;
                          return (
                            <RecipeStep
                              key={stepKey}
                              step={step}
                              stepKey={stepKey}
                              baseYield={baseYield}
                              targetYield={targetYield}
                              isCompleted={Boolean(completedStepIds[stepKey])}
                              onToggle={() => dispatch(toggleStepCompleted({ stepKey }))}
                              onImageClick={(img, stepText) => setLightboxImage({ ...img, stepText })}
                              textSize="text-base"
                              padding="p-4"
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Story 40 & 41: Recipe Cooking Journey & Past Tries Timeline */}
        {recipe && (
          <div className="mt-8">
            <RecipeJourneyTimeline
              recipeId={recipe.id}
              recipeName={recipe.name}
              baseYield={recipe.baseYield}
            />
          </div>
        )}

        {/* Story 43: Community Discussion & Cooking Tips */}
        {recipe && (
          <div className="mt-6">
            <RecipeDiscussionSection
              recipeId={recipe.id}
              recipeName={recipe.name}
            />
          </div>
        )}
      </main>

      {/* Global Image Lightbox Modal */}
      <ImageLightboxModal
        image={lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Story 24.1: Step-by-Step Focus Cooking Mode Modal */}
      {recipe && (
        <GuidedCookingModal
          isOpen={isGuidedModeOpen}
          onClose={() => setIsGuidedModeOpen(false)}
          recipe={recipe}
          targetYield={targetYield}
          baseYield={recipe.baseYield}
          spiceMultiplier={spiceToleranceMultiplier}
          sweetMultiplier={sweetToleranceMultiplier}
          language={language}
        />
      )}

      {/* Story 23: Smart Grocery List Modal */}
      <GroceryListModal
        isOpen={isGroceryModalOpen}
        onClose={() => setIsGroceryModalOpen(false)}
        recipe={recipe}
        targetYield={targetYield}
        baseYield={recipe.baseYield}
        spiceMultiplier={spiceToleranceMultiplier}
        sweetMultiplier={sweetToleranceMultiplier}
        language={language}
      />
    </div>
  );
}
