'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  pauseGlobalTimer,
  resumeGlobalTimer,
  resetGlobalTimer,
  dismissGlobalTimer,
  tickGlobalTimers,
  ActiveTimer,
} from '@/store/recipeSlice';
import { playTimerChime } from '@/lib/utils';

export default function GlobalTimersBar() {
  const dispatch = useDispatch();
  const activeTimers = useSelector((state: RootState) => state.recipe?.activeTimers) || {};
  const timersList = Object.values(activeTimers);

  // Keep track of which timers already played their completion chime to avoid repeated beeps
  const chimedTimersRef = useRef<Set<string>>(new Set());

  // Global interval ticking active timers
  useEffect(() => {
    const hasRunningTimer = timersList.some((t) => t.isRunning);
    if (!hasRunningTimer) return;

    const interval = setInterval(() => {
      dispatch(tickGlobalTimers());
    }, 1000);

    return () => clearInterval(interval);
  }, [timersList, dispatch]);

  // Check for newly completed timers and trigger audio chime
  useEffect(() => {
    timersList.forEach((timer) => {
      if (timer.isCompleted && !chimedTimersRef.current.has(timer.id)) {
        chimedTimersRef.current.add(timer.id);
        playTimerChime();
      } else if (!timer.isCompleted && chimedTimersRef.current.has(timer.id)) {
        // If reset, clear chimed tracking
        chimedTimersRef.current.delete(timer.id);
      }
    });
  }, [timersList]);

  if (timersList.length === 0) return null;

  const formatTimerDuration = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <aside
      aria-label="Active Kitchen Timers"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-[slideUp_200ms_ease-out]"
    >
      <div className="bg-[#141519]/95 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] rounded-2xl p-3.5 sm:p-4 text-foreground ring-1 ring-white/10">
        {/* Header summary */}
        <div className="flex items-center justify-between gap-3 mb-2.5 px-1 border-b border-white/[0.08] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm">⏱️</span>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
              Active Kitchen Timers
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-mono font-bold border border-accent/30 shadow-xs">
              {timersList.length} Active
            </span>
          </div>
          <p className="text-[10px] text-text-muted hidden sm:block">
            Tracking concurrent cooking & resting processes
          </p>
        </div>

        {/* Timers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
          {timersList.map((timer: ActiveTimer) => {
            const percentElapsed = timer.totalDurationSeconds > 0
              ? Math.round(((timer.totalDurationSeconds - timer.remainingSeconds) / timer.totalDurationSeconds) * 100)
              : 100;

            return (
              <div
                key={timer.id}
                className={`p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between shadow-xs ${
                  timer.isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)] animate-pulse'
                    : timer.isRunning
                    ? 'bg-card-bg/95 border-accent/40 shadow-sm'
                    : 'bg-card-bg/70 border-white/[0.08] opacity-90'
                }`}
              >
                {/* Progress bar background */}
                <div
                  className={`absolute bottom-0 left-0 h-1 transition-all duration-300 ${
                    timer.isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-accent shadow-[0_0_8px_rgba(255,109,0,0.6)]'
                  }`}
                  style={{ width: `${percentElapsed}%` }}
                />

                {/* Top Info */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent truncate block">
                      {timer.blockName || timer.phase || 'Cooking Step'}
                    </span>
                    <h4 className="text-xs font-semibold text-foreground truncate" title={timer.label}>
                      {timer.label}
                    </h4>
                  </div>
                  <button
                    onClick={() => dispatch(dismissGlobalTimer(timer.id))}
                    className="text-text-muted hover:text-foreground text-xs p-1 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer"
                    title="Dismiss timer"
                    aria-label={`Dismiss timer for ${timer.label}`}
                  >
                    ✕
                  </button>
                </div>

                {/* Digital Clock & Controls */}
                <div className="flex items-center justify-between gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-base font-mono font-bold tracking-tight ${
                        timer.isCompleted
                          ? 'text-emerald-400 font-extrabold'
                          : timer.isRunning
                          ? 'text-accent'
                          : 'text-foreground'
                      }`}
                    >
                      {timer.isCompleted ? '🎉 DONE' : formatTimerDuration(timer.remainingSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!timer.isCompleted ? (
                      timer.isRunning ? (
                        <button
                          onClick={() => dispatch(pauseGlobalTimer(timer.id))}
                          className="px-2.5 py-1 rounded-lg bg-card-bg/90 border border-white/[0.08] hover:border-accent/40 text-[10px] font-bold text-foreground transition-all cursor-pointer shadow-xs"
                          title="Pause"
                        >
                          ⏸️ Pause
                        </button>
                      ) : (
                        <button
                          onClick={() => dispatch(resumeGlobalTimer(timer.id))}
                          className="px-2.5 py-1 rounded-lg bg-accent text-background text-[10px] font-bold hover:bg-accent/80 transition-all shadow-[0_0_10px_rgba(255,109,0,0.3)] cursor-pointer"
                          title="Resume"
                        >
                          ▶️ Start
                        </button>
                      )
                    ) : null}

                    <button
                      onClick={() => dispatch(resetGlobalTimer(timer.id))}
                      className="px-2.5 py-1 rounded-lg bg-card-bg/90 border border-white/[0.08] hover:border-accent/40 text-[10px] font-bold text-text-muted hover:text-foreground transition-all cursor-pointer shadow-xs"
                      title="Reset"
                    >
                      ↺
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
