import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import bcrypt from 'bcryptjs';
import * as api from '../services/api';
import type { ApiUser } from '../services/api';

// --- Password handling -------------------------------------------------
// Passwords are only ever hashed with bcrypt (a one-way function) — never
// encrypted-and-decrypted. Registration hashes the plain-text password;
// login re-hashes the entered password internally and compares digests via
// bcrypt.compare(). There is no code path anywhere that recovers a
// plain-text password from a stored hash.
const SALT_ROUNDS = 10;
const hashPassword = (plainText: string): string => bcrypt.hashSync(plainText, SALT_ROUNDS);
const verifyPassword = (plainText: string, hash: string): boolean => bcrypt.compareSync(plainText, hash);

const SESSION_KEY = 'shopping_list_session_user_id';

export interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  cellNumber?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const toPublicUser = (apiUser: ApiUser): User => ({
  id: apiUser.id,
  name: apiUser.name,
  surname: apiUser.surname,
  email: apiUser.email,
  cellNumber: apiUser.cellNumber,
});

const initialState: AuthState = {
  user: null,
  // We only ever store the plain user id locally (a session pointer), never
  // credentials. On boot the app resumes the session by re-fetching the
  // profile from the json-server backend.
  isAuthenticated: false,
  status: 'idle',
  error: null,
};

// ----- Thunks -----

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (
    payload: { name: string; surname: string; email: string; cellNumber?: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const existing = await api.findUserByEmail(payload.email);
      if (existing) {
        return rejectWithValue('An account with this email already exists.');
      }

      const created = await api.createUser({
        name: payload.name,
        surname: payload.surname,
        email: payload.email.toLowerCase(),
        cellNumber: payload.cellNumber,
        passwordHash: hashPassword(payload.password),
      });

      return toPublicUser(created);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Registration failed.');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const existing = await api.findUserByEmail(payload.email);
      if (!existing) {
        return rejectWithValue('No account found with this email address.');
      }

      // Only ever compares hashes — the stored password is never decrypted.
      if (!verifyPassword(payload.password, existing.passwordHash)) {
        return rejectWithValue('Incorrect password. Please try again.');
      }

      return toPublicUser(existing);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed.');
    }
  }
);

export const resumeSession = createAsyncThunk('auth/resumeSession', async (_, { rejectWithValue }) => {
  const userId = localStorage.getItem(SESSION_KEY);
  if (!userId) return rejectWithValue('No saved session.');

  try {
    const user = await api.findUserById(userId);
    if (!user) return rejectWithValue('Session user no longer exists.');
    return toPublicUser(user);
  } catch (err) {
    return rejectWithValue(err instanceof Error ? err.message : 'Could not resume session.');
  }
});

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (
    payload: { id: string; name?: string; surname?: string; email?: string; cellNumber?: string; password?: string },
    { rejectWithValue }
  ) => {
    try {
      const { id, password, ...rest } = payload;
      const updates: Partial<ApiUser> = { ...rest };
      // Re-hash if (and only if) the user actually typed a new password.
      if (password) {
        updates.passwordHash = hashPassword(password);
      }
      const updated = await api.updateUser(id, updates);
      return toPublicUser(updated);
    } catch (err) {
      return rejectWithValue(err instanceof Error ? err.message : 'Profile update failed.');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(SESSION_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'idle';
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem(SESSION_KEY, action.payload.id);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Registration failed.';
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.status = 'idle';
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem(SESSION_KEY, action.payload.id);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || 'Login failed.';
      })
      .addCase(resumeSession.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(resumeSession.rejected, (state) => {
        state.isAuthenticated = false;
        localStorage.removeItem(SESSION_KEY);
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Profile update failed.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
