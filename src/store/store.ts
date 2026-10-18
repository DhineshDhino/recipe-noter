import { configureStore, combineReducers } from '@reduxjs/toolkit';
import recipeReducer from './recipeSlice';
import editorReducer from './editorSlice';
import { loadPersistedState, persistenceMiddleware } from './persistence';

const rootReducer = combineReducers({
  recipe: recipeReducer,
  editor: editorReducer,
});

export const createStore = (initial?: any) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: initial || loadPersistedState(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(persistenceMiddleware),
  });

export const store = createStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
