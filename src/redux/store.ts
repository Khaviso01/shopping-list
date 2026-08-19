import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import shoppingListReducer from './shoppingListSlice'; // Use exact filename casing

export const store = configureStore({
  reducer: {
    auth: authReducer,
    shoppingList: shoppingListReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;