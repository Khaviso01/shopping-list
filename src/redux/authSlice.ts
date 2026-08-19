import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'shopping-list-secret-key';

const savedUser = localStorage.getItem('user');
const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<any>) => {
      const encryptedPassword = CryptoJS.AES.encrypt(
        action.payload.password,
        SECRET_KEY
      ).toString();

      const userData = { ...action.payload, password: encryptedPassword };
      state.user = userData;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(userData));
    },
    loginUser: (state, action: PayloadAction<{ email: string }>) => {
      const userData = { ...state.user, email: action.payload.email };
      state.user = userData;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(userData));
    },
    updateProfile: (state, action: PayloadAction<any>) => {
      const updatedUser = { ...state.user, ...action.payload };
      state.user = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
  },
});

export const { registerUser, loginUser, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;