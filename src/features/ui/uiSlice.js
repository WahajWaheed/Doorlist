import { createSlice, nanoid } from '@reduxjs/toolkit';

const MAX_TOASTS = 4;

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [] },
  reducers: {
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
        if (state.toasts.length > MAX_TOASTS) state.toasts.shift();
      },
      prepare({ type = 'info', message }) {
        return { payload: { id: nanoid(), type, message } };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const { pushToast, dismissToast } = uiSlice.actions;
export const selectToasts = (state) => state.ui.toasts;
export default uiSlice.reducer;
