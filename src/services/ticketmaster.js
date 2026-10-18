// Thin client for the Ticketmaster Discovery API (v2).
// Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
//
// Quota: 5000 requests/day, 2 requests/second. So every call goes through a
// tiny queue that spaces requests out, and successful GETs are cached briefly.

const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;

const MIN_GAP_MS = 520; // keeps us safely under 2 requests/second
const CACHE_TTL_MS = 5 * 60 * 1000;

export class ApiError extends Error {
  constructor(message, code = 'UNKNOWN', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export const hasApiKey = Boolean(API_KEY && API_KEY !== 'your_consumer_key_here');

const cache = new Map();
let queueTail = Promise.resolve();
let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function abortError() {
  const err = new Error('Request aborted');
  err.name = 'AbortError';
  return err;
}

// Run `task` after the previous request plus MIN_GAP_MS. If the caller gave up
// (e.g. React StrictMode re-ran an effect) before our turn, skip the network call.
function enqueue(task, signal) {
  const run = queueTail.then(async () => {
    if (signal?.aborted) throw abortError();
    const wait = lastRequestAt + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    if (signal?.aborted) throw abortError();
    lastRequestAt = Date.now();
    return task();
  });
  queueTail = run.catch(() => {});
  return run;
}

function buildUrl(path, params) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  url.searchParams.set('apikey', API_KEY);
  return url.toString();
}

async function readFailure(response) {
  let detail = '';
  try {
    const body = await response.json();
    detail = body?.fault?.faultstring || body?.errors?.[0]?.detail || '';
  } catch {
    /* body wasn't JSON */
  }

  switch (response.status) {
    case 401:
    case 403:
      return new ApiError(
        'Ticketmaster rejected the API key. Check VITE_TICKETMASTER_API_KEY in your .env file.',
        'BAD_KEY',
        response.status
      );
    case 404:
      return new ApiError("We couldn't find that event. It may have been removed.", 'NOT_FOUND', 404);
    case 429:
      return new ApiError(
        'Ticketmaster is rate limiting us (2 requests/second, 5,000/day). Give it a moment and retry.',
        'RATE_LIMIT',
        429
      );
    default:
      return new ApiError(
        detail || `Ticketmaster returned an unexpected error (${response.status}).`,
        'HTTP_ERROR',
        response.status
      );
  }
}

async function request(path, params = {}, { signal } = {}) {
  if (!hasApiKey) {
    throw new ApiError(
      'No Ticketmaster API key found. Add VITE_TICKETMASTER_API_KEY to a .env file and restart the dev server.',
      'NO_KEY'
    );
  }

  const url = buildUrl(path, params);
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  return enqueue(async () => {
    let response;
    try {
      response = await fetch(url);
    } catch {
      throw new ApiError(
        "Couldn't reach Ticketmaster. Check your internet connection and try again.",
        'NETWORK'
      );
    }
    if (!response.ok) throw await readFailure(response);

    const data = await response.json();
    cache.set(url, { at: Date.now(), data });
    return data;
  }, signal);
}

export const getEvents = (params, options) => request('/events.json', params, options);
export const getEventById = (id, options) =>
  request(`/events/${encodeURIComponent(id)}.json`, { locale: '*' }, options);
export const getClassifications = (options) =>
  request('/classifications.json', { size: 100, locale: '*' }, options);
