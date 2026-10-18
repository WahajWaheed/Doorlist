import { createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { loadRegistrations } from '../../utils/storage';
import { hasEnded } from '../../utils/dates';
import { makeId } from '../../utils/ids';
import { toSnapshot } from '../../services/normalizers';
import { pushToast } from '../ui/uiSlice';

// A registration belongs to a user: { id, userId, eventId, registeredAt, event: snapshot }.
// All users' registrations share one localStorage list; selectors filter by the logged-in user.

export const registerForEvent = createAsyncThunk(
  'registrations/register',
  async (event, { getState, dispatch, rejectWithValue }) => {
    const { auth, registrations } = getState();
    const fail = (code, message, type = 'error') => {
      dispatch(pushToast({ type, message }));
      return rejectWithValue(code);
    };

    if (!auth.user) return fail('not-authenticated', 'Log in first to register for events.');

    const duplicate = registrations.items.some(
      (r) => r.userId === auth.user.id && r.eventId === event.id
    );
    if (duplicate) return fail('duplicate', "You're already registered for this one.", 'info');

    if (event.status === 'cancelled') return fail('cancelled', 'This event has been cancelled.');
    if (hasEnded(event)) return fail('ended', 'This event has already taken place.');

    dispatch(pushToast({ type: 'success', message: `You're on the list for ${event.name}.` }));
    return {
      id: makeId(),
      userId: auth.user.id,
      eventId: event.id,
      registeredAt: new Date().toISOString(),
      event: toSnapshot(event),
    };
  }
);

export const cancelRegistration = createAsyncThunk(
  'registrations/cancel',
  async (eventId, { getState, dispatch, rejectWithValue }) => {
    const { auth, registrations } = getState();
    const found = registrations.items.find(
      (r) => r.userId === auth.user?.id && r.eventId === eventId
    );
    if (!found) {
      dispatch(pushToast({ type: 'error', message: "We couldn't find that registration." }));
      return rejectWithValue('missing');
    }
    dispatch(pushToast({ type: 'info', message: `Registration cancelled: ${found.event.name}.` }));
    return found.id;
  }
);

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState: { items: loadRegistrations() },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerForEvent.fulfilled, (state, action) => {
        const { userId, eventId } = action.payload;
        // belt and braces: the thunk already blocks duplicates
        if (!state.items.some((r) => r.userId === userId && r.eventId === eventId)) {
          state.items.push(action.payload);
        }
      })
      .addCase(cancelRegistration.fulfilled, (state, action) => {
        state.items = state.items.filter((r) => r.id !== action.payload);
      });
  },
});

const selectItems = (state) => state.registrations.items;
const selectUserId = (state) => state.auth.user?.id;

export const selectUserRegistrations = createSelector([selectItems, selectUserId], (items, userId) =>
  userId ? items.filter((r) => r.userId === userId) : []
);

export const selectIsRegistered = (eventId) => (state) =>
  state.registrations.items.some(
    (r) => r.eventId === eventId && r.userId === state.auth.user?.id
  );

export default registrationsSlice.reducer;
