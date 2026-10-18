// Ticketmaster gives us the venue's own local date/time ("2026-11-02", "19:30:00").
// We display those as-is instead of converting to the viewer's timezone, which is
// what you actually want when you're deciding whether to go.

export function parseLocalDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatLongDate(value) {
  const d = parseLocalDate(value);
  if (!d) return 'Date to be announced';
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(value) {
  const d = parseLocalDate(value);
  if (!d) return 'Date TBA';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(value) {
  if (!value) return 'Time to be announced';
  const [h, m] = value.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m || 0, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatStamp(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatLocation(venue = {}) {
  return [venue.city, venue.state || venue.country].filter(Boolean).join(', ');
}

export function formatPrice(price) {
  if (!price || (price.min == null && price.max == null)) return '';
  const { min, max, currency } = price;
  try {
    const fmt = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    });
    if (min != null && max != null && min !== max) return `${fmt.format(min)} - ${fmt.format(max)}`;
    return fmt.format(min ?? max);
  } catch {
    return `${min ?? ''}${max && max !== min ? ` - ${max}` : ''} ${currency || ''}`.trim();
  }
}

export function dateParts(localDate) {
  const d = parseLocalDate(localDate);
  if (!d) return { month: 'TBA', day: '--', weekday: '' };
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: d.getDate(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
  };
}
