import { loadPersistedState, savePersistedState, STORAGE_KEY } from './persistence';
import { createStore } from './store';
import { toggleFavorite, setUnitSystem } from './recipeSlice';

describe('Story 75: LocalStorage Redux Store Persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('returns undefined when localStorage is empty or corrupted', () => {
    expect(loadPersistedState()).toBeUndefined();

    window.localStorage.setItem(STORAGE_KEY, 'INVALID_JSON{');
    expect(loadPersistedState()).toBeUndefined();
  });

  it('saves and reloads state to/from localStorage', () => {
    const mockState = {
      recipe: {
        favorites: ['recipe_adai_001'],
        unitSystem: 'us_customary',
      },
      editor: {
        recipeName: 'Test Dosai',
        baseYield: 6,
      },
    };

    savePersistedState(mockState);
    const loaded = loadPersistedState();

    expect(loaded).toBeDefined();
    expect(loaded.recipe.favorites).toContain('recipe_adai_001');
    expect(loaded.recipe.unitSystem).toBe('us_customary');
    expect(loaded.editor.recipeName).toBe('Test Dosai');
  });

  it('automatically persists state changes through redux middleware', () => {
    const store = createStore();
    
    // Dispatch action
    store.dispatch(setUnitSystem('us_customary'));

    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.recipe.unitSystem).toBe('us_customary');
  });
});
