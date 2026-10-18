'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { recipeLibrary } from '@/lib/mockRecipes';
import { loadRecipe } from '@/store/recipeSlice';
import { loadRecipeIntoEditor, resetEditorState } from '@/store/editorSlice';
import RecipeLibraryModal from './RecipeLibraryModal';
import TamilVoiceNoteModal from './TamilVoiceNoteModal';
import WhatToCookModal from './WhatToCookModal';
import UserProfileModal from './UserProfileModal';
import { useScreenWakeLock } from '@/lib/useScreenWakeLock';

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const activeRecipe = useSelector((state: RootState) => state.recipe.recipe);
  const editorRecipeName = useSelector((state: RootState) => state.editor.recipeName);
  const currentUser = useSelector((state: RootState) => state.recipe.currentUser);

  const { isLocked, toggleWakeLock } = useScreenWakeLock();

  const [mounted, setMounted] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isWhatToCookOpen, setIsWhatToCookOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEditorRoute = pathname === '/editor';
  const isDraftMode = mounted ? (isEditorRoute && !editorRecipeName) : isEditorRoute;
  const currentDisplayName = mounted
    ? (isEditorRoute ? editorRecipeName || 'New Recipe (Draft)' : activeRecipe?.name || 'Select Recipe')
    : (isEditorRoute ? 'New Recipe (Draft)' : activeRecipe?.name || 'Select Recipe');

  const handleSelectRecipe = (recipe: typeof recipeLibrary[0]) => {
    dispatch(loadRecipe(recipe));
    dispatch(loadRecipeIntoEditor(recipe));
    setIsSwitcherOpen(false);
  };

  const handleNewRecipe = () => {
    dispatch(resetEditorState());
    router.push('/editor');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0E0F12]/85 backdrop-blur-xl px-4 sm:px-8 py-3 transition-all shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Branding */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent via-amber-500 to-orange-400 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,109,0,0.35)] group-hover:scale-105 transition-transform ring-1 ring-white/20">
                🍳
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-foreground group-hover:text-accent transition-colors">
                    What 2 Cook
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                    Studio
                  </span>
                </div>
                <p className="text-[10px] text-text-muted hidden md:block">
                  Smart Culinary Suggestions & Modular Precision Cooking
                </p>
              </div>
            </button>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-card-bg/90 border border-white/[0.08] p-1 rounded-xl shadow-inner">
              <button
                onClick={() => router.push('/')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  pathname === '/'
                    ? 'bg-accent text-background shadow-md'
                    : 'text-text-muted hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                <span>📖</span>
                <span>Cook Mode</span>
              </button>
              <button
                onClick={() => router.push('/editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  pathname === '/editor'
                    ? 'bg-accent text-background shadow-md'
                    : 'text-text-muted hover:text-foreground hover:bg-white/[0.04]'
                }`}
              >
                <span>📝</span>
                <span>Noter Studio</span>
              </button>
              <button
                onClick={() => setIsLibraryOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-foreground hover:bg-white/[0.04] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>📚</span>
                <span className="hidden sm:inline">Library</span>
                <span className="px-1.5 py-0.2 rounded-full bg-white/[0.08] text-[10px] font-mono text-foreground">
                  {recipeLibrary.length}
                </span>
              </button>
              <button
                onClick={() => setIsWhatToCookOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-accent/15 text-accent hover:bg-accent/25 border border-accent/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Smart What to Cook Recommendation Engine"
              >
                <span>🍽️</span>
                <span>What to Cook</span>
              </button>
              <button
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-text-muted hover:text-foreground hover:bg-white/[0.04] transition-all flex items-center gap-1.5 cursor-pointer"
                title="Tamil Voice Note to Recipe AI"
              >
                <span>🎙️</span>
                <span className="hidden md:inline">Tamil AI</span>
                <span className="text-[9px] px-1 rounded bg-accent/20 text-accent font-semibold">
                  Beta
                </span>
              </button>
            </div>
          </div>

          {/* Right Action Toolbar: Quick Switcher & New Recipe */}
          <div className="flex items-center gap-2.5">
            {/* Screen Wake Lock Toggle (Story 68) */}
            <button
              onClick={() => toggleWakeLock()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                isLocked
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                  : 'bg-card-bg/90 border-white/[0.08] text-text-muted hover:text-foreground hover:border-white/20'
              }`}
              title={isLocked ? 'Screen Wake Lock Active (Screen will not sleep)' : 'Click to keep screen awake while cooking'}
            >
              <span className={isLocked ? 'animate-pulse' : 'opacity-60'}>💡</span>
              <span className="hidden xl:inline text-[11px] font-medium">
                {isLocked ? 'Awake' : 'Screen'}
              </span>
            </button>

            {/* Quick Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card-bg/90 border border-white/[0.08] hover:border-accent/40 text-foreground text-xs font-semibold transition-all cursor-pointer shadow-xs"
                title={isEditorRoute ? 'Editor Recipe Selector' : 'Switch Active Recipe'}
              >
                <span
                  suppressHydrationWarning
                  className={`w-2 h-2 rounded-full ${
                    isDraftMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                  }`}
                />
                <span className="max-w-[130px] truncate" suppressHydrationWarning>{currentDisplayName}</span>
                <span className="text-text-muted text-[10px]">▼</span>
              </button>

              {isSwitcherOpen && (
                <>
                  {/* Backdrop overlay for outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsSwitcherOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] bg-[#16171B]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2.5 z-50 animate-[fadeIn_120ms_ease-out] ring-1 ring-black/60">
                    <div className="px-2.5 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-white/[0.08] mb-1.5 flex items-center justify-between">
                      <span>{isEditorRoute ? 'Load Recipe into Editor' : 'Select Active Recipe'}</span>
                      <span className="text-[10px] text-accent font-mono">({recipeLibrary.length + 1} options)</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-1 pr-0.5">
                      {/* Blank Recipe Draft Option */}
                      <button
                        onClick={handleNewRecipe}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          isDraftMode
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 shadow-sm'
                            : 'text-amber-400/90 hover:bg-card-bg hover:text-amber-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
                            ➕
                          </span>
                          <div>
                            <span className="font-semibold block">Blank Recipe Draft</span>
                            <span className="text-[10px] text-text-muted">Create from scratch</span>
                          </div>
                        </div>
                      </button>

                      <div className="border-t border-white/[0.08] my-1.5" />

                      {recipeLibrary.map(r => {
                        const isCurrent = isEditorRoute ? editorRecipeName === r.name : activeRecipe?.id === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => handleSelectRecipe(r)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-accent text-background font-bold shadow-sm'
                                : 'text-foreground hover:bg-white/[0.04] hover:text-accent'
                            }`}
                          >
                            <span className="truncate font-medium">{r.name}</span>
                            <span className={`text-[10px] font-mono shrink-0 ml-2 ${isCurrent ? 'text-background/80 font-bold' : 'text-text-muted'}`}>
                              {r.baseYield} servings
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* New Recipe Button */}
            <button
              onClick={handleNewRecipe}
              className="px-3.5 py-1.5 rounded-xl bg-accent text-background text-xs font-bold hover:bg-accent/80 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,109,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>➕</span>
              <span className="hidden sm:inline">New Recipe</span>
            </button>

            {/* User Profile Avatar / Google Login (Story 42) */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-card-bg/90 border border-white/[0.08] hover:border-accent/40 transition-all cursor-pointer shadow-xs"
              title={currentUser?.isLoggedIn ? `Account: ${currentUser.name}` : 'Sign In with Google'}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-accent/40 bg-background">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs flex items-center justify-center h-full">👤</span>
                )}
              </div>
              <span className="text-xs font-semibold text-foreground max-w-[80px] truncate hidden md:inline">
                {currentUser?.isLoggedIn ? currentUser.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Global Modals */}
      <RecipeLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
      <TamilVoiceNoteModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} />
      <WhatToCookModal isOpen={isWhatToCookOpen} onClose={() => setIsWhatToCookOpen(false)} />
      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
}
