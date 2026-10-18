import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClassifications,
  fetchUpcoming,
  selectSegments,
  selectUpcoming,
} from '../features/events/eventsSlice';
import { QUICK_SEARCHES } from '../constants';
import { dateParts, formatLocation } from '../utils/format';
import EventGrid from '../components/EventGrid';
import ErrorState from '../components/ErrorState';
import { ArrowRightIcon, SearchIcon } from '../components/Icons';
import './Home.css';
import '../components/states.css';

function CalendarList({ upcoming }) {
  if (upcoming.status === 'failed') return <ErrorState error={upcoming.error} compact />;

  if (upcoming.status !== 'succeeded') {
    return (
      <ol className="calendar" aria-busy="true" aria-label="Loading upcoming events">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="calendar__row">
            <div className="skeleton skeleton-line" style={{ width: '100%', height: '2.6rem' }} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="calendar">
      {upcoming.items.slice(0, 5).map((event) => {
        const { month, day } = dateParts(event.localDate);
        return (
          <li key={event.id} className="calendar__row">
            <Link to={`/events/${event.id}`}>
              <span className="calendar__date">
                <span className="calendar__day">{day}</span>
                <span className="calendar__month">{month}</span>
              </span>
              <span className="calendar__what">
                <span className="calendar__name">{event.name}</span>
                <span className="calendar__where">
                  {[event.venue.name, formatLocation(event.venue)].filter(Boolean).join(', ')}
                </span>
              </span>
              <ArrowRightIcon width={16} height={16} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export default function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const upcoming = useSelector(selectUpcoming);
  const segments = useSelector(selectSegments);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchUpcoming());
    dispatch(fetchClassifications());
  }, [dispatch]);

  const search = (term) => navigate(`/events?q=${encodeURIComponent(term.trim())}`);

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="label">Live from Ticketmaster</p>
            <h1>
              Find the night worth <em>leaving the house</em> for.
            </h1>
            <p className="hero__lede">
              Concerts, games, theatre and the occasional strange one. Claim a spot, keep your own
              list, and never lose track of what you said yes to.
            </p>

            <form
              className="hero__search"
              onSubmit={(e) => {
                e.preventDefault();
                search(query);
              }}
              role="search"
            >
              <label htmlFor="hero-q" className="sr-only">
                Search events
              </label>
              <SearchIcon />
              <input
                id="hero-q"
                type="search"
                placeholder="Artist, team, show or venue"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit" className="btn btn--primary">
                Find events
              </button>
            </form>

            <p className="hero__try">
              <span className="label">Try</span>
              {QUICK_SEARCHES.map((term) => (
                <button key={term} type="button" onClick={() => search(term)}>
                  {term}
                </button>
              ))}
            </p>
          </div>

          <aside className="hero__calendar" aria-labelledby="cal-title">
            <div className="hero__calendar-head">
              <h2 id="cal-title">On the calendar</h2>
              <span className="label">Next up</span>
            </div>
            <CalendarList upcoming={upcoming} />
            <Link to="/events" className="link-arrow">
              See everything <ArrowRightIcon width={15} height={15} />
            </Link>
          </aside>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="section-head">
            <h2>Browse by category</h2>
            <Link to="/categories" className="link-arrow">
              All categories <ArrowRightIcon width={15} height={15} />
            </Link>
          </div>
          <ul className="category-rows">
            {segments.map((segment, i) => (
              <li key={segment.id}>
                <Link to={`/events?segment=${segment.id}`}>
                  <span className="category-rows__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="category-rows__name">{segment.name}</span>
                  <ArrowRightIcon />
                </Link>
              </li>
            ))}
            {segments.length === 0 && (
              <li className="category-rows__loading">
                <div className="skeleton skeleton-line" style={{ height: '3rem' }} />
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="home-section">
        <div className="container">
          <div className="section-head">
            <h2>Coming up</h2>
            <Link to="/events" className="link-arrow">
              Browse all <ArrowRightIcon width={15} height={15} />
            </Link>
          </div>
          <EventGrid
            events={upcoming.items.slice(5, 13)}
            status={upcoming.status}
            error={upcoming.error}
            onRetry={() => dispatch(fetchUpcoming())}
            skeletons={8}
          />
        </div>
      </section>
    </>
  );
}
