'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { deleteRecipeTry } from '@/store/recipeSlice';
import { RecipeTry } from '@/lib/types';
import RecipeTryModal from './RecipeTryModal';

interface RecipeJourneyTimelineProps {
  recipeId: string;
  recipeName: string;
  baseYield: number;
}

export default function RecipeJourneyTimeline({
  recipeId,
  recipeName,
  baseYield,
}: RecipeJourneyTimelineProps) {
  const dispatch = useDispatch();
  const tries = useSelector((state: RootState) => state.recipe.recipeTries[recipeId] || []);

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleCompareSelect = (tryId: string) => {
    setSelectedForCompare(prev =>
      prev.includes(tryId) ? prev.filter(id => id !== tryId) : [...prev, tryId]
    );
  };

  const comparedTries = tries.filter(t => selectedForCompare.includes(t.id));

  return (
    <section className="bg-card-bg border border-border-subtle rounded-2xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle/50 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">📓</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Cooking Journey &amp; Tries</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/30 font-mono">
                {tries.length} {tries.length === 1 ? 'Attempt' : 'Attempts'}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Track taste differences, micro-tweaks, and texture outcomes across each attempt.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedForCompare.length >= 2 && (
            <button
              type="button"
              onClick={() => setShowCompareModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>⚖️</span>
              <span>Compare ({selectedForCompare.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLogModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-accent text-background text-xs font-bold hover:bg-accent/85 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>➕</span>
            <span>Log a Try</span>
          </button>
        </div>
      </div>

      {/* Tries Timeline */}
      {tries.length === 0 ? (
        <div className="py-10 text-center space-y-2 bg-background/40 rounded-xl border border-dashed border-border-subtle">
          <span className="text-3xl block">👨‍🍳</span>
          <h4 className="text-xs font-bold text-foreground">No cooking attempts logged yet</h4>
          <p className="text-[11px] text-text-muted max-w-xs mx-auto">
            Cooked this recipe today? Click <strong>&quot;Log a Try&quot;</strong> to record the tweaks you tried and how it tasted!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tries.map((t, idx) => {
            const isComparing = selectedForCompare.includes(t.id);
            const formattedDate = new Date(t.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={t.id}
                className={`p-4 rounded-xl border transition-all ${
                  isComparing
                    ? 'bg-accent/10 border-accent'
                    : 'bg-background border-border-subtle/80 hover:border-accent/30'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCompareSelect(t.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] cursor-pointer transition-colors ${
                        isComparing
                          ? 'bg-accent text-background border-accent font-bold'
                          : 'border-border-subtle text-transparent hover:border-accent'
                      }`}
                      title="Select for side-by-side comparison"
                    >
                      ✓
                    </button>
                    <span className="text-xs font-bold text-foreground">
                      Try #{tries.length - idx}:
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                      {'★'.repeat(t.rating)}
                      <span className="text-text-muted/40 font-normal">{'★'.repeat(5 - t.rating)}</span>
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">
                      ({t.yieldCooked} servings • {formattedDate})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted">by {t.authorName || 'Chef'}</span>
                    <button
                      type="button"
                      onClick={() => dispatch(deleteRecipeTry({ recipeId, tryId: t.id }))}
                      className="text-text-muted hover:text-warning text-xs cursor-pointer px-1"
                      title="Delete attempt"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Micro Tweak & Taste notes */}
                <div className="space-y-2 text-xs">
                  <div className="bg-card-bg/60 p-2.5 rounded-lg border border-border-subtle/40">
                    <span className="text-[10px] font-bold uppercase text-accent tracking-wider block mb-0.5">
                      ✨ Tweak Tested:
                    </span>
                    <p className="text-foreground">{t.tweaksSummary}</p>
                  </div>

                  {t.tasteNotes && (
                    <div className="bg-card-bg/60 p-2.5 rounded-lg border border-border-subtle/40">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider block mb-0.5">
                        👅 Taste &amp; Texture Result:
                      </span>
                      <p className="text-text-muted">{t.tasteNotes}</p>
                    </div>
                  )}

                  {t.photos && t.photos.length > 0 && (
                    <div className="flex gap-2 pt-1">
                      {t.photos.map((p, pIdx) => (
                        <div key={pIdx} className="w-20 h-16 rounded-lg overflow-hidden border border-border-subtle">
                          <img src={p} alt="Try photo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare Side-by-Side Modal */}
      {showCompareModal && comparedTries.length >= 2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_150ms_ease-out]">
          <div className="bg-[#181818] border border-border-subtle rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-border-subtle bg-card-bg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <h3 className="text-base font-bold text-foreground">
                  Side-by-Side Cooking Tries Comparison
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="w-7 h-7 rounded-full bg-border-subtle/50 text-text-muted hover:text-foreground flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-x-auto flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {comparedTries.map((t, idx) => (
                <div key={t.id} className="p-4 rounded-xl bg-background border border-border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-accent">Comparison Item #{idx + 1}</span>
                    <span className="text-amber-400 text-xs font-bold">{'★'.repeat(t.rating)}</span>
                  </div>
                  <div className="text-[11px] text-text-muted">
                    Yield: <strong className="text-foreground font-mono">{t.yieldCooked}p</strong>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-accent">Tweak:</span>
                    <p className="text-xs text-foreground bg-card-bg p-2 rounded-lg">{t.tweaksSummary}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-400">Taste:</span>
                    <p className="text-xs text-text-muted bg-card-bg p-2 rounded-lg">{t.tasteNotes || 'No notes'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log Modal */}
      <RecipeTryModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        recipeId={recipeId}
        recipeName={recipeName}
        baseYield={baseYield}
      />
    </section>
  );
}
