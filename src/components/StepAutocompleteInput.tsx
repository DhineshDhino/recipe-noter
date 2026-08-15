'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IngredientRegistry } from '@/lib/types';
import { searchCookingTerms, CookingTerm } from '@/lib/cookingTerms';

interface StepAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectIngredient?: (ingredient: IngredientRegistry) => void;
  placeholder?: string;
  className?: string;
  masterIngredients: IngredientRegistry[];
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  id?: string;
  autoFocus?: boolean;
}

export default function StepAutocompleteInput({
  value,
  onChange,
  onSelectIngredient,
  placeholder,
  className,
  masterIngredients,
  inputRef: externalRef,
  onKeyDown,
  id,
  autoFocus,
}: StepAutocompleteInputProps) {
  const internalRef = useRef<HTMLInputElement>(null);
  const activeInputRef = externalRef || internalRef;

  const [cursorPos, setCursorPos] = useState<number>(value.length);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Extract the current typing word under cursor
  const getActiveWord = (text: string, pos: number) => {
    const effectivePos = pos === 0 && text.length > 0 ? text.length : pos;
    const leftText = text.slice(0, effectivePos);
    const words = leftText.split(/\s+/);
    return words[words.length - 1] || '';
  };

  const activeWord = getActiveWord(value, cursorPos);

  // Filter ingredients matching active word (or full value if short)
  const matchedIngredients = React.useMemo(() => {
    const q = activeWord.toLowerCase().trim();
    if (q.length < 2) return [];
    return masterIngredients
      .filter(
        i =>
          i.defaultName.toLowerCase().includes(q) ||
          i.translations.some(t => t.name.toLowerCase().includes(q))
      )
      .slice(0, 4);
  }, [activeWord, masterIngredients]);

  // Filter cooking terms matching active word
  const matchedTerms = React.useMemo(() => {
    const q = activeWord.toLowerCase().trim();
    if (q.length < 2) return [];
    return searchCookingTerms(q, 4);
  }, [activeWord]);

  const totalItems = matchedIngredients.length + matchedTerms.length;

  useEffect(() => {
    if (totalItems > 0) {
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, [totalItems, activeWord]);

  const handleSelectIngredient = (ing: IngredientRegistry) => {
    const leftText = value.slice(0, cursorPos);
    const rightText = value.slice(cursorPos);
    const words = leftText.split(/\s+/);
    words[words.length - 1] = ing.defaultName;
    const newText = words.join(' ') + (rightText.startsWith(' ') ? '' : ' ') + rightText;

    onChange(newText.trimEnd() + ' ');
    if (onSelectIngredient) {
      onSelectIngredient(ing);
    }
    setIsOpen(false);
    activeInputRef.current?.focus();
  };

  const handleSelectTerm = (term: CookingTerm) => {
    const leftText = value.slice(0, cursorPos);
    const rightText = value.slice(cursorPos);
    const words = leftText.split(/\s+/);
    // Extract base term (without parentheses if any)
    const baseTerm = term.term.split('(')[0].trim();
    words[words.length - 1] = baseTerm;
    const newText = words.join(' ') + (rightText.startsWith(' ') ? '' : ' ') + rightText;

    onChange(newText.trimEnd() + ' ');
    setIsOpen(false);
    activeInputRef.current?.focus();
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isOpen && totalItems > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (selectedIndex < matchedIngredients.length) {
          handleSelectIngredient(matchedIngredients[selectedIndex]);
        } else {
          const termIdx = selectedIndex - matchedIngredients.length;
          handleSelectTerm(matchedTerms[termIdx]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }
    }

    if (onKeyDown) onKeyDown(e);
  };

  return (
    <div className="relative flex-1 w-full">
      <input
        ref={activeInputRef as React.RefObject<HTMLInputElement>}
        id={id}
        type="text"
        value={value}
        autoFocus={autoFocus}
        onChange={e => {
          onChange(e.target.value);
          setCursorPos(e.target.selectionStart || 0);
        }}
        onClick={e => setCursorPos((e.target as HTMLInputElement).selectionStart || 0)}
        onKeyUp={e => setCursorPos((e.target as HTMLInputElement).selectionStart || 0)}
        onKeyDown={handleCustomKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />

      {/* Floating Autocomplete Dropdown */}
      {isOpen && totalItems > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#1C1C1E] border border-accent/40 rounded-xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto animate-[fadeIn_100ms_ease-out]">
          {/* Ingredients Section */}
          {matchedIngredients.length > 0 && (
            <div className="p-1.5 border-b border-border-subtle/50">
              <div className="px-2 py-1 text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                <span>🥘</span>
                <span>Master Ingredients (Auto-links ID)</span>
              </div>
              {matchedIngredients.map((ing, idx) => {
                const isSelected = selectedIndex === idx;
                const tamilTrans = ing.translations?.find(t => t.language.toLowerCase() === 'tamil')?.name;
                const hindiTrans = ing.translations?.find(t => t.language.toLowerCase() === 'hindi')?.name;

                return (
                  <button
                    key={ing.id}
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelectIngredient(ing);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-accent text-background font-bold' : 'text-foreground hover:bg-card-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{ing.defaultName}</span>
                      {(tamilTrans || hindiTrans) && (
                        <span className={`text-[11px] ${isSelected ? 'text-background/80' : 'text-text-muted'}`}>
                          ({tamilTrans || hindiTrans})
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-background/90' : 'text-accent'}`}>
                      + Link
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cooking Terms & Techniques Section */}
          {matchedTerms.length > 0 && (
            <div className="p-1.5">
              <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <span>🔥</span>
                <span>Cooking Verbs & Techniques</span>
              </div>
              {matchedTerms.map((term, tIdx) => {
                const globalIdx = matchedIngredients.length + tIdx;
                const isSelected = selectedIndex === globalIdx;

                return (
                  <button
                    key={term.term}
                    type="button"
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelectTerm(term);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber-500 text-background font-bold' : 'text-foreground hover:bg-card-bg'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{term.term}</span>
                        {term.tamilEquiv && (
                          <span className={`text-[10px] ${isSelected ? 'text-background/80' : 'text-text-muted'}`}>
                            ({term.tamilEquiv})
                          </span>
                        )}
                      </div>
                      {term.hint && (
                        <span
                          className={`text-[10px] truncate max-w-[280px] ${
                            isSelected ? 'text-background/90' : 'text-text-muted/80'
                          }`}
                        >
                          {term.hint}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                        isSelected ? 'bg-background/20 text-background' : 'bg-card-bg text-text-muted'
                      }`}
                    >
                      {term.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
