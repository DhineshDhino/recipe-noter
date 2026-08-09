'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { RootState } from '@/store/store';
import {
  setActivePhase,
  setRecipeName,
  setBaseYield,
  addStep,
  updateStepText,
  deleteStep,
  setEditingStep,
  updateStepDuration,
  updateStepHeat,
  toggleStepCritical,
  reorderSteps,
  moveStepUp,
  moveStepDown,
  addBlock,
  updateBlockName,
  deleteBlock,
  moveBlockUp as moveBlockUpAction,
  moveBlockDown as moveBlockDownAction,
  PhaseKey,
  EditableBlock,
  EditableStep,
} from '@/store/editorSlice';

// --- Phase Configuration ---
const PHASES: { key: PhaseKey; label: string; icon: string; placeholder: string }[] = [
  { key: 'prep', label: 'Prep Phase', icon: '🥄', placeholder: 'e.g., Wash all ingredients thoroughly' },
  { key: 'passive', label: 'Rest / Passive', icon: '⏳', placeholder: 'e.g., Allow the batter to rest for 12 hours' },
  { key: 'cook', label: 'Cooking Phase', icon: '🔥', placeholder: 'e.g., Heat Dosa Tawa on medium flame' },
];

// --- Sub-Components ---

/** Recipe metadata header — name + yield */
const RecipeHeader = ({
  name,
  baseYield,
  onNameChange,
  onYieldChange,
}: {
  name: string;
  baseYield: number;
  onNameChange: (v: string) => void;
  onYieldChange: (v: number) => void;
}) => (
  <header className="space-y-5 border-b border-border-subtle pb-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📝</span>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
          Recipe Editor
        </h1>
      </div>
      <Link
        href="/"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-bg border border-border-subtle hover:border-accent/50 text-text-muted hover:text-foreground text-xs font-semibold transition-colors"
      >
        <span>📖</span>
        <span>Reader View</span>
      </Link>
    </div>
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="recipe-name-input" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          Recipe Name
        </label>
        <input
          id="recipe-name-input"
          type="text"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="e.g., Adai"
          className="w-full bg-card-bg border border-border-subtle rounded-lg px-4 py-2.5 text-foreground text-lg font-medium outline-none placeholder:text-text-muted/50 focus:border-accent transition-colors"
        />
      </div>
      <div className="w-32">
        <label htmlFor="base-yield-input" className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
          Servings
        </label>
        <input
          id="base-yield-input"
          type="number"
          min={1}
          value={baseYield}
          onChange={e => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val > 0) onYieldChange(val);
          }}
          placeholder="e.g., 4"
          className="w-full bg-card-bg border border-border-subtle rounded-lg px-4 py-2.5 text-accent text-lg font-bold text-center outline-none placeholder:text-text-muted/50 focus:border-accent transition-colors tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
  </header>
);

/** Phase tab bar */
const PhaseTabBar = ({
  activePhase,
  onSelect,
  stepCounts,
}: {
  activePhase: PhaseKey;
  onSelect: (phase: PhaseKey) => void;
  stepCounts: Record<PhaseKey, number>;
}) => (
  <nav id="phase-tab-bar" className="flex gap-2" role="tablist" aria-label="Recipe phases">
    {PHASES.map(phase => {
      const isActive = activePhase === phase.key;
      const count = stepCounts[phase.key];
      return (
        <button
          key={phase.key}
          id={`tab-${phase.key}`}
          role="tab"
          aria-selected={isActive}
          aria-controls={`panel-${phase.key}`}
          onClick={() => onSelect(phase.key)}
          className={`
            flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold
            transition-all duration-200 cursor-pointer relative
            ${isActive
              ? 'bg-accent/15 text-accent border-2 border-accent shadow-[0_0_20px_rgba(255,109,0,0.15)]'
              : 'bg-card-bg text-text-muted border border-border-subtle hover:border-accent/40 hover:text-foreground'
            }
          `}
        >
          <span className="text-lg">{phase.icon}</span>
          <span className="hidden sm:inline">{phase.label}</span>
          {count > 0 && (
            <span className={`
              text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center
              ${isActive ? 'bg-accent text-background' : 'bg-border-subtle text-text-muted'}
            `}>
              {count}
            </span>
          )}
          {isActive && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full" />
          )}
        </button>
      );
    })}
  </nav>
);

