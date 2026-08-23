import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ShoppingItem {
  id: string;
  name: string;
  category?: string;
  quantity?: string;
  notes?: string;
  imageUrl?: string;
  dateAdded: string;
}

interface ShoppingListState {
  items: ShoppingItem[];
}

// Load initial items from localStorage
const loadItemsFromStorage = (): ShoppingItem[] => {
  try {
    const saved = localStorage.getItem('shopping_list_items');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load shopping list from localStorage:', error);
    return [];
  }
};

// Helper function to update localStorage
const saveItemsToStorage = (items: ShoppingItem[]) => {
  try {
    localStorage.setItem('shopping_list_items', JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save shopping list to localStorage:', error);
  }
};

const initialState: ShoppingListState = {
  items: loadItemsFromStorage(),
};

export const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<{
        name: string;
        category?: string;
        quantity?: string;
        notes?: string;
        imageUrl?: string;
      }>
    ) => {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: action.payload.name,
        category: action.payload.category || 'General',
        quantity: action.payload.quantity || '1',
        notes: action.payload.notes || '',
        imageUrl: action.payload.imageUrl || '',
        dateAdded: new Date().toISOString(),
      };
      state.items.unshift(newItem);
      saveItemsToStorage(state.items);
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveItemsToStorage(state.items);
    },
  },
});

export const { addItem, deleteItem } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;