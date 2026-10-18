import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import eventsReducer from '../features/events/eventsSlice';
import registrationsReducer from '../features/registrations/registrationsSlice';
import uiReducer from '../features/ui/uiSlice';
import { saveRegistrations, saveSession } from '../utils/storage';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    registrations: registrationsReducer,
    ui: uiReducer,
  },
});

// Persist only what must survive a refresh: the session and the registrations.
// Comparing by reference means we write to localStorage only when they change.
let lastUser = store.getState().auth.user;
let lastRegistrations = store.getState().registrations.items;

store.subscribe(() => {
  const { auth, registrations } = store.getState();

  if (auth.user !== lastUser) {
    lastUser = auth.user;
    saveSession(lastUser);
  }
  if (registrations.items !== lastRegistrations) {
    lastRegistrations = registrations.items;
    saveRegistrations(lastRegistrations);
  }
});

export default store;
