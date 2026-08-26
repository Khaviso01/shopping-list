import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as api from '../services/api';

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  category?: string;
  quantity?: string;
  notes?: string;
  imageUrl?: string;
  dateAdded: string;
}

export interface NewShoppingItemInput {
  name: string;
  category?: string;
  quantity?: string;
  notes?: string;
  imageUrl?: string;
}

interface ShoppingListState {
  items: ShoppingItem[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: ShoppingListState = {
  items: [],
  status: 'idle',
  error: null,
};

// ----- Thunks (all data lives in json-server / db.json) -----

export const fetchItems = createAsyncThunk(
  'shoppingList/fetchItems',
  async (userId: string, { rejectWithValue }) => {
    try {
      return await api.getItemsForUser(userId);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to load shopping list.');
    }
  }
);

export const addItem = createAsyncThunk(
  'shoppingList/addItem',
  async (payload: { userId: string; item: NewShoppingItemInput }, { rejectWithValue }) => {
    try {
      return await api.createItem({
        userId: payload.userId,
        name: payload.item.name,
        category: payload.item.category || 'General',
        quantity: payload.item.quantity || '1',
        notes: payload.item.notes || '',
        imageUrl: payload.item.imageUrl || '',
        dateAdded: new Date().toISOString(),
      });
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to add item.');
    }
  }
);

export const editItem = createAsyncThunk(
  'shoppingList/editItem',
  async (item: ShoppingItem, { rejectWithValue }) => {
    try {
      return await api.updateItem(item.id, item);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update item.');
    }
  }
);

export const deleteItem = createAsyncThunk(
  'shoppingList/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteItem(id);
      return id;
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete item.');
    }
  }
);

export const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    clearItems: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<ShoppingItem[]>) => {
        state.status = 'idle';
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Failed to load shopping list.';
      })
      .addCase(addItem.fulfilled, (state, action: PayloadAction<ShoppingItem>) => {
        state.items.unshift(action.payload);
      })
      .addCase(editItem.fulfilled, (state, action: PayloadAction<ShoppingItem>) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearItems } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
