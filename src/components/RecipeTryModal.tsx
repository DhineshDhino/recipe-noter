'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addRecipeTry } from '@/store/recipeSlice';
import { generateId } from '@/lib/id';

interface RecipeTryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string;
  recipeName: string;
  baseYield: number;
}

export default function RecipeTryModal({
  isOpen,
  onClose,
  recipeId,
  recipeName,
  baseYield,
}: RecipeTryModalProps) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.recipe.currentUser);

  const [yieldCooked, setYieldCooked] = useState(baseYield);
  const [rating, setRating] = useState(5);
  const [tweaksSummary, setTweaksSummary] = useState('');
  const [tasteNotes, setTasteNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweaksSummary.trim() && !tasteNotes.trim()) return;

    dispatch(
      addRecipeTry({
        id: generateId(),
        recipeId,
        timestamp: new Date().toISOString(),
        yieldCooked: Number(yieldCooked) || baseYield,
        tweaksSummary: tweaksSummary.trim(),
        tasteNotes: tasteNotes.trim(),
        rating,
        photos: photoUrl.trim() ? [photoUrl.trim()] : [],
        authorId: currentUser?.id,
        authorName: currentUser?.name || 'Chef',
      })
    );

    onClose();
    setTweaksSummary('');
    setTasteNotes('');
    setPhotoUrl('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]">
      <div className="bg-[#181818] border border-border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle bg-card-bg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center text-xl font-bold shadow-md">
              📓
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Log Cooking Attempt</h2>
              <p className="text-xs text-text-muted">
                Record tweaks &amp; taste outcome for <strong className="text-accent">{recipeName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-border-subtle/50 text-text-muted hover:text-foreground flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Star Rating & Yield */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Taste &amp; Outcome Rating
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform hover:scale-125 cursor-pointer ${
                      star <= rating ? 'text-amber-400' : 'text-text-muted/40'
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span className="text-xs font-bold text-foreground ml-1.5">{rating}/5</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                Serving Yield Cooked
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={yieldCooked}
                onChange={e => setYieldCooked(Number(e.target.value))}
                className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-accent font-mono"
              />
            </div>
          </div>

          {/* Micro Tweaks Summary */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-accent mb-1">
              ✨ What small tweak did you try?
            </label>
            <textarea
              rows={2}
              value={tweaksSummary}
              onChange={e => setTweaksSummary(e.target.value)}
              placeholder="e.g., Added +10g minced ginger, used cold-pressed gingelly oil, cooked on medium flame for 2 extra minutes."
              className="w-full bg-background border border-border-subtle rounded-xl p-3 text-xs text-foreground outline-none focus:border-accent resize-none placeholder:text-text-muted/60"
              required
            />
          </div>

          {/* Taste Notes */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-accent mb-1">
              👅 Sensory Taste &amp; Texture Result
            </label>
            <textarea
              rows={2}
              value={tasteNotes}
              onChange={e => setTasteNotes(e.target.value)}
              placeholder="e.g., Extremely crispy honeycomb edges, ginger gave a refreshing kick, family rated it a 10/10."
              className="w-full bg-background border border-border-subtle rounded-xl p-3 text-xs text-foreground outline-none focus:border-accent resize-none placeholder:text-text-muted/60"
            />
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
              📷 Optional Outcome Photo (URL)
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-background border border-border-subtle rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-accent font-mono"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!tweaksSummary.trim()}
              className="px-5 py-2 rounded-xl bg-accent text-background text-xs font-bold hover:bg-accent/85 disabled:opacity-40 transition-all shadow-md cursor-pointer"
            >
              Save Try to Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
