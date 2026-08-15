import editorReducer, {
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
  addPhotosToPool,
  removePhotoFromPool,
  updatePoolPhoto,
  toggleMealSlot,
  toggleDietaryCategory,
  setDifficulty,
  loadRecipeIntoEditor,
  resetEditorState,
  EditorState,
  PhaseKey,
} from './editorSlice';
import { mockAdaiRecipe } from '../lib/mockRecipe';

// Helper to get a clean initial state for each test
const getInitialState = (): EditorState => editorReducer(undefined, { type: '@@INIT' });

describe('editorSlice', () => {
  let state: EditorState;

  beforeEach(() => {
    state = getInitialState();
  });

  // --- Phase Navigation ---

  describe('setActivePhase', () => {
    it('should default to setup phase', () => {
      expect(state.activePhase).toBe('setup');
    });

    it('should switch to prep phase', () => {
      const result = editorReducer(state, setActivePhase('prep'));
      expect(result.activePhase).toBe('prep');
    });

    it('should switch to passive phase', () => {
      const result = editorReducer(state, setActivePhase('passive'));
      expect(result.activePhase).toBe('passive');
    });

    it('should switch to cook phase', () => {
      const result = editorReducer(state, setActivePhase('cook'));
      expect(result.activePhase).toBe('cook');
    });

    it('should clear editingStepId when switching phases', () => {
      // First get to prep phase to have a block
      let result = editorReducer(state, setActivePhase('prep'));
      
      const blockId = result.prepBlocks[0].id;
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Test' }));
      const stepId = result.prepBlocks[0].steps[0].id;
      result = editorReducer(result, setEditingStep(stepId));
      expect(result.editingStepId).toBe(stepId);
      result = editorReducer(result, setActivePhase('cook'));
      expect(result.editingStepId).toBeNull();
    });
  });

  // --- Recipe Metadata ---

  describe('setRecipeName', () => {
    it('should set the recipe name', () => {
      const result = editorReducer(state, setRecipeName('Adai'));
      expect(result.recipeName).toBe('Adai');
    });

    it('should start with an empty name', () => {
      expect(state.recipeName).toBe('');
    });
  });

  describe('setBaseYield', () => {
    it('should set the base yield', () => {
      const result = editorReducer(state, setBaseYield(6));
      expect(result.baseYield).toBe(6);
    });

    it('should default to 4', () => {
      expect(state.baseYield).toBe(4);
    });
  });

  // --- Adding Steps ---

  describe('addStep', () => {
    it('should add a step to the prep block', () => {
      const blockId = state.prepBlocks[0].id;
      const result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Wash rice' }));
      expect(result.prepBlocks[0].steps).toHaveLength(1);
      expect(result.prepBlocks[0].steps[0].text).toBe('Wash rice');
      expect(result.prepBlocks[0].steps[0].isCritical).toBe(false);
      expect(result.prepBlocks[0].steps[0].id).toBeDefined();
    });

    it('should add a step with initial metadata (duration, heat, isCritical)', () => {
      const blockId = state.cookBlocks[0].id;
      const result = editorReducer(
        state,
        addStep({
          phase: 'cook',
          blockId,
          text: 'Saute onions',
          duration: { value: 5, isYieldDependent: true },
          heat: { intensity: 'Medium', precisionTemp: 160 },
          isCritical: true,
        })
      );
      const step = result.cookBlocks[0].steps[0];
      expect(step.text).toBe('Saute onions');
      expect(step.duration).toEqual({ value: 5, isYieldDependent: true });
      expect(step.heat).toEqual({ intensity: 'Medium', precisionTemp: 160 });
      expect(step.isCritical).toBe(true);
    });

    it('should add a step to the passive block', () => {
      const blockId = state.passiveBlocks[0].id;
      const result = editorReducer(state, addStep({ phase: 'passive', blockId, text: 'Let it rest' }));
      expect(result.passiveBlocks[0].steps).toHaveLength(1);
      expect(result.passiveBlocks[0].steps[0].text).toBe('Let it rest');
    });

    it('should add a step to the cook block', () => {
      const blockId = state.cookBlocks[0].id;
      const result = editorReducer(state, addStep({ phase: 'cook', blockId, text: 'Heat tawa' }));
      expect(result.cookBlocks[0].steps).toHaveLength(1);
      expect(result.cookBlocks[0].steps[0].text).toBe('Heat tawa');
    });

    it('should append steps sequentially', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 2' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 3' }));

      expect(result.prepBlocks[0].steps).toHaveLength(3);
      expect(result.prepBlocks[0].steps[0].text).toBe('Step 1');
      expect(result.prepBlocks[0].steps[1].text).toBe('Step 2');
      expect(result.prepBlocks[0].steps[2].text).toBe('Step 3');
    });

    it('should trim whitespace from step text', () => {
      const blockId = state.prepBlocks[0].id;
      const result = editorReducer(state, addStep({ phase: 'prep', blockId, text: '  Wash rice  ' }));
      expect(result.prepBlocks[0].steps[0].text).toBe('Wash rice');
    });

    it('should do nothing if blockId does not exist', () => {
      const result = editorReducer(state, addStep({ phase: 'prep', blockId: 'nonexistent', text: 'Test' }));
      expect(result.prepBlocks[0].steps).toHaveLength(0);
    });

    it('should generate unique IDs for each step', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step A' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step B' }));

      const ids = result.prepBlocks[0].steps.map(s => s.id);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });

  // --- Updating Steps ---

  describe('updateStepText', () => {
    it('should update an existing step text', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Old text' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, updateStepText({ phase: 'prep', blockId, stepId, text: 'New text' }));
      expect(result.prepBlocks[0].steps[0].text).toBe('New text');
    });

    it('should not modify other steps', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 2' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, updateStepText({ phase: 'prep', blockId, stepId, text: 'Updated' }));
      expect(result.prepBlocks[0].steps[0].text).toBe('Updated');
      expect(result.prepBlocks[0].steps[1].text).toBe('Step 2');
    });

    it('should do nothing if stepId does not exist', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Original' }));
      result = editorReducer(result, updateStepText({ phase: 'prep', blockId, stepId: 'fake', text: 'Changed' }));
      expect(result.prepBlocks[0].steps[0].text).toBe('Original');
    });
  });

  // --- Deleting Steps ---

  describe('deleteStep', () => {
    it('should remove a step from the block', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'To delete' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, deleteStep({ phase: 'prep', blockId, stepId }));
      expect(result.prepBlocks[0].steps).toHaveLength(0);
    });

    it('should only remove the target step', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Keep' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Delete me' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Also keep' }));

      const deleteId = result.prepBlocks[0].steps[1].id;
      result = editorReducer(result, deleteStep({ phase: 'prep', blockId, stepId: deleteId }));

      expect(result.prepBlocks[0].steps).toHaveLength(2);
      expect(result.prepBlocks[0].steps[0].text).toBe('Keep');
      expect(result.prepBlocks[0].steps[1].text).toBe('Also keep');
    });

    it('should clear editingStepId if the deleted step was being edited', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Editing this' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, setEditingStep(stepId));
      expect(result.editingStepId).toBe(stepId);

      result = editorReducer(result, deleteStep({ phase: 'prep', blockId, stepId }));
      expect(result.editingStepId).toBeNull();
    });

    it('should not clear editingStepId if a different step was deleted', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step A' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step B' }));

      const editId = result.prepBlocks[0].steps[0].id;
      const deleteId = result.prepBlocks[0].steps[1].id;

      result = editorReducer(result, setEditingStep(editId));
      result = editorReducer(result, deleteStep({ phase: 'prep', blockId, stepId: deleteId }));

      expect(result.editingStepId).toBe(editId);
    });
  });

  // --- Editing State ---

  describe('setEditingStep', () => {
    it('should set the editing step ID', () => {
      const result = editorReducer(state, setEditingStep('step-123'));
      expect(result.editingStepId).toBe('step-123');
    });

    it('should clear editing when set to null', () => {
      let result = editorReducer(state, setEditingStep('step-123'));
      result = editorReducer(result, setEditingStep(null));
      expect(result.editingStepId).toBeNull();
    });
  });

  // --- Default Blocks ---

  describe('initial state', () => {
    it('should have one default block per phase', () => {
      expect(state.prepBlocks).toHaveLength(1);
      expect(state.passiveBlocks).toHaveLength(1);
      expect(state.cookBlocks).toHaveLength(1);
    });

    it('should have named default blocks', () => {
      expect(state.prepBlocks[0].name).toBe('Prep Steps');
      expect(state.passiveBlocks[0].name).toBe('Rest / Passive Steps');
      expect(state.cookBlocks[0].name).toBe('Cooking Steps');
    });

    it('should start with empty steps in all blocks', () => {
      expect(state.prepBlocks[0].steps).toHaveLength(0);
      expect(state.passiveBlocks[0].steps).toHaveLength(0);
      expect(state.cookBlocks[0].steps).toHaveLength(0);
    });
  });

  // --- Cross-phase isolation ---

  describe('phase isolation', () => {
    it('should not affect other phases when adding steps', () => {
      const prepBlockId = state.prepBlocks[0].id;
      const cookBlockId = state.cookBlocks[0].id;

      let result = editorReducer(state, addStep({ phase: 'prep', blockId: prepBlockId, text: 'Prep step' }));
      result = editorReducer(result, addStep({ phase: 'cook', blockId: cookBlockId, text: 'Cook step' }));

      expect(result.prepBlocks[0].steps).toHaveLength(1);
      expect(result.passiveBlocks[0].steps).toHaveLength(0);
      expect(result.cookBlocks[0].steps).toHaveLength(1);
    });
  });

  // --- Step Metadata ---

  describe('updateStepDuration', () => {
    it('should set step duration and yield-dependent flag', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Wash rice' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        updateStepDuration({ phase: 'prep', blockId, stepId, duration: { value: 10, isYieldDependent: true } })
      );

      expect(result.prepBlocks[0].steps[0].duration).toEqual({ value: 10, isYieldDependent: true });
    });

    it('should clear duration when passed undefined', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Wash rice' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        updateStepDuration({ phase: 'prep', blockId, stepId, duration: { value: 10, isYieldDependent: false } })
      );
      result = editorReducer(result, updateStepDuration({ phase: 'prep', blockId, stepId, duration: undefined }));

      expect(result.prepBlocks[0].steps[0].duration).toBeUndefined();
    });
  });

  describe('updateStepHeat', () => {
    it('should set heat intensity and precision temperature', () => {
      const blockId = state.cookBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'cook', blockId, text: 'Heat pan' }));
      const stepId = result.cookBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        updateStepHeat({ phase: 'cook', blockId, stepId, heat: { intensity: 'Medium', precisionTemp: 180 } })
      );

      expect(result.cookBlocks[0].steps[0].heat).toEqual({ intensity: 'Medium', precisionTemp: 180 });
    });

    it('should clear heat when passed undefined', () => {
      const blockId = state.cookBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'cook', blockId, text: 'Heat pan' }));
      const stepId = result.cookBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        updateStepHeat({ phase: 'cook', blockId, stepId, heat: { intensity: 'High' } })
      );
      result = editorReducer(result, updateStepHeat({ phase: 'cook', blockId, stepId, heat: undefined }));

      expect(result.cookBlocks[0].steps[0].heat).toBeUndefined();
    });
  });

  describe('toggleStepCritical', () => {
    it('should toggle step criticality from false to true and back', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Grind batter' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      expect(result.prepBlocks[0].steps[0].isCritical).toBe(false);

      result = editorReducer(result, toggleStepCritical({ phase: 'prep', blockId, stepId }));
      expect(result.prepBlocks[0].steps[0].isCritical).toBe(true);

      result = editorReducer(result, toggleStepCritical({ phase: 'prep', blockId, stepId }));
      expect(result.prepBlocks[0].steps[0].isCritical).toBe(false);
    });
  });

  describe('linkIngredientToStep', () => {
    it('should link an ingredient to a step', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Mix ingredients' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, linkIngredientToStep({ phase: 'prep', blockId, stepId, ingredientId: 'ing_raw_rice' }));
      expect(result.prepBlocks[0].steps[0].linkedIngredients).toContain('ing_raw_rice');
      expect(result.prepBlocks[0].steps[0].linkedIngredients).toHaveLength(1);

      // Should not add duplicates
      result = editorReducer(result, linkIngredientToStep({ phase: 'prep', blockId, stepId, ingredientId: 'ing_raw_rice' }));
      expect(result.prepBlocks[0].steps[0].linkedIngredients).toHaveLength(1);
    });
  });

  describe('unlinkIngredientFromStep', () => {
    it('should unlink an ingredient from a step', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Mix ingredients' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, linkIngredientToStep({ phase: 'prep', blockId, stepId, ingredientId: 'ing_raw_rice' }));
      result = editorReducer(result, linkIngredientToStep({ phase: 'prep', blockId, stepId, ingredientId: 'ing_urad_dal' }));
      
      result = editorReducer(result, unlinkIngredientFromStep({ phase: 'prep', blockId, stepId, ingredientId: 'ing_raw_rice' }));
      
      expect(result.prepBlocks[0].steps[0].linkedIngredients).not.toContain('ing_raw_rice');
      expect(result.prepBlocks[0].steps[0].linkedIngredients).toContain('ing_urad_dal');
      expect(result.prepBlocks[0].steps[0].linkedIngredients).toHaveLength(1);
    });
  });

  // --- Step Reordering ---

  describe('reorderSteps', () => {
    it('should move a step from fromIndex to toIndex', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 2' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 3' }));

      // Move Step 3 (index 2) to position 0
      result = editorReducer(result, reorderSteps({ phase: 'prep', blockId, fromIndex: 2, toIndex: 0 }));

      const steps = result.prepBlocks[0].steps;
      expect(steps[0].text).toBe('Step 3');
      expect(steps[1].text).toBe('Step 1');
      expect(steps[2].text).toBe('Step 2');
    });

    it('should do nothing if indices are invalid or identical', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 2' }));

      let unchanged = editorReducer(result, reorderSteps({ phase: 'prep', blockId, fromIndex: 0, toIndex: 0 }));
      expect(unchanged.prepBlocks[0].steps[0].text).toBe('Step 1');

      unchanged = editorReducer(result, reorderSteps({ phase: 'prep', blockId, fromIndex: -1, toIndex: 1 }));
      expect(unchanged.prepBlocks[0].steps[0].text).toBe('Step 1');
    });
  });

  describe('moveStepUp', () => {
    it('should move a step up by 1 position', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 2' }));
      const step2Id = result.prepBlocks[0].steps[1].id;

      result = editorReducer(result, moveStepUp({ phase: 'prep', blockId, stepId: step2Id }));

      expect(result.prepBlocks[0].steps[0].text).toBe('Step 2');
      expect(result.prepBlocks[0].steps[1].text).toBe('Step 1');
    });

    it('should do nothing if step is already at top (index 0)', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      const step1Id = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, moveStepUp({ phase: 'prep', blockId, stepId: step1Id }));

      expect(result.prepBlocks[0].steps[0].text).toBe('Step 1');
    });
  });

  describe('moveStepDown', () => {
    it('should move a step down by 1 position', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 2' }));
      const step1Id = result.prepBlocks[0].steps[0].id;

      result = editorReducer(result, moveStepDown({ phase: 'prep', blockId, stepId: step1Id }));

      expect(result.prepBlocks[0].steps[0].text).toBe('Step 2');
      expect(result.prepBlocks[0].steps[1].text).toBe('Step 1');
    });

    it('should do nothing if step is already at bottom', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Step 1' }));
      result = editorReducer(result, addStep({ phase: 'prep', blockId, text: 'Step 2' }));
      const step2Id = result.prepBlocks[0].steps[1].id;

      result = editorReducer(result, moveStepDown({ phase: 'prep', blockId, stepId: step2Id }));

      expect(result.prepBlocks[0].steps[1].text).toBe('Step 2');
    });
  });

  // --- Block Management ---

  describe('addBlock', () => {
    it('should add a new block to the specified phase', () => {
      let result = editorReducer(state, addBlock({ phase: 'prep', name: 'Soaking' }));
      expect(result.prepBlocks).toHaveLength(2);
      expect(result.prepBlocks[1].name).toBe('Soaking');
      expect(result.prepBlocks[1].steps).toHaveLength(0);
    });

    it('should use default name if no custom name provided', () => {
      let result = editorReducer(state, addBlock({ phase: 'cook' }));
      expect(result.cookBlocks).toHaveLength(2);
      expect(result.cookBlocks[1].name).toBe('New Cooking Block');
    });
  });

  describe('updateBlockName', () => {
    it('should update the name of a block', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, updateBlockName({ phase: 'prep', blockId, name: 'Grinding' }));
      expect(result.prepBlocks[0].name).toBe('Grinding');
    });
  });

  describe('deleteBlock', () => {
    it('should remove the target block', () => {
      let result = editorReducer(state, addBlock({ phase: 'prep', name: 'Second Block' }));
      const deleteId = result.prepBlocks[0].id;

      result = editorReducer(result, deleteBlock({ phase: 'prep', blockId: deleteId }));
      expect(result.prepBlocks).toHaveLength(1);
      expect(result.prepBlocks[0].name).toBe('Second Block');
    });

    it('should recreate a default block if all blocks are deleted', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, deleteBlock({ phase: 'prep', blockId }));

      expect(result.prepBlocks).toHaveLength(1);
      expect(result.prepBlocks[0].name).toBe('Prep Steps');
    });
  });

  describe('moveBlockUp and moveBlockDown', () => {
    it('should reorder blocks up and down', () => {
      let result = editorReducer(state, addBlock({ phase: 'prep', name: 'Block 2' }));
      const block2Id = result.prepBlocks[1].id;

      // Move Block 2 up to position 0
      result = editorReducer(result, moveBlockUpAction({ phase: 'prep', blockId: block2Id }));
      expect(result.prepBlocks[0].name).toBe('Block 2');
      expect(result.prepBlocks[1].name).toBe('Prep Steps');

      // Move Block 2 back down to position 1
      result = editorReducer(result, moveBlockDownAction({ phase: 'prep', blockId: block2Id }));
      expect(result.prepBlocks[0].name).toBe('Prep Steps');
      expect(result.prepBlocks[1].name).toBe('Block 2');
    });
  });

  // --- Block Ingredients Management ---

  describe('addBlockIngredient', () => {
    it('should add an ingredient to a specific block', () => {
      const blockId = state.prepBlocks[0].id;
      const result = editorReducer(state, addBlockIngredient({
        phase: 'prep',
        blockId,
        ingredient: {
          ingredientId: 'ing_raw_rice',
          quantity: 100,
          unit: 'g',
          isOptional: false,
          tags: ['sweet'],
        }
      }));

      expect(result.prepBlocks[0].ingredients).toHaveLength(1);
      expect(result.prepBlocks[0].ingredients[0].ingredientId).toBe('ing_raw_rice');
      expect(result.prepBlocks[0].ingredients[0].id).toBeDefined();
    });
  });

  describe('updateBlockIngredient', () => {
    it('should update an existing ingredient in a block', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addBlockIngredient({
        phase: 'prep',
        blockId,
        ingredient: {
          ingredientId: 'ing_raw_rice',
          quantity: 100,
          unit: 'g',
          isOptional: false,
          tags: [],
        }
      }));

      const ingredientId = result.prepBlocks[0].ingredients[0].id;
      result = editorReducer(result, updateBlockIngredient({
        phase: 'prep',
        blockId,
        ingredientId,
        updates: { quantity: 200, isOptional: true }
      }));

      expect(result.prepBlocks[0].ingredients[0].quantity).toBe(200);
      expect(result.prepBlocks[0].ingredients[0].isOptional).toBe(true);
      expect(result.prepBlocks[0].ingredients[0].unit).toBe('g'); // unchanged
    });
  });

  describe('removeBlockIngredient', () => {
    it('should remove an ingredient from a block', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addBlockIngredient({
        phase: 'prep',
        blockId,
        ingredient: {
          ingredientId: 'ing_raw_rice',
          quantity: 100,
          unit: 'g',
          isOptional: false,
          tags: [],
        }
      }));

      const ingredientId = result.prepBlocks[0].ingredients[0].id;
      result = editorReducer(result, removeBlockIngredient({
        phase: 'prep',
        blockId,
        ingredientId,
      }));

      expect(result.prepBlocks[0].ingredients).toHaveLength(0);
    });
  });

  // --- Recipe Metadata Management ---

  describe('Equipment Management', () => {
    it('should add equipment if not present', () => {
      let result = editorReducer(state, addEquipment('Mixer Grinder'));
      expect(result.requiredEquipment).toContain('Mixer Grinder');
      expect(result.requiredEquipment).toHaveLength(1);

      // Should not add duplicates
      result = editorReducer(result, addEquipment('Mixer Grinder'));
      expect(result.requiredEquipment).toHaveLength(1);
    });

    it('should remove equipment', () => {
      let result = editorReducer(state, addEquipment('Pan'));
      result = editorReducer(result, removeEquipment('Pan'));
      expect(result.requiredEquipment).not.toContain('Pan');
    });
  });

  describe('Pairings Management', () => {
    it('should add pairing if not present', () => {
      let result = editorReducer(state, addPairing('Coconut Chutney'));
      expect(result.pairings).toContain('Coconut Chutney');
      expect(result.pairings).toHaveLength(1);

      // Should not add duplicates
      result = editorReducer(result, addPairing('Coconut Chutney'));
      expect(result.pairings).toHaveLength(1);
    });

    it('should remove pairing', () => {
      let result = editorReducer(state, addPairing('Sambar'));
      result = editorReducer(result, removePairing('Sambar'));
      expect(result.pairings).not.toContain('Sambar');
    });
  });

  describe('Version Metadata', () => {
    it('should set version name', () => {
      const result = editorReducer(state, setVersionName('V2 Refined'));
      expect(result.versionName).toBe('V2 Refined');
    });

    it('should set author name', () => {
      const result = editorReducer(state, setAuthor('John Doe'));
      expect(result.author).toBe('John Doe');
    });
  });

  // --- Ratio Groups ---

  describe('Ratio Groups', () => {
    it('should add a ratio group', () => {
      const result = editorReducer(state, addRatioGroup({ name: 'Batter', isStrict: true }));
      expect(result.ratioGroups).toHaveLength(1);
      expect(result.ratioGroups[0].name).toBe('Batter');
      expect(result.ratioGroups[0].isStrict).toBe(true);
      expect(result.ratioGroups[0].members).toEqual([]);
    });

    it('should update a ratio group', () => {
      let result = editorReducer(state, addRatioGroup({ name: 'Batter', isStrict: true }));
      const groupId = result.ratioGroups[0].id;
      result = editorReducer(result, updateRatioGroup({ id: groupId, name: 'Dosa Batter', isStrict: false }));
      expect(result.ratioGroups[0].name).toBe('Dosa Batter');
      expect(result.ratioGroups[0].isStrict).toBe(false);
    });

    it('should delete a ratio group', () => {
      let result = editorReducer(state, addRatioGroup({ name: 'Batter', isStrict: true }));
      const groupId = result.ratioGroups[0].id;
      result = editorReducer(result, deleteRatioGroup(groupId));
      expect(result.ratioGroups).toHaveLength(0);
    });

    it('should add a ratio group member', () => {
      let result = editorReducer(state, addRatioGroup({ name: 'Batter', isStrict: true }));
      const groupId = result.ratioGroups[0].id;
      result = editorReducer(result, addRatioGroupMember({ groupId, ingredientId: 'ing_rice', parts: 4 }));
      expect(result.ratioGroups[0].members).toHaveLength(1);
      expect(result.ratioGroups[0].members[0].ingredientId).toBe('ing_rice');
      expect(result.ratioGroups[0].members[0].parts).toBe(4);
    });

    it('should update an existing ratio group member', () => {
      let result = editorReducer(state, addRatioGroup({ name: 'Batter', isStrict: true }));
      const groupId = result.ratioGroups[0].id;
      result = editorReducer(result, addRatioGroupMember({ groupId, ingredientId: 'ing_rice', parts: 4 }));
      result = editorReducer(result, addRatioGroupMember({ groupId, ingredientId: 'ing_rice', parts: 5 }));
      expect(result.ratioGroups[0].members).toHaveLength(1);
      expect(result.ratioGroups[0].members[0].parts).toBe(5);
    });

    it('should remove a ratio group member', () => {
      let result = editorReducer(state, addRatioGroup({ name: 'Batter', isStrict: true }));
      const groupId = result.ratioGroups[0].id;
      result = editorReducer(result, addRatioGroupMember({ groupId, ingredientId: 'ing_rice', parts: 4 }));
      result = editorReducer(result, removeRatioGroupMember({ groupId, ingredientId: 'ing_rice' }));
      expect(result.ratioGroups[0].members).toHaveLength(0);
    });
  });

  // --- Story 16: Master Ingredients ---

  describe('Master Ingredients (Story 16)', () => {
    it('initializes with a default pantry master ingredients list', () => {
      expect(state.masterIngredients.length).toBeGreaterThan(10);
    });

    it('adds a new master ingredient with translations', () => {
      const result = editorReducer(
        state,
        addMasterIngredient({
          defaultName: 'Saffron',
          translations: [{ language: 'Tamil', name: 'Kungumapoo' }],
        })
      );
      const added = result.masterIngredients.find(m => m.defaultName === 'Saffron');
      expect(added).toBeDefined();
      expect(added?.translations[0].name).toBe('Kungumapoo');
    });

    it('does not add duplicate ingredients with the same derived ID', () => {
      let result = editorReducer(
        state,
        addMasterIngredient({
          defaultName: 'Cardamom',
        })
      );
      const countBefore = result.masterIngredients.length;
      result = editorReducer(
        result,
        addMasterIngredient({
          defaultName: 'Cardamom',
        })
      );
      expect(result.masterIngredients.length).toBe(countBefore);
    });

    it('updates an existing master ingredient', () => {
      let result = editorReducer(
        state,
        addMasterIngredient({
          id: 'ing_saffron_test',
          defaultName: 'Saffron',
          translations: [],
        })
      );
      result = editorReducer(
        result,
        updateMasterIngredient({
          id: 'ing_saffron_test',
          defaultName: 'Pure Kashmiri Saffron',
          translations: [{ language: 'Tamil', name: 'Kungumapoo' }],
        })
      );
      const updated = result.masterIngredients.find(m => m.id === 'ing_saffron_test');
      expect(updated?.defaultName).toBe('Pure Kashmiri Saffron');
      expect(updated?.translations[0].name).toBe('Kungumapoo');
    });

    it('removes a master ingredient by ID', () => {
      let result = editorReducer(
        state,
        addMasterIngredient({
          id: 'ing_temp_del',
          defaultName: 'Temp Ingredient',
        })
      );
      expect(result.masterIngredients.some(m => m.id === 'ing_temp_del')).toBe(true);
      result = editorReducer(result, removeMasterIngredient('ing_temp_del'));
      expect(result.masterIngredients.some(m => m.id === 'ing_temp_del')).toBe(false);
    });
  });

  // --- Story 12.1: Recipe Load & Reset ---

  describe('Recipe Load & Reset (Story 12.1)', () => {
    it('hydrates editor state from an existing Recipe entity', () => {
      const result = editorReducer(state, loadRecipeIntoEditor(mockAdaiRecipe));
      expect(result.recipeName).toBe('Adai');
      expect(result.baseYield).toBe(4);
      expect(result.versionName).toBe("Amma's Soft Version");
      expect(result.prepBlocks.length).toBeGreaterThan(0);
      expect(result.cookBlocks.length).toBeGreaterThan(0);
      expect(result.activePhase).toBe('setup');
    });

    it('resets editor state to clean initial defaults', () => {
      let result = editorReducer(state, loadRecipeIntoEditor(mockAdaiRecipe));
      expect(result.recipeName).toBe('Adai');
      result = editorReducer(result, resetEditorState());
      expect(result.recipeName).toBe('');
      expect(result.baseYield).toBe(4);
      expect(result.versionName).toBe('');
    });
  });

  // --- Story 8.1: Step Visual Media & Guidance ---

  describe('Step Visual Media & Stage Guidance (Story 8.1)', () => {
    it('adds a step image with while_cooking stage', () => {
      const blockId = state.prepBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'prep', blockId, text: 'Grind batter' }));
      const stepId = result.prepBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        addStepImage({
          phase: 'prep',
          blockId,
          stepId,
          image: {
            url: 'https://example.com/batter.jpg',
            caption: 'Semi-coarse texture',
            stage: 'while_cooking',
          },
        })
      );

      const step = result.prepBlocks[0].steps[0];
      expect(step.images).toHaveLength(1);
      expect(step.images![0].url).toBe('https://example.com/batter.jpg');
      expect(step.images![0].caption).toBe('Semi-coarse texture');
      expect(step.images![0].stage).toBe('while_cooking');
    });

    it('adds a step image with after_step stage', () => {
      const blockId = state.cookBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'cook', blockId, text: 'Cook dosa' }));
      const stepId = result.cookBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        addStepImage({
          phase: 'cook',
          blockId,
          stepId,
          image: {
            url: 'https://example.com/golden.jpg',
            caption: 'Golden brown crust',
            stage: 'after_step',
          },
        })
      );

      const step = result.cookBlocks[0].steps[0];
      expect(step.images).toHaveLength(1);
      expect(step.images![0].stage).toBe('after_step');
    });

    it('updates image stage and caption', () => {
      const blockId = state.cookBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'cook', blockId, text: 'Fry paneer' }));
      const stepId = result.cookBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        addStepImage({
          phase: 'cook',
          blockId,
          stepId,
          image: {
            url: 'https://example.com/fry.jpg',
            caption: 'Initial caption',
            stage: 'while_cooking',
          },
        })
      );

      const imageId = result.cookBlocks[0].steps[0].images![0].id!;

      result = editorReducer(
        result,
        updateStepImage({
          phase: 'cook',
          blockId,
          stepId,
          imageId,
          stage: 'after_step',
          caption: 'Updated crispy golden texture',
        })
      );

      const updated = result.cookBlocks[0].steps[0].images![0];
      expect(updated.stage).toBe('after_step');
      expect(updated.caption).toBe('Updated crispy golden texture');
    });

    it('removes an image from a step', () => {
      const blockId = state.cookBlocks[0].id;
      let result = editorReducer(state, addStep({ phase: 'cook', blockId, text: 'Roast spices' }));
      const stepId = result.cookBlocks[0].steps[0].id;

      result = editorReducer(
        result,
        addStepImage({
          phase: 'cook',
          blockId,
          stepId,
          image: { url: 'https://example.com/spice.jpg', stage: 'while_cooking' },
        })
      );

      const imageId = result.cookBlocks[0].steps[0].images![0].id!;
      expect(result.cookBlocks[0].steps[0].images).toHaveLength(1);

      result = editorReducer(
        result,
        removeStepImage({ phase: 'cook', blockId, stepId, imageId })
      );

      expect(result.cookBlocks[0].steps[0].images).toHaveLength(0);
    });
  });

  // --- Story 8.2: Centralized Recipe Media Pool (Photo Dump & Assignment) ---

  describe('Story 8.2: Centralized Recipe Media Pool (photoPool)', () => {
    it('initializes with empty photoPool array', () => {
      expect(state.photoPool).toEqual([]);
    });

    it('adds multiple photos to the central pool via addPhotosToPool', () => {
      const photos = [
        { url: 'https://example.com/p1.jpg', caption: 'Dals soaking', defaultStage: 'while_cooking' as const },
        { url: 'https://example.com/p2.jpg', caption: 'Golden crisp', defaultStage: 'after_step' as const },
      ];

      const result = editorReducer(state, addPhotosToPool(photos));
      expect(result.photoPool).toHaveLength(2);
      expect(result.photoPool[0].url).toBe('https://example.com/p1.jpg');
      expect(result.photoPool[0].caption).toBe('Dals soaking');
      expect(result.photoPool[0].defaultStage).toBe('while_cooking');
      expect(result.photoPool[0].id).toBeDefined();

      expect(result.photoPool[1].url).toBe('https://example.com/p2.jpg');
      expect(result.photoPool[1].caption).toBe('Golden crisp');
      expect(result.photoPool[1].defaultStage).toBe('after_step');
    });

    it('removes a photo from pool by id or url via removePhotoFromPool', () => {
      let result = editorReducer(
        state,
        addPhotosToPool([
          { url: 'https://example.com/p1.jpg', caption: 'Keep' },
          { url: 'https://example.com/p2.jpg', caption: 'Delete me' },
        ])
      );

      const toDeleteId = result.photoPool[1].id;
      result = editorReducer(result, removePhotoFromPool(toDeleteId));
      expect(result.photoPool).toHaveLength(1);
      expect(result.photoPool[0].caption).toBe('Keep');
    });

    it('updates caption and defaultStage via updatePoolPhoto', () => {
      let result = editorReducer(
        state,
        addPhotosToPool([{ url: 'https://example.com/p1.jpg', caption: 'Old caption', defaultStage: 'while_cooking' }])
      );

      const photoId = result.photoPool[0].id;
      result = editorReducer(
        result,
        updatePoolPhoto({ id: photoId, caption: 'New enhanced caption', defaultStage: 'after_step' })
      );

      expect(result.photoPool[0].caption).toBe('New enhanced caption');
      expect(result.photoPool[0].defaultStage).toBe('after_step');
    });

    it('resets photoPool when resetEditorState is dispatched', () => {
      let result = editorReducer(
        state,
        addPhotosToPool([{ url: 'https://example.com/p1.jpg', caption: 'Temp' }])
      );
      expect(result.photoPool).toHaveLength(1);

      result = editorReducer(result, resetEditorState());
      expect(result.photoPool).toHaveLength(0);
    });
  });

  // --- Story 33.1 & 38: Setup Metadata (Meal Slots, Dietary, Difficulty) ---

  describe('Story 33.1 & 38: Setup Metadata Actions', () => {
    it('toggles meal slots on and off via toggleMealSlot', () => {
      let result = editorReducer(state, toggleMealSlot('breakfast'));
      expect(result.mealSlots).toContain('breakfast');

      result = editorReducer(result, toggleMealSlot('dinner'));
      expect(result.mealSlots).toEqual(['breakfast', 'dinner']);

      result = editorReducer(result, toggleMealSlot('breakfast'));
      expect(result.mealSlots).toEqual(['dinner']);
    });

    it('toggles dietary categories via toggleDietaryCategory', () => {
      let result = editorReducer(state, toggleDietaryCategory('vegetarian'));
      expect(result.dietary).toContain('vegetarian');

      result = editorReducer(result, toggleDietaryCategory('high_protein'));
      expect(result.dietary).toEqual(['vegetarian', 'high_protein']);

      result = editorReducer(result, toggleDietaryCategory('vegetarian'));
      expect(result.dietary).toEqual(['high_protein']);
    });

    it('updates difficulty level via setDifficulty', () => {
      let result = editorReducer(state, setDifficulty('easy'));
      expect(result.difficulty).toBe('easy');

      result = editorReducer(result, setDifficulty('advanced'));
      expect(result.difficulty).toBe('advanced');
    });
  });
});
