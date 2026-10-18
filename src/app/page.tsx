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
import { SupportedLanguage, formatLocalizedIngredient, UnitSystem, getConvertedIngredientDisplay, formatCulinaryFraction } from '@/lib/conversions';
import { getUiString } from '@/lib/translations';
import { IngredientRegistry } from '@/lib/types';
import { setLanguage, toggleFavorite, setRecipeNote, setUnitSystem } from '@/store/recipeSlice';
import InteractiveStepText from '@/components/InteractiveStepText';

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
    'inline-flex items-center text-[10px] px-2 py-0.5 rounded-md font-semibold tracking-wide relative -top-[1px] transition-colors';
  const variants = {
    critical: 'bg-red-500/15 text-red-300 border border-red-500/35 shadow-xs font-bold uppercase tracking-wider',
    optional: 'bg-blue-500/15 text-blue-300 border border-blue-500/35 uppercase tracking-wider',
    duration: 'bg-white/[0.06] text-foreground font-mono tabular-nums border border-white/10 font-medium tracking-normal',
    heat: 'bg-accent/15 text-accent border border-accent/30',
    spice: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    sweet: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
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
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all text-xs font-semibold shadow-xs cursor-pointer"
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
      className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-all backdrop-blur-md shadow-xs ${
        status === 'finished'
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.3)]'
          : status === 'running'
          ? 'bg-accent/15 border-accent text-accent shadow-[0_0_15px_rgba(255,109,0,0.3)]'
          : 'bg-card-bg/90 border-white/[0.08] text-foreground'
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
  unitSystem = 'metric',
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
  unitSystem?: UnitSystem;
}) => {
  if (!ingredients || ingredients.length === 0) return null;
  const containerClass = isGlobal
    ? 'group mb-6 border border-white/[0.08] rounded-2xl bg-card-bg/90 backdrop-blur-sm overflow-hidden shadow-lg hover:border-white/[0.14] transition-all'
    : 'group mb-4 bg-background/60 border border-white/[0.07] rounded-xl overflow-hidden shadow-xs hover:border-white/[0.12] transition-all';
  const summaryClass = isGlobal
    ? 'cursor-pointer p-4 font-bold text-xs sm:text-sm text-text-muted uppercase tracking-wider flex justify-between items-center outline-none select-none hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden'
    : 'cursor-pointer p-3.5 font-bold text-xs sm:text-sm text-text-muted uppercase tracking-wider flex justify-between items-center outline-none select-none hover:text-foreground transition-colors list-none [&::-webkit-details-marker]:hidden';
  const contentClass = isGlobal
    ? 'p-4 pt-2 border-t border-white/[0.06] bg-black/10'
    : 'p-3.5 pt-2 border-t border-white/[0.06] bg-black/10';
  const ingId = (ing: any) => ing.id || ing.ingredientId;

  return (
    <details className={containerClass} open={isGlobal}>
      <summary className={summaryClass}>
        <div className="flex items-center gap-3 flex-wrap">
          <span>{title}</span>
          {isGlobal && onLanguageChange && (
            <div
              className="flex items-center bg-background/80 border border-white/[0.08] rounded-xl p-0.5 text-xs normal-case tracking-normal shadow-xs"
              onClick={e => e.stopPropagation()}
            >
              <span className="text-[10px] text-text-muted px-2 font-medium">Script:</span>
              {(['en', 'ta', 'hi'] as SupportedLanguage[]).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    onLanguageChange(l);
                  }}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    language === l
                      ? 'bg-accent text-background shadow-xs'
                      : 'text-text-muted hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                  title={`Show ingredients in ${l === 'en' ? 'English' : l === 'ta' ? 'Tamil' : 'Hindi'}`}
                >
                  {l === 'en' ? 'EN' : l === 'ta' ? 'தமிழ்' : 'हिंदी'}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className="transition-transform duration-200 group-open:rotate-180 text-lg leading-none text-accent">
          ▾
        </span>
      </summary>
      <div className={contentClass}>
        <ul className="space-y-1">
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
            const converted = getConvertedIngredientDisplay(displayQty, ing.unit, id, unitSystem);
            const master = masterIngredients?.find(m => m.id === id);
            const subs = ing.substitutions || master?.substitutions;

            return (
              <li
                key={i}
                className="text-foreground text-sm flex justify-between items-center border-b border-white/[0.04] last:border-b-0 py-2.5 px-2.5 rounded-xl hover:bg-white/[0.03] transition-colors gap-3"
              >
                <span className="flex-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-foreground/95">{loc.primary}</span>
                  {loc.secondary && (
                    <span className="text-[11px] text-text-muted">({loc.secondary})</span>
                  )}
                  {ing.isCritical && (
                    <Badge variant="critical">⚡ Critical</Badge>
                  )}
                  {ing.isOptional && <Badge variant="optional">✨ Optional</Badge>}
                  {subs && subs.length > 0 && (
                    <span
                      className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-semibold cursor-help"
                      title={`Substitutions: ${subs.map((s: any) => `${s.name}${s.ratioNote ? ` (${s.ratioNote})` : ''}`).join(', ')}`}
                    >
                      🔄 Alt: {subs[0].name}
                    </span>
                  )}
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
                <div className="flex items-center gap-2">
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
                      className="w-16 bg-background/90 border border-white/10 rounded-lg px-2 py-1 text-accent font-mono text-right text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
                    />
                  ) : (
                    <span className="tabular-nums font-mono text-accent font-semibold">{converted.formattedQuantity}</span>
                  )}
                  <span className="text-text-muted text-xs min-w-[28px]">{onOverride ? ing.unit : converted.unit}</span>
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
  masterIngredients,
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
  masterIngredients?: IngredientRegistry[];
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
      className={`flex items-start gap-3.5 sm:gap-4.5 ${padding} rounded-2xl border transition-all select-none group shadow-xs ${
        isCompleted
          ? 'bg-emerald-950/20 border-emerald-500/35 opacity-75 shadow-inner'
          : 'bg-card-bg/90 border-white/[0.08] hover:border-accent/40 hover:bg-card-bg hover:shadow-md'
      }`}
    >
      <input
        type="checkbox"
        id={`checkbox-${stepKey}`}
        checked={isCompleted}
        onChange={onToggle}
        className="mt-0.5 w-5 h-5 appearance-none border-2 border-white/20 rounded-md bg-background/90 checked:bg-emerald-500 checked:border-emerald-500 flex-shrink-0 cursor-pointer transition-all relative checked:after:content-['✓'] checked:after:absolute checked:after:text-background checked:after:font-black checked:after:text-xs checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center shadow-xs focus:ring-2 focus:ring-emerald-500/40"
      />
      <div className="flex-1 space-y-2 min-w-0">
        <label
          htmlFor={`checkbox-${stepKey}`}
          className="cursor-pointer block"
        >
          <div
            className={`text-foreground ${textSize} leading-relaxed transition-colors ${
              isCompleted ? 'line-through text-text-muted' : 'group-hover:text-foreground'
            }`}
          >
            <InteractiveStepText text={step.text} masterIngredients={masterIngredients} />
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
          </div>
        </label>

        {/* Visual Guidance Images (While Cooking vs After Step) */}
        {step.images && step.images.length > 0 && !isCompleted && (
          <div className="flex flex-wrap gap-2.5 pt-1.5">
            {step.images.map((img: any, imgIdx: number) => (
              <button
                key={img.id || imgIdx}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onImageClick?.(img, step.text);
                }}
                className={`flex items-center gap-2.5 p-2 pr-3.5 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                  img.stage === 'while_cooking'
                    ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60'
                    : 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60'
                }`}
                title="Click to view full photo"
              >
                <img
                  src={img.url}
                  alt={img.caption || 'Step visual guide'}
                  className="w-11 h-11 object-cover rounded-lg flex-shrink-0 border border-white/10"
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
          <div className="pt-1.5">
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
    unitSystem = 'metric',
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
    unitSystem,
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="space-y-5 border-b border-white/[0.08] pb-6">
        {/* Breadcrumbs & Status */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span>🍳 What 2 Cook</span>
            <span className="text-white/20">/</span>
            <span className="text-accent font-semibold">📖 Cook Mode</span>
            <span className="text-white/20">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{recipe.name}</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-mono text-[11px] font-semibold">Stove-side Active</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {recipe.name}
              </h1>
              <button
                type="button"
                onClick={() => dispatch(toggleFavorite(recipe.id))}
                className={`text-xl p-1.5 rounded-xl bg-card-bg/90 border border-white/[0.08] transition-transform hover:scale-110 cursor-pointer shadow-xs ${
                  isFavorite ? 'text-red-500 border-red-500/30' : 'text-text-muted hover:text-red-400'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
              {recipe.id !== 'recipe_adai_001' && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-accent/15 text-accent border border-accent/30 shadow-xs">
                  Custom Recipe
                </span>
              )}
            </div>
            <p className="text-text-muted text-xs sm:text-sm mt-1.5">
              Version:{' '}
              <span className="text-foreground font-medium">
                {recipe.versionHistory?.[0]?.versionName || 'Original'}
              </span>
              {recipe.versionHistory?.[0]?.author && (
                <> • By <span className="text-foreground font-medium">{recipe.versionHistory[0].author}</span></>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Story 74: Print Recipe Button */}
            <button
              id="print-recipe-btn"
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card-bg/90 border border-white/[0.08] hover:border-accent/40 text-foreground text-xs font-semibold transition-all cursor-pointer shadow-xs"
              title="Print ink-friendly recipe card or export to PDF"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Smart Grocery List Button (Story 23) */}
            <button
              type="button"
              onClick={() => setIsGroceryModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-card-bg/90 border border-white/[0.08] hover:border-accent/40 text-foreground text-xs font-semibold transition-all cursor-pointer shadow-xs"
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/15 text-accent border border-accent/40 hover:bg-accent/25 text-xs font-bold transition-all shadow-xs"
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
            <div className="flex items-center gap-2 bg-card-bg/90 border border-white/[0.08] rounded-xl px-3.5 py-1.5 focus-within:border-accent transition-all shadow-xs">
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

            {/* Story 70: Unit System Toggle */}
            <div className="flex items-center bg-card-bg/90 border border-white/[0.08] rounded-xl p-1 text-xs font-semibold shadow-xs">
              <button
                type="button"
                onClick={() => dispatch(setUnitSystem('metric'))}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unitSystem === 'metric'
                    ? 'bg-accent text-background shadow-xs'
                    : 'text-text-muted hover:text-foreground'
                }`}
                title="Display measurements in Metric (grams & milliliters)"
              >
                Metric (g)
              </button>
              <button
                type="button"
                onClick={() => dispatch(setUnitSystem('us_customary'))}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  unitSystem === 'us_customary'
                    ? 'bg-accent text-background shadow-xs'
                    : 'text-text-muted hover:text-foreground'
                }`}
                title="Display measurements in US Customary (cups, tbsp, tsp)"
              >
                US (Cups)
              </button>
            </div>

            {/* Total time breakdown */}
            <div className="flex items-center gap-2.5 bg-card-bg/90 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs sm:text-sm shadow-xs">
              <span className="text-foreground font-semibold">Total: {formatTime(totalTime)}</span>
              <span className="text-white/20">|</span>
              <span className="text-text-muted">
                Prep: <span className="text-foreground font-medium">{formatTime(totalPrepTime)}</span>
              </span>
              {totalPassiveTime > 0 && (
                <>
                  <span className="text-white/20">•</span>
                  <span className="text-text-muted">
                    Rest: <span className="text-foreground font-medium">{formatTime(totalPassiveTime)}</span>
                  </span>
                </>
              )}
              <span className="text-white/20">•</span>
              <span className="text-text-muted">
                Cook: <span className="text-foreground font-medium">{formatTime(totalCookTime)}</span>
              </span>
            </div>

            {/* Taste Profile Toggle */}
            <button
              id="taste-profile-toggle"
              onClick={() => setShowTasteControls(!showTasteControls)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                showTasteControls || spiceToleranceMultiplier !== 1.0 || sweetToleranceMultiplier !== 1.0
                  ? 'bg-accent/15 border-accent text-accent shadow-[0_0_12px_rgba(255,109,0,0.2)]'
                  : 'bg-card-bg/90 border-white/[0.08] text-text-muted hover:text-foreground hover:border-white/20'
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
            <div className="flex items-center gap-3 bg-card-bg/90 border border-white/[0.08] px-4 py-2 rounded-xl shadow-xs">
              <div className="text-xs">
                <span className="font-bold text-foreground">
                  {completedStepsCount}/{totalStepsCount}
                </span>{' '}
                <span className="text-text-muted">Steps Done ({progressPercentage}%)</span>
              </div>
              <div className="w-24 bg-background border border-white/[0.08] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {completedStepsCount > 0 && (
                <button
                  id="reset-progress-btn"
                  onClick={() => dispatch(resetStepProgress())}
                  className="text-[11px] text-text-muted hover:text-warning transition-colors font-medium ml-1 cursor-pointer"
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
          <div className="p-5 rounded-2xl bg-card-bg/95 backdrop-blur-md border border-accent/40 space-y-4 animate-[fadeIn_200ms_ease-out] shadow-xl">
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
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-4">{getUiString('prepPhase', language)}</h2>
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
                    className="bg-card-bg/90 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl hover:border-white/[0.14] transition-all"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-accent mb-4">
                      {block.name}{' '}
                      <span className="text-xs sm:text-sm font-normal text-text-muted ml-2">
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
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5">
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
                              padding="p-3.5 sm:p-4"
                              masterIngredients={recipe.masterIngredients}
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
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-4">{getUiString('restPhase', language)}</h2>
              <div className="space-y-6">
                {recipe.passiveBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="bg-card-bg/90 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl opacity-90 hover:opacity-100 hover:border-white/[0.14] transition-all"
                  >
                    <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4">
                      {block.name}{' '}
                      <span className="text-xs sm:text-sm font-normal text-text-muted ml-2">
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
                            padding="p-3.5 sm:p-4"
                            masterIngredients={recipe.masterIngredients}
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
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-accent mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
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
                    className="bg-card-bg/95 backdrop-blur-sm border border-accent/35 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden ring-1 ring-accent/15"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-accent to-amber-500" />
                    <h3 className="text-lg sm:text-xl font-bold text-accent mb-4 pl-1">
                      {block.name}{' '}
                      <span className="text-xs sm:text-sm font-normal text-text-muted ml-2">
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
                      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2.5 pl-1">
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
                              padding="p-4 sm:p-4.5"
                              masterIngredients={recipe.masterIngredients}
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
