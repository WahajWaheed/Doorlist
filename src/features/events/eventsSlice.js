import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getClassifications, getEventById, getEvents } from '../../services/ticketmaster';
import {
  normalizeEvent,
  normalizeEventPage,
  normalizeSegments,
} from '../../services/normalizers';
import { apiDateTime } from '../../utils/dates';
import {
  DEFAULT_FILTERS,
  FALLBACK_SEGMENTS,
  PAGE_SIZE,
  UPCOMING_SIZE,
} from '../../constants';

const toErrorPayload = (err) => ({
  message: err?.message || 'Something went wrong while loading events.',
  code: err?.code || 'UNKNOWN',
});

// Aborts (StrictMode re-runs, quick filter changes) must stay aborts so the
// reducers can ignore them; everything else becomes a readable error payload.
function failWith(err, rejectWithValue) {
  if (err?.name === 'AbortError') throw err;
  return rejectWithValue(toErrorPayload(err));
}

function paramsFromFilters(filters, page) {
  return {
    keyword: filters.keyword.trim(),
    classificationId: filters.segmentId,
    genreId: filters.genreId,
    countryCode: filters.countryCode,
    city: filters.city.trim(),
    startDateTime: filters.dateFrom ? `${filters.dateFrom}T00:00:00Z` : apiDateTime(),
    endDateTime: filters.dateTo ? `${filters.dateTo}T23:59:59Z` : '',
    sort: filters.sort,
    size: PAGE_SIZE,
    page,
    locale: '*',
  };
}

/* ----------------------------- thunks ----------------------------- */

// Reads the current filters + page from the store, so components just call fetchEvents().
export const fetchEvents = createAsyncThunk(
  'events/fetchList',
  async (_, { getState, signal, rejectWithValue }) => {
    const { filters, currentPage } = getState().events;
    try {
      const res = await getEvents(paramsFromFilters(filters, currentPage), { signal });
      return normalizeEventPage(res, PAGE_SIZE);
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  }
);

export const fetchUpcoming = createAsyncThunk(
  'events/fetchUpcoming',
  async (_, { signal, rejectWithValue }) => {
    try {
      const res = await getEvents(
        { sort: 'date,asc', size: UPCOMING_SIZE, startDateTime: apiDateTime(), locale: '*' },
        { signal }
      );
      return normalizeEventPage(res, UPCOMING_SIZE).events;
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  },
  { condition: (_, { getState }) => getState().events.upcoming.status !== 'loading' }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id, { signal, rejectWithValue }) => {
    try {
      return normalizeEvent(await getEventById(id, { signal }));
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  },
  { condition: (id, { getState }) => !getState().events.detail.byId[id] }
);

export const fetchClassifications = createAsyncThunk(
  'events/fetchClassifications',
  async (_, { signal, rejectWithValue }) => {
    try {
      return normalizeSegments(await getClassifications({ signal }));
    } catch (err) {
      return failWith(err, rejectWithValue);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().events.classifications;
      return status === 'idle' || status === 'failed';
    },
  }
);

/* ------------------------------ slice ------------------------------ */

const initialState = {
  filters: { ...DEFAULT_FILTERS },
  currentPage: 0,
  list: {
    items: [],
    page: { number: 0, size: PAGE_SIZE, totalElements: 0, totalPages: 0 },
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    requestId: null,
  },
  upcoming: { items: [], status: 'idle', error: null },
  detail: { byId: {}, statusById: {}, errorById: {} },
  classifications: { segments: [], status: 'idle', error: null },
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 0;
    },
    resetFilters(state) {
      state.filters = { ...DEFAULT_FILTERS };
      state.currentPage = 0;
    },
    setPage(state, action) {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* list */
      .addCase(fetchEvents.pending, (state, action) => {
        state.list.status = 'loading';
        state.list.error = null;
        state.list.requestId = action.meta.requestId;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return; // stale response
        state.list.status = 'succeeded';
        state.list.items = action.payload.events;
        state.list.page = action.payload.page;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (action.meta.aborted || state.list.requestId !== action.meta.requestId) return;
        state.list.status = 'failed';
        state.list.error = action.payload || toErrorPayload(action.error);
      })

      /* upcoming (home page) */
      .addCase(fetchUpcoming.pending, (state) => {
        state.upcoming.status = 'loading';
        state.upcoming.error = null;
      })
      .addCase(fetchUpcoming.fulfilled, (state, action) => {
        state.upcoming.status = 'succeeded';
        state.upcoming.items = action.payload;
      })
      .addCase(fetchUpcoming.rejected, (state, action) => {
        if (action.meta.aborted) {
          state.upcoming.status = 'idle';
          return;
        }
        state.upcoming.status = 'failed';
        state.upcoming.error = action.payload || toErrorPayload(action.error);
      })

      /* single event */
      .addCase(fetchEventById.pending, (state, action) => {
        state.detail.statusById[action.meta.arg] = 'loading';
        delete state.detail.errorById[action.meta.arg];
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.detail.byId[action.payload.id] = action.payload;
        state.detail.statusById[action.meta.arg] = 'succeeded';
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        if (action.meta.aborted) {
          state.detail.statusById[action.meta.arg] = 'idle';
          return;
        }
        state.detail.statusById[action.meta.arg] = 'failed';
        state.detail.errorById[action.meta.arg] = action.payload || toErrorPayload(action.error);
      })

      /* categories */
      .addCase(fetchClassifications.pending, (state) => {
        state.classifications.status = 'loading';
      })
      .addCase(fetchClassifications.fulfilled, (state, action) => {
        state.classifications.status = 'succeeded';
        state.classifications.segments =
          action.payload.length >= 3 ? action.payload : FALLBACK_SEGMENTS;
      })
      .addCase(fetchClassifications.rejected, (state, action) => {
        if (action.meta.aborted) {
          state.classifications.status = 'idle';
          return;
        }
        state.classifications.status = 'failed';
        state.classifications.error = action.payload || toErrorPayload(action.error);
        state.classifications.segments = FALLBACK_SEGMENTS; // keep the UI usable
      });
  },
});

export const { setFilters, resetFilters, setPage } = eventsSlice.actions;

export const selectFilters = (state) => state.events.filters;
export const selectCurrentPage = (state) => state.events.currentPage;
export const selectEventList = (state) => state.events.list;
export const selectUpcoming = (state) => state.events.upcoming;
export const selectSegments = (state) => state.events.classifications.segments;
export const selectClassificationStatus = (state) => state.events.classifications.status;
export const selectEventById = (id) => (state) => state.events.detail.byId[id];
export const selectEventStatus = (id) => (state) => state.events.detail.statusById[id] || 'idle';
export const selectEventError = (id) => (state) => state.events.detail.errorById[id] || null;

export default eventsSlice.reducer;
