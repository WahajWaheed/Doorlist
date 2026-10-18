import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { loadSession, loadUsers, saveUsers } from '../../utils/storage';
import { hashPassword } from '../../utils/hash';
import { makeId } from '../../utils/ids';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const toPublicUser = ({ id, name, email }) => ({ id, name, email });

// Frontend simulation: "accounts" live in localStorage. The thunks are async
// (with a short pause) so loading and error states behave like a real backend.
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    await wait(350);
    const normalized = email.trim().toLowerCase();
    const users = loadUsers();

    if (users.some((u) => u.email === normalized)) {
      return rejectWithValue('An account with that email already exists. Try logging in instead.');
    }

    const user = {
      id: makeId(),
      name: name.trim(),
      email: normalized,
      passwordHash: await hashPassword(password, normalized),
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, user]);
    return toPublicUser(user);
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    await wait(350);
    const normalized = email.trim().toLowerCase();
    const user = loadUsers().find((u) => u.email === normalized);
    const hash = user ? await hashPassword(password, normalized) : null;

    // same message for "no such user" and "wrong password" on purpose
    if (!user || user.passwordHash !== hash) {
      return rejectWithValue('Email or password is incorrect.');
    }
    return toPublicUser(user);
  }
);

const initialState = {
  user: loadSession(), // restored from localStorage so a refresh keeps you logged in
  status: 'idle', // idle | loading
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(isAnyOf(registerUser.pending, loginUser.pending), (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addMatcher(isAnyOf(registerUser.fulfilled, loginUser.fulfilled), (state, action) => {
        state.status = 'idle';
        state.user = action.payload;
      })
      .addMatcher(isAnyOf(registerUser.rejected, loginUser.rejected), (state, action) => {
        state.status = 'idle';
        state.error = action.payload || 'Something went wrong. Please try again.';
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.user);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
