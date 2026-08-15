'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { loadRecipe, togglePantryIngredient, setPantryIngredients, clearPantry } from '@/store/recipeSlice';
import { loadRecipeIntoEditor } from '@/store/editorSlice';
import { recipeLibrary } from '@/lib/mockRecipes';
import { Recipe, MealSlot, DietaryCategory, RecipeDifficulty } from '@/lib/types';
import {
  getCurrentMealSlot,
  getMealSlotMeta,
  filterAndRankRecipes,
  PantryMatchResult,
  cornerStoreStaples,
} from '@/lib/recommendationEngine';
import { formatIngredientName, formatTime } from '@/lib/utils';
import GuidedCookingModal from './GuidedCookingModal';

interface WhatToCookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatToCookModal({ isOpen, onClose }: WhatToCookModalProps) {
  const router = useRouter();
  const dispatch = useDispatch();

  const activeRecipe = useSelector((state: RootState) => state.recipe.recipe);
  const targetYield = useSelector((state: RootState) => state.recipe.targetYield);
  const favorites = useSelector((state: RootState) => state.recipe.favorites);
  const userPantryIds = useSelector((state: RootState) => state.recipe.userPantryIngredientIds || []);

  const [activeMealSlot, setActiveMealSlot] = useState<MealSlot | 'all'>('all');
  const [maxTotalTime, setMaxTotalTime] = useState<number | null>(null);
  const [zeroRestTime, setZeroRestTime] = useState<boolean>(false);
  const [heroIngredientId, setHeroIngredientId] = useState<string | null>(null);
  const [selectedDietary, setSelectedDietary] = useState<DietaryCategory[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<RecipeDifficulty | 'all'>('all');
  const [scope, setScope] = useState<'global' | 'library'>('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPantryEditor, setShowPantryEditor] = useState(false);
  const [focusRecipe, setFocusRecipe] = useState<Recipe | null>(null);

  // Auto-detect current circadian meal slot on mount
  const currentCircadianSlot = useMemo(() => getCurrentMealSlot(), []);
  const currentSlotMeta = useMemo(() => getMealSlotMeta(currentCircadianSlot), [currentCircadianSlot]);

  useEffect(() => {
    if (isOpen && activeMealSlot === 'all') {
      setActiveMealSlot(currentCircadianSlot);
    }
  }, [isOpen, currentCircadianSlot]);

  // Aggregate all master ingredients across library for pantry selector
  const allMasterIngredients = useMemo(() => {
    const map = new Map<string, { id: string; defaultName: string; category: string }>();
    recipeLibrary.forEach(r => {
      r.masterIngredients?.forEach(m => {
        if (!map.has(m.id)) {
          let category = '🌾 Grains & Pulses';
          const id = m.id.toLowerCase();
          if (id.includes('rice') || id.includes('dal') || id.includes('flour') || id.includes('rava')) {
            category = '🌾 Grains & Pulses';
          } else if (id.includes('onion') || id.includes('tomato') || id.includes('ginger') || id.includes('garlic') || id.includes('leaves') || id.includes('chilli')) {
            category = '🧅 Fresh Produce';
          } else if (id.includes('milk') || id.includes('ghee') || id.includes('butter') || id.includes('paneer') || id.includes('oil')) {
            category = '🥛 Dairy & Oils';
          } else {
            category = '🌶️ Spices & Pantry';
          }
          map.set(m.id, { id: m.id, defaultName: m.defaultName, category });
        }
      });
    });
    return Array.from(map.values());
  }, []);

  // Filter and rank recipes
  const rankedResults: PantryMatchResult[] = useMemo(() => {
    return filterAndRankRecipes(recipeLibrary, {
      mealSlot: activeMealSlot,
      maxTotalTime,
      zeroRestTime,
      heroIngredientId,
      dietary: selectedDietary,
      difficulty: selectedDifficulty,
      searchQuery,
      pantryIngredientIds: userPantryIds,
      scope,
      userSavedRecipeIds: favorites,
    });
  }, [
    activeMealSlot,
    maxTotalTime,
    zeroRestTime,
    heroIngredientId,
    selectedDietary,
    selectedDifficulty,
    searchQuery,
    userPantryIds,
    scope,
    favorites,
  ]);

  if (!isOpen) return null;

  const handleStartCooking = (recipe: Recipe) => {
    dispatch(loadRecipe(recipe));
    setFocusRecipe(recipe);
  };

  const handleEditInStudio = (recipe: Recipe) => {
    dispatch(loadRecipeIntoEditor(recipe));
    onClose();
    router.push('/editor');
  };

  const handleSurpriseMe = () => {
    if (rankedResults.length > 0) {
      const randomIdx = Math.floor(Math.random() * rankedResults.length);
      const chosen = rankedResults[randomIdx].recipe;
      handleStartCooking(chosen);
    }
  };

  const toggleDietFilter = (cat: DietaryCategory) => {
    setSelectedDietary(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAllStaples = () => {
    dispatch(setPantryIngredients(cornerStoreStaples));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-[fadeIn_150ms_ease-out]">
      <div className="bg-[#141414] border border-border-subtle rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle bg-card-bg flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center text-xl font-bold shadow-md">
              🍽️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">What to Cook</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/20 text-accent border border-accent/40 uppercase">
                  Circadian Matcher
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Right now it&apos;s <strong className="text-accent">{currentSlotMeta.emoji} {currentSlotMeta.label}</strong> ({currentSlotMeta.timeRange})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Pick a random recipe matching your constraints"
            >
              <span>🎲</span>
              <span>Surprise Me</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-border-subtle/50 text-text-muted hover:text-foreground flex items-center justify-center text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Circadian Meal Slot Pill Bar (Story 33) */}
        <div className="px-5 py-3 border-b border-border-subtle bg-background/50 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted mr-1">Meal Time:</span>
          {[
            { id: 'all', label: 'All Meals', emoji: '✨' },
            { id: 'breakfast', label: 'Breakfast / Tiffin', emoji: '🌅' },
            { id: 'lunch', label: 'Lunch / Main', emoji: '☀️' },
            { id: 'snack', label: 'Tea Time / Snack', emoji: '☕' },
            { id: 'dinner', label: 'Dinner', emoji: '🌙' },
            { id: 'late_night', label: 'Late Night', emoji: '🌌' },
          ].map(slot => {
            const isSelected = activeMealSlot === slot.id;
            const isCurrent = slot.id === currentCircadianSlot;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => setActiveMealSlot(slot.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-accent text-background font-bold border-accent shadow-sm'
                    : 'bg-card-bg border-border-subtle text-text-muted hover:text-foreground hover:border-accent/40'
                }`}
              >
                <span>{slot.emoji}</span>
                <span>{slot.label}</span>
                {isCurrent && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-background' : 'bg-accent animate-ping'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="px-5 py-3 border-b border-border-subtle bg-card-bg/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Scope Switcher (Story 37) */}
            <div className="flex items-center bg-background border border-border-subtle rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setScope('global')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  scope === 'global' ? 'bg-accent text-background' : 'text-text-muted hover:text-foreground'
                }`}
              >
                🌐 Global Cloud
              </button>
              <button
                type="button"
                onClick={() => setScope('library')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  scope === 'library' ? 'bg-accent text-background' : 'text-text-muted hover:text-foreground'
                }`}
              >
                📚 My Library ({favorites.length})
              </button>
            </div>

            {/* Zero Rest Time Toggle (Story 34) */}
            <button
              type="button"
              onClick={() => setZeroRestTime(!zeroRestTime)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                zeroRestTime
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-background border-border-subtle text-text-muted hover:text-foreground'
              }`}
              title="Exclude recipes requiring hours of passive soaking/fermentation"
            >
              <span>⚡</span>
              <span>No Soaking / 0m Rest</span>
            </button>

            {/* Max Time Presets */}
            <div className="flex items-center gap-1 bg-background border border-border-subtle rounded-lg px-2 py-1">
              <span className="text-text-muted text-[10px] font-bold uppercase">Max:</span>
              {[
                { label: 'Any', value: null },
                { label: '15m', value: 15 },
                { label: '30m', value: 30 },
                { label: '45m', value: 45 },
              ].map(t => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setMaxTotalTime(t.value)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    maxTotalTime === t.value ? 'bg-accent text-background font-bold' : 'text-text-muted hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Pantry Drawer Button */}
            <button
              type="button"
              onClick={() => setShowPantryEditor(!showPantryEditor)}
              className={`px-3 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                showPantryEditor || userPantryIds.length > 0
                  ? 'bg-accent/15 text-accent border-accent/40'
                  : 'bg-background border-border-subtle text-text-muted hover:text-foreground'
              }`}
            >
              <span>🧺</span>
              <span>My Pantry ({userPantryIds.length} items)</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search dishes, tags..."
              className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1 text-xs text-foreground outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Collapsible Pantry & Hero Ingredient Picker Drawer (Story 35) */}
        {showPantryEditor && (
          <div className="p-4 border-b border-border-subtle bg-background/90 space-y-3 animate-[fadeIn_150ms_ease-out] max-h-56 overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  🧺 Select Ingredients in Your Kitchen:
                </span>
                <span className="text-[11px] text-text-muted">
                  ({userPantryIds.length} of {allMasterIngredients.length} selected)
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Hero Ingredient Selector */}
                <select
                  value={heroIngredientId || ''}
                  onChange={e => setHeroIngredientId(e.target.value || null)}
                  className="bg-card-bg border border-border-subtle rounded-lg px-2 py-1 text-xs text-foreground outline-none focus:border-accent cursor-pointer"
                >
                  <option value="">🌟 Hero Ingredient: (Any)</option>
                  {allMasterIngredients.map(i => (
                    <option key={i.id} value={i.id}>
                      Must Use: {i.defaultName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleSelectAllStaples}
                  className="text-[11px] text-accent hover:underline cursor-pointer"
                >
                  + Add Common Staples
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(clearPantry())}
                  className="text-[11px] text-text-muted hover:text-warning cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5">
              {allMasterIngredients.map(item => {
                const isSelected = userPantryIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => dispatch(togglePantryIngredient(item.id))}
                    className={`px-2 py-1 rounded-lg text-[11px] border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-accent/20 text-accent border-accent/60 font-semibold'
                        : 'bg-card-bg border-border-subtle text-text-muted hover:text-foreground'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{item.defaultName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Ranked Recipe Cards Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              Found <strong className="text-foreground">{rankedResults.length}</strong> matching recipe{rankedResults.length === 1 ? '' : 's'}
            </span>
            <span className="text-[11px]">Ranked by pantry readiness & speed</span>
          </div>

          {rankedResults.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <span className="text-4xl">🍳</span>
              <h3 className="text-base font-bold text-foreground">No matching recipes found</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Try loosening your time filters, clearing the &quot;No Rest Time&quot; restriction, or adding more ingredients to your pantry.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveMealSlot('all');
                  setMaxTotalTime(null);
                  setZeroRestTime(false);
                  setHeroIngredientId(null);
                  setScope('global');
                }}
                className="px-4 py-2 rounded-xl bg-accent text-background text-xs font-bold hover:bg-accent/80 transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rankedResults.map(res => {
                const { recipe, matchPercentage, missingCount, missingCornerStoreBasics, canCookImmediately, canCookWithOneOrTwoBuys, timeBreakdown } = res;

                return (
                  <div
                    key={recipe.id}
                    className="p-5 rounded-2xl bg-card-bg border border-border-subtle hover:border-accent/40 transition-all duration-200 flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-lg"
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {canCookImmediately ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              🟢 100% Pantry Match (Ready Now!)
                            </span>
                          ) : canCookWithOneOrTwoBuys ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ⚡ Missing {missingCount} item{missingCount > 1 ? 's' : ''} (Quick Run)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-border-subtle text-text-muted">
                              {matchPercentage}% Match
                            </span>
                          )}
                        </div>

                        {/* Difficulty & Meal Slot Badges */}
                        <div className="flex items-center gap-1">
                          {recipe.difficulty && (
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-background text-text-muted border border-border-subtle">
                              {recipe.difficulty}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recipe Title & Time */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                          {recipe.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-text-muted font-mono">
                          <span>⏱️ {formatTime(timeBreakdown.totalMinutes)} total</span>
                          <span>•</span>
                          <span>{formatTime(timeBreakdown.prepMinutes + timeBreakdown.cookMinutes)} active</span>
                          {timeBreakdown.passiveMinutes > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 font-semibold">
                                {formatTime(timeBreakdown.passiveMinutes)} rest/soak
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Missing Ingredients Tag Radar (Story 36) */}
                      {!canCookImmediately && res.missingIngredientIds.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-background border border-border-subtle/70 text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                            Missing items to buy ({res.missingIngredientIds.length}):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {res.missingIngredientIds.slice(0, 4).map(id => (
                              <span
                                key={id}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  cornerStoreStaples.includes(id)
                                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                    : 'bg-border-subtle text-foreground'
                                }`}
                              >
                                {formatIngredientName(id, recipe.masterIngredients)}
                              </span>
                            ))}
                            {res.missingIngredientIds.length > 4 && (
                              <span className="text-[10px] text-text-muted self-center">
                                +{res.missingIngredientIds.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-border-subtle/50 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditInStudio(recipe)}
                        className="px-3 py-1.5 rounded-xl bg-background hover:bg-card-bg border border-border-subtle hover:border-accent/40 text-foreground text-xs font-semibold transition-all cursor-pointer"
                      >
                        <span>📝 Noter Studio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartCooking(recipe)}
                        className="px-4 py-1.5 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/85 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <span>🎯</span>
                        <span>Start Cooking (Focus)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Guided Cooking Focus Modal Launcher */}
      {focusRecipe && (
        <GuidedCookingModal
          isOpen={Boolean(focusRecipe)}
          onClose={() => setFocusRecipe(null)}
          recipe={focusRecipe}
          targetYield={targetYield}
          baseYield={focusRecipe.baseYield}
          spiceMultiplier={1.0}
          sweetMultiplier={1.0}
        />
      )}
    </div>
  );
}
