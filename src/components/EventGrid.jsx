import EventCard from './EventCard';
import ErrorState from './ErrorState';
import './EventGrid.css';
import './states.css';

function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-card__img" />
      <div className="skeleton-card__body">
        <div className="skeleton skeleton-line skeleton-line--title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line--short" />
      </div>
    </div>
  );
}

// Handles all four states of a list of events so pages don't have to:
// loading (skeletons), failed (error + retry), empty, and the actual grid.
export default function EventGrid({
  events,
  status,
  error,
  onRetry,
  skeletons = 8,
  empty,
}) {
  if (status === 'failed') return <ErrorState error={error} onRetry={onRetry} />;

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="event-grid" aria-busy="true" aria-label="Loading events">
        {Array.from({ length: skeletons }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!events.length) {
    return (
      empty || (
        <div className="empty">
          <h3>Nothing on the bill</h3>
          <p>No events matched that. Try loosening a filter.</p>
        </div>
      )
    );
  }

  return (
    <div className="event-grid">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
