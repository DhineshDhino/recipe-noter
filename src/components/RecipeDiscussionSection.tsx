'use client';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { addRecipeComment, likeRecipeComment, deleteRecipeComment } from '@/store/recipeSlice';
import { generateId } from '@/lib/id';

interface RecipeDiscussionSectionProps {
  recipeId: string;
  recipeName: string;
}

export default function RecipeDiscussionSection({
  recipeId,
  recipeName,
}: RecipeDiscussionSectionProps) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.recipe.currentUser);
  const comments = useSelector((state: RootState) => state.recipe.recipeComments[recipeId] || []);

  const [newCommentText, setNewCommentText] = useState('');

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    dispatch(
      addRecipeComment({
        id: generateId(),
        recipeId,
        authorId: currentUser?.id || 'guest',
        authorName: currentUser?.name || 'Fellow Cook',
        authorAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80',
        text: newCommentText.trim(),
        timestamp: new Date().toISOString(),
        likes: 0,
      })
    );

    setNewCommentText('');
  };

  return (
    <section className="bg-card-bg/90 backdrop-blur-sm border border-white/[0.08] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">💬</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Community Discussion &amp; Tips</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/30 font-mono shadow-xs">
                {comments.length}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Ask questions, suggest ingredient substitutes, or share feedback on {recipeName}.
            </p>
          </div>
        </div>
      </div>

      {/* New Comment Authoring Form */}
      <form onSubmit={handlePostComment} className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/40 bg-background shrink-0 mt-1 shadow-xs">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs flex items-center justify-center h-full">👤</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <textarea
            rows={2}
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            placeholder={`Ask a question or share your cooking experience with ${recipeName}...`}
            className="w-full bg-background/80 border border-white/[0.08] rounded-xl p-3 text-xs text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 resize-none placeholder:text-text-muted/60 shadow-inner transition-all"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="px-4 py-1.5 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/85 disabled:opacity-40 transition-all cursor-pointer shadow-[0_0_12px_rgba(255,109,0,0.25)] hover:scale-105 active:scale-95"
            >
              Post Comment
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="py-8 text-center bg-background/40 rounded-xl border border-dashed border-white/[0.08]">
          <p className="text-xs text-text-muted">
            No community comments yet. Be the first to share your thoughts!
          </p>
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {comments.map(c => {
            const dateStr = new Date(c.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div key={c.id} className="p-3.5 rounded-xl bg-background/80 border border-white/[0.08] hover:border-white/20 transition-all space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden border border-white/10 bg-card-bg">
                      <img src={c.authorAvatar || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=120&q=80'} alt={c.authorName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">{c.authorName}</span>
                      <span className="text-[10px] text-text-muted font-mono ml-2">{dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Upvote Button */}
                    <button
                      type="button"
                      onClick={() => dispatch(likeRecipeComment({ recipeId, commentId: c.id }))}
                      className="px-2.5 py-1 rounded-lg bg-card-bg/90 border border-white/[0.08] hover:border-accent/40 text-[11px] font-semibold text-text-muted hover:text-accent flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                      title="Mark as helpful"
                    >
                      <span>👍</span>
                      <span>{c.likes}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => dispatch(deleteRecipeComment({ recipeId, commentId: c.id }))}
                      className="text-text-muted hover:text-warning text-xs cursor-pointer px-1"
                      title="Delete comment"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <p className="text-xs text-foreground/90 pl-9.5 leading-relaxed">{c.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
