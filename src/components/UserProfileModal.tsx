'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setCurrentUser, logoutUser, createCollection } from '@/store/recipeSlice';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.recipe.currentUser);
  const favorites = useSelector((state: RootState) => state.recipe.favorites);
  const customCollections = useSelector((state: RootState) => state.recipe.customCollections || {});

  const [newCollectionName, setNewCollectionName] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = (email: string, name: string, avatar: string) => {
    dispatch(
      setCurrentUser({
        id: `user_${email.split('@')[0]}`,
        name,
        email,
        avatar,
        isLoggedIn: true,
      })
    );
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    dispatch(createCollection({ name: newCollectionName.trim() }));
    setNewCollectionName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]">
      <div className="bg-[#181818] border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border-subtle bg-card-bg flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">👤</span>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {currentUser?.isLoggedIn ? 'Chef Profile & Account' : 'Sign In to What 2 Cook'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-border-subtle/50 text-text-muted hover:text-foreground flex items-center justify-center text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {currentUser?.isLoggedIn ? (
            /* Signed In User Card */
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-background rounded-xl border border-border-subtle">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-accent/40 bg-card-bg">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80'}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">{currentUser.name}</h3>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Google Verified
                    </span>
                  </div>
                  <p className="text-xs text-text-muted font-mono">{currentUser.email}</p>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
                  <span className="text-base font-bold text-accent font-mono">{favorites.length}</span>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Bookmarked Favorites</span>
                </div>
                <div className="p-3 rounded-xl bg-card-bg border border-border-subtle">
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {Object.keys(customCollections).length}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-text-muted block">Custom Collections</span>
                </div>
              </div>

              {/* Custom Collections Manager (Story 44) */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-accent tracking-wider">
                  📁 Your Recipe Collections
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(customCollections).map(([colName, ids]) => (
                    <span
                      key={colName}
                      className="px-2.5 py-1 rounded-lg bg-background border border-border-subtle text-xs text-foreground flex items-center gap-1.5"
                    >
                      <span>📂 {colName}</span>
                      <span className="text-[10px] text-text-muted font-mono">({ids.length})</span>
                    </span>
                  ))}
                </div>

                <form onSubmit={handleCreateCollection} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    placeholder="New Collection Name (e.g. Quick Dinners)"
                    className="flex-1 bg-background border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={!newCollectionName.trim()}
                    className="px-3 py-1.5 bg-accent/20 text-accent font-bold text-xs rounded-xl hover:bg-accent/30 disabled:opacity-40 cursor-pointer"
                  >
                    + Add
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => dispatch(logoutUser())}
                  className="text-xs text-warning hover:underline font-semibold cursor-pointer"
                >
                  Log Out
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-card-bg border border-border-subtle text-foreground text-xs font-semibold hover:border-accent/40 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Guest Sign-In Options (Story 42) */
            <div className="space-y-4 text-center">
              <p className="text-xs text-text-muted">
                Sign in with Google to sync your personal recipe notebook, log cooking iterations, and join recipe discussions.
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    handleGoogleSignIn(
                      'dhinesh@gmail.com',
                      'Chef Dhinesh',
                      'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80'
                    )
                  }
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-gray-900 font-bold text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>🇬</span>
                  <span>Continue with Google (dhinesh@gmail.com)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleGoogleSignIn(
                      'alex@gmail.com',
                      'Chef Alex',
                      'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?auto=format&fit=crop&w=120&q=80'
                    )
                  }
                  className="w-full py-2 px-4 rounded-xl bg-card-bg border border-border-subtle text-foreground font-semibold text-xs hover:border-accent/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>👤</span>
                  <span>Switch Account: Chef Alex (alex@gmail.com)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
