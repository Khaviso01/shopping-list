import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import shoppingListReducer from './shoppingListSlice';


// storing the redux store with auth and shopping list reducers
export const store = configureStore({
  reducer: {
    auth: authReducer,
    shoppingList: shoppingListReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;