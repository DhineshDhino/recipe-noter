import { configureStore } from '@reduxjs/toolkit';
import recipeReducer from './recipeSlice';
import editorReducer from './editorSlice';

export const store = configureStore({
  reducer: {
    recipe: recipeReducer,
    editor: editorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

