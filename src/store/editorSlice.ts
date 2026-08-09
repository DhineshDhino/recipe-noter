import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '../lib/id';

// --- Types ---

export type PhaseKey = 'prep' | 'passive' | 'cook';

export interface EditableStep {
  id: string;
  text: string;
  isCritical: boolean;
  duration?: { value: number; isYieldDependent: boolean };
  heat?: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number };
}

export interface EditableBlock {
  id: string;
  name: string;
  steps: EditableStep[];
}

export interface EditorState {
  recipeName: string;
  baseYield: number;
  activePhase: PhaseKey;
  prepBlocks: EditableBlock[];
  passiveBlocks: EditableBlock[];
  cookBlocks: EditableBlock[];
  editingStepId: string | null;
}

// --- Helpers ---

/** Get the block array for a given phase */
const getPhaseBlocks = (state: EditorState, phase: PhaseKey): EditableBlock[] => {
  switch (phase) {
    case 'prep': return state.prepBlocks;
    case 'passive': return state.passiveBlocks;
    case 'cook': return state.cookBlocks;
  }
};

/** Create a default block for a phase */
const createDefaultBlock = (phase: PhaseKey): EditableBlock => ({
  id: generateId(),
  name: phase === 'prep' ? 'Prep Steps' : phase === 'passive' ? 'Rest / Passive Steps' : 'Cooking Steps',
  steps: [],
});

// --- Initial State ---

const initialState: EditorState = {
  recipeName: '',
  baseYield: 4,
  activePhase: 'prep',
  prepBlocks: [createDefaultBlock('prep')],
  passiveBlocks: [createDefaultBlock('passive')],
  cookBlocks: [createDefaultBlock('cook')],
  editingStepId: null,
};

// --- Slice ---

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    /** Switch the active phase tab */
    setActivePhase: (state, action: PayloadAction<PhaseKey>) => {
      state.activePhase = action.payload;
      state.editingStepId = null; // dismiss any open editor when switching tabs
    },

    /** Set recipe name */
    setRecipeName: (state, action: PayloadAction<string>) => {
      state.recipeName = action.payload;
    },

    /** Set base yield (servings) */
    setBaseYield: (state, action: PayloadAction<number>) => {
      state.baseYield = action.payload;
    },

    /** Append a new step to a block within the active phase */
    addStep: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        text: string;
        duration?: { value: number; isYieldDependent: boolean };
        heat?: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number };
        isCritical?: boolean;
      }>
    ) => {
      const { phase, blockId, text, duration, heat, isCritical } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      block.steps.push({
        id: generateId(),
        text: text.trim(),
        isCritical: isCritical ?? false,
        duration,
        heat,
      });
    },

    /** Update the text of an existing step */
    updateStepText: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; stepId: string; text: string }>
    ) => {
      const { phase, blockId, stepId, text } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step) {
        step.text = text;
      }
    },

    /** Delete a step from a block */
    deleteStep: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; stepId: string }>
    ) => {
      const { phase, blockId, stepId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      block.steps = block.steps.filter(s => s.id !== stepId);

      // Clear editing state if the deleted step was being edited
      if (state.editingStepId === stepId) {
        state.editingStepId = null;
      }
    },

    /** Set which step is currently in inline-edit mode (null = none) */
    setEditingStep: (state, action: PayloadAction<string | null>) => {
      state.editingStepId = action.payload;
    },

    /** Update step duration metadata */
    updateStepDuration: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        stepId: string;
        duration?: { value: number; isYieldDependent: boolean };
      }>
    ) => {
      const { phase, blockId, stepId, duration } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step) {
        step.duration = duration;
      }
    },

    /** Update step heat/temperature metadata */
    updateStepHeat: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        stepId: string;
        heat?: { intensity: 'Low' | 'Medium' | 'High'; precisionTemp?: number };
      }>
    ) => {
      const { phase, blockId, stepId, heat } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step) {
        step.heat = heat;
      }
    },

    /** Toggle critical flag for a step */
    toggleStepCritical: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; stepId: string }>
    ) => {
      const { phase, blockId, stepId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step) {
        step.isCritical = !step.isCritical;
      }
    },

    /** Reorder steps via Drag & Drop (move from fromIndex to toIndex) */
    reorderSteps: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        fromIndex: number;
        toIndex: number;
      }>
    ) => {
      const { phase, blockId, fromIndex, toIndex } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      if (
        fromIndex < 0 ||
        fromIndex >= block.steps.length ||
        toIndex < 0 ||
        toIndex >= block.steps.length ||
        fromIndex === toIndex
      ) {
        return;
      }

      const [movedStep] = block.steps.splice(fromIndex, 1);
      block.steps.splice(toIndex, 0, movedStep);
    },

    /** Move a step up by 1 position */
    moveStepUp: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; stepId: string }>
    ) => {
      const { phase, blockId, stepId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const index = block.steps.findIndex(s => s.id === stepId);
      if (index > 0) {
        const [movedStep] = block.steps.splice(index, 1);
        block.steps.splice(index - 1, 0, movedStep);
      }
    },

    /** Move a step down by 1 position */
    moveStepDown: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; stepId: string }>
    ) => {
      const { phase, blockId, stepId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const index = block.steps.findIndex(s => s.id === stepId);
      if (index >= 0 && index < block.steps.length - 1) {
        const [movedStep] = block.steps.splice(index, 1);
        block.steps.splice(index + 1, 0, movedStep);
      }
    },

    /** Append a new component block to a phase */
    addBlock: (
      state,
      action: PayloadAction<{ phase: PhaseKey; name?: string }>
    ) => {
      const { phase, name } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const defaultName = name?.trim() || `New ${phase === 'prep' ? 'Prep' : phase === 'passive' ? 'Passive' : 'Cooking'} Block`;
      blocks.push({
        id: generateId(),
        name: defaultName,
        steps: [],
      });
    },

    /** Update block name */
    updateBlockName: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; name: string }>
    ) => {
      const { phase, blockId, name } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (block && name.trim()) {
        block.name = name.trim();
      }
    },

    /** Delete a block from a phase */
    deleteBlock: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string }>
    ) => {
      const { phase, blockId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const index = blocks.findIndex(b => b.id === blockId);
      if (index === -1) return;

      const targetBlock = blocks[index];
      if (targetBlock.steps.some(s => s.id === state.editingStepId)) {
        state.editingStepId = null;
      }

      blocks.splice(index, 1);

      // Recreate default block if all blocks in phase are deleted
      if (blocks.length === 0) {
        blocks.push(createDefaultBlock(phase));
      }
    },

    /** Move a block up within its phase */
    moveBlockUp: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string }>
    ) => {
      const { phase, blockId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const index = blocks.findIndex(b => b.id === blockId);
      if (index > 0) {
        const [movedBlock] = blocks.splice(index, 1);
        blocks.splice(index - 1, 0, movedBlock);
      }
    },

    /** Move a block down within its phase */
    moveBlockDown: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string }>
    ) => {
      const { phase, blockId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const index = blocks.findIndex(b => b.id === blockId);
      if (index >= 0 && index < blocks.length - 1) {
        const [movedBlock] = blocks.splice(index, 1);
        blocks.splice(index + 1, 0, movedBlock);
      }
    },
  },
});

export const {
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
  moveBlockUp,
  moveBlockDown,
} = editorSlice.actions;

export default editorSlice.reducer;
