// The Discovery API response is deeply nested and full of optional fields.
// These helpers flatten it once so components can stay simple.

const real = (value) => (value && value !== 'Undefined' ? value : '');

// Prefer a 16:9 image that's at least `minWidth` wide (smallest such), else the largest we have.
function pickImage(images = [], minWidth = 640) {
  if (!images.length) return '';
  const byWidth = [...images].sort((a, b) => (a.width || 0) - (b.width || 0));
  const wide = byWidth.filter((img) => img.ratio === '16_9' && (img.width || 0) >= minWidth);
  if (wide.length) return wide[0].url;
  const any = byWidth.filter((img) => (img.width || 0) >= minWidth);
  if (any.length) return any[0].url;
  return byWidth[byWidth.length - 1].url;
}

export function normalizeEvent(raw) {
  const venue = raw._embedded?.venues?.[0] || {};
  const cls = raw.classifications?.find((c) => c.primary) || raw.classifications?.[0] || {};
  const start = raw.dates?.start || {};
  const price = raw.priceRanges?.[0];

  return {
    id: raw.id,
    name: raw.name,
    url: raw.url || '',
    image: pickImage(raw.images, 640),
    imageLarge: pickImage(raw.images, 1280),

    localDate: start.localDate || '',
    localTime: start.localTime || '',
    dateTime: start.dateTime || '',
    timeTBA: Boolean(start.timeTBA || start.noSpecificTime),
    timezone: raw.dates?.timezone || venue.timezone || '',
    status: raw.dates?.status?.code || 'onsale',

    category: real(cls.segment?.name),
    categoryId: cls.segment?.id || '',
    genre: real(cls.genre?.name),
    subGenre: real(cls.subGenre?.name),

    venue: {
      name: venue.name || '',
      address: venue.address?.line1 || '',
      city: venue.city?.name || '',
      state: venue.state?.name || venue.state?.stateCode || '',
      country: venue.country?.name || '',
      postalCode: venue.postalCode || '',
      lat: Number(venue.location?.latitude) || null,
      lng: Number(venue.location?.longitude) || null,
    },

    price: price ? { min: price.min, max: price.max, currency: price.currency } : null,
    info: raw.info || '',
    pleaseNote: raw.pleaseNote || '',
    seatmap: raw.seatmap?.staticUrl || '',
    promoter: raw.promoter?.name || '',
    ticketLimit: raw.ticketLimit?.info || '',
    accessibility: raw.accessibility?.info || '',
    ageNote: raw.ageRestrictions?.legalAgeEnforced
      ? 'Age restrictions are enforced at the door.'
      : '',
    salesStart: raw.sales?.public?.startDateTime || '',
    salesEnd: raw.sales?.public?.endDateTime || '',

    attractions: (raw._embedded?.attractions || []).map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url || '',
      image: pickImage(a.images, 300),
    })),
  };
}

// Slim copy stored with a registration, so My Events renders without re-fetching.
export function toSnapshot(event) {
  return {
    id: event.id,
    name: event.name,
    url: event.url,
    image: event.image,
    localDate: event.localDate,
    localTime: event.localTime,
    dateTime: event.dateTime,
    timezone: event.timezone,
    status: event.status,
    category: event.category,
    genre: event.genre,
    venue: {
      name: event.venue?.name || '',
      city: event.venue?.city || '',
      state: event.venue?.state || '',
      country: event.venue?.country || '',
    },
  };
}

export function normalizeEventPage(response, requestedSize) {
  const raw = response?._embedded?.events || [];
  const page = response?.page || {};
  const size = page.size || requestedSize;
  // The Discovery API refuses deep paging: page * size must stay under 1000.
  const maxPages = Math.max(1, Math.floor(1000 / size));

  return {
    events: raw.map(normalizeEvent),
    page: {
      number: page.number || 0,
      size,
      totalElements: page.totalElements || 0,
      totalPages: Math.min(page.totalPages || 0, maxPages),
    },
  };
}

export function normalizeSegments(response) {
  const map = new Map();
  (response?._embedded?.classifications || []).forEach((c) => {
    const seg = c.segment;
    if (!seg?.id || !real(seg.name)) return;
    if (!map.has(seg.id)) map.set(seg.id, { id: seg.id, name: seg.name, genres: [] });
    const entry = map.get(seg.id);
    (seg._embedded?.genres || []).forEach((g) => {
      if (real(g.name) && !entry.genres.some((x) => x.id === g.id)) {
        entry.genres.push({ id: g.id, name: g.name });
      }
    });
  });
  return [...map.values()];
}
