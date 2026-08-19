import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'shopping-list-secret-key';

interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<any>) => {
      // Encrypt sensitive credentials
      const encryptedPassword = CryptoJS.AES.encrypt(
        action.payload.password,
        SECRET_KEY
      ).toString();

      state.user = {
        ...action.payload,
        password: encryptedPassword,
      };
      state.isAuthenticated = true;
    },
    loginUser: (state, action: PayloadAction<{ email: string }>) => {
      state.user = { email: action.payload.email };
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { registerUser, loginUser, logout } = authSlice.actions;
export default authSlice.reducer;