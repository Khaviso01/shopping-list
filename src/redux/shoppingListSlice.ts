import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ShoppingItem {
  id: string;
  name: string;
  category?: string;
  dateAdded: string;
}

interface ShoppingListState {
  items: ShoppingItem[];
}

const initialState: ShoppingListState = {
  items: [],
};

export const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<{ name: string; category?: string }>) => {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: action.payload.name,
        category: action.payload.category || 'General',
        dateAdded: new Date().toISOString(),
      };
      state.items.unshift(newItem);
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { addItem, deleteItem } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;