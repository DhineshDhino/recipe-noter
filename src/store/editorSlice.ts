import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { generateId } from '../lib/id';
import { RatioGroup, IngredientRegistry, Recipe, ComponentBlock, StepImage, StepImageStage, PoolPhoto, MealSlot, DietaryCategory, RecipeDifficulty } from '../lib/types';
import { mockAdaiRecipe } from '../lib/mockRecipe';

// --- Types ---

export type PhaseKey = 'setup' | 'prep' | 'passive' | 'cook';

export interface EditableStep {
  id: string;
  text: string;
  isCritical: boolean;
  duration?: { value: number; isYieldDependent: boolean };
  heat?: { intensity: 'Low' | 'Medium' | 'High' | 'Off'; precisionTemp?: number };
  linkedIngredients?: string[];
  images?: StepImage[];
}

export interface EditableScopedIngredient {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  isCritical?: boolean;
  tags: ("spice" | "sweet")[];
}

export interface EditableBlock {
  id: string;
  name: string;
  ingredients: EditableScopedIngredient[];
  steps: EditableStep[];
}

export interface EditorState {
  recipeName: string;
  baseYield: number;
  requiredEquipment: string[];
  pairings: string[];
  versionName: string;
  author: string;
  activePhase: PhaseKey;
  prepBlocks: EditableBlock[];
  passiveBlocks: EditableBlock[];
  cookBlocks: EditableBlock[];
  ratioGroups: RatioGroup[];
  masterIngredients: IngredientRegistry[];
  photoPool: PoolPhoto[];
  editingStepId: string | null;
  mealSlots: MealSlot[];
  dietary: DietaryCategory[];
  difficulty: RecipeDifficulty;
}

// --- Starter Pantry Master Ingredients ---
export const initialMasterIngredients: IngredientRegistry[] = [
  ...mockAdaiRecipe.masterIngredients,
  { id: "ing_tomato", defaultName: "Tomato", translations: [{ language: "Tamil", name: "Thakkali" }] },
  { id: "ing_garlic", defaultName: "Garlic", translations: [{ language: "Tamil", name: "Poondu" }] },
  { id: "ing_mustard_seeds", defaultName: "Mustard Seeds", translations: [{ language: "Tamil", name: "Kadugu" }] },
  { id: "ing_cumin_seeds", defaultName: "Cumin Seeds", translations: [{ language: "Tamil", name: "Seeragam" }] },
  { id: "ing_turmeric_powder", defaultName: "Turmeric Powder", translations: [{ language: "Tamil", name: "Manjal Thool" }] },
  { id: "ing_red_chilli_powder", defaultName: "Red Chilli Powder", translations: [{ language: "Tamil", name: "Molagai Thool" }] },
  { id: "ing_black_pepper", defaultName: "Black Pepper", translations: [{ language: "Tamil", name: "Milagu" }] },
  { id: "ing_ghee", defaultName: "Ghee", translations: [{ language: "Tamil", name: "Nei" }] },
  { id: "ing_cooking_oil", defaultName: "Cooking Oil", translations: [{ language: "Tamil", name: "Ennai" }] },
  { id: "ing_water", defaultName: "Water", translations: [{ language: "Tamil", name: "Thanni" }] },
  { id: "ing_grated_coconut", defaultName: "Grated Coconut", translations: [{ language: "Tamil", name: "Thengai Thuruval" }] },
  { id: "ing_jaggery", defaultName: "Jaggery / Sugar", translations: [{ language: "Tamil", name: "Vellam / Sarkarai" }] },
  { id: "ing_paneer", defaultName: "Paneer", translations: [{ language: "Tamil", name: "Paneer" }] },
  { id: "ing_garam_masala", defaultName: "Garam Masala", translations: [{ language: "Tamil", name: "Garam Masala" }] },
];

// --- Helpers ---

/** Get the block array for a given phase */
const getPhaseBlocks = (state: EditorState, phase: PhaseKey): EditableBlock[] => {
  switch (phase) {
    case 'setup': return [];
    case 'prep': return state.prepBlocks;
    case 'passive': return state.passiveBlocks;
    case 'cook': return state.cookBlocks;
  }
};

/** Create a default block for a phase */
const createDefaultBlock = (phase: PhaseKey): EditableBlock => ({
  id: generateId(),
  name: phase === 'prep' ? 'Prep Steps' : phase === 'passive' ? 'Rest / Passive Steps' : 'Cooking Steps',
  ingredients: [],
  steps: [],
});

// --- Initial State ---