/** Delete confirmation dialog */
const DeleteConfirmation = ({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="absolute inset-0 bg-background/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3 z-10 animate-[fadeIn_150ms_ease-out]">
    <span className="text-sm text-text-muted mr-1">Delete this step?</span>
    <button
      onClick={onConfirm}
      className="text-xs px-3 py-1.5 rounded-lg bg-warning text-white font-bold hover:bg-warning/80 transition-colors cursor-pointer"
    >
      Delete
    </button>
    <button
      onClick={onCancel}
      className="text-xs px-3 py-1.5 rounded-lg bg-border-subtle text-foreground font-medium hover:bg-border-subtle/80 transition-colors border border-border-subtle cursor-pointer"
    >
      Cancel
    </button>
  </div>
);

/** Single step card — numbered, with inline edit, metadata drawer, reordering controls, and delete */
const StepCard = ({
  step,
  index,
  totalSteps,
  phase,
  blockId,
  isEditing,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  dispatch,
}: {
  step: EditableStep;
  index: number;
  totalSteps: number;
  phase: PhaseKey;
  blockId: string;
  isEditing: boolean;
  onStartEdit: () => void;
  onSaveEdit: (text: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  dispatch: ReturnType<typeof useDispatch>;
}) => {
  const [editText, setEditText] = useState(step.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Sync edit text when step text changes externally
  useEffect(() => {
    if (!isEditing) setEditText(step.text);
  }, [step.text, isEditing]);

  const handleSaveText = () => {
    const trimmed = editText.trim();
    if (trimmed) {
      onSaveEdit(trimmed);
    } else {
      onCancelEdit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveText();
    } else if (e.key === 'Escape') {
      setEditText(step.text);
      onCancelEdit();
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fromIndexStr = e.dataTransfer.getData('text/plain');
    const fromIndex = parseInt(fromIndexStr, 10);
    if (!isNaN(fromIndex) && fromIndex !== index) {
      dispatch(reorderSteps({ phase, blockId, fromIndex, toIndex: index }));
    }
  };

  const handleDurationChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(
        updateStepDuration({
          phase,
          blockId,
          stepId: step.id,
          duration: {
            value: val,
            isYieldDependent: step.duration?.isYieldDependent ?? false,
          },
        })
      );
    } else if (valStr === '') {
      dispatch(
        updateStepDuration({
          phase,
          blockId,
          stepId: step.id,
          duration: undefined,
        })
      );
    }
  };

  const handleYieldDepToggle = (checked: boolean) => {
    if (step.duration) {
      dispatch(
        updateStepDuration({
          phase,
          blockId,
          stepId: step.id,
          duration: {
            ...step.duration,
            isYieldDependent: checked,
          },
        })
      );
    } else {
      dispatch(
        updateStepDuration({
          phase,
          blockId,
          stepId: step.id,
          duration: {
            value: 5,
            isYieldDependent: checked,
          },
        })
      );
    }
  };

  const handleHeatIntensityChange = (intensity: 'None' | 'Low' | 'Medium' | 'High') => {
    if (intensity === 'None') {
      dispatch(updateStepHeat({ phase, blockId, stepId: step.id, heat: undefined }));
    } else {
      dispatch(
        updateStepHeat({
          phase,
          blockId,
          stepId: step.id,
          heat: {
            intensity,
            precisionTemp: step.heat?.precisionTemp,
          },
        })
      );
    }
  };

  const handleHeatTempChange = (tempStr: string) => {
    const temp = parseInt(tempStr, 10);
    const intensity = step.heat?.intensity ?? 'Medium';
    if (!isNaN(temp) && temp > 0) {
      dispatch(
        updateStepHeat({
          phase,
          blockId,
          stepId: step.id,
          heat: { intensity, precisionTemp: temp },
        })
      );
    } else if (tempStr === '') {
      dispatch(
        updateStepHeat({
          phase,
          blockId,
          stepId: step.id,
          heat: { intensity },
        })
      );
    }
  };

  const handleToggleCritical = () => {
    dispatch(toggleStepCritical({ phase, blockId, stepId: step.id }));
  };

  const hasMetadata = Boolean(step.duration || step.heat || step.isCritical);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        group relative flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200
        ${isDragOver
          ? 'bg-accent/15 border-2 border-accent shadow-[0_0_20px_rgba(255,109,0,0.25)] scale-[1.01]'
          : step.isCritical
            ? 'bg-warning/5 border-warning/60 shadow-[0_0_16px_rgba(255,170,0,0.1)]'
            : isEditing
              ? 'bg-card-bg border-accent shadow-[0_0_16px_rgba(255,109,0,0.1)]'
              : 'bg-card-bg border-border-subtle hover:border-accent/40'
        }
        animate-[slideIn_200ms_ease-out]
      `}
    >
      {/* Top Header Row: Drag handle, Index, Text/Input, Badges & Action buttons */}
      <div className="flex items-start gap-2.5">
        {/* Drag Handle */}
        <div
          draggable
          onDragStart={handleDragStart}
          className="flex-shrink-0 cursor-grab active:cursor-grabbing text-text-muted/40 hover:text-accent select-none text-base px-0.5 mt-0.5 transition-colors"
          title="Drag to reorder step"
          aria-label={`Drag handle for step ${index + 1}`}
        >
          ⠿
        </div>

        {/* Step Number */}
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center mt-0.5 ${
            step.isCritical
              ? 'bg-warning/20 text-warning'
              : 'bg-accent/15 text-accent'
          }`}
        >
          {index + 1}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={handleSaveText}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-foreground text-sm outline-none border-b border-accent/50 pb-1 placeholder:text-text-muted/50"
              placeholder="Enter step description..."
            />
          ) : (
            <div>
              <p
                onClick={onStartEdit}
                className="text-foreground text-sm leading-relaxed cursor-text hover:text-accent transition-colors select-none"
                title="Click to edit"
              >
                {step.text}
              </p>

              {/* Collapsed Metadata Badges */}
              {hasMetadata && !showDetails && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {step.isCritical && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning border border-warning/30">
                      ⚠️ Critical Step
                    </span>
                  )}
                  {step.duration && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-border-subtle/40 text-foreground border border-border-subtle">
                      ⏱️ {step.duration.value} min
                      {step.duration.isYieldDependent && (
                        <span className="text-accent text-[10px] font-bold" title="Scales with yield">
                          (scaled)
                        </span>
                      )}
                    </span>
                  )}
                  {step.heat && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-border-subtle/40 text-foreground border border-border-subtle">
                      🔥 {step.heat.intensity}
                      {step.heat.precisionTemp && ` (${step.heat.precisionTemp}°C)`}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Move Up / Down Buttons */}
            <button
              onClick={() => dispatch(moveStepUp({ phase, blockId, stepId: step.id }))}
              disabled={index === 0}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-text-muted flex items-center justify-center transition-colors text-xs cursor-pointer disabled:cursor-not-allowed"
              title="Move step up"
              aria-label={`Move step ${index + 1} up`}
            >
              ↑
            </button>
            <button
              onClick={() => dispatch(moveStepDown({ phase, blockId, stepId: step.id }))}
              disabled={index === totalSteps - 1}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-text-muted flex items-center justify-center transition-colors text-xs cursor-pointer disabled:cursor-not-allowed"
              title="Move step down"
              aria-label={`Move step ${index + 1} down`}
            >
              ↓
            </button>

            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer ${
                showDetails || hasMetadata
                  ? 'bg-accent/20 text-accent'
                  : 'bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10'
              }`}
              title={showDetails ? 'Hide step details' : 'Step details (duration, heat, critical)'}
              aria-label={`Details for step ${index + 1}`}
            >
              ⚙️
            </button>
            <button
              onClick={onStartEdit}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 flex items-center justify-center transition-colors text-xs cursor-pointer"
              title="Edit step text"
              aria-label={`Edit step ${index + 1}`}
            >
              ✏️
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-warning hover:bg-warning/10 flex items-center justify-center transition-colors text-xs cursor-pointer"
              title="Delete step"
              aria-label={`Delete step ${index + 1}`}
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Expanded Step Details Drawer */}
      {showDetails && (
        <div className="mt-2 pt-3 border-t border-border-subtle/60 flex flex-wrap gap-4 text-xs animate-[fadeIn_150ms_ease-out]">
          {/* Duration Input */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider">
              Duration (mins)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={step.duration?.value ?? ''}
                onChange={e => handleDurationChange(e.target.value)}
                placeholder="e.g., 10"
                className="w-20 bg-background border border-border-subtle rounded-md px-2 py-1 text-foreground font-medium outline-none focus:border-accent text-xs"
              />
              <label className="flex items-center gap-1 cursor-pointer text-text-muted hover:text-foreground">
                <input
                  type="checkbox"
                  checked={step.duration?.isYieldDependent ?? false}
                  onChange={e => handleYieldDepToggle(e.target.checked)}
                  className="rounded border-border-subtle text-accent focus:ring-accent accent-accent"
                />
                <span>Scales with yield</span>
              </label>
            </div>
          </div>

          {/* Heat Input */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider">
              Heat Intensity
            </label>
            <div className="flex items-center gap-2">
              <select
                value={step.heat?.intensity ?? 'None'}
                onChange={e =>
                  handleHeatIntensityChange(
                    e.target.value as 'None' | 'Low' | 'Medium' | 'High'
                  )
                }
                className="bg-background border border-border-subtle rounded-md px-2 py-1 text-foreground font-medium outline-none focus:border-accent text-xs"
              >
                <option value="None">None</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {step.heat && step.heat.intensity !== 'None' && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={step.heat.precisionTemp ?? ''}
                    onChange={e => handleHeatTempChange(e.target.value)}
                    placeholder="180"
                    className="w-16 bg-background border border-border-subtle rounded-md px-2 py-1 text-foreground font-medium outline-none focus:border-accent text-xs"
                  />
                  <span className="text-text-muted">°C</span>
                </div>
              )}
            </div>
          </div>

          {/* Critical Toggle */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider">
              Step Importance
            </label>
            <button
              type="button"
              onClick={handleToggleCritical}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                step.isCritical
                  ? 'bg-warning/20 text-warning border-warning/50'
                  : 'bg-background text-text-muted border-border-subtle hover:border-warning/40 hover:text-foreground'
              }`}
            >
              <span>{step.isCritical ? '⚠️ Critical Step' : 'Normal'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};

