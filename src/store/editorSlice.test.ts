import editorReducer, {
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
  EditorState,
  PhaseKey,
} from './editorSlice';

// Helper to get a clean initial state for each test
const getInitialState = (): EditorState => editorReducer(undefined, { type: '@@INIT' });

describe('editorSlice', () => {
  let state: EditorState;

  beforeEach(() => {
    state = getInitialState();
  });

  // --- Phase Navigation ---

  describe('setActivePhase', () => {
    it('should default to prep phase', () => {
      expect(state.activePhase).toBe('prep');
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
      let result = editorReducer(state, setEditingStep('some-step-id'));
      expect(result.editingStepId).toBe('some-step-id');
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
});
