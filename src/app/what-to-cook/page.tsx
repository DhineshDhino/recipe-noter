'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import WhatToCookModal from '@/components/WhatToCookModal';

export default function WhatToCookPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <span className="text-5xl">🍽️</span>
        <h1 className="text-2xl font-bold text-foreground">What to Cook Discovery Hub</h1>
        <p className="text-xs text-text-muted">
          Smart recommendations based on time of day, active/passive budgets, and pantry ingredients.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/85 transition-all shadow-md cursor-pointer"
          >
            Open Recommendations Modal
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl bg-card-bg border border-border-subtle hover:border-accent/40 text-foreground text-xs font-semibold transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <WhatToCookModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
