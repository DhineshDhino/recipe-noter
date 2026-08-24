'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store/store';
import {
  setActivePhase,
  setRecipeName,
  setBaseYield,
  addEquipment,
  removeEquipment,
  addPairing,
  removePairing,
  setVersionName,
  setAuthor,
  addStep,
  updateStepText,
  deleteStep,
  setEditingStep,
  updateStepDuration,
  updateStepHeat,
  toggleStepCritical,
  linkIngredientToStep,
  unlinkIngredientFromStep,
  reorderSteps,
  moveStepUp,
  moveStepDown,
  addBlock,
  addBlockIngredient,
  updateBlockIngredient,
  removeBlockIngredient,
  setIngredientCriticality,
  updateBlockName,
  deleteBlock,
  moveBlockUp as moveBlockUpAction,
  moveBlockDown as moveBlockDownAction,
  addRatioGroup,
  updateRatioGroup,
  deleteRatioGroup,
  addRatioGroupMember,
  removeRatioGroupMember,
  addMasterIngredient,
  updateMasterIngredient,
  removeMasterIngredient,
  addStepImage,
  removeStepImage,
  updateStepImage,
  loadRecipeIntoEditor,
  resetEditorState,
  toggleMealSlot,
  toggleDietaryCategory,
  setDifficulty,
  PhaseKey,
  EditableBlock,
  EditableStep,
  EditableScopedIngredient,
} from '@/store/editorSlice';
import { loadRecipe } from '@/store/recipeSlice';
import { mockAdaiRecipe } from '@/lib/mockRecipe';
import { formatIngredientName, formatTime, exportEditorToRecipe, calculateScaledQuantity } from '@/lib/utils';
import { IngredientRegistry, StepImageStage, StepImage, PoolPhoto, MealSlot, DietaryCategory, RecipeDifficulty } from '@/lib/types';
import MediaPoolManager from '@/components/MediaPoolManager';
import StepAutocompleteInput from '@/components/StepAutocompleteInput';

// --- Phase Configuration ---
const PHASES: { key: PhaseKey; label: string; icon: string; placeholder: string }[] = [
  { key: 'setup', label: 'Setup', icon: '📋', placeholder: '' },
  { key: 'prep', label: 'Prep Phase', icon: '🥄', placeholder: 'e.g., Wash all ingredients thoroughly' },
  { key: 'passive', label: 'Rest / Passive', icon: '⏳', placeholder: 'e.g., Allow the batter to rest for 12 hours' },
  { key: 'cook', label: 'Cooking Phase', icon: '🔥', placeholder: 'e.g., Heat Dosa Tawa on medium flame' },
];

// --- Sub-Components ---

