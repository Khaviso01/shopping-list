import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'shopping-list-secret-key';

export interface User {
  name: string;
  surname: string;
  email: string;
  cellNumber?: string;
  password?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const savedUser = localStorage.getItem('user');
const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<User>) => {
      const encryptedPassword = CryptoJS.AES.encrypt(
        action.payload.password || '',
        SECRET_KEY
      ).toString();

      const userData = { ...action.payload, password: encryptedPassword };
      state.user = userData;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(userData));
    },
    loginUser: (state, action: PayloadAction<{ email: string }>) => {
      const userData = { ...state.user, ...action.payload } as User;
      state.user = userData;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(userData));
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      let updatedData = { ...action.payload };

      // Encrypt password if a new unencrypted plain-text password was submitted
      if (
        updatedData.password &&
        updatedData.password !== state.user?.password
      ) {
        updatedData.password = CryptoJS.AES.encrypt(
          updatedData.password,
          SECRET_KEY
        ).toString();
      }

      const updatedUser = { ...state.user, ...updatedData } as User;
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