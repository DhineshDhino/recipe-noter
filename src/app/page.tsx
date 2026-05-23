'use client';

import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setTargetYield, setIngredientOverride, autoScaleGroup, confirmBreakRatio } from '@/store/recipeSlice';
import { formatIngredientName, formatTime, getGlobalIngredients, calculateScaledQuantity } from '@/lib/utils';

// --- SUB-COMPONENTS ---
const Badge = ({ children, variant, className = "" }: { children: React.ReactNode, variant: 'critical' | 'optional' | 'duration' | 'heat', className?: string }) => {
  const base = "inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider relative -top-[1px]";
  const variants = {
    critical: "bg-warning text-white shadow-[0_0_8px_rgba(255,59,48,0.4)]",
    optional: "bg-amber-500/20 text-amber-500 border border-amber-500/50",
    duration: "bg-border-subtle text-foreground font-mono tabular-nums border border-border-subtle font-semibold tracking-wide",
    heat: "bg-accent/10 text-accent border border-accent/20"
  };
  return <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>;
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
          Expected: {Object.entries(mismatch.expectedQuantities).map(([id, qty]) =>
            `${formatIngredientName(id)}: ${qty}g`
          ).join(' | ')}
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
  title = "Phase Ingredients",
  isGlobal = true,
  baseYield,
  targetYield,
  ingredientOverrides,
  onOverride,
}: {
  ingredients: any[],
  title?: string,
  isGlobal?: boolean,
  baseYield: number,
  targetYield: number,
  ingredientOverrides: Record<string, number>,
  onOverride?: (ingredientId: string, qty: number) => void,
}) => {
  if (!ingredients || ingredients.length === 0) return null;
  const containerClass = isGlobal
    ? "group mb-6 border-2 border-border-subtle rounded-xl bg-card-bg overflow-hidden shadow-sm"
    : "group mb-4 bg-background/50 border border-border-subtle rounded-lg overflow-hidden";
  const summaryClass = isGlobal
    ? "cursor-pointer p-4 font-semibold text-sm text-text-muted uppercase tracking-wider flex justify-between items-center outline-none select-none hover:text-accent transition-colors list-none [&::-webkit-details-marker]:hidden"
    : "cursor-pointer p-3 font-semibold text-sm text-text-muted uppercase tracking-wider flex justify-between items-center outline-none select-none hover:text-foreground transition-colors list-none [&::-webkit-details-marker]:hidden";
  const contentClass = isGlobal ? "p-4 pt-0 border-t border-border-subtle/50 mt-2" : "p-3 pt-0 border-t border-border-subtle mt-1";
  const ingId = (ing: any) => ing.id || ing.ingredientId;

  return (
    <details className={containerClass}>
      <summary className={summaryClass}>
        {title}
        <span className="transition-transform group-open:rotate-180 text-lg leading-none text-accent">▾</span>
      </summary>
      <div className={contentClass}>
        <ul className="space-y-1.5">
          {ingredients.map((ing, i) => {
            const id = ingId(ing);
            const rawQty = ing.amount ?? ing.quantity;
            const scaledQty = calculateScaledQuantity(rawQty, baseYield, targetYield, ing.isOptional);
            const overriddenQty = ingredientOverrides[id];
            const displayQty = overriddenQty ?? scaledQty;
            const isOverridden = overriddenQty !== undefined;

            return (
              <li key={i} className="text-foreground text-sm flex justify-between items-center border-b border-border-subtle/30 pb-1.5 gap-2">
                <span className="flex-1">
                  {formatIngredientName(id)}
                  {ing.isOptional && <Badge variant="optional" className="ml-2">Optional</Badge>}
                  {isOverridden && (
                    <span className="ml-2 text-[10px] text-amber-400 font-mono">(overridden)</span>
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
                  <span className="text-text-muted text-xs w-5">{ing.unit}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
};

const RecipeStep = ({ step, textSize = "text-sm", padding = "p-3" }: { step: any, textSize?: string, padding?: string }) => {
  return (
    <label className={`flex items-start gap-4 ${padding} rounded-lg bg-background border border-border-subtle hover:border-accent/50 cursor-pointer transition-colors group`}>
      <input type="checkbox" className="mt-1 w-5 h-5 appearance-none border-2 border-border-subtle rounded bg-card-bg checked:bg-accent checked:border-accent flex-shrink-0 cursor-pointer transition-all relative checked:after:content-['✓'] checked:after:absolute checked:after:text-background checked:after:font-bold checked:after:text-sm checked:after:left-[3px] checked:after:-top-[1px]" />
      <div className="flex-1">
        <p className={`text-foreground ${textSize} leading-relaxed group-hover:text-accent transition-colors select-none`}>
          {step.text}
          <span className="inline-flex flex-wrap items-center gap-2 ml-2">
            {step.isCritical && <Badge variant="critical">Critical</Badge>}
            {step.duration && <Badge variant="duration">⏱ {formatTime(step.duration.value)}</Badge>}
            {step.heat && <Badge variant="heat">🔥 {step.heat.intensity} Heat</Badge>}
          </span>
        </p>
      </div>
    </label>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  const dispatch = useDispatch();
  const { recipe, targetYield, ratioMismatches, ingredientOverrides } = useSelector((state: RootState) => state.recipe);

  const handleYieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) dispatch(setTargetYield(val));
  }, [dispatch]);

  const handleOverride = useCallback((ingredientId: string, quantity: number) => {
    dispatch(setIngredientOverride({ ingredientId, quantity }));
  }, [dispatch]);

  const { totalPrepTime, totalPassiveTime, totalCookTime, totalTime } = useMemo(() => {
    if (!recipe) return { totalPrepTime: 0, totalPassiveTime: 0, totalCookTime: 0, totalTime: 0 };
    const prep = recipe.prepBlocks.reduce((acc, block) => acc + (block.totalDurationInMinutes || 0), 0);
    const passive = recipe.passiveBlocks.reduce((acc, block) => acc + (block.totalDurationInMinutes || 0), 0);
    const cook = recipe.cookBlocks.reduce((acc, block) => acc + (block.totalDurationInMinutes || 0), 0);
    return { totalPrepTime: prep, totalPassiveTime: passive, totalCookTime: cook, totalTime: prep + passive + cook };
  }, [recipe]);

  const prepIngredients = useMemo(() => recipe ? getGlobalIngredients(recipe.prepBlocks) : [], [recipe]);
  const cookIngredients = useMemo(() => recipe ? getGlobalIngredients(recipe.cookBlocks) : [], [recipe]);

  if (!recipe) {
    return <div className="min-h-screen flex items-center justify-center text-foreground">Loading Recipe...</div>;
  }

  const baseYield = recipe.baseYield;
  const accordionProps = { baseYield, targetYield, ingredientOverrides, onOverride: handleOverride };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="space-y-4 border-b border-border-subtle pb-6">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          {recipe.name}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
          <div className="flex items-center gap-2 bg-card-bg border border-border-subtle rounded-lg px-3 py-1.5 focus-within:border-accent transition-colors">
            <label htmlFor="yield-input" className="text-text-muted text-sm font-medium whitespace-nowrap">Servings</label>
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
          <span className="text-text-muted hidden sm:inline">•</span>
          <p className="text-text-muted text-sm">
            Version: <span className="text-foreground">{recipe.versionHistory[0]?.versionName || 'Original'}</span>
          </p>
          <span className="text-text-muted hidden sm:inline">•</span>
          <div className="flex items-center gap-2 bg-card-bg border border-border-subtle rounded-md px-3 py-1">
            <span className="text-foreground font-semibold">Total: {formatTime(totalTime)}</span>
            <span className="text-text-muted">|</span>
            <span className="text-text-muted text-sm">Prep: <span className="text-foreground">{formatTime(totalPrepTime)}</span></span>
            {totalPassiveTime > 0 && (
              <>
                <span className="text-text-muted text-xs">•</span>
                <span className="text-text-muted text-sm">Rest: <span className="text-foreground">{formatTime(totalPassiveTime)}</span></span>
              </>
            )}
            <span className="text-text-muted text-xs">•</span>
            <span className="text-text-muted text-sm">Cook: <span className="text-foreground">{formatTime(totalCookTime)}</span></span>
          </div>
        </div>
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
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Preparation</h2>
            <PhaseIngredientsAccordion ingredients={prepIngredients} title="Phase Ingredients" isGlobal={true} {...accordionProps} />
            <div className="space-y-6">
              {recipe.prepBlocks.map((block, idx) => (
                <div key={idx} className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl">
                  <h3 className="text-xl font-medium text-accent mb-4">{block.name} <span className="text-sm text-text-muted ml-2">({formatTime(block.totalDurationInMinutes || 0)})</span></h3>
                  <PhaseIngredientsAccordion ingredients={block.ingredients} title="Ingredients" isGlobal={false} {...accordionProps} />
                  <div>
                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Steps</h4>
                    <div className="space-y-3">
                      {block.steps.map((step, i) => <RecipeStep key={i} step={step} textSize="text-sm" padding="p-3" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Passive / Resting</h2>
            <div className="space-y-6">
              {recipe.passiveBlocks.map((block, idx) => (
                <div key={idx} className="bg-card-bg border border-border-subtle rounded-xl p-6 shadow-xl opacity-80 hover:opacity-100 transition-opacity">
                  <h3 className="text-xl font-medium text-foreground mb-4">{block.name} <span className="text-sm text-text-muted ml-2">({formatTime(block.totalDurationInMinutes || 0)})</span></h3>
                  <div className="space-y-3">
                    {block.steps.map((step, i) => (
                      <div key={i} className="p-3 rounded-lg bg-background border border-border-subtle">
                        <p className="text-text-muted text-sm">{step.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Active Cooking */}
        <div className="flex flex-col gap-8">
          <section className="lg:sticky lg:top-8">
            <h2 className="text-2xl font-semibold text-accent mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Active Cooking
            </h2>
            <PhaseIngredientsAccordion ingredients={cookIngredients} title="Phase Ingredients" isGlobal={true} {...accordionProps} />
            <div className="space-y-6">
              {recipe.cookBlocks.map((block, idx) => (
                <div key={idx} className="bg-card-bg border-2 border-border-subtle rounded-xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                  <h3 className="text-xl font-medium text-accent mb-4">{block.name} <span className="text-sm text-text-muted ml-2">({formatTime(block.totalDurationInMinutes || 0)})</span></h3>
                  <PhaseIngredientsAccordion ingredients={block.ingredients} title="Mise en place" isGlobal={false} {...accordionProps} />
                  <div>
                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Execution</h4>
                    <div className="space-y-3">
                      {block.steps.map((step, i) => <RecipeStep key={i} step={step} textSize="text-base" padding="p-4" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
