export const PAGE_SIZE = 12;
// Home page asks for 13: five go in the "on the calendar" list, eight in the grid.
export const UPCOMING_SIZE = 13;

export const SORT_OPTIONS = [
  { value: 'date,asc', label: 'Soonest first' },
  { value: 'date,desc', label: 'Latest first' },
  { value: 'relevance,desc', label: 'Most relevant' },
  { value: 'name,asc', label: 'Name A to Z' },
];

export const COUNTRIES = [
  { code: '', name: 'Anywhere' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'MX', name: 'Mexico' },
];

export const DEFAULT_FILTERS = {
  keyword: '',
  segmentId: '',
  genreId: '',
  countryCode: '',
  city: '',
  dateFrom: '',
  dateTo: '',
  sort: 'date,asc',
};

// Ticketmaster's top-level "segments". Used only if the classifications
// endpoint fails or comes back empty, so the category UI never goes blank.
export const FALLBACK_SEGMENTS = [
  { id: 'KZFzniwnSyZfZ7v7nJ', name: 'Music', genres: [] },
  { id: 'KZFzniwnSyZfZ7v7nE', name: 'Sports', genres: [] },
  { id: 'KZFzniwnSyZfZ7v7na', name: 'Arts & Theatre', genres: [] },
  { id: 'KZFzniwnSyZfZ7v7nn', name: 'Film', genres: [] },
  { id: 'KZFzniwnSyZfZ7v7n1', name: 'Miscellaneous', genres: [] },
];

export const QUICK_SEARCHES = ['jazz', 'basketball', 'comedy', 'musical', 'festival'];
