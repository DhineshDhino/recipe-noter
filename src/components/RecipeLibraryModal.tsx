'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Recipe } from '@/lib/types';
import { recipeLibrary } from '@/lib/mockRecipes';
import { loadRecipe } from '@/store/recipeSlice';
import { loadRecipeIntoEditor, resetEditorState } from '@/store/editorSlice';
import { RootState } from '@/store/store';
import { formatTime } from '@/lib/utils';

interface RecipeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeLibraryModal({ isOpen, onClose }: RecipeLibraryModalProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const activeRecipe = useSelector((state: RootState) => state.recipe.recipe);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = useMemo(() => {
    if (!searchQuery.trim()) return recipeLibrary;
    const q = searchQuery.toLowerCase();
    return recipeLibrary.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.versionHistory?.[0]?.versionName.toLowerCase().includes(q) ||
        r.versionHistory?.[0]?.author?.toLowerCase().includes(q) ||
        r.masterIngredients?.some(
          i =>
            i.defaultName.toLowerCase().includes(q) ||
            i.translations.some(t => t.name.toLowerCase().includes(q))
        )
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const handleSelectForCooking = (recipe: Recipe) => {
    dispatch(loadRecipe(recipe));
    onClose();
    router.push('/');
  };

  const handleSelectForEditing = (recipe: Recipe) => {
    dispatch(loadRecipeIntoEditor(recipe));
    onClose();
    router.push('/editor');
  };

  const handleCreateNew = () => {
    dispatch(resetEditorState());
    onClose();
    router.push('/editor');
  };

  const getRecipeTotalTime = (recipe: Recipe) => {
    const prep = (recipe.prepBlocks || []).reduce((acc, b) => acc + (b.totalDurationInMinutes || 0), 0);
    const passive = (recipe.passiveBlocks || []).reduce((acc, b) => acc + (b.totalDurationInMinutes || 0), 0);
    const cook = (recipe.cookBlocks || []).reduce((acc, b) => acc + (b.totalDurationInMinutes || 0), 0);
    return prep + passive + cook;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_150ms_ease-out]">
      <div className="bg-[#181818] border border-border-subtle rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border-subtle flex items-center justify-between bg-card-bg">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📚</span>
            <div>
              <h2 className="text-xl font-bold text-foreground">Recipe Library & Catalogue</h2>
              <p className="text-xs text-text-muted">
                Select a verified modular recipe to cook stove-side or customize in the Noter Studio.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-border-subtle/50 text-text-muted hover:text-foreground hover:bg-border-subtle flex items-center justify-center transition-colors text-sm"
            title="Close library"
          >
            ✕
          </button>
        </div>

        {/* Toolbar & Search */}
        <div className="p-4 border-b border-border-subtle bg-background/50 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <span className="absolute left-3 top-2.5 text-text-muted text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search recipes, ingredients, Tamil names, authors..."
              className="w-full bg-card-bg border border-border-subtle rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-text-muted/50 outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-xl bg-accent text-background text-xs font-bold hover:bg-accent/80 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>➕</span>
            <span>Create New Recipe from Scratch</span>
          </button>
        </div>

        {/* Recipe Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map(r => {
            const isActive = activeRecipe?.id === r.id;
            const totalMins = getRecipeTotalTime(r);
            const blockCount =
              (r.prepBlocks?.length || 0) + (r.passiveBlocks?.length || 0) + (r.cookBlocks?.length || 0);

            return (
              <div
                key={r.id}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/10 border-accent shadow-[0_0_20px_rgba(255,109,0,0.15)] ring-1 ring-accent'
                    : 'bg-card-bg border-border-subtle hover:border-accent/50 hover:bg-card-bg/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-foreground leading-snug">{r.name}</h3>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-background uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-muted line-clamp-1">
                    {r.versionHistory?.[0]?.versionName || 'Standard Version'}
                    {r.versionHistory?.[0]?.author && ` • by ${r.versionHistory[0].author}`}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-background border border-border-subtle text-foreground font-mono">
                      ⏱ {formatTime(totalMins)}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-background border border-border-subtle text-text-muted">
                      👥 {r.baseYield} Servings
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-background border border-border-subtle text-text-muted">
                      🧩 {blockCount} Blocks
                    </span>
                    {r.ratioGroups && r.ratioGroups.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/30 font-semibold">
                        📐 {r.ratioGroups.length} Ratios
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-5 mt-4 border-t border-border-subtle/50">
                  <button
                    onClick={() => handleSelectForCooking(r)}
                    className="flex-1 py-2 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/80 transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>🍳</span>
                    <span>Cook</span>
                  </button>
                  <button
                    onClick={() => handleSelectForEditing(r)}
                    className="flex-1 py-2 rounded-xl bg-background border border-border-subtle text-foreground font-semibold text-xs hover:border-accent/50 hover:text-accent transition-all flex items-center justify-center gap-1"
                  >
                    <span>📝</span>
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredRecipes.length === 0 && (
            <div className="col-span-full py-12 text-center text-text-muted space-y-3">
              <span className="text-4xl block">🔍</span>
              <p className="text-sm">No recipes match &quot;{searchQuery}&quot;</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-accent underline hover:text-accent/80"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
