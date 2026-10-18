import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetFilters, selectFilters, selectSegments, setFilters } from '../features/events/eventsSlice';
import { COUNTRIES } from '../constants';
import { validateDateRange } from '../utils/validators';
import './FilterPanel.css';
import './FormField.css';

// The "detail" filters. They're edited locally and applied together with the
// button, so every keystroke doesn't fire an API request (we only get 2/sec).
export default function FilterPanel({ onApplied }) {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const segments = useSelector(selectSegments);

  const [draft, setDraft] = useState({
    genreId: filters.genreId,
    countryCode: filters.countryCode,
    city: filters.city,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  });

  // keep the form in step when filters change elsewhere (tabs, chips, reset)
  useEffect(() => {
    setDraft({
      genreId: filters.genreId,
      countryCode: filters.countryCode,
      city: filters.city,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
  }, [filters.genreId, filters.countryCode, filters.city, filters.dateFrom, filters.dateTo]);

  const genres = segments.find((s) => s.id === filters.segmentId)?.genres || [];
  const rangeError = validateDateRange(draft.dateFrom, draft.dateTo);

  const update = (e) => setDraft((d) => ({ ...d, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rangeError) return;
    dispatch(setFilters({ ...draft, city: draft.city.trim() }));
    onApplied?.();
  };

  const handleReset = () => {
    dispatch(resetFilters());
    onApplied?.();
  };

  return (
    <form className="filters" onSubmit={handleSubmit} noValidate>
      <h2 className="filters__title">Narrow it down</h2>

      {genres.length > 0 && (
        <div className="field">
          <label className="field__label" htmlFor="f-genre">
            Genre
          </label>
          <select id="f-genre" name="genreId" className="input" value={draft.genreId} onChange={update}>
            <option value="">Any genre</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label className="field__label" htmlFor="f-country">
          Country
        </label>
        <select
          id="f-country"
          name="countryCode"
          className="input"
          value={draft.countryCode}
          onChange={update}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="f-city">
          City
        </label>
        <input
          id="f-city"
          name="city"
          className="input"
          placeholder="e.g. Chicago"
          value={draft.city}
          onChange={update}
        />
      </div>

      <div className="filters__dates">
        <div className="field">
          <label className="field__label" htmlFor="f-from">
            From
          </label>
          <input
            id="f-from"
            name="dateFrom"
            type="date"
            className="input"
            value={draft.dateFrom}
            onChange={update}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="f-to">
            To
          </label>
          <input
            id="f-to"
            name="dateTo"
            type="date"
            className="input"
            value={draft.dateTo}
            min={draft.dateFrom || undefined}
            onChange={update}
          />
        </div>
      </div>
      {rangeError && (
        <p className="field__error" role="alert">
          {rangeError}
        </p>
      )}

      <div className="filters__actions">
        <button type="submit" className="btn btn--primary" disabled={Boolean(rangeError)}>
          Apply filters
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleReset}>
          Reset all
        </button>
      </div>
    </form>
  );
}
