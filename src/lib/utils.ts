import { Recipe, ComponentBlock, ScopedIngredient, AtomicStep, IngredientRegistry } from './types';
import { EditorState } from '../store/editorSlice';

export const formatIngredientName = (id: string, masterIngredients?: IngredientRegistry[]) => {
  if (masterIngredients) {
    const found = masterIngredients.find(m => m.id === id);
    if (found) return found.defaultName;
  }
  return id.replace(/^ing_/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const formatTime = (mins: number) => {
  if (mins === 0) return '0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};

export interface AggregatedIngredient {
  id: string;
  ingredientId: string;
  amount: number;
  quantity: number;
  unit: string;
  isOptional?: boolean;
  tags: ("spice" | "sweet")[];
}

// Group by ingredient AND unit to prevent math bugs when mixing units
export const getGlobalIngredients = (blocks: ComponentBlock[]): AggregatedIngredient[] => {
  const all: Record<string, AggregatedIngredient> = {};
  blocks.forEach(b => {
    (b.ingredients || []).forEach(i => {
      const key = `${i.ingredientId}_${i.unit}`;
      if (all[key]) {
        all[key].amount += i.quantity;
        all[key].quantity += i.quantity;
        // Merge tags
        if (i.tags) {
          i.tags.forEach(t => {
            if (!all[key].tags.includes(t)) all[key].tags.push(t);
          });
        }
      } else {
        all[key] = {
          id: i.ingredientId,
          ingredientId: i.ingredientId,
          amount: i.quantity,
          quantity: i.quantity,
          unit: i.unit,
          isOptional: i.isOptional,
          tags: i.tags ? [...i.tags] : [],
        };
      }
    });
  });
  return Object.values(all);
};

/**
 * Calculates a scaled ingredient quantity based on the target yield and taste multipliers.
 * Returns the original quantity unchanged for optional ingredients.
 *
 * @param baseQuantity    - The original quantity at baseYield
 * @param baseYield       - The recipe's original serving count
 * @param targetYield     - The user's desired serving count
 * @param isOptional      - If true, quantity is not scaled (returns base as-is)
 * @param tasteMultiplier - Optional multiplier (e.g. for spice or sweetness tolerance)
 * @returns               - The scaled quantity, rounded to 2 decimal places
 */
export const calculateScaledQuantity = (
  baseQuantity: number,
  baseYield: number,
  targetYield: number,
  isOptional: boolean = false,
  tasteMultiplier: number = 1.0,
): number => {
  if (isOptional) return baseQuantity;
  if (baseYield === 0) return 0;
  const scaled = (baseQuantity / baseYield) * targetYield * (tasteMultiplier > 0 ? tasteMultiplier : 1.0);
  return Math.round(scaled * 100) / 100;
};

/**
 * Calculates a scaled step duration based on the recipe base yield and target yield.
 * Returns the base duration unchanged if isYieldDependent is false.
 */
export const calculateScaledDuration = (
  baseDuration: number,
  baseYield: number,
  targetYield: number,
  isYieldDependent: boolean = false,
): number => {
  if (!isYieldDependent) return baseDuration;
  if (baseYield === 0 || baseDuration === 0) return 0;
  return Math.max(1, Math.round((baseDuration / baseYield) * targetYield));
};

/**
 * Converts Editor Redux state into a standard Recipe entity ready for the Reader View.
 */
export const exportEditorToRecipe = (editorState: EditorState): Recipe => {
  const mapBlock = (b: any): ComponentBlock => {
    const steps: AtomicStep[] = (b.steps || []).map((s: any) => ({
      text: s.text || '',
      duration: s.duration,
      heat: s.heat,
      isCritical: Boolean(s.isCritical),
      images: s.images || [],
    }));

    const ingredients: ScopedIngredient[] = (b.ingredients || []).map((i: any) => ({
      ingredientId: i.ingredientId,
      quantity: Number(i.quantity) || 0,
      unit: i.unit || 'g',
      isOptional: Boolean(i.isOptional),
      isCritical: Boolean(i.isCritical),
      tags: i.tags || [],
    }));

    const totalDurationInMinutes = steps.reduce((sum, s) => sum + (s.duration?.value || 0), 0);

    return {
      name: b.name || 'Component Block',
      totalDurationInMinutes,
      ingredients,
      steps,
    };
  };

  const recipeId = `recipe_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  return {
    id: recipeId,
    name: editorState.recipeName.trim() || 'Untitled Recipe',
    baseYield: editorState.baseYield || 4,
    versionHistory: [
      {
        versionName: editorState.versionName.trim() || "Author's Edition",
        author: editorState.author.trim() || 'Chef',
        timestamp: new Date().toISOString(),
      },
    ],
    masterIngredients: editorState.masterIngredients || [],
    requiredEquipment: editorState.requiredEquipment || [],
    ratioGroups: editorState.ratioGroups || [],
    prepBlocks: (editorState.prepBlocks || []).map(mapBlock),
    passiveBlocks: (editorState.passiveBlocks || []).map(mapBlock),
    cookBlocks: (editorState.cookBlocks || []).map(mapBlock),
    pairings: editorState.pairings || [],
    photoPool: editorState.photoPool || [],
    mealSlots: editorState.mealSlots || [],
    dietary: editorState.dietary || [],
    difficulty: editorState.difficulty || 'medium',
  };
};

/**
 * Plays a pleasant culinary completion chime using Web Audio API.
 * Safe to call in any browser environment with window/AudioContext.
 */
export const playTimerChime = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a friendly 3-tone notification chord (C5 - E5 - G5)
    const tones = [523.25, 659.25, 783.99, 1046.50];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      const startTime = ctx.currentTime + idx * 0.15;
      const duration = 0.35;
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch (err) {
    // AudioContext may be blocked by autoplay policies until user interaction, ignore silently
  }
};