/** Add step form — text input + optional inline metadata + add button */
const AddStepForm = ({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (stepData: {
    text: string;
    duration?: { value: number; isYieldDependent: boolean };
    heat?: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number };
    isCritical?: boolean;
  }) => void;
}) => {
  const [text, setText] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const [durationMins, setDurationMins] = useState('');
  const [isYieldDep, setIsYieldDep] = useState(false);
  const [heatIntensity, setHeatIntensity] = useState<'None' | 'Low' | 'Medium' | 'High'>('None');
  const [heatTemp, setHeatTemp] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasMetadataInput = Boolean(
    (durationMins && parseInt(durationMins, 10) > 0) ||
    heatIntensity !== 'None' ||
    isCritical
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    let duration: { value: number; isYieldDependent: boolean } | undefined;
    const durVal = parseInt(durationMins, 10);
    if (!isNaN(durVal) && durVal > 0) {
      duration = { value: durVal, isYieldDependent: isYieldDep };
    }

    let heat: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number } | undefined;
    if (heatIntensity !== 'None') {
      const tempVal = parseInt(heatTemp, 10);
      heat = {
        intensity: heatIntensity,
        precisionTemp: !isNaN(tempVal) && tempVal > 0 ? tempVal : undefined,
      };
    }

    onAdd({
      text: trimmed,
      duration,
      heat,
      isCritical,
    });

    // Reset form
    setText('');
    setDurationMins('');
    setIsYieldDep(false);
    setHeatIntensity('None');
    setHeatTemp('');
    setIsCritical(false);
    setShowMetadata(false);

    // Re-focus input for rapid sequential entry
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-4 p-3 bg-card-bg/40 border border-border-subtle rounded-xl">
      {/* Top Input Row */}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id="add-step-input"
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-background border border-border-subtle rounded-lg px-4 py-2.5 text-foreground text-sm outline-none placeholder:text-text-muted/40 focus:border-accent transition-colors"
        />
        <button
          type="button"
          onClick={() => setShowMetadata(!showMetadata)}
          className={`h-10 px-3 rounded-lg flex items-center gap-1.5 border text-xs font-semibold transition-all cursor-pointer ${
            showMetadata || hasMetadataInput
              ? 'bg-accent/20 text-accent border-accent/50'
              : 'bg-background text-text-muted border-border-subtle hover:text-foreground hover:border-accent/40'
          }`}
          title="Add step details (duration, heat, critical)"
        >
          <span>⚙️</span>
          <span className="hidden sm:inline">Details</span>
          {hasMetadataInput && (
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          )}
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="h-10 px-5 rounded-lg bg-accent text-background text-sm font-bold hover:bg-accent/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
        >
          + Add Step
        </button>
      </div>

      {/* Expandable Optional Metadata Inputs at creation time */}
      {showMetadata && (
        <div className="pt-2 mt-1 border-t border-border-subtle/50 flex flex-wrap gap-4 text-xs animate-[fadeIn_150ms_ease-out]">
          {/* Duration */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider">
              Duration (mins)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={durationMins}
                onChange={e => setDurationMins(e.target.value)}
                placeholder="e.g., 10"
                className="w-20 bg-background border border-border-subtle rounded-md px-2 py-1 text-foreground font-medium outline-none focus:border-accent text-xs"
              />
              <label className="flex items-center gap-1 cursor-pointer text-text-muted hover:text-foreground">
                <input
                  type="checkbox"
                  checked={isYieldDep}
                  onChange={e => setIsYieldDep(e.target.checked)}
                  className="rounded border-border-subtle text-accent focus:ring-accent accent-accent"
                />
                <span>Scales with yield</span>
              </label>
            </div>
          </div>

          {/* Heat */}
          <div className="flex flex-col gap-1 min-w-[160px]">
            <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider">
              Heat Intensity
            </label>
            <div className="flex items-center gap-2">
              <select
                value={heatIntensity}
                onChange={e => setHeatIntensity(e.target.value as 'None' | 'Low' | 'Medium' | 'High')}
                className="bg-background border border-border-subtle rounded-md px-2 py-1 text-foreground font-medium outline-none focus:border-accent text-xs"
              >
                <option value="None">None</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              {heatIntensity !== 'None' && (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={heatTemp}
                    onChange={e => setHeatTemp(e.target.value)}
                    placeholder="180"
                    className="w-16 bg-background border border-border-subtle rounded-md px-2 py-1 text-foreground font-medium outline-none focus:border-accent text-xs"
                  />
                  <span className="text-text-muted">°C</span>
                </div>
              )}
            </div>
          </div>

          {/* Critical Toggle */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider">
              Step Importance
            </label>
            <button
              type="button"
              onClick={() => setIsCritical(!isCritical)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                isCritical
                  ? 'bg-warning/20 text-warning border-warning/50'
                  : 'bg-background text-text-muted border-border-subtle hover:border-warning/40 hover:text-foreground'
              }`}
            >
              <span>{isCritical ? '⚠️ Critical Step' : 'Normal'}</span>
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

/** Block card containing steps + add form */
const BlockPanel = ({
  block,
  blockIndex,
  totalBlocks,
  phase,
  placeholder,
  editingStepId,
  dispatch,
}: {
  block: EditableBlock;
  blockIndex: number;
  totalBlocks: number;
  phase: PhaseKey;
  placeholder: string;
  editingStepId: string | null;
  dispatch: ReturnType<typeof useDispatch>;
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(block.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setNameInput(block.name);
  }, [block.name]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      dispatch(updateBlockName({ phase, blockId: block.id, name: trimmed }));
    } else {
      setNameInput(block.name);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      setNameInput(block.name);
      setIsEditingName(false);
    }
  };

  const handleAdd = useCallback(
    (stepData: {
      text: string;
      duration?: { value: number; isYieldDependent: boolean };
      heat?: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number };
      isCritical?: boolean;
    }) => {
      dispatch(addStep({ phase, blockId: block.id, ...stepData }));
    },
    [dispatch, phase, block.id]
  );

  return (
    <div className="relative bg-card-bg/50 border border-border-subtle rounded-2xl p-5 sm:p-6 transition-all duration-200">
      {/* Block Header */}
      <div className="flex items-center gap-3 mb-4 group/block">
        <span className="w-1.5 h-6 rounded-full bg-accent flex-shrink-0" />

        {/* Inline Editable Block Name */}
        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleNameKeyDown}
              className="bg-transparent text-base font-semibold text-foreground border-b border-accent outline-none w-full"
              placeholder="Component block name..."
            />
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="text-base font-semibold text-foreground hover:text-accent cursor-text transition-colors flex items-center gap-2 group/title"
              title="Click to rename block"
            >
              <span>{block.name}</span>
              <span className="text-xs opacity-0 group-hover/title:opacity-100 text-text-muted hover:text-accent transition-opacity">
                ✏️
              </span>
            </h3>
          )}
        </div>

        {/* Step Count Badge */}
        <span className="text-xs text-text-muted">
          {block.steps.length} {block.steps.length === 1 ? 'step' : 'steps'}
        </span>

        {/* Block Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
          <button
            onClick={() => dispatch(moveBlockUpAction({ phase, blockId: block.id }))}
            disabled={blockIndex === 0}
            className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center transition-colors text-xs cursor-pointer disabled:cursor-not-allowed"
            title="Move block up"
            aria-label="Move block up"
          >
            ↑
          </button>
          <button
            onClick={() => dispatch(moveBlockDownAction({ phase, blockId: block.id }))}
            disabled={blockIndex === totalBlocks - 1}
            className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-20 disabled:hover:bg-transparent flex items-center justify-center transition-colors text-xs cursor-pointer disabled:cursor-not-allowed"
            title="Move block down"
            aria-label="Move block down"
          >
            ↓
          </button>
          <button
            onClick={() => {
              if (block.steps.length > 0) {
                setShowDeleteConfirm(true);
              } else {
                dispatch(deleteBlock({ phase, blockId: block.id }));
              }
            }}
            className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-warning hover:bg-warning/10 flex items-center justify-center transition-colors text-xs cursor-pointer"
            title="Delete block"
            aria-label="Delete block"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Delete Confirmation Overlay for Block */}
      {showDeleteConfirm && (
        <DeleteConfirmation
          onConfirm={() => {
            setShowDeleteConfirm(false);
            dispatch(deleteBlock({ phase, blockId: block.id }));
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Steps List */}
      {block.steps.length > 0 ? (
        <div className="space-y-2">
          {block.steps.map((step, i) => (
            <StepCard
              key={step.id}
              step={step}
              index={i}
              totalSteps={block.steps.length}
              phase={phase}
              blockId={block.id}
              isEditing={editingStepId === step.id}
              onStartEdit={() => dispatch(setEditingStep(step.id))}
              onSaveEdit={(text) => {
                dispatch(updateStepText({ phase, blockId: block.id, stepId: step.id, text }));
                dispatch(setEditingStep(null));
              }}
              onCancelEdit={() => dispatch(setEditingStep(null))}
              onDelete={() => dispatch(deleteStep({ phase, blockId: block.id, stepId: step.id }))}
              dispatch={dispatch}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-text-muted/50 text-sm border border-dashed border-border-subtle rounded-xl">
          No steps yet — add your first step below
        </div>
      )}

      {/* Add Step Form */}
      <AddStepForm placeholder={placeholder} onAdd={handleAdd} />
    </div>
  );
};

// --- MAIN EDITOR PAGE ---

export default function EditorPage() {
  const dispatch = useDispatch();
  const {
    recipeName,
    baseYield,
    activePhase,
    prepBlocks,
    passiveBlocks,
    cookBlocks,
    editingStepId,
  } = useSelector((state: RootState) => state.editor);

  // Compute step counts for each phase (for the tab badges)
  const stepCounts: Record<PhaseKey, number> = {
    prep: prepBlocks.reduce((acc, b) => acc + b.steps.length, 0),
    passive: passiveBlocks.reduce((acc, b) => acc + b.steps.length, 0),
    cook: cookBlocks.reduce((acc, b) => acc + b.steps.length, 0),
  };

  // Get active phase's blocks & config
  const activePhaseConfig = PHASES.find(p => p.key === activePhase)!;
  const activeBlocks = activePhase === 'prep'
    ? prepBlocks
    : activePhase === 'passive'
      ? passiveBlocks
      : cookBlocks;

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Recipe Header */}
      <RecipeHeader
        name={recipeName}
        baseYield={baseYield}
        onNameChange={v => dispatch(setRecipeName(v))}
        onYieldChange={v => dispatch(setBaseYield(v))}
      />

      {/* Phase Tabs */}
      <PhaseTabBar
        activePhase={activePhase}
        onSelect={phase => dispatch(setActivePhase(phase))}
        stepCounts={stepCounts}
      />

      {/* Active Phase Panel */}
      <section
        id={`panel-${activePhase}`}
        role="tabpanel"
        aria-labelledby={`tab-${activePhase}`}
        className="flex flex-col gap-4"
      >
        {/* Phase description */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activePhaseConfig.icon}</span>
            <h2 className="text-xl font-semibold text-foreground">{activePhaseConfig.label}</h2>
          </div>
          <span className="text-xs text-text-muted">
            {activeBlocks.length} {activeBlocks.length === 1 ? 'block' : 'blocks'}
          </span>
        </div>

        {/* Blocks */}
        {activeBlocks.map((block, idx) => (
          <BlockPanel
            key={block.id}
            block={block}
            blockIndex={idx}
            totalBlocks={activeBlocks.length}
            phase={activePhase}
            placeholder={activePhaseConfig.placeholder}
            editingStepId={editingStepId}
            dispatch={dispatch}
          />
        ))}

        {/* Add Component Block Button */}
        <button
          onClick={() => dispatch(addBlock({ phase: activePhase }))}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-accent/40 bg-accent/5 hover:bg-accent/15 text-accent font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-accent"
        >
          <span className="text-lg">+</span>
          <span>Add Component Block to {activePhaseConfig.label}</span>
        </button>
      </section>
    </div>
  );
}
