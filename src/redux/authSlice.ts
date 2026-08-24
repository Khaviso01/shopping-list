import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as CryptoJS from 'crypto-js';

const SECRET_KEY = 'shopping-list-secret-key';
const AUTHENTICATED_KEY = 'shopping-list-authenticated';

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
  isAuthenticated: localStorage.getItem(AUTHENTICATED_KEY) === 'true',
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
      localStorage.setItem(AUTHENTICATED_KEY, 'true');
    },
    loginUser: (state, action: PayloadAction<{ email: string }>) => {
      const userData = { ...state.user, ...action.payload } as User;
      state.user = userData;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem(AUTHENTICATED_KEY, 'true');
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
      state.isAuthenticated = false;
      localStorage.setItem(AUTHENTICATED_KEY, 'false');
    },
  },
});

export const { registerUser, loginUser, updateProfile, logout } = authSlice.actions;
export default authSlice.reducer;