const initialState: EditorState = {
  recipeName: '',
  baseYield: 4,
  requiredEquipment: [],
  pairings: [],
  versionName: '',
  author: '',
  activePhase: 'setup',
  prepBlocks: [createDefaultBlock('prep')],
  passiveBlocks: [createDefaultBlock('passive')],
  cookBlocks: [createDefaultBlock('cook')],
  ratioGroups: [],
  masterIngredients: [...initialMasterIngredients],
  photoPool: [],
  editingStepId: null,
  mealSlots: [],
  dietary: [],
  difficulty: 'medium',
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

    /** Add equipment */
    addEquipment: (state, action: PayloadAction<string>) => {
      if (!state.requiredEquipment.includes(action.payload)) {
        state.requiredEquipment.push(action.payload);
      }
    },

    /** Remove equipment */
    removeEquipment: (state, action: PayloadAction<string>) => {
      state.requiredEquipment = state.requiredEquipment.filter(e => e !== action.payload);
    },

    /** Add pairing */
    addPairing: (state, action: PayloadAction<string>) => {
      if (!state.pairings.includes(action.payload)) {
        state.pairings.push(action.payload);
      }
    },

    /** Remove pairing */
    removePairing: (state, action: PayloadAction<string>) => {
      state.pairings = state.pairings.filter(p => p !== action.payload);
    },

    /** Set version name */
    setVersionName: (state, action: PayloadAction<string>) => {
      state.versionName = action.payload;
    },

    /** Set author */
    setAuthor: (state, action: PayloadAction<string>) => {
      state.author = action.payload;
    },

    /** Append a new step to a block within the active phase */
    addStep: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        text: string;
        duration?: { value: number; isYieldDependent: boolean };
        heat?: { intensity: 'Low' | 'Medium' | 'High' | 'Off'; precisionTemp?: number };
        isCritical?: boolean;
        images?: StepImage[];
      }>
    ) => {
      const { phase, blockId, text, duration, heat, isCritical, images } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      block.steps.push({
        id: generateId(),
        text: text.trim(),
        isCritical: isCritical ?? false,
        duration,
        heat,
        images: images || [],
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
        heat?: { intensity: 'Low' | 'Medium' | 'High' | 'Off'; precisionTemp?: number };
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

    /** Link an ingredient to a step */
    linkIngredientToStep: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; stepId: string; ingredientId: string }>
    ) => {
      const { phase, blockId, stepId, ingredientId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step) {
        if (!step.linkedIngredients) {
          step.linkedIngredients = [];
        }
        if (!step.linkedIngredients.includes(ingredientId)) {
          step.linkedIngredients.push(ingredientId);
        }
      }
    },

    /** Unlink an ingredient from a step */
    unlinkIngredientFromStep: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; stepId: string; ingredientId: string }>
    ) => {
      const { phase, blockId, stepId, ingredientId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step && step.linkedIngredients) {
        step.linkedIngredients = step.linkedIngredients.filter(id => id !== ingredientId);
      }
    },

    /** Add visual guidance image to a step */
    addStepImage: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        stepId: string;
        image: { url: string; caption?: string; stage: StepImageStage };
      }>
    ) => {
      const { phase, blockId, stepId, image } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step) {
        if (!step.images) step.images = [];
        step.images.push({
          id: generateId(),
          url: image.url.trim(),
          caption: image.caption?.trim(),
          stage: image.stage,
        });
      }
    },

    /** Remove visual guidance image from a step */
    removeStepImage: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        stepId: string;
        imageId: string;
      }>
    ) => {
      const { phase, blockId, stepId, imageId } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step && step.images) {
        step.images = step.images.filter(img => img.id !== imageId && img.url !== imageId);
      }
    },

    /** Update visual guidance image stage or caption */
    updateStepImage: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        stepId: string;
        imageId: string;
        stage?: StepImageStage;
        caption?: string;
      }>
    ) => {
      const { phase, blockId, stepId, imageId, stage, caption } = action.payload;
      const blocks = getPhaseBlocks(state, phase);
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const step = block.steps.find(s => s.id === stepId);
      if (step && step.images) {
        const img = step.images.find(i => i.id === imageId || i.url === imageId);
        if (img) {
          if (stage) img.stage = stage;
          if (caption !== undefined) img.caption = caption;
        }
      }
    },

    // --- Story 8.2: Centralized Recipe Media Pool (Photo Dump) ---

    /** Add one or more photos to the central media pool */
    addPhotosToPool: (
      state,
      action: PayloadAction<Array<{ id?: string; url: string; caption?: string; defaultStage?: StepImageStage }>>
    ) => {
      action.payload.forEach(item => {
        if (!item.url?.trim()) return;
        state.photoPool.push({
          id: item.id || generateId(),
          url: item.url.trim(),
          caption: item.caption?.trim(),
          defaultStage: item.defaultStage || 'while_cooking',
        });
      });
    },

    /** Remove photo from the central media pool */
    removePhotoFromPool: (state, action: PayloadAction<string>) => {
      state.photoPool = state.photoPool.filter(p => p.id !== action.payload && p.url !== action.payload);
    },

    /** Update photo in media pool */
    updatePoolPhoto: (
      state,
      action: PayloadAction<{ id: string; caption?: string; defaultStage?: StepImageStage }>
    ) => {
      const p = state.photoPool.find(item => item.id === action.payload.id || item.url === action.payload.id);
      if (p) {
        if (action.payload.caption !== undefined) p.caption = action.payload.caption;
        if (action.payload.defaultStage) p.defaultStage = action.payload.defaultStage;
      }
    },

    toggleMealSlot: (state, action: PayloadAction<MealSlot>) => {
      const slot = action.payload;
      if (state.mealSlots.includes(slot)) {
        state.mealSlots = state.mealSlots.filter(s => s !== slot);
      } else {
        state.mealSlots.push(slot);
      }
    },

    toggleDietaryCategory: (state, action: PayloadAction<DietaryCategory>) => {
      const cat = action.payload;
      if (state.dietary.includes(cat)) {
        state.dietary = state.dietary.filter(c => c !== cat);
      } else {
        state.dietary.push(cat);
      }
    },

    setDifficulty: (state, action: PayloadAction<RecipeDifficulty>) => {
      state.difficulty = action.payload;
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
        ingredients: [],
        steps: [],
      });
    },

    /** Add an ingredient to a block */
    addBlockIngredient: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; ingredient: Omit<EditableScopedIngredient, 'id'> }>
    ) => {
      const { phase, blockId, ingredient } = action.payload;
      const block = getPhaseBlocks(state, phase).find(b => b.id === blockId);
      if (block) {
        block.ingredients.push({
          id: generateId(),
          ...ingredient,
        });
      }
    },

    /** Update an ingredient in a block */
    updateBlockIngredient: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; ingredientId: string; updates: Partial<EditableScopedIngredient> }>
    ) => {
      const { phase, blockId, ingredientId, updates } = action.payload;
      const block = getPhaseBlocks(state, phase).find(b => b.id === blockId);
      if (block) {
        const ingredient = block.ingredients.find(i => i.id === ingredientId);
        if (ingredient) {
          Object.assign(ingredient, updates);
        }
      }
    },

    /** Remove an ingredient from a block */
    removeBlockIngredient: (
      state,
      action: PayloadAction<{ phase: PhaseKey; blockId: string; ingredientId: string }>
    ) => {
      const { phase, blockId, ingredientId } = action.payload;
      const block = getPhaseBlocks(state, phase).find(b => b.id === blockId);
      if (block) {
        block.ingredients = block.ingredients.filter(i => i.id !== ingredientId);
      }
    },

    /** Set 3-tier criticality for a block ingredient (Critical Core / Standard / Optional) */
    setIngredientCriticality: (
      state,
      action: PayloadAction<{
        phase: PhaseKey;
        blockId: string;
        ingredientId: string;
        tier: 'critical' | 'standard' | 'optional';
      }>
    ) => {
      const { phase, blockId, ingredientId, tier } = action.payload;
      const block = getPhaseBlocks(state, phase).find(b => b.id === blockId);
      if (block) {
        const ingredient = block.ingredients.find(i => i.id === ingredientId);
        if (ingredient) {
          if (tier === 'critical') {
            ingredient.isCritical = true;
            ingredient.isOptional = false;
          } else if (tier === 'optional') {
            ingredient.isCritical = false;
            ingredient.isOptional = true;
          } else {
            ingredient.isCritical = false;
            ingredient.isOptional = false;
          }
        }
      }
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

    // --- Ratio Groups ---

    addRatioGroup: (
      state,
      action: PayloadAction<{ name: string; isStrict: boolean }>
    ) => {
      state.ratioGroups.push({
        id: generateId(),
        name: action.payload.name,
        isStrict: action.payload.isStrict,
        members: [],
      });
    },

    updateRatioGroup: (
      state,
      action: PayloadAction<{ id: string; name: string; isStrict: boolean }>
    ) => {
      const group = state.ratioGroups.find(g => g.id === action.payload.id);
      if (group) {
        group.name = action.payload.name;
        group.isStrict = action.payload.isStrict;
      }
    },

    deleteRatioGroup: (state, action: PayloadAction<string>) => {
      state.ratioGroups = state.ratioGroups.filter(g => g.id !== action.payload);
    },

    addRatioGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; ingredientId: string; parts: number }>
    ) => {
      const group = state.ratioGroups.find(g => g.id === action.payload.groupId);
      if (group) {
        const existing = group.members.find(m => m.ingredientId === action.payload.ingredientId);
        if (existing) {
          existing.parts = action.payload.parts;
        } else {
          group.members.push({
            ingredientId: action.payload.ingredientId,
            parts: action.payload.parts,
          });
        }
      }
    },

    removeRatioGroupMember: (
      state,
      action: PayloadAction<{ groupId: string; ingredientId: string }>
    ) => {
      const group = state.ratioGroups.find(g => g.id === action.payload.groupId);
      if (group) {
        group.members = group.members.filter(m => m.ingredientId !== action.payload.ingredientId);
      }
    },

    // --- Story 16: Master Ingredient Registry CRUD ---

    addMasterIngredient: (
      state,
      action: PayloadAction<{ id?: string; defaultName: string; translations?: { language: string; name: string }[] }>
    ) => {
      const defaultName = action.payload.defaultName.trim();
      if (!defaultName) return;
      const id = action.payload.id || `ing_${defaultName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`;
      if (!state.masterIngredients.some(m => m.id === id)) {
        state.masterIngredients.push({
          id,
          defaultName,
          translations: action.payload.translations || [],
        });
      }
    },

    updateMasterIngredient: (
      state,
      action: PayloadAction<{ id: string; defaultName: string; translations?: { language: string; name: string }[] }>
    ) => {
      const ing = state.masterIngredients.find(m => m.id === action.payload.id);
      if (ing) {
        if (action.payload.defaultName?.trim()) ing.defaultName = action.payload.defaultName.trim();
        if (action.payload.translations) ing.translations = action.payload.translations;
      }
    },

    removeMasterIngredient: (state, action: PayloadAction<string>) => {
      state.masterIngredients = state.masterIngredients.filter(m => m.id !== action.payload);
    },

    // --- Story 12.1: Recipe Load & Reset ---

    loadRecipeIntoEditor: (state, action: PayloadAction<Recipe>) => {
      const r = action.payload;
      state.recipeName = r.name || '';
      state.baseYield = r.baseYield || 4;
      state.versionName = r.versionHistory?.[0]?.versionName || '';
      state.author = r.versionHistory?.[0]?.author || '';
      state.requiredEquipment = [...(r.requiredEquipment || [])];
      state.pairings = [...(r.pairings || [])];
      state.ratioGroups = [...(r.ratioGroups || [])];
      state.masterIngredients = r.masterIngredients && r.masterIngredients.length > 0
        ? [...r.masterIngredients]
        : [...initialMasterIngredients];
      state.photoPool = r.photoPool && r.photoPool.length > 0
        ? [...r.photoPool]
        : [];
      state.mealSlots = r.mealSlots || [];
      state.dietary = r.dietary || [];
      state.difficulty = r.difficulty || 'medium';

      const mapBlocks = (blocks: ComponentBlock[], fallbackPhase: PhaseKey): EditableBlock[] => {
        if (!blocks || blocks.length === 0) return [createDefaultBlock(fallbackPhase)];
        return blocks.map(b => ({
          id: generateId(),
          name: b.name,
          ingredients: (b.ingredients || []).map(i => ({
            id: generateId(),
            ingredientId: i.ingredientId,
            quantity: i.quantity,
            unit: i.unit,
            isOptional: Boolean(i.isOptional),
            isCritical: Boolean(i.isCritical),
            tags: i.tags || [],
          })),
          steps: (b.steps || []).map(s => ({
            id: generateId(),
            text: s.text,
            isCritical: Boolean(s.isCritical),
            duration: s.duration,
            heat: s.heat,
            linkedIngredients: [],
            images: (s.images || []).map(img => ({
              id: img.id || generateId(),
              url: img.url,
              caption: img.caption,
              stage: img.stage,
            })),
          })),
        }));
      };

      state.prepBlocks = mapBlocks(r.prepBlocks, 'prep');
      state.passiveBlocks = mapBlocks(r.passiveBlocks, 'passive');
      state.cookBlocks = mapBlocks(r.cookBlocks, 'cook');
      state.activePhase = 'setup';
      state.editingStepId = null;
    },

    resetEditorState: (state) => {
      state.recipeName = '';
      state.baseYield = 4;
      state.requiredEquipment = [];
      state.pairings = [];
      state.versionName = '';
      state.author = '';
      state.activePhase = 'setup';
      state.prepBlocks = [createDefaultBlock('prep')];
      state.passiveBlocks = [createDefaultBlock('passive')];
      state.cookBlocks = [createDefaultBlock('cook')];
      state.ratioGroups = [];
      state.masterIngredients = [...initialMasterIngredients];
      state.photoPool = [];
      state.editingStepId = null;
      state.mealSlots = [];
      state.dietary = [];
      state.difficulty = 'medium';
    },
  },
});

export const {
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
  moveBlockUp,
  moveBlockDown,
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
  addPhotosToPool,
  removePhotoFromPool,
  updatePoolPhoto,
  toggleMealSlot,
  toggleDietaryCategory,
  setDifficulty,
  loadRecipeIntoEditor,
  resetEditorState,
} = editorSlice.actions;

export default editorSlice.reducer;
