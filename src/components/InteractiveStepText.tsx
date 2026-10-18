'use client';

import React, { useState, useMemo } from 'react';
import { IngredientRegistry } from '@/lib/types';

interface InteractiveStepTextProps {
  text: string;
  masterIngredients?: IngredientRegistry[];
  className?: string;
  onIngredientToggle?: (ingredientName: string, isChecked: boolean) => void;
}

export default function InteractiveStepText({
  text,
  masterIngredients = [],
  className = '',
  onIngredientToggle,
}: InteractiveStepTextProps) {
  const [struckIngredients, setStruckIngredients] = useState<Set<string>>(new Set());

  // Extract all searchable ingredient names (default names and translations)
  const ingredientKeywords = useMemo(() => {
    const keywords: { name: string; rawName: string }[] = [];

    masterIngredients.forEach((m) => {
      if (m.defaultName && m.defaultName.length > 2) {
        keywords.push({ name: m.defaultName.toLowerCase(), rawName: m.defaultName });
      }
      m.translations?.forEach((t) => {
        if (t.name && t.name.length > 2) {
          keywords.push({ name: t.name.toLowerCase(), rawName: t.name });
        }
      });
    });

    // Sort by longest name first to match multi-word ingredients before single words (e.g. "mustard seeds" before "mustard")
    return keywords.sort((a, b) => b.name.length - a.name.length);
  }, [masterIngredients]);

  const toggleStruck = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStruckIngredients((prev) => {
      const next = new Set(prev);
      const isNowStruck = !next.has(name);
      if (isNowStruck) {
        next.add(name);
      } else {
        next.delete(name);
      }
      if (onIngredientToggle) {
        onIngredientToggle(name, isNowStruck);
      }
      return next;
    });
  };

  // If no ingredients to match, render plain text
  if (ingredientKeywords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Construct regex pattern matching any of the ingredient keywords
  const escapedNames = ingredientKeywords.map((k) =>
    k.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const regex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={`leading-relaxed ${className}`}>
      {parts.map((part, idx) => {
        const lowerPart = part.toLowerCase();
        const matched = ingredientKeywords.find((k) => k.name === lowerPart);

        if (matched) {
          const isStruck = struckIngredients.has(matched.rawName.toLowerCase());

          return (
            <button
              key={idx}
              type="button"
              onClick={(e) => toggleStruck(matched.rawName.toLowerCase(), e)}
              className={`inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.2 rounded-md font-medium text-xs sm:text-sm transition-all cursor-pointer select-none align-baseline ${
                isStruck
                  ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-400 line-through opacity-60 shadow-xs'
                  : 'bg-accent/10 border border-accent/30 text-accent hover:bg-accent/25 hover:border-accent/60 hover:scale-105'
              }`}
              title={isStruck ? `Added "${part}" to pan (Click to undo)` : `Click to cross off "${part}" as added`}
              aria-label={`Toggle ingredient ${part}`}
            >
              {isStruck && <span className="text-[10px] no-underline">✓</span>}
              <span>{part}</span>
            </button>
          );
        }

        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}