/** Recipe metadata header — name, yield, preview, and publish */
const RecipeHeader = ({
  name,
  baseYield,
  onNameChange,
  onYieldChange,
  onPreview,
  onPublish,
}: {
  name: string;
  baseYield: number;
  onNameChange: (v: string) => void;
  onYieldChange: (v: number) => void;
  onPreview: () => void;
  onPublish: () => void;
}) => (
  <header className="space-y-5 border-b border-border-subtle pb-6">
    {/* Breadcrumbs & Status */}
    <div className="flex items-center justify-between text-xs text-text-muted">
      <div className="flex items-center gap-2">
        <span>🍳 What 2 Cook</span>
        <span>/</span>
        <span className="text-accent font-semibold">📝 Noter Studio</span>
        <span>/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">{name || 'New Recipe'}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-amber-300 font-mono text-[11px] font-semibold">Draft Mode</span>
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📝</span>
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Recipe Editor
          </h1>
          <p className="text-xs text-text-muted">Modular recipe builder with phase-by-phase authoring</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-bg border border-border-subtle hover:border-accent/50 text-foreground text-xs font-semibold transition-colors"
        >
          <span>👁️</span>
          <span>Live Preview</span>
        </button>
        <button
          onClick={onPublish}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-background font-bold text-xs hover:bg-accent/80 transition-colors shadow-sm"
        >
          <span>🚀</span>
          <span>Publish & Cook</span>
        </button>
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card-bg border border-border-subtle hover:border-accent/50 text-text-muted hover:text-foreground text-xs font-semibold transition-colors"
        >
          <span>📖</span>
          <span>Reader</span>
        </Link>
      </div>
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

/** Single step card */
const StepCard = ({
  step,
  index,
  totalSteps,
  phase,
  blockId,
  isEditing,
  masterIngredients,
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
  masterIngredients: IngredientRegistry[];
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
  const [isPhotoDragOver, setIsPhotoDragOver] = useState(false);
  const [showPoolPicker, setShowPoolPicker] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageStage, setNewImageStage] = useState<StepImageStage>('while_cooking');
  const [newImageCaption, setNewImageCaption] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const photoPool = useSelector((state: RootState) => state.editor.photoPool || []);

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    dispatch(
      addStepImage({
        phase,
        blockId,
        stepId: step.id,
        image: {
          url: newImageUrl.trim(),
          stage: newImageStage,
          caption: newImageCaption.trim() || undefined,
        },
      })
    );
    setNewImageUrl('');
    setNewImageCaption('');
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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
      onCancelEdit();
    }
  };

  const handleDurationChange = (val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      dispatch(updateStepDuration({ phase, blockId, stepId: step.id, duration: undefined }));
    } else {
      dispatch(
        updateStepDuration({
          phase,
          blockId,
          stepId: step.id,
          duration: { value: num, isYieldDependent: step.duration?.isYieldDependent ?? false },
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
          duration: { ...step.duration, isYieldDependent: checked },
        })
      );
    }
  };

  const handleHeatIntensityChange = (val: 'None' | 'Low' | 'Medium' | 'High') => {
    if (val === 'None') {
      dispatch(updateStepHeat({ phase, blockId, stepId: step.id, heat: undefined }));
    } else {
      dispatch(
        updateStepHeat({
          phase,
          blockId,
          stepId: step.id,
          heat: { intensity: val, precisionTemp: step.heat?.precisionTemp },
        })
      );
    }
  };

  const handleHeatTempChange = (val: string) => {
    const num = parseInt(val, 10);
    if (step.heat) {
      dispatch(
        updateStepHeat({
          phase,
          blockId,
          stepId: step.id,
          heat: { ...step.heat, precisionTemp: isNaN(num) ? undefined : num },
        })
      );
    }
  };

  const handleToggleCritical = () => {
    dispatch(toggleStepCritical({ phase, blockId, stepId: step.id }));
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', String(index));
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

  const hasMetadata = Boolean(
    step.duration ||
      step.heat ||
      step.isCritical ||
      (step.linkedIngredients && step.linkedIngredients.length > 0) ||
      (step.images && step.images.length > 0)
  );

  return (
    <div
      id={`step-card-${step.id}`}
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragOver={e => {
        if (e.dataTransfer.types.includes('application/json')) {
          e.preventDefault();
          e.stopPropagation();
          setIsPhotoDragOver(true);
        } else {
          handleDragOver(e);
        }
      }}
      onDragLeave={e => {
        setIsPhotoDragOver(false);
        handleDragLeave();
      }}
      onDrop={e => {
        if (e.dataTransfer.types.includes('application/json')) {
          e.preventDefault();
          e.stopPropagation();
          setIsPhotoDragOver(false);
          try {
            const raw = e.dataTransfer.getData('application/json');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed && parsed.url) {
                dispatch(
                  addStepImage({
                    phase,
                    blockId,
                    stepId: step.id,
                    image: {
                      url: parsed.url,
                      stage: parsed.stage || 'while_cooking',
                      caption: parsed.caption,
                    },
                  })
                );
              }
            }
          } catch (err) {}
        } else {
          handleDrop(e);
        }
      }}
      className={`
        relative rounded-xl border p-4 transition-all duration-150 group
        ${isDragOver ? 'border-accent bg-accent/10 scale-[1.01]' : ''}
        ${isPhotoDragOver ? 'border-accent ring-2 ring-accent bg-accent/20 scale-[1.01]' : ''}
        ${step.isCritical
          ? 'bg-card-bg border-warning/50 shadow-[0_0_12px_rgba(255,59,48,0.1)]'
          : 'bg-card-bg border-border-subtle hover:border-accent/40'
        }
      `}
    >
      {/* Drop overlay for photo */}
      {isPhotoDragOver && (
        <div className="absolute inset-0 z-30 bg-accent/25 border-2 border-dashed border-accent rounded-xl backdrop-blur-xs flex items-center justify-center text-accent font-bold text-xs gap-2">
          <span>📥</span>
          <span>Drop photo here to attach to this step!</span>
        </div>
      )}
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <span
          className="text-text-muted hover:text-accent cursor-grab active:cursor-grabbing select-none text-base mt-0.5"
          title="Drag to reorder"
          aria-label="Drag handle"
        >
          ⠿
        </span>

        {/* Step Number */}
        <span className={`
          flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono
          ${step.isCritical ? 'bg-warning text-white' : 'bg-border-subtle text-foreground'}
        `}>
          {index + 1}
        </span>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <StepAutocompleteInput
                inputRef={inputRef}
                value={editText}
                onChange={setEditText}
                onKeyDown={handleKeyDown}
                onSelectIngredient={ing => {
                  dispatch(linkIngredientToStep({ phase, blockId, stepId: step.id, ingredientId: ing.id }));
                }}
                masterIngredients={masterIngredients}
                className="flex-1 bg-background border border-accent rounded-lg px-3 py-1.5 text-foreground text-sm outline-none"
              />
              <button
                onMouseDown={e => { e.preventDefault(); handleSaveText(); }}
                className="text-xs px-2.5 py-1 rounded bg-accent text-background font-bold hover:bg-accent/80 cursor-pointer"
              >
                Save
              </button>
              <button
                onMouseDown={e => { e.preventDefault(); onCancelEdit(); }}
                className="text-xs px-2.5 py-1 rounded bg-border-subtle text-foreground hover:bg-border-subtle/80 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p
              onClick={onStartEdit}
              className={`text-sm leading-relaxed cursor-pointer ${
                step.isCritical ? 'text-foreground font-medium' : 'text-foreground/90'
              }`}
              title="Click to edit step text"
            >
              {step.text}
            </p>
          )}

          {/* Metadata Badges */}
          {!isEditing && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {step.isCritical && (
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-warning text-white shadow-[0_0_8px_rgba(255,59,48,0.4)]">
                  Critical
                </span>
              )}
              {step.duration && (
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-border-subtle text-foreground border border-border-subtle">
                  ⏱ {formatTime(step.duration.value)}
                  {step.duration.isYieldDependent ? (
                    <span className="text-accent ml-1 font-sans">⚡ (Scales with Servings)</span>
                  ) : (
                    <span className="text-text-muted ml-1 font-sans">(Fixed Time)</span>
                  )}
                </span>
              )}
              {step.heat && (
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded font-bold bg-accent/10 text-accent border border-accent/20">
                  🔥 {step.heat.intensity} Heat
                  {step.heat.precisionTemp && ` (${step.heat.precisionTemp}°C)`}
                </span>
              )}
              {step.images && step.images.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold bg-card-bg border border-border-subtle text-foreground font-sans">
                  🖼️ {step.images.length} {step.images.length === 1 ? 'Photo' : 'Photos'}
                  <span className="text-text-muted font-normal text-[9px]">
                    {step.images.some(i => i.stage === 'while_cooking') && '👨‍🍳 Process'}
                    {step.images.some(i => i.stage === 'while_cooking') && step.images.some(i => i.stage === 'after_step') && ' • '}
                    {step.images.some(i => i.stage === 'after_step') && '✨ Result'}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isEditing && (
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => dispatch(moveStepUp({ phase, blockId, stepId: step.id }))}
              disabled={index === 0}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-20 flex items-center justify-center transition-colors text-xs cursor-pointer disabled:cursor-not-allowed"
              title="Move step up"
            >
              ↑
            </button>
            <button
              onClick={() => dispatch(moveStepDown({ phase, blockId, stepId: step.id }))}
              disabled={index === totalSteps - 1}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-20 flex items-center justify-center transition-colors text-xs cursor-pointer disabled:cursor-not-allowed"
              title="Move step down"
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
              title="Step details (duration, heat, critical)"
            >
              ⚙️
            </button>
            <button
              onClick={onStartEdit}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent hover:bg-accent/10 flex items-center justify-center transition-colors text-xs cursor-pointer"
              title="Edit step text"
            >
              ✏️
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-warning hover:bg-warning/10 flex items-center justify-center transition-colors text-xs cursor-pointer"
              title="Delete step"
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
              <label className="flex items-center gap-1.5 cursor-pointer text-text-muted hover:text-foreground">
                <input
                  type="checkbox"
                  id={`yield-dep-${step.id}`}
                  checked={step.duration?.isYieldDependent ?? false}
                  onChange={e => handleYieldDepToggle(e.target.checked)}
                  className="rounded border-border-subtle text-accent focus:ring-accent accent-accent w-4 h-4"
                />
                <span className="font-semibold text-xs text-accent">⚡ Scales with servings (yield)</span>
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
              {step.heat && (
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

          {/* Linked Ingredients */}
          <div className="w-full mt-2 pt-2 border-t border-border-subtle/40">
            <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider mb-2 block">
              Linked Ingredients
            </label>
            <div className="flex flex-wrap gap-2 items-center">
              {step.linkedIngredients?.map(ingId => {
                const masterName = formatIngredientName(ingId, masterIngredients);
                return (
                  <span key={ingId} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-accent/10 text-accent border border-accent/20">
                    {masterName}
                    <button
                      type="button"
                      onClick={() => dispatch(unlinkIngredientFromStep({ phase, blockId, stepId: step.id, ingredientId: ingId }))}
                      className="text-accent/60 hover:text-warning transition-colors"
                      title="Unlink ingredient"
                    >
                      ✕
                    </button>
                  </span>
                );
              })}

              <select
                value=""
                onChange={e => {
                  if (e.target.value) {
                    dispatch(linkIngredientToStep({ phase, blockId, stepId: step.id, ingredientId: e.target.value }));
                  }
                }}
                className="bg-background border border-border-subtle rounded-md px-2 py-1 text-foreground font-medium outline-none focus:border-accent text-xs"
              >
                <option value="">+ Link Ingredient</option>
                {masterIngredients
                  .filter(m => !step.linkedIngredients?.includes(m.id))
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.defaultName}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Visual Guidance Images (While Cooking vs After Step) */}
          <div className="w-full mt-3 pt-3 border-t border-border-subtle/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider block">
                🖼️ Step Photos & Visual Guidance ({step.images?.length || 0})
              </label>
              <span className="text-[10px] text-text-muted">
                Configure stage: While Cooking 👨‍🍳 vs. After Step ✨
              </span>
            </div>

            {/* List of attached images */}
            {step.images && step.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {step.images.map((img, imgIdx) => (
                  <div
                    key={img.id || imgIdx}
                    className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border-subtle group/img"
                  >
                    <img
                      src={img.url}
                      alt={img.caption || 'Step reference'}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0 border border-border-subtle"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <select
                          value={img.stage}
                          onChange={e =>
                            dispatch(
                              updateStepImage({
                                phase,
                                blockId,
                                stepId: step.id,
                                imageId: img.id || img.url,
                                stage: e.target.value as StepImageStage,
                              })
                            )
                          }
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border outline-none cursor-pointer ${
                            img.stage === 'while_cooking'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          <option value="while_cooking">👨‍🍳 While Cooking</option>
                          <option value="after_step">✨ After Step (Result)</option>
                        </select>
                      </div>
                      <p className="text-[11px] text-text-muted truncate mt-0.5" title={img.caption}>
                        {img.caption || 'No caption'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          removeStepImage({
                            phase,
                            blockId,
                            stepId: step.id,
                            imageId: img.id || img.url,
                          })
                        )
                      }
                      className="text-text-muted hover:text-warning p-1 text-xs transition-colors"
                      title="Remove image"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Media Bin Picker Trigger */}
            {photoPool.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowPoolPicker(!showPoolPicker)}
                  className="px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/40 text-accent font-bold text-xs hover:bg-accent/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>🖼️</span>
                  <span>Pick from Media Bin ({photoPool.length} available)</span>
                </button>
                <span className="text-[10px] text-text-muted">or drag from Media Bin above</span>
              </div>
            )}

            {/* Media Pool Picker Grid */}
            {showPoolPicker && photoPool.length > 0 && (
              <div className="p-3 bg-background rounded-xl border border-accent/40 space-y-2.5 animate-[fadeIn_150ms_ease-out]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <span>📸</span>
                    <span>Click a Photo to Attach:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPoolPicker(false)}
                    className="text-text-muted hover:text-foreground text-xs cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {photoPool.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        dispatch(
                          addStepImage({
                            phase,
                            blockId,
                            stepId: step.id,
                            image: {
                              url: p.url,
                              stage: p.defaultStage || 'while_cooking',
                              caption: p.caption,
                            },
                          })
                        );
                        setShowPoolPicker(false);
                      }}
                      className="group/p relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-accent cursor-pointer transition-all hover:scale-105 shadow-sm"
                      title={`Click to attach: ${p.caption || 'Photo'}`}
                    >
                      <img src={p.url} alt={p.caption || 'Pool'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/p:opacity-100 transition-opacity flex flex-col items-center justify-center text-accent text-xs font-bold gap-0.5">
                        <span>+ Attach</span>
                        <span className="text-[9px] text-white font-normal truncate max-w-[90%]">
                          {p.defaultStage === 'after_step' ? '✨ Result' : '👨‍🍳 Process'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Image Form */}
            <div className="p-2.5 rounded-lg bg-background/80 border border-dashed border-border-subtle space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="url"
                  placeholder="Paste Image URL (https://...)"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  className="flex-1 min-w-[200px] bg-card-bg border border-border-subtle rounded-md px-2.5 py-1 text-xs text-foreground outline-none focus:border-accent"
                />
                <select
                  value={newImageStage}
                  onChange={e => setNewImageStage(e.target.value as StepImageStage)}
                  className={`text-xs font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer ${
                    newImageStage === 'while_cooking'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  <option value="while_cooking">👨‍🍳 While Cooking</option>
                  <option value="after_step">✨ After Step (Result)</option>
                </select>
                <input
                  type="text"
                  placeholder="Caption (e.g. Thick coarse batter)"
                  value={newImageCaption}
                  onChange={e => setNewImageCaption(e.target.value)}
                  className="flex-1 min-w-[160px] bg-card-bg border border-border-subtle rounded-md px-2.5 py-1 text-xs text-foreground outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={!newImageUrl.trim()}
                  className="px-3 py-1 bg-accent text-background font-bold text-xs rounded-md hover:bg-accent/80 disabled:opacity-40 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                >
                  + Add Photo
                </button>
              </div>

              {/* Sample Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-text-muted">
                <span>Quick Presets:</span>
                {[
                  { label: '🥞 Batter (While Cooking)', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', stage: 'while_cooking' as const, caption: 'Semi-coarse batter texture' },
                  { label: '🔥 Sautéing (While Cooking)', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', stage: 'while_cooking' as const, caption: 'Simmering in the pan' },
                  { label: '✨ Golden Finish (Result)', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', stage: 'after_step' as const, caption: 'Golden crisp roasted outcome' },
                  { label: '☕ Froth Crown (Result)', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', stage: 'after_step' as const, caption: 'Frothy aerated crema finish' },
                ].map((pr, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setNewImageUrl(pr.url);
                      setNewImageStage(pr.stage);
                      setNewImageCaption(pr.caption);
                    }}
                    className="px-2 py-0.5 rounded bg-card-bg hover:bg-border-subtle border border-border-subtle text-foreground text-[10px] transition-colors"
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Linked Ingredients Badges in Collapsed State */}
      {!isEditing && step.linkedIngredients && step.linkedIngredients.length > 0 && !showDetails && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {step.linkedIngredients.map(ingId => {
            const masterName = formatIngredientName(ingId, masterIngredients);
            return (
              <span key={ingId} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                🥕 {masterName}
              </span>
            );
          })}
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

/** Form to add an ingredient to a block */
const AddIngredientForm = ({
  masterIngredients,
  onAdd,
  onCancel,
}: {
  masterIngredients: IngredientRegistry[];
  onAdd: (ingredient: Omit<EditableScopedIngredient, 'id'>) => void;
  onCancel: () => void;
}) => {
  const [ingredientId, setIngredientId] = useState(masterIngredients[0]?.id || '');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('g');
  const [criticalityTier, setCriticalityTier] = useState<'critical' | 'standard' | 'optional'>('standard');
  const [isSpice, setIsSpice] = useState(false);
  const [isSweet, setIsSweet] = useState(false);

  useEffect(() => {
    if (!ingredientId && masterIngredients.length > 0) {
      setIngredientId(masterIngredients[0].id);
    }
  }, [masterIngredients, ingredientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (!ingredientId || isNaN(qty) || qty <= 0) return;

    const tags: ('spice' | 'sweet')[] = [];
    if (isSpice) tags.push('spice');
    if (isSweet) tags.push('sweet');

    onAdd({
      ingredientId,
      quantity: qty,
      unit,
      isOptional: criticalityTier === 'optional',
      isCritical: criticalityTier === 'critical',
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-3.5 bg-background border border-border-subtle rounded-xl space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          value={ingredientId}
          onChange={e => setIngredientId(e.target.value)}
          className="bg-card-bg border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-accent"
        >
          {masterIngredients.map(ing => (
            <option key={ing.id} value={ing.id}>
              {ing.defaultName}
            </option>
          ))}
        </select>

        <div className="flex gap-1">
          <input
            type="number"
            min="0.1"
            step="any"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="Amount"
            className="w-full bg-card-bg border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-accent"
          />
          <select
            value={unit}
            onChange={e => setUnit(e.target.value)}
            className="w-20 bg-card-bg border border-border-subtle rounded-lg px-1.5 py-1.5 text-xs text-foreground outline-none focus:border-accent"
          >
            <option value="g">g</option>
            <option value="ml">ml</option>
            <option value="count">count</option>
            <option value="tbsp">tbsp</option>
            <option value="tsp">tsp</option>
            <option value="cup">cup</option>
            <option value="handful">handful</option>
          </select>
        </div>

        {/* 3-Tier Criticality Selector */}
        <div className="flex items-center bg-card-bg border border-border-subtle rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setCriticalityTier('critical')}
            className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              criticalityTier === 'critical'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
            title="Non-negotiable structural ingredient"
          >
            ⚡ Critical
          </button>
          <button
            type="button"
            onClick={() => setCriticalityTier('standard')}
            className={`flex-1 py-1 px-1.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
              criticalityTier === 'standard'
                ? 'bg-accent/20 text-accent font-bold shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setCriticalityTier('optional')}
            className={`flex-1 py-1 px-1.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              criticalityTier === 'optional'
                ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50 shadow-xs'
                : 'text-text-muted hover:text-foreground'
            }`}
            title="Optional enhancer, topping or garnish"
          >
            ✨ Optional
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={isSpice}
              onChange={e => setIsSpice(e.target.checked)}
              className="rounded border-border-subtle text-red-500"
            />
            <span>🌶️ Spice Tag</span>
          </label>
          <label className="flex items-center gap-1 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={isSweet}
              onChange={e => setIsSweet(e.target.checked)}
              className="rounded border-border-subtle text-amber-400"
            />
            <span>🍯 Sweet Tag</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-xs text-text-muted hover:text-foreground cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 bg-accent text-background text-xs font-bold rounded-lg hover:bg-accent/80 transition-colors cursor-pointer"
          >
            Add Ingredient
          </button>
        </div>
      </div>
    </form>
  );
};

/** Add step form inside a block */
const AddStepForm = ({
  placeholder,
  masterIngredients,
  onAdd,
}: {
  placeholder: string;
  masterIngredients: IngredientRegistry[];
  onAdd: (stepData: {
    text: string;
    duration?: { value: number; isYieldDependent: boolean };
    heat?: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number };
    isCritical?: boolean;
    images?: StepImage[];
  }) => void;
}) => {
  const [text, setText] = useState('');
  const [showMetadata, setShowMetadata] = useState(false);
  const [durationMins, setDurationMins] = useState('');
  const [isYieldDep, setIsYieldDep] = useState(false);
  const [heatIntensity, setHeatIntensity] = useState<'None' | 'Low' | 'Medium' | 'High'>('None');
  const [heatTemp, setHeatTemp] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageStage, setImageStage] = useState<StepImageStage>('while_cooking');
  const [imageCaption, setImageCaption] = useState('');
  const [showAddFormPoolPicker, setShowAddFormPoolPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const photoPool = useSelector((state: RootState) => state.editor.photoPool || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const durNum = parseInt(durationMins, 10);
    const duration = !isNaN(durNum) && durNum > 0 ? { value: durNum, isYieldDependent: isYieldDep } : undefined;

    const heatNum = parseInt(heatTemp, 10);
    const heat =
      heatIntensity !== 'None'
        ? { intensity: heatIntensity, precisionTemp: !isNaN(heatNum) ? heatNum : undefined }
        : undefined;

    const images: StepImage[] | undefined = imageUrl.trim()
      ? [
          {
            url: imageUrl.trim(),
            stage: imageStage,
            caption: imageCaption.trim() || undefined,
          },
        ]
      : undefined;

    onAdd({
      text: trimmed,
      duration,
      heat,
      isCritical,
      images,
    });

    setText('');
    setDurationMins('');
    setIsYieldDep(false);
    setHeatIntensity('None');
    setHeatTemp('');
    setIsCritical(false);
    setImageUrl('');
    setImageCaption('');
    setShowMetadata(false);
    inputRef.current?.focus();
  };

  const hasMetadataInput = durationMins || heatIntensity !== 'None' || isCritical || imageUrl.trim();

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl border border-border-subtle bg-background/60">
      <div className="flex items-center gap-2">
        <StepAutocompleteInput
          inputRef={inputRef}
          id="add-step-input"
          value={text}
          onChange={setText}
          placeholder={placeholder}
          masterIngredients={masterIngredients}
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
          title="Add step details (duration, heat, critical, image)"
        >
          <span>⚙️</span>
          <span className="hidden sm:inline">Details</span>
          {hasMetadataInput && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
        </button>
        <button
          type="submit"
          disabled={!text.trim()}
          className="h-10 px-5 rounded-lg bg-accent text-background text-sm font-bold hover:bg-accent/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
        >
          + Add Step
        </button>
      </div>

      {showMetadata && (
        <div className="pt-3 mt-2 border-t border-border-subtle/50 flex flex-wrap gap-4 text-xs animate-[fadeIn_150ms_ease-out]">
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
              <label className="flex items-center gap-1.5 cursor-pointer text-text-muted hover:text-foreground">
                <input
                  type="checkbox"
                  id="add-step-yield-dep"
                  checked={isYieldDep}
                  onChange={e => setIsYieldDep(e.target.checked)}
                  className="rounded border-border-subtle text-accent focus:ring-accent accent-accent w-4 h-4"
                />
                <span className="font-semibold text-xs text-accent">⚡ Scales with servings (yield)</span>
              </label>
            </div>
          </div>

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

          {/* Optional Initial Photo */}
          <div className="w-full pt-2 border-t border-border-subtle/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-text-muted uppercase text-[10px] tracking-wider block">
                Optional Reference Photo
              </label>
              {photoPool.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddFormPoolPicker(!showAddFormPoolPicker)}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>🖼️</span>
                  <span>Pick from Media Bin ({photoPool.length})</span>
                </button>
              )}
            </div>

            {/* Media Pool Picker Grid */}
            {showAddFormPoolPicker && photoPool.length > 0 && (
              <div className="p-3 bg-card-bg rounded-xl border border-accent/40 space-y-2 animate-[fadeIn_150ms_ease-out]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-accent uppercase tracking-wider">
                    Select a Photo from Media Bin:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddFormPoolPicker(false)}
                    className="text-text-muted hover:text-foreground text-xs"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1">
                  {photoPool.map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setImageUrl(p.url);
                        setImageCaption(p.caption || '');
                        setImageStage(p.defaultStage || 'while_cooking');
                        setShowAddFormPoolPicker(false);
                      }}
                      className="group/p relative aspect-video rounded-lg overflow-hidden border border-border-subtle hover:border-accent cursor-pointer transition-all hover:scale-105"
                      title={`Select: ${p.caption || 'Photo'}`}
                    >
                      <img src={p.url} alt={p.caption || 'Pool'} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/p:opacity-100 transition-opacity flex flex-col items-center justify-center text-accent text-[11px] font-bold gap-0.5">
                        <span>Select</span>
                        <span className="text-[9px] text-white font-normal truncate max-w-[90%]">
                          {p.defaultStage === 'after_step' ? '✨ Result' : '👨‍🍳 Process'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="url"
                placeholder="Image URL (https://...)"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="flex-1 min-w-[180px] bg-card-bg border border-border-subtle rounded-md px-2 py-1 text-xs text-foreground outline-none focus:border-accent"
              />
              <select
                value={imageStage}
                onChange={e => setImageStage(e.target.value as StepImageStage)}
                className={`text-xs font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer ${
                  imageStage === 'while_cooking'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <option value="while_cooking">👨‍🍳 While Cooking</option>
                <option value="after_step">✨ After Step (Result)</option>
              </select>
              <input
                type="text"
                placeholder="Caption"
                value={imageCaption}
                onChange={e => setImageCaption(e.target.value)}
                className="flex-1 min-w-[140px] bg-card-bg border border-border-subtle rounded-md px-2 py-1 text-xs text-foreground outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

/** Block card containing steps + ingredients + add forms */
const BlockPanel = ({
  block,
  blockIndex,
  totalBlocks,
  phase,
  placeholder,
  editingStepId,
  masterIngredients,
  dispatch,
}: {
  block: EditableBlock;
  blockIndex: number;
  totalBlocks: number;
  phase: PhaseKey;
  placeholder: string;
  editingStepId: string | null;
  masterIngredients: IngredientRegistry[];
  dispatch: ReturnType<typeof useDispatch>;
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(block.name);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
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

  const handleAddStep = useCallback(
    (stepData: {
      text: string;
      duration?: { value: number; isYieldDependent: boolean };
      heat?: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number };
      isCritical?: boolean;
      images?: StepImage[];
    }) => {
      dispatch(addStep({ phase, blockId: block.id, ...stepData }));
    },
    [dispatch, phase, block.id]
  );

  return (
    <div className="relative bg-card-bg/60 border border-border-subtle rounded-2xl p-5 sm:p-6 transition-all duration-200 space-y-4">
      {/* Block Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-1.5 h-6 rounded-full bg-accent flex-shrink-0" />
          {isEditingName ? (
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              className="bg-transparent text-base font-semibold text-foreground border-b border-accent outline-none w-full"
            />
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="text-base font-semibold text-foreground cursor-pointer hover:text-accent transition-colors truncate"
              title="Click to rename block"
            >
              {block.name}
            </h3>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch(moveBlockUpAction({ phase, blockId: block.id }))}
            disabled={blockIndex === 0}
            className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent disabled:opacity-20 flex items-center justify-center text-xs"
            title="Move block up"
          >
            ↑
          </button>
          <button
            onClick={() => dispatch(moveBlockDownAction({ phase, blockId: block.id }))}
            disabled={blockIndex === totalBlocks - 1}
            className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-accent disabled:opacity-20 flex items-center justify-center text-xs"
            title="Move block down"
          >
            ↓
          </button>
          <button
            onClick={() => dispatch(deleteBlock({ phase, blockId: block.id }))}
            className="w-7 h-7 rounded-lg bg-border-subtle/50 text-text-muted hover:text-warning flex items-center justify-center text-xs"
            title="Delete block"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Block Ingredients Section */}
      <div className="space-y-2 pt-1 border-t border-border-subtle/40">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Block Ingredients ({block.ingredients?.length || 0})
          </h4>
          <button
            type="button"
            onClick={() => setShowAddIngredient(!showAddIngredient)}
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>+</span> <span>Add Ingredient</span>
          </button>
        </div>

        {block.ingredients && block.ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {block.ingredients.map(ing => {
              const masterName = formatIngredientName(ing.ingredientId, masterIngredients);
              const currentTier = ing.isCritical ? 'critical' : ing.isOptional ? 'optional' : 'standard';

              return (
                <div
                  key={ing.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border-subtle text-xs group/ing"
                >
                  <span className="font-bold text-accent">
                    {ing.quantity} {ing.unit}
                  </span>
                  <span className="text-foreground font-medium">{masterName}</span>

                  {/* 3-Tier Badge Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextTier = currentTier === 'critical' ? 'standard' : currentTier === 'standard' ? 'optional' : 'critical';
                      dispatch(setIngredientCriticality({ phase, blockId: block.id, ingredientId: ing.id, tier: nextTier }));
                    }}
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                      ing.isCritical
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                        : ing.isOptional
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-card-bg text-text-muted hover:text-foreground border border-border-subtle'
                    }`}
                    title="Click to cycle tier (Critical -> Standard -> Optional)"
                  >
                    {ing.isCritical ? '⚡ Critical' : ing.isOptional ? '✨ Optional' : 'Standard'}
                  </button>

                  {ing.tags?.includes('spice') && <span title="Spice tag">🌶️</span>}
                  {ing.tags?.includes('sweet') && <span title="Sweet tag">🍯</span>}

                  <button
                    type="button"
                    onClick={() => dispatch(removeBlockIngredient({ phase, blockId: block.id, ingredientId: ing.id }))}
                    className="text-text-muted hover:text-warning ml-1 transition-colors cursor-pointer"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showAddIngredient && (
          <AddIngredientForm
            masterIngredients={masterIngredients}
            onAdd={ing => {
              dispatch(addBlockIngredient({ phase, blockId: block.id, ingredient: ing }));
              setShowAddIngredient(false);
            }}
            onCancel={() => setShowAddIngredient(false)}
          />
        )}
      </div>

      {/* Steps List */}
      <div className="space-y-3 pt-2 border-t border-border-subtle/40">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Steps ({block.steps?.length || 0})
        </h4>

        {block.steps && block.steps.length > 0 ? (
          <div className="space-y-3">
            {block.steps.map((step, idx) => (
              <StepCard
                key={step.id}
                step={step}
                index={idx}
                totalSteps={block.steps.length}
                phase={phase}
                blockId={block.id}
                isEditing={editingStepId === step.id}
                masterIngredients={masterIngredients}
                onStartEdit={() => dispatch(setEditingStep(step.id))}
                onSaveEdit={text => {
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
          <div className="flex items-center justify-center py-6 text-text-muted/50 text-xs border border-dashed border-border-subtle rounded-xl">
            No steps yet — add a step below
          </div>
        )}

        <AddStepForm
          placeholder={placeholder}
          masterIngredients={masterIngredients}
          onAdd={handleAddStep}
        />
      </div>
    </div>
  );
};

// --- Story 16: Master Ingredient Registry Manager Component ---
const MasterIngredientManager = ({
  masterIngredients,
  dispatch,
}: {
  masterIngredients: IngredientRegistry[];
  dispatch: ReturnType<typeof useDispatch>;
}) => {
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [hindiName, setHindiName] = useState('');
  const [filter, setFilter] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const translations: { language: string; name: string }[] = [];
    if (tamilName.trim()) translations.push({ language: 'Tamil', name: tamilName.trim() });
    if (hindiName.trim()) translations.push({ language: 'Hindi', name: hindiName.trim() });

    dispatch(
      addMasterIngredient({
        defaultName: name.trim(),
        translations,
      })
    );

    setName('');
    setTamilName('');
    setHindiName('');
  };

  const filtered = masterIngredients.filter(m =>
    m.defaultName.toLowerCase().includes(filter.toLowerCase()) ||
    m.translations?.some(t => t.name.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="p-4 bg-background rounded-xl border border-border-subtle space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>🥕</span>
          <span>Master Ingredient Registry ({masterIngredients.length} ingredients)</span>
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Add custom ingredients with localized translations to use in blocks and step links.
        </p>
      </div>

      {/* Add New Master Ingredient Form */}
      <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-card-bg p-3 rounded-lg border border-border-subtle">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ingredient Name (e.g. Cardamom)"
          className="bg-background border border-border-subtle rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
        />
        <input
          type="text"
          value={tamilName}
          onChange={e => setTamilName(e.target.value)}
          placeholder="Tamil Name (optional, e.g. ஏலக்காய்)"
          className="bg-background border border-border-subtle rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
        />
        <input
          type="text"
          value={hindiName}
          onChange={e => setHindiName(e.target.value)}
          placeholder="Hindi Name (optional, e.g. इलायची)"
          className="bg-background border border-border-subtle rounded-md px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="px-3 py-1.5 bg-accent text-background font-bold text-xs rounded-md hover:bg-accent/80 disabled:opacity-40 transition-colors"
        >
          + Add to Registry
        </button>
      </form>

      {/* Filter / Search */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter ingredients..."
          className="w-full sm:w-64 bg-card-bg border border-border-subtle rounded-md px-3 py-1 text-xs text-foreground outline-none focus:border-accent"
        />
        <span className="text-[11px] text-text-muted">{filtered.length} matching</span>
      </div>

      {/* Ingredients Grid */}
      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
        {filtered.map(ing => (
          <div
            key={ing.id}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-card-bg border border-border-subtle text-xs"
          >
            <span className="font-medium text-foreground">{ing.defaultName}</span>
            {ing.translations && ing.translations.length > 0 && (
              <span className="text-[10px] text-text-muted font-mono">
                ({ing.translations.map(t => t.name).join(', ')})
              </span>
            )}
            <button
              type="button"
              onClick={() => dispatch(removeMasterIngredient(ing.id))}
              className="text-text-muted hover:text-warning ml-1"
              title={`Remove ${ing.defaultName}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Story 12: Ratio Group Builder ---
const RatioGroupItem = ({
  group,
  masterIngredients,
  dispatch,
}: {
  group: import('@/lib/types').RatioGroup;
  masterIngredients: IngredientRegistry[];
  dispatch: ReturnType<typeof useDispatch>;
}) => {
  const [ingId, setIngId] = useState('');
  const [parts, setParts] = useState('');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(parts);
    if (ingId && !isNaN(p) && p > 0) {
      dispatch(addRatioGroupMember({ groupId: group.id, ingredientId: ingId, parts: p }));
      setIngId('');
      setParts('');
    }
  };

  return (
    <div className="bg-background border border-border-subtle rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <input
          type="text"
          value={group.name}
          onChange={e => dispatch(updateRatioGroup({ id: group.id, name: e.target.value, isStrict: group.isStrict }))}
          className="font-semibold text-foreground bg-transparent outline-none border-b border-transparent focus:border-accent w-1/2"
        />
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={group.isStrict}
              onChange={e => dispatch(updateRatioGroup({ id: group.id, name: group.name, isStrict: e.target.checked }))}
              className="rounded border-border-subtle text-accent focus:ring-accent accent-accent"
            />
            Strict Mode
          </label>
          <button onClick={() => dispatch(deleteRatioGroup(group.id))} className="text-text-muted hover:text-warning" title="Delete Group">
            🗑️
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {group.members.map(m => {
          const masterName = formatIngredientName(m.ingredientId, masterIngredients);
          return (
            <span key={m.ingredientId} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent/10 text-accent text-xs font-medium border border-accent/20">
              {m.parts} part(s) {masterName}
              <button
                type="button"
                onClick={() => dispatch(removeRatioGroupMember({ groupId: group.id, ingredientId: m.ingredientId }))}
                className="text-accent/60 hover:text-warning"
                title="Remove"
              >
                ✕
              </button>
            </span>
          );
        })}
      </div>

      <form onSubmit={handleAddMember} className="flex gap-2">
        <select
          value={ingId}
          onChange={e => setIngId(e.target.value)}
          className="flex-1 bg-card-bg border border-border-subtle rounded-lg px-2 py-1.5 text-xs outline-none focus:border-accent"
        >
          <option value="">Select Ingredient</option>
          {masterIngredients.map(m => (
            <option key={m.id} value={m.id}>
              {m.defaultName}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="0.1"
          min="0.1"
          value={parts}
          onChange={e => setParts(e.target.value)}
          placeholder="Parts (e.g. 1)"
          className="w-24 bg-card-bg border border-border-subtle rounded-lg px-2 py-1.5 text-xs outline-none focus:border-accent"
        />
        <button type="submit" disabled={!ingId || !parts} className="px-3 py-1.5 bg-border-subtle/30 text-foreground text-xs font-medium rounded-lg hover:bg-border-subtle/50 disabled:opacity-50">
          Add
        </button>
      </form>
    </div>
  );
};

// --- Recipe Setup Form ---
const RecipeMetadataForm = () => {
  const dispatch = useDispatch();
  const {
    versionName,
    author,
    requiredEquipment,
    pairings,
    ratioGroups,
    masterIngredients,
    mealSlots = [],
    dietary = [],
    difficulty = 'medium',
  } = useSelector((state: RootState) => state.editor);

  const [eqInput, setEqInput] = useState('');
  const [pairingInput, setPairingInput] = useState('');
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (eqInput.trim()) {
      dispatch(addEquipment(eqInput.trim()));
      setEqInput('');
    }
  };

  const handleAddPairing = (e: React.FormEvent) => {
    e.preventDefault();
    if (pairingInput.trim()) {
      dispatch(addPairing(pairingInput.trim()));
      setPairingInput('');
    }
  };

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      dispatch(addRatioGroup({ name: newGroupName.trim(), isStrict: true }));
      setNewGroupName('');
    }
  };

  return (
    <section className="bg-card-bg border border-border-subtle rounded-2xl p-5 sm:p-6 mb-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recipe Setup & Registry</h2>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch(loadRecipeIntoEditor(mockAdaiRecipe))}
            className="text-xs px-2.5 py-1 rounded bg-border-subtle/50 text-text-muted hover:text-foreground"
          >
            Load Demo Data
          </button>
          <button
            onClick={() => dispatch(resetEditorState())}
            className="text-xs px-2.5 py-1 rounded bg-border-subtle/50 text-text-muted hover:text-warning"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5">Version Name</label>
          <input
            type="text"
            value={versionName}
            onChange={e => dispatch(setVersionName(e.target.value))}
            placeholder="e.g., Mom's Authentic"
            className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5">Author</label>
          <input
            type="text"
            value={author}
            onChange={e => dispatch(setAuthor(e.target.value))}
            placeholder="e.g., Jane Doe"
            className="w-full bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Story 33.1: Meal Slots (Time of Day Recommendation Metadata) */}
      <div className="p-4 rounded-xl bg-background border border-border-subtle space-y-3">
        <div>
          <label className="block text-[10px] uppercase font-bold text-accent tracking-wider mb-1">
            🍽️ When to Cook (Meal Slots & Time of Day)
          </label>
          <p className="text-xs text-text-muted">
            Select compatible meal times to power automatic &quot;What to Cook&quot; suggestions based on the time of day.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'breakfast' as MealSlot, label: '🌅 Breakfast / Morning Tiffin', hours: '6-11 AM' },
            { id: 'lunch' as MealSlot, label: '☀️ Lunch / Main Meal', hours: '11 AM-3 PM' },
            { id: 'snack' as MealSlot, label: '☕ Evening Snack / Tea Time', hours: '3-7 PM' },
            { id: 'dinner' as MealSlot, label: '🌙 Dinner / Night Tiffin', hours: '7-11 PM' },
            { id: 'late_night' as MealSlot, label: '🌌 Late Night Quick Bite', hours: '11 PM-6 AM' },
            { id: 'anytime' as MealSlot, label: '🕒 Anytime / All-Day', hours: 'All Day' },
          ].map(slot => {
            const isSelected = mealSlots.includes(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => dispatch(toggleMealSlot(slot.id))}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-accent text-background font-bold border-accent shadow-sm scale-[1.02]'
                    : 'bg-card-bg border-border-subtle text-text-muted hover:text-foreground hover:border-accent/40'
                }`}
              >
                <span>{slot.label}</span>
                <span className={`text-[10px] ${isSelected ? 'text-background/80 font-mono' : 'text-text-muted/60 font-mono'}`}>
                  ({slot.hours})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story 38: Dietary Preferences & Difficulty Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-background border border-border-subtle">
        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold text-accent tracking-wider">
            🌱 Dietary Classifications
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'vegetarian' as DietaryCategory, label: '🌱 Vegetarian' },
              { id: 'vegan' as DietaryCategory, label: '🌿 Vegan' },
              { id: 'gluten_free' as DietaryCategory, label: '🌾 Gluten-Free' },
              { id: 'high_protein' as DietaryCategory, label: '🥛 High-Protein' },
              { id: 'jain' as DietaryCategory, label: '✨ Jain' },
            ].map(diet => {
              const isSelected = dietary.includes(diet.id);
              return (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => dispatch(toggleDietaryCategory(diet.id))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                      : 'bg-card-bg border-border-subtle text-text-muted hover:text-foreground'
                  }`}
                >
                  {diet.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] uppercase font-bold text-accent tracking-wider">
            ⚡ Cooking Difficulty
          </label>
          <div className="flex gap-2">
            {[
              { id: 'easy' as RecipeDifficulty, label: '🟢 Easy / Quick' },
              { id: 'medium' as RecipeDifficulty, label: '🟡 Medium' },
              { id: 'advanced' as RecipeDifficulty, label: '🔴 Advanced' },
            ].map(diff => {
              const isSelected = difficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => dispatch(setDifficulty(diff.id))}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-accent/20 text-accent border-accent/60 font-bold'
                      : 'bg-card-bg border-border-subtle text-text-muted hover:text-foreground'
                  }`}
                >
                  {diff.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Story 8.2: Recipe Media Bin & Photo Pool */}
      <MediaPoolManager />

      {/* Story 16: Master Ingredient Registry Section */}
      <MasterIngredientManager masterIngredients={masterIngredients} dispatch={dispatch} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Equipment Checklist */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5">Required Equipment</label>
          <form onSubmit={handleAddEquipment} className="flex gap-2 mb-3">
            <input
              type="text"
              value={eqInput}
              onChange={e => setEqInput(e.target.value)}
              placeholder="e.g., Dosa Tawa"
              className="flex-1 bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button type="submit" disabled={!eqInput.trim()} className="px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-lg hover:bg-accent/20 disabled:opacity-50">
              Add
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {requiredEquipment.map(eq => (
              <span key={eq} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-border-subtle/30 text-xs font-medium text-foreground">
                {eq}
                <button type="button" onClick={() => dispatch(removeEquipment(eq))} className="text-text-muted hover:text-warning" title="Remove">✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* Pairings */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-text-muted mb-1.5">Food Pairings</label>
          <form onSubmit={handleAddPairing} className="flex gap-2 mb-3">
            <input
              type="text"
              value={pairingInput}
              onChange={e => setPairingInput(e.target.value)}
              placeholder="e.g., Coconut Chutney"
              className="flex-1 bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button type="submit" disabled={!pairingInput.trim()} className="px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-lg hover:bg-accent/20 disabled:opacity-50">
              Add
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {pairings.map(pairing => (
              <span key={pairing} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-border-subtle/30 text-xs font-medium text-foreground">
                {pairing}
                <button type="button" onClick={() => dispatch(removePairing(pairing))} className="text-text-muted hover:text-warning" title="Remove">✕</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ratio Groups */}
      <div className="border-t border-border-subtle/60 pt-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Ratio Groups (Relational Math)</h3>
        <p className="text-xs text-text-muted mb-4">Define proportional rules for ingredients (e.g., 1 part Rice : 0.25 part Dal).</p>
        
        <div className="flex flex-col gap-4 mb-4">
          {ratioGroups.map(group => (
            <RatioGroupItem key={group.id} group={group} masterIngredients={masterIngredients} dispatch={dispatch} />
          ))}
        </div>

        <form onSubmit={handleAddGroup} className="flex gap-2">
          <input
            type="text"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            placeholder="New Ratio Group Name (e.g., Dosa Batter)"
            className="flex-1 bg-background border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <button type="submit" disabled={!newGroupName.trim()} className="px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-lg hover:bg-accent/20 disabled:opacity-50">
            Add Group
          </button>
        </form>
      </div>
    </section>
  );
};

// --- Story 12.1: Live Recipe Preview Modal ---
const LiveRecipePreviewModal = ({
  isOpen,
  onClose,
  editorState,
  onPublish,
}: {
  isOpen: boolean;
  onClose: () => void;
  editorState: RootState['editor'];
  onPublish: () => void;
}) => {
  if (!isOpen) return null;

  const exported = exportEditorToRecipe(editorState);
  const totalPrep = (exported.prepBlocks || []).reduce((sum, b) => sum + (b.totalDurationInMinutes || 0), 0);
  const totalRest = (exported.passiveBlocks || []).reduce((sum, b) => sum + (b.totalDurationInMinutes || 0), 0);
  const totalCook = (exported.cookBlocks || []).reduce((sum, b) => sum + (b.totalDurationInMinutes || 0), 0);
  const totalTime = totalPrep + totalRest + totalCook;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card-bg border border-border-subtle rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">Live Preview</span>
            <h2 className="text-2xl font-bold text-foreground">{exported.name}</h2>
            <p className="text-xs text-text-muted">Servings: {exported.baseYield} • Total Time: {formatTime(totalTime)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-border-subtle flex items-center justify-center text-foreground hover:bg-warning hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Phase summaries */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-background rounded-xl border border-border-subtle">
            <span className="text-xs text-text-muted">Prep Phase</span>
            <p className="font-bold text-accent">{formatTime(totalPrep)}</p>
          </div>
          <div className="p-3 bg-background rounded-xl border border-border-subtle">
            <span className="text-xs text-text-muted">Rest / Passive</span>
            <p className="font-bold text-foreground">{formatTime(totalRest)}</p>
          </div>
          <div className="p-3 bg-background rounded-xl border border-border-subtle">
            <span className="text-xs text-text-muted">Cooking Phase</span>
            <p className="font-bold text-accent">{formatTime(totalCook)}</p>
          </div>
        </div>

        {/* Blocks breakdown */}
        <div className="space-y-4">
          {['Prep', 'Rest / Passive', 'Cooking'].map((phaseName, pIdx) => {
            const blocks = pIdx === 0 ? exported.prepBlocks : pIdx === 1 ? exported.passiveBlocks : exported.cookBlocks;
            if (!blocks || blocks.length === 0) return null;

            return (
              <div key={phaseName} className="space-y-2">
                <h3 className="text-sm font-bold text-accent uppercase tracking-wider">{phaseName}</h3>
                {blocks.map((b, bIdx) => (
                  <div key={bIdx} className="p-4 bg-background rounded-xl border border-border-subtle space-y-2">
                    <h4 className="font-semibold text-foreground text-sm">{b.name}</h4>
                    {b.ingredients && b.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 text-xs text-text-muted">
                        {b.ingredients.map((ing, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-card-bg border border-border-subtle">
                            {formatIngredientName(ing.ingredientId, exported.masterIngredients)}: {ing.quantity} {ing.unit}
                          </span>
                        ))}
                      </div>
                    )}
                    <ol className="list-decimal list-inside space-y-1 text-xs text-foreground/90 pl-1">
                      {b.steps.map((s, sIdx) => (
                        <li key={sIdx}>
                          <span>{s.text}</span>
                          {s.isCritical && <span className="text-warning ml-2 font-bold">[Critical]</span>}
                          {s.duration && <span className="text-accent ml-2">({formatTime(s.duration.value)})</span>}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-border-subtle text-foreground text-xs font-semibold hover:bg-border-subtle/80"
          >
            Back to Editing
          </button>
          <button
            onClick={() => {
              onPublish();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-accent text-background font-bold text-xs hover:bg-accent/80 shadow-md"
          >
            🚀 Save & Open in Reader
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN EDITOR PAGE ---

export default function EditorPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const editorState = useSelector((state: RootState) => state.editor);
  const {
    recipeName,
    baseYield,
    activePhase,
    prepBlocks,
    passiveBlocks,
    cookBlocks,
    editingStepId,
    masterIngredients,
  } = editorState;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const stepCounts: Record<PhaseKey, number> = {
    setup: 0,
    prep: prepBlocks.reduce((acc, b) => acc + b.steps.length, 0),
    passive: passiveBlocks.reduce((acc, b) => acc + b.steps.length, 0),
    cook: cookBlocks.reduce((acc, b) => acc + b.steps.length, 0),
  };

  const activePhaseConfig = PHASES.find(p => p.key === activePhase)!;
  const activeBlocks =
    activePhase === 'setup'
      ? []
      : activePhase === 'prep'
      ? prepBlocks
      : activePhase === 'passive'
      ? passiveBlocks
      : cookBlocks;

  const currentPhaseIndex = PHASES.findIndex(p => p.key === activePhase);
  const prevPhase = currentPhaseIndex > 0 ? PHASES[currentPhaseIndex - 1] : null;
  const nextPhase = currentPhaseIndex < PHASES.length - 1 ? PHASES[currentPhaseIndex + 1] : null;

  const handlePublishToReader = () => {
    const exported = exportEditorToRecipe(editorState);
    dispatch(loadRecipe(exported));
    router.push('/');
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 font-sans flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Recipe Header */}
      <RecipeHeader
        name={recipeName}
        baseYield={baseYield}
        onNameChange={v => dispatch(setRecipeName(v))}
        onYieldChange={v => dispatch(setBaseYield(v))}
        onPreview={() => setIsPreviewOpen(true)}
        onPublish={handlePublishToReader}
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
        {activePhase === 'setup' ? (
          <div className="animate-[fadeIn_200ms_ease-out]">
            <RecipeMetadataForm />
          </div>
        ) : (
          <>
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

            {/* Docked Quick Media Bin Bar for Drag-and-Drop */}
            {editorState.photoPool && editorState.photoPool.length > 0 && (
              <div className="p-3 bg-card-bg border border-border-subtle rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span>📸</span>
                    <span>Media Bin ({editorState.photoPool.length} photos ready)</span>
                  </span>
                  <span className="text-[11px] text-text-muted hidden sm:inline">
                    Drag any photo thumbnail onto a step card below ⬇️
                  </span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {editorState.photoPool.map((p, pIdx) => (
                    <div
                      key={p.id || pIdx}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData(
                          'application/json',
                          JSON.stringify({
                            url: p.url,
                            caption: p.caption,
                            stage: p.defaultStage || 'while_cooking',
                          })
                        );
                      }}
                      className="group/chip flex-shrink-0 flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-background border border-border-subtle hover:border-accent cursor-grab active:cursor-grabbing transition-all hover:scale-105 shadow-sm"
                      title={`Drag onto any step: ${p.caption || 'Photo'}`}
                    >
                      <img src={p.url} alt={p.caption || 'Pool'} className="w-8 h-8 object-cover rounded-lg" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold text-accent uppercase tracking-wider">
                          {p.defaultStage === 'after_step' ? '✨ Result' : '👨‍🍳 Process'}
                        </span>
                        <span className="text-[11px] font-medium text-foreground truncate max-w-[100px]">
                          {p.caption || 'Photo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                masterIngredients={masterIngredients}
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
          </>
        )}

        {/* Wizard Navigation */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-subtle/50">
          {prevPhase ? (
            <button
              onClick={() => dispatch(setActivePhase(prevPhase.key))}
              className="px-5 py-2.5 rounded-xl border border-border-subtle text-foreground text-sm font-semibold hover:border-accent/40 transition-colors"
            >
              ← Back to {prevPhase.label}
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {nextPhase ? (
              <button
                onClick={() => dispatch(setActivePhase(nextPhase.key))}
                className="px-5 py-2.5 rounded-xl bg-accent text-background text-sm font-bold hover:bg-accent/80 transition-colors shadow-sm"
              >
                Next: {nextPhase.label} →
              </button>
            ) : (
              <button
                onClick={handlePublishToReader}
                className="px-6 py-2.5 rounded-xl bg-accent text-background text-sm font-bold hover:bg-accent/80 transition-colors shadow-lg animate-pulse"
              >
                🚀 Save & Open in Reader View
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Live Preview Modal */}
      <LiveRecipePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        editorState={editorState}
        onPublish={handlePublishToReader}
      />
    </div>
  );
}
