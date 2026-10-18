# Doorlist - Event Management System

A React + Redux Toolkit app for exploring events, registering for them and managing your own list.
Event data comes live from the [Ticketmaster Discovery API](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/).

Built for Web Programming - Assignment 2.

## Features

| Requirement | Where it lives |
| --- | --- |
| Register / log in / log out, session survives a refresh | `features/auth`, `pages/Login.jsx`, `pages/Register.jsx` |
| Browse, search, filter (category, genre, country, city, date range), sort | `pages/Events.jsx`, `components/FilterPanel.jsx` |
| Upcoming events and categories | `pages/Home.jsx`, `pages/Categories.jsx` |
| Event details (name, date/time, venue, location, category, image, price, performers, seat map...) | `pages/EventDetails.jsx` |
| Register for an event, duplicate prevention, feedback, cancel | `features/registrations`, `components/RegisterButton.jsx` |
| My Events with Upcoming / Completed split and cancellation | `pages/MyEvents.jsx` |
| Protected routes (My Events needs a login; login/register hidden once logged in) | `routes/ProtectedRoute.jsx` |
| Loading, error and empty states, form validation | `EventGrid`, `ErrorState`, `utils/validators.js` |

Extras beyond the brief: request throttling and caching to respect Ticketmaster's rate limit, removable
active-filter chips, URL-driven links from the home/categories pages, accessible tabs and dialogs,
a native `<dialog>` confirmation before cancelling.

## Getting started

You need Node.js 18 or newer.

```bash
# 1. install dependencies
npm install

# 2. add your Ticketmaster key
cp .env.example .env
#    then open .env and paste your Consumer Key after VITE_TICKETMASTER_API_KEY=

# 3. run the dev server
npm run dev
```

Get a free key at <https://developer.ticketmaster.com/> (the portal calls it the *Consumer Key*).
Restart the dev server after editing `.env`.

Other scripts:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

> The `.env` file is git-ignored. Never commit your API key. Only `.env.example` (a placeholder) is tracked.

## How it works

### Tech

React 18, Redux Toolkit, React Router 6, Vite. Plain CSS (no UI kit), organised next to the component it styles.

### Redux store (`src/app/store.js`)

| Slice | State | Notes |
| --- | --- | --- |
| `auth` | `user`, `status`, `error` | `registerUser` / `loginUser` thunks, `logout` reducer. Session restored from localStorage on load. |
| `events` | `filters`, `currentPage`, `list`, `upcoming`, `detail`, `classifications` | Thunks: `fetchEvents`, `fetchUpcoming`, `fetchEventById`, `fetchClassifications`. Stale responses are ignored via `requestId`. |
| `registrations` | `items` | `registerForEvent` / `cancelRegistration` thunks. Each record stores the user id and a slim snapshot of the event. |
| `ui` | `toasts` | Notifications shown after actions. |

`store.subscribe` writes the session and registrations to localStorage whenever they change.
Components use `useSelector` / `useDispatch` throughout, with selectors exported from each slice.

### Routes

| Path | Page | Access |
| --- | --- | --- |
| `/` | Home | public |
| `/events` | Explore + search + filters | public |
| `/events/:id` | Event details | public (register needs login) |
| `/categories` | Categories and genres | public |
| `/login`, `/register` | Auth | guests only |
| `/my-events` | Registered events | logged-in only |
| `*` | 404 | public |

If you hit a protected page while logged out, you're sent to `/login` and returned afterwards.

### Ticketmaster API usage

Endpoints: `GET /events.json`, `GET /events/{id}.json`, `GET /classifications.json`.
Parameters used: `keyword`, `classificationId`, `genreId`, `countryCode`, `city`, `startDateTime`,
`endDateTime`, `sort`, `size`, `page`, `locale`.

- **Rate limit** (2 req/s, 5,000/day): `services/ticketmaster.js` spaces requests ~520 ms apart and caches responses for 5 minutes.
- **Deep paging**: the API rejects `page * size >= 1000`, so pagination is capped at the reachable pages.
- **Dates**: events show the venue's own local date and time, as the API returns them.
- **Completed events**: an event counts as completed five hours after its start (or at the end of its day if no time is known).

### Authentication (frontend simulation)

There is no backend. Accounts live in localStorage, with passwords stored as a salted SHA-256 digest
instead of plain text. This is for the assignment only and is **not** real security.
Registrations are keyed by user id, so several accounts on one browser keep separate lists.

## Project structure

```
src/
  app/            store.js
  features/       auth/  events/  registrations/  ui/      (slice + thunks + selectors)
  services/       ticketmaster.js (HTTP client)  normalizers.js (API -> app shape)
  components/     reusable UI (EventCard, EventGrid, FilterPanel, ...) + their CSS
  pages/          route-level screens + their CSS
  routes/         ProtectedRoute.jsx
  utils/          dates, formatting, validators, storage, hashing
  styles/         base.css (tokens + global styles)
```

## Git workflow

Work was done on feature branches and merged into `main` through merge commits that mirror pull requests:

- `feat/redux-state-and-api` - slices, Ticketmaster client, store
- `feat/auth-ui` - auth pages, navbar/footer, toasts, route guards
- `feat/event-discovery` - listing, filters, home, categories, details, registration, My Events
- `feat/routing` - route table

```bash
git log --oneline --graph
```

## Troubleshooting

- **"The Ticketmaster key is missing"** - create `.env` from `.env.example`, paste the key, restart `npm run dev`.
- **"Ticketmaster rejected the API key"** - double-check you copied the *Consumer Key*, not the secret.
- **"rate limiting us"** - wait a few seconds; the 5,000/day quota resets daily.
