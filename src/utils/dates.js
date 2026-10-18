import { parseLocalDate } from './format';

const FIVE_HOURS = 5 * 60 * 60 * 1000;

// An event counts as "completed" once it has had time to finish: five hours
// after the start when we know the exact start, otherwise the end of its day.
export function getEventEnd(event) {
  if (event?.dateTime) {
    const t = new Date(event.dateTime).getTime();
    if (!Number.isNaN(t)) return t + FIVE_HOURS;
  }
  const d = parseLocalDate(event?.localDate);
  if (d) {
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }
  return Infinity; // no date yet (TBA) - treat as still to come
}

export function hasEnded(event, now = Date.now()) {
  return getEventEnd(event) < now;
}

export function getEventStart(event) {
  if (event?.dateTime) {
    const t = new Date(event.dateTime).getTime();
    if (!Number.isNaN(t)) return t;
  }
  const d = parseLocalDate(event?.localDate);
  return d ? d.getTime() : Infinity;
}

// "2026-10-18T14:00:00Z" - what the Discovery API wants. Rounded down to the
// hour so repeated calls share a cache key.
export function apiDateTime(date = new Date()) {
  const d = new Date(date);
  d.setMinutes(0, 0, 0);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
