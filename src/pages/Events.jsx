import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClassifications,
  fetchEvents,
  resetFilters,
  selectCurrentPage,
  selectEventList,
  selectFilters,
  selectSegments,
  setFilters,
  setPage,
} from '../features/events/eventsSlice';
import { COUNTRIES, DEFAULT_FILTERS, SORT_OPTIONS } from '../constants';
import EventGrid from '../components/EventGrid';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import { CloseIcon, SearchIcon, SlidersIcon } from '../components/Icons';
import './Events.css';
import '../components/FormField.css';

export default function Events() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const filters = useSelector(selectFilters);
  const currentPage = useSelector(selectCurrentPage);
  const list = useSelector(selectEventList);
  const segments = useSelector(selectSegments);

  const [keyword, setKeyword] = useState(filters.keyword);
  const [panelOpen, setPanelOpen] = useState(false);
  const resultsRef = useRef(null);

  // Links from the home and categories pages arrive as /events?q=jazz&segment=...
  // Apply them once, then tidy the URL so a later manual filter isn't fighting it.
  useEffect(() => {
    const q = params.get('q');
    const segment = params.get('segment');
    const genre = params.get('genre');
    if (q !== null || segment || genre) {
      dispatch(
        setFilters({ ...DEFAULT_FILTERS, keyword: q || '', segmentId: segment || '', genreId: genre || '' })
      );
      setParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch(fetchClassifications());
  }, [dispatch]);

  useEffect(() => setKeyword(filters.keyword), [filters.keyword]);

  // fetchEvents reads filters + page from the store; abort the old request if they change again
  useEffect(() => {
    const request = dispatch(fetchEvents());
    return () => request.abort();
  }, [dispatch, filters, currentPage]);

  const retry = () => dispatch(fetchEvents());

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ keyword: keyword.trim() }));
  };

  const handlePage = (page) => {
    dispatch(setPage(page));
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // chips describing whatever is currently filtered, each one removable
  const activeSegment = segments.find((s) => s.id === filters.segmentId);
  const activeGenre = activeSegment?.genres.find((g) => g.id === filters.genreId);
  const chips = [
    filters.keyword && { label: `"${filters.keyword}"`, clear: { keyword: '' } },
    activeGenre && { label: activeGenre.name, clear: { genreId: '' } },
    filters.countryCode && {
      label: COUNTRIES.find((c) => c.code === filters.countryCode)?.name || filters.countryCode,
      clear: { countryCode: '' },
    },
    filters.city && { label: filters.city, clear: { city: '' } },
    filters.dateFrom && { label: `from ${filters.dateFrom}`, clear: { dateFrom: '' } },
    filters.dateTo && { label: `until ${filters.dateTo}`, clear: { dateTo: '' } },
  ].filter(Boolean);

  const total = list.page.totalElements;

  return (
    <div className="page">
      <div className="container">
        <header className="events-head">
          <p className="label">Discover</p>
          <h1>What's on</h1>

          <form className="events-search" onSubmit={handleSearch} role="search">
            <label htmlFor="q" className="sr-only">
              Search events, artists or venues
            </label>
            <SearchIcon />
            <input
              id="q"
              type="search"
              placeholder="Search an artist, team, show or venue"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn--primary btn--sm">
              Search
            </button>
          </form>

          <div className="events-tabs" role="group" aria-label="Category">
            <button
              type="button"
              className={`chip${filters.segmentId === '' ? ' is-active' : ''}`}
              onClick={() => dispatch(setFilters({ segmentId: '', genreId: '' }))}
            >
              All
            </button>
            {segments.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`chip${filters.segmentId === s.id ? ' is-active' : ''}`}
                onClick={() => dispatch(setFilters({ segmentId: s.id, genreId: '' }))}
              >
                {s.name}
              </button>
            ))}
          </div>
        </header>

        <div className="events-layout">
          <aside className={`events-aside${panelOpen ? ' is-open' : ''}`}>
            <FilterPanel onApplied={() => setPanelOpen(false)} />
          </aside>

          <section className="events-results" ref={resultsRef} aria-labelledby="results-title">
            <div className="events-bar">
              <div>
                <h2 id="results-title" className="events-count">
                  {list.status === 'succeeded'
                    ? `${total.toLocaleString()} ${total === 1 ? 'event' : 'events'}`
                    : 'Events'}
                </h2>
                {list.status === 'succeeded' && list.page.totalPages > 1 && (
                  <p className="label">
                    Page {currentPage + 1} of {list.page.totalPages}
                  </p>
                )}
              </div>

              <div className="events-bar__tools">
                <button
                  type="button"
                  className="btn btn--outline btn--sm events-bar__filters"
                  onClick={() => setPanelOpen((v) => !v)}
                  aria-expanded={panelOpen}
                >
                  <SlidersIcon /> Filters{chips.length ? ` (${chips.length})` : ''}
                </button>
                <label className="events-sort">
                  <span className="sr-only">Sort by</span>
                  <select
                    className="input"
                    value={filters.sort}
                    onChange={(e) => dispatch(setFilters({ sort: e.target.value }))}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {chips.length > 0 && (
              <ul className="active-filters" aria-label="Active filters">
                {chips.map((c) => (
                  <li key={c.label}>
                    <button
                      type="button"
                      className="chip"
                      onClick={() => dispatch(setFilters(c.clear))}
                      aria-label={`Remove filter ${c.label}`}
                    >
                      {c.label}
                      <CloseIcon width={13} height={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <EventGrid
              events={list.items}
              status={list.status}
              error={list.error}
              onRetry={retry}
              skeletons={12}
              empty={
                <div className="empty">
                  <h3>Nothing on the bill</h3>
                  <p>No events matched those filters. Try a broader search or another date range.</p>
                  <button type="button" className="btn btn--outline" onClick={() => dispatch(resetFilters())}>
                    Clear all filters
                  </button>
                </div>
              }
            />

            {list.status === 'succeeded' && (
              <Pagination page={currentPage} totalPages={list.page.totalPages} onChange={handlePage} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